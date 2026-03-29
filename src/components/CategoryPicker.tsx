import type { Database } from '../lib/database.types';

type Category = Database['public']['Tables']['categories']['Row'];

interface CategoryPickerProps {
    categories: Category[];
    selectedId: string;
    onChange: (id: string) => void;
}

export function CategoryPicker({ categories, selectedId, onChange }: CategoryPickerProps) {
    return (
        <div>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#3d3d3a' }}>
                Category
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {categories.map(cat => {
                    const isSelected = cat.id === selectedId;
                    return (
                        <div
                            key={cat.id}
                            onClick={() => onChange(cat.id)}
                            style={{
                                background: cat.color_bg,
                                color: cat.color_text,
                                padding: '8px 6px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 500,
                                textAlign: 'center',
                                cursor: 'pointer',
                                border: isSelected ? '2px solid #185FA5' : '2px solid transparent',
                                transition: 'all 0.2s',
                            }}
                        >
                            {cat.label}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
