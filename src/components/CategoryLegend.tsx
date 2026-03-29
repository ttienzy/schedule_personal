import { useState, useCallback, memo } from 'react';
import { CategoryBadge } from './CategoryBadge';
import type { Database } from '../lib/database.types';

type Category = Database['public']['Tables']['categories']['Row'];

interface CategoryLegendProps {
    categories: Category[];
    initialShowCount?: number;
}

export const CategoryLegend = memo(function CategoryLegend({ categories, initialShowCount = 5 }: CategoryLegendProps) {
    const [showAll, setShowAll] = useState(false);

    const displayCategories = showAll ? categories : categories.slice(0, initialShowCount);
    const hasMore = categories.length > initialShowCount;

    const toggleShowAll = useCallback(() => {
        setShowAll(prev => !prev);
    }, []);

    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1rem', alignItems: 'center' }}>
            {displayCategories.map(cat => (
                <CategoryBadge key={cat.id} category={cat} />
            ))}

            {hasMore && (
                <button
                    onClick={toggleShowAll}
                    style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        background: '#e8e6dd',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: '#5f5e5a',
                    }}
                >
                    {showAll ? '← Thu gọn' : `+ ${categories.length - initialShowCount} khác`}
                </button>
            )}
        </div>
    );
});
