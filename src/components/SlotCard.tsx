import type { Database } from '../lib/database.types';

type Slot = Database['public']['Tables']['slots']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

interface SlotCardProps {
    slot: Slot;
    category: Category;
    onClick: () => void;
}

export function SlotCard({ slot, category, onClick }: SlotCardProps) {
    return (
        <div
            onClick={onClick}
            style={{
                background: category.color_bg,
                color: category.color_text,
                borderRadius: '4px',
                minHeight: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 500,
                textAlign: 'center',
                lineHeight: 1.2,
                padding: '2px 3px',
                cursor: 'pointer',
                transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
            {slot.label}
        </div>
    );
}
