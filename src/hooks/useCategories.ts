import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Category = Database['public']['Tables']['categories']['Row'];

export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    async function fetchCategories() {
        try {
            setLoading(true);

            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('id');

            if (error) throw error;

            setCategories(data || []);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }


    return { categories, loading, error, refetch: fetchCategories };
}
