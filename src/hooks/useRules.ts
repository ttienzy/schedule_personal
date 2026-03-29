import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Rule = Database['public']['Tables']['rules']['Row'];
type RuleInsert = Database['public']['Tables']['rules']['Insert'];
type RuleUpdate = Database['public']['Tables']['rules']['Update'];

export function useRules(scheduleId: string | null) {
    const [rules, setRules] = useState<Rule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (scheduleId) {
            fetchRules();
        }
    }, [scheduleId]);

    async function fetchRules() {
        if (!scheduleId) return;

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('rules')
                .select('*')
                .eq('schedule_id', scheduleId)
                .order('order');

            if (error) throw error;
            setRules(data || []);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }

    async function createRule(rule: RuleInsert) {
        const { data, error } = await supabase
            .from('rules')
            .insert(rule)
            .select()
            .single();

        if (error) throw error;

        // Optimistic update
        if (data) {
            setRules(prev => [...prev, data].sort((a, b) => a.order - b.order));
        }

        return data;
    }

    async function updateRule(id: string, updates: RuleUpdate) {
        const { error } = await supabase
            .from('rules')
            .update(updates)
            .eq('id', id);

        if (error) throw error;

        // Optimistic update
        setRules(prev => prev.map(rule =>
            rule.id === id ? { ...rule, ...updates } : rule
        ));
    }

    async function deleteRule(id: string) {
        const { error } = await supabase
            .from('rules')
            .delete()
            .eq('id', id);

        if (error) throw error;

        // Optimistic update
        setRules(prev => prev.filter(rule => rule.id !== id));
    }

    return { rules, loading, error, createRule, updateRule, deleteRule, refetch: fetchRules };
}
