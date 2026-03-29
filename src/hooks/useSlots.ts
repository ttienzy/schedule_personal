import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Slot = Database['public']['Tables']['slots']['Row'];
type SlotInsert = Database['public']['Tables']['slots']['Insert'];
type SlotUpdate = Database['public']['Tables']['slots']['Update'];

export function useSlots(scheduleId: string | null) {
    const [slots, setSlots] = useState<Slot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (scheduleId) {
            fetchSlots();
        }
    }, [scheduleId]);

    async function fetchSlots() {
        if (!scheduleId) return;

        try {
            setLoading(true);

            const { data, error } = await supabase
                .from('slots')
                .select('*')
                .eq('schedule_id', scheduleId)
                .order('day')
                .order('time_start');

            if (error) throw error;

            setSlots(data || []);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }


    async function createSlot(slot: SlotInsert) {
        const { data, error } = await supabase
            .from('slots')
            .insert(slot)
            .select()
            .single();

        if (error) throw error;

        // Optimistic update — thêm vào state ngay, không refetch
        if (data) {
            setSlots(prev => [...prev, data].sort((a, b) => {
                if (a.day !== b.day) return a.day - b.day;
                return a.time_start.localeCompare(b.time_start);
            }));
        }

        return data;
    }

    async function updateSlot(id: string, updates: SlotUpdate) {
        const { error } = await supabase
            .from('slots')
            .update(updates)
            .eq('id', id);

        if (error) throw error;

        // Optimistic update — cập nhật state local
        setSlots(prev => prev.map(slot =>
            slot.id === id ? { ...slot, ...updates as Partial<Slot> } : slot
        ).sort((a, b) => {
            if (a.day !== b.day) return a.day - b.day;
            return a.time_start.localeCompare(b.time_start);
        }));
    }

    async function deleteSlot(id: string) {
        const { error } = await supabase
            .from('slots')
            .delete()
            .eq('id', id);

        if (error) throw error;

        // Optimistic update — xóa khỏi state
        setSlots(prev => prev.filter(slot => slot.id !== id));
    }

    return { slots, loading, error, createSlot, updateSlot, deleteSlot, refetch: fetchSlots };
}
