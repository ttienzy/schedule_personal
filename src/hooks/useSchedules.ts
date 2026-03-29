import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Schedule = Database['public']['Tables']['schedules']['Row'];
type ScheduleInsert = Database['public']['Tables']['schedules']['Insert'];

interface UseSchedulesOptions {
    pageSize?: number;
    searchQuery?: string;
}

export function useSchedules(options: UseSchedulesOptions = {}) {
    const { pageSize = 5, searchQuery = '' } = options;
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        fetchSchedules();
    }, [currentPage, searchQuery]);

    async function fetchSchedules() {
        try {
            setLoading(true);
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError) throw userError;
            if (!user) throw new Error('Not authenticated');

            // Build query
            let query = supabase
                .from('schedules')
                .select('*', { count: 'exact' })
                .eq('owner_id', user.id);

            // Apply search filter
            if (searchQuery.trim()) {
                query = query.or(`title.ilike.%${searchQuery}%,week_label.ilike.%${searchQuery}%`);
            }

            // Apply pagination (fetch max 10 per request)
            const from = (currentPage - 1) * pageSize;
            const to = from + Math.min(pageSize, 10) - 1;

            const { data, error, count } = await query
                .order('date_from', { ascending: false })
                .range(from, to);

            if (error) throw error;

            setSchedules(data || []);
            setTotalCount(count || 0);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }


    async function createSchedule(schedule: Omit<ScheduleInsert, 'owner_id'>) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Kiểm tra trùng lặp tuần
        const { data: existingSchedules, error: checkError } = await supabase
            .from('schedules')
            .select('id, date_from, date_to, week_label')
            .eq('owner_id', user.id)
            .or(`date_from.lte.${schedule.date_to},date_to.gte.${schedule.date_from}`);

        if (checkError) throw checkError;

        if (existingSchedules && existingSchedules.length > 0) {
            const conflictSchedule = existingSchedules[0];
            const conflictLabel = conflictSchedule.week_label || `${conflictSchedule.date_from} → ${conflictSchedule.date_to}`;
            throw new Error(
                `Tuần này đã tồn tại!\n\n` +
                `Lịch trình "${conflictLabel}" đã bao gồm khoảng thời gian từ ${schedule.date_from} đến ${schedule.date_to}.\n\n` +
                `Vui lòng chọn khoảng thời gian khác hoặc chỉnh sửa lịch trình hiện có.`
            );
        }

        const { data, error } = await supabase
            .from('schedules')
            .insert({ ...schedule, owner_id: user.id })
            .select()
            .single();

        if (error) throw error;

        // Optimistic update
        if (data) {
            setSchedules(prev => [data, ...prev]);
            setTotalCount(prev => prev + 1);
        }

        return data;
    }

    async function updateSchedule(id: string, updates: Omit<Database['public']['Tables']['schedules']['Update'], 'owner_id'>) {
        const { data, error } = await supabase
            .from('schedules')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Optimistic update
        if (data) {
            setSchedules(prev => prev.map(s => s.id === id ? data : s));
        }

        return data;
    }

    async function deleteSchedule(id: string) {
        const { error } = await supabase
            .from('schedules')
            .delete()
            .eq('id', id);

        if (error) throw error;

        // Optimistic update
        setSchedules(prev => prev.filter(s => s.id !== id));
        setTotalCount(prev => prev - 1);
    }

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
        schedules,
        loading,
        error,
        currentPage,
        totalPages,
        totalCount,
        setCurrentPage,
        createSchedule,
        updateSchedule,
        deleteSchedule,
        refetch: fetchSchedules
    };
}
