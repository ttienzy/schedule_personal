import type { Database } from '../lib/database.types';

type Category = Database['public']['Tables']['categories']['Row'];

interface CategoryBadgeProps {
    category: Category;
    showDot?: boolean;
}

export function CategoryBadge({ category, showDot = true }: CategoryBadgeProps) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
            {showDot && (
                <div
                    style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '2px',
                        background: category.color_bg,
                        flexShrink: 0,
                    }}
                />
            )}
            <span style={{ color: '#5f5e5a' }}>{category.label}</span>
        </div>
    );
}
