import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Database } from '../lib/database.types';

type Slot = Database['public']['Tables']['slots']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

interface DraggableSlotCardProps {
    slot: Slot;
    category: Category;
    onClick: () => void;
    hasConflict?: boolean;
}

export function DraggableSlotCard({ slot, category, onClick, hasConflict }: DraggableSlotCardProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: slot.id,
        data: { slot },
    });

    const containerStyle = {
        background: hasConflict ? '#ffdddd' : category.color_bg,
        color: category.color_text,
        borderRadius: '4px',
        minHeight: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '10px',
        fontWeight: 500,
        textAlign: 'center' as const,
        lineHeight: 1.2,
        padding: '2px 4px 2px 2px',
        opacity: isDragging ? 0.5 : 1,
        transform: CSS.Transform.toString(transform),
        transition: 'all 0.3s ease-out',
        border: hasConflict ? '1px solid #ff6666' : 'none',
        cursor: 'pointer',
    };

    return (
        <div
            ref={setNodeRef}
            style={containerStyle}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
        >
            <span
                {...listeners}
                {...attributes}
                style={{
                    cursor: isDragging ? 'grabbing' : 'grab',
                    padding: '4px 4px',
                    marginRight: '2px',
                    opacity: 0.6,
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    userSelect: 'none',
                    flexShrink: 0,
                }}
                onClick={(e) => e.stopPropagation()}
                title="Kéo để di chuyển"
            >
                ⋮⋮
            </span>
            <span style={{ flex: 1, textAlign: 'left', paddingRight: '2px' }}>{slot.label}</span>
        </div>
    );
}
