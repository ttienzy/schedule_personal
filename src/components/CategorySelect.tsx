import type { Database } from '../lib/database.types';

type Category = Database['public']['Tables']['categories']['Row'];

interface CategorySelectProps {
    categories: Category[];
    selectedId: string;
    onChange: (id: string) => void;
}

export function CategorySelect({ categories, selectedId, onChange }: CategorySelectProps) {
    const selectedCategory = categories.find(c => c.id === selectedId);

    return (
        <div>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Danh mục
            </label>
            <select
                value={selectedId}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '14px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    background: selectedCategory?.color_bg || 'var(--bg-card)',
                    color: selectedCategory?.color_text || 'var(--text-primary)',
                    cursor: 'pointer',
                    fontWeight: 500,
                }}
            >
                {categories.map(cat => (
                    <option
                        key={cat.id}
                        value={cat.id}
                        style={{
                            background: 'var(--bg-card)',
                            color: 'var(--text-primary)',
                            padding: '8px',
                        }}
                    >
                        {cat.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
