import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Schedule = Database['public']['Tables']['schedules']['Row'];

export function useSchedule(scheduleId: string | null, requireAuth = true) {
    const [schedule, setSchedule] = useState<Schedule | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (scheduleId) {
            fetchSchedule();
        }
    }, [scheduleId]);

    async function fetchSchedule() {
        if (!scheduleId) return;

        try {
            setLoading(true);

            let query = supabase
                .from('schedules')
                .select('*')
                .eq('id', scheduleId);

            if (requireAuth) {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error('Not authenticated');
                query = query.eq('owner_id', user.id);
            } else {
                query = query.eq('is_shared', true);
            }

            const { data, error } = await query.single();

            if (error) throw error;
            setSchedule(data);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }

    return { schedule, loading, error, refetch: fetchSchedule };
}
