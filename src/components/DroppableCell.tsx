import { useDroppable } from '@dnd-kit/core';

interface DroppableCellProps {
    day: number;
    timeSlot: string;
    onClick: () => void;
    children?: React.ReactNode;
}

export function DroppableCell({ day, timeSlot, onClick, children }: DroppableCellProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: `${day}-${timeSlot}`,
        data: { day, timeSlot },
    });

    const hasSlot = !!children;
    const showSwapIndicator = isOver && hasSlot;

    return (
        <div
            ref={setNodeRef}
            onClick={onClick}
            style={{
                background: isOver ? (hasSlot ? '#fff4e6' : '#d4e8ff') : children ? 'transparent' : '#f1efe8',
                minHeight: '28px',
                borderRadius: '4px',
                cursor: children ? 'default' : 'pointer',
                transition: 'background 0.2s',
                position: 'relative',
                border: showSwapIndicator ? '2px dashed #ff9800' : 'none',
            }}
        >
            {children}
            {showSwapIndicator && (
                <div
                    style={{
                        position: 'absolute',
                        top: '-20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#ff9800',
                        color: '#fff',
                        fontSize: '9px',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                        zIndex: 100,
                    }}
                >
                    ⇄ Hoán đổi
                </div>
            )}
        </div>
    );
}
