import { useMemo } from 'react';
import type { Database } from '../lib/database.types';

type Slot = Database['public']['Tables']['slots']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

interface WeekGridProps {
    slots: Slot[];
    categories: Category[];
    conflicts: Set<string>;
    onSlotClick: (slot: Slot) => void;
    onEmptyClick: (day: number, timeSlot: string) => void;
    onBulkAddClick?: (day: number, dayLabel: string) => void;
    isOwner?: boolean;
}

const DAYS = [
    { value: 1, label: 'T2', fullLabel: 'Thứ 2', weekend: false },
    { value: 2, label: 'T3', fullLabel: 'Thứ 3', weekend: false },
    { value: 3, label: 'T4', fullLabel: 'Thứ 4', weekend: false },
    { value: 4, label: 'T5', fullLabel: 'Thứ 5', weekend: false },
    { value: 5, label: 'T6', fullLabel: 'Thứ 6', weekend: false },
    { value: 6, label: 'T7', fullLabel: 'Thứ 7', weekend: true },
    { value: 7, label: 'CN', fullLabel: 'Chủ nhật', weekend: true },
];

export function WeekGrid({ slots, categories, conflicts, onSlotClick, onBulkAddClick, isOwner = true }: WeekGridProps) {
    const getCategoryById = (id: string) => categories.find(c => c.id === id);

    // Group slots by day and sort by time
    const slotsByDay = useMemo(() => {
        const grouped: Record<number, Slot[]> = {};
        DAYS.forEach(d => {
            grouped[d.value] = slots
                .filter(s => s.day === d.value)
                .sort((a, b) => a.time_start.localeCompare(b.time_start));
        });
        return grouped;
    }, [slots]);

    return (
        <>
            {/* Desktop Grid View */}
            <div className="week-grid-desktop" style={{ display: 'block' }}>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, 1fr)',
                        gap: '8px',
                        marginBottom: '1rem',
                    }}
                >
                    {DAYS.map(day => (
                        <div key={day.value}>
                            {/* Day Header */}
                            <div
                                style={{
                                    padding: '8px',
                                    background: 'var(--bg-hover)',
                                    borderRadius: '6px 6px 0 0',
                                    border: '1px solid var(--border-light)',
                                    borderBottom: 'none',
                                    textAlign: 'center',
                                    fontWeight: 600,
                                    fontSize: '11px',
                                    color: day.weekend ? 'var(--text-tertiary)' : 'var(--text-primary)',
                                }}
                            >
                                {day.label}
                            </div>

                            {/* Slots Column */}
                            <div
                                style={{
                                    minHeight: '300px',
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-light)',
                                    borderRadius: '0 0 6px 6px',
                                    padding: '6px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '6px',
                                }}
                            >
                                {slotsByDay[day.value]?.length === 0 ? (
                                    <div
                                        style={{
                                            padding: '1.5rem 0.5rem',
                                            textAlign: 'center',
                                            color: 'var(--text-tertiary)',
                                            fontSize: '11px',
                                        }}
                                    >
                                        Chưa có hoạt động
                                    </div>
                                ) : (
                                    slotsByDay[day.value]?.map(slot => {
                                        const category = getCategoryById(slot.category_id);
                                        if (!category) return null;

                                        return (
                                            <div
                                                key={slot.id}
                                                onClick={() => onSlotClick(slot)}
                                                style={{
                                                    background: conflicts.has(slot.id) ? '#ffdddd' : category.color_bg,
                                                    color: category.color_text,
                                                    borderRadius: '4px',
                                                    padding: '6px 8px',
                                                    cursor: 'pointer',
                                                    border: conflicts.has(slot.id) ? '1px solid #ff6666' : `1px solid ${category.color_bg}`,
                                                    transition: 'all 0.2s',
                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.12)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.08)';
                                                }}
                                            >
                                                {/* Time Range */}
                                                <div
                                                    style={{
                                                        fontSize: '9px',
                                                        opacity: 0.8,
                                                        marginBottom: '3px',
                                                        fontWeight: 500,
                                                        letterSpacing: '0.2px',
                                                    }}
                                                >
                                                    {slot.time_start.substring(0, 5)} - {slot.time_end.substring(0, 5)}
                                                </div>

                                                {/* Label */}
                                                <div
                                                    style={{
                                                        fontSize: '11px',
                                                        fontWeight: 600,
                                                        lineHeight: 1.3,
                                                    }}
                                                >
                                                    {slot.label}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}

                                {/* Add Slots Button */}
                                {isOwner && onBulkAddClick && (
                                    <button
                                        onClick={() => onBulkAddClick(day.value, day.label)}
                                        style={{
                                            marginTop: 'auto',
                                            padding: '6px 8px',
                                            fontSize: '10px',
                                            background: 'transparent',
                                            color: 'var(--text-secondary)',
                                            border: '1px dashed var(--border-color)',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontWeight: 500,
                                            transition: 'all 0.2s',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'var(--bg-hover)';
                                            e.currentTarget.style.borderColor = 'var(--primary-color)';
                                            e.currentTarget.style.color = 'var(--primary-color)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'transparent';
                                            e.currentTarget.style.borderColor = 'var(--border-color)';
                                            e.currentTarget.style.color = 'var(--text-secondary)';
                                        }}
                                        title={`Thêm nhiều hoạt động vào ${day.label}`}
                                    >
                                        Thêm vào {day.label}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile List View */}
            <div className="week-grid-mobile" style={{ display: 'none' }}>
                {DAYS.map(day => {
                    const daySlots = slotsByDay[day.value] || [];

                    return (
                        <div
                            key={day.value}
                            style={{
                                marginBottom: '1rem',
                                background: 'var(--bg-card)',
                                borderRadius: '8px',
                                border: '1px solid var(--border-light)',
                                overflow: 'hidden',
                            }}
                        >
                            <div
                                style={{
                                    padding: '0.75rem 1rem',
                                    background: day.weekend ? 'var(--bg-hover)' : 'var(--bg-card)',
                                    borderBottom: '1px solid var(--border-light)',
                                    fontWeight: 600,
                                    fontSize: '14px',
                                    color: 'var(--text-primary)',
                                }}
                            >
                                {day.fullLabel}
                            </div>
                            <div style={{ padding: '0.5rem' }}>
                                {daySlots.length === 0 ? (
                                    <div
                                        style={{
                                            padding: '1.5rem',
                                            textAlign: 'center',
                                            color: 'var(--text-tertiary)',
                                            fontSize: '13px',
                                        }}
                                    >
                                        Chưa có hoạt động
                                    </div>
                                ) : (
                                    daySlots.map(slot => {
                                        const category = getCategoryById(slot.category_id);
                                        if (!category) return null;

                                        return (
                                            <div
                                                key={slot.id}
                                                onClick={() => onSlotClick(slot)}
                                                style={{
                                                    padding: '12px',
                                                    margin: '0.5rem',
                                                    background: conflicts.has(slot.id) ? '#ffdddd' : category.color_bg,
                                                    color: category.color_text,
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    border: conflicts.has(slot.id) ? '2px solid #ff6666' : 'none',
                                                }}
                                            >
                                                <div style={{ fontSize: '11px', opacity: 0.85, marginBottom: '4px', fontWeight: 500 }}>
                                                    {slot.time_start.substring(0, 5)} - {slot.time_end.substring(0, 5)}
                                                </div>
                                                <div style={{ fontSize: '14px', fontWeight: 600 }}>
                                                    {slot.label}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}

                                {/* Add Slots Button for Mobile */}
                                {isOwner && onBulkAddClick && (
                                    <button
                                        onClick={() => onBulkAddClick(day.value, day.fullLabel)}
                                        style={{
                                            width: '100%',
                                            marginTop: '0.5rem',
                                            padding: '10px',
                                            fontSize: '13px',
                                            background: 'transparent',
                                            color: 'var(--text-secondary)',
                                            border: '1px dashed var(--border-color)',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: 500,
                                        }}
                                    >
                                        Thêm vào {day.fullLabel}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <style>
                {`
                    @media (max-width: 768px) {
                        .week-grid-desktop {
                            display: none !important;
                        }
                        .week-grid-mobile {
                            display: block !important;
                        }
                    }
                `}
            </style>
        </>
    );
}
