import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

interface PushNotificationState {
    isSupported: boolean;
    isSubscribed: boolean;
    permission: NotificationPermission;
    loading: boolean;
    error: string | null;
}

export function usePushNotifications(userId: string | null) {
    const [state, setState] = useState<PushNotificationState>({
        isSupported: false,
        isSubscribed: false,
        permission: 'default',
        loading: true,
        error: null,
    });

    // Check if push notifications are supported
    useEffect(() => {
        const isSupported =
            'serviceWorker' in navigator &&
            'PushManager' in window &&
            'Notification' in window;

        setState(prev => ({
            ...prev,
            isSupported,
            permission: isSupported ? Notification.permission : 'denied',
            loading: false,
        }));
    }, []);

    // Check if user is already subscribed
    useEffect(() => {
        if (!state.isSupported || !userId) return;

        checkSubscription();
    }, [state.isSupported, userId]);

    const checkSubscription = async () => {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            setState(prev => ({
                ...prev,
                isSubscribed: !!subscription,
            }));
        } catch (error) {
            console.error('Error checking subscription:', error);
        }
    };

    const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    const subscribe = useCallback(async () => {
        if (!state.isSupported || !userId || !VAPID_PUBLIC_KEY) {
            setState(prev => ({
                ...prev,
                error: 'Push notifications không được hỗ trợ hoặc thiếu cấu hình',
            }));
            return false;
        }

        try {
            setState(prev => ({ ...prev, loading: true, error: null }));

            // Request permission
            const permission = await Notification.requestPermission();

            if (permission !== 'granted') {
                setState(prev => ({
                    ...prev,
                    permission,
                    loading: false,
                    error: 'Bạn đã từ chối quyền thông báo',
                }));
                return false;
            }

            // Get service worker registration
            const registration = await navigator.serviceWorker.ready;

            // Subscribe to push notifications
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            });

            // Extract subscription details
            const subscriptionJSON = subscription.toJSON();
            const endpoint = subscriptionJSON.endpoint;
            const p256dh = subscriptionJSON.keys?.p256dh;
            const auth = subscriptionJSON.keys?.auth;

            if (!endpoint || !p256dh || !auth) {
                throw new Error('Invalid subscription data');
            }

            // Save to database
            const { error: dbError } = await supabase
                .from('push_subscriptions')
                .upsert({
                    owner_id: userId,
                    endpoint,
                    p256dh,
                    auth_key: auth,
                }, {
                    onConflict: 'endpoint',
                });

            if (dbError) throw dbError;

            setState(prev => ({
                ...prev,
                isSubscribed: true,
                permission: 'granted',
                loading: false,
            }));

            return true;
        } catch (error) {
            console.error('Error subscribing to push notifications:', error);
            setState(prev => ({
                ...prev,
                loading: false,
                error: (error as Error).message,
            }));
            return false;
        }
    }, [state.isSupported, userId]);

    const unsubscribe = useCallback(async () => {
        if (!state.isSupported || !userId) return false;

        try {
            setState(prev => ({ ...prev, loading: true, error: null }));

            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                const endpoint = subscription.endpoint;

                // Unsubscribe from push manager
                await subscription.unsubscribe();

                // Remove from database
                const { error: dbError } = await supabase
                    .from('push_subscriptions')
                    .delete()
                    .eq('owner_id', userId)
                    .eq('endpoint', endpoint);

                if (dbError) throw dbError;
            }

            setState(prev => ({
                ...prev,
                isSubscribed: false,
                loading: false,
            }));

            return true;
        } catch (error) {
            console.error('Error unsubscribing from push notifications:', error);
            setState(prev => ({
                ...prev,
                loading: false,
                error: (error as Error).message,
            }));
            return false;
        }
    }, [state.isSupported, userId]);

    return {
        ...state,
        subscribe,
        unsubscribe,
    };
}
