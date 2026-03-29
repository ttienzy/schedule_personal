import { useState, useEffect } from 'react';
import { CategorySelect } from './CategorySelect';
import type { Database } from '../lib/database.types';

type Slot = Database['public']['Tables']['slots']['Row'];
type SlotInsert = Database['public']['Tables']['slots']['Insert'];
type Category = Database['public']['Tables']['categories']['Row'];

interface SlotInput {
    id: string;
    timeStart: string;
    timeEnd: string;
    categoryId: string;
    label: string;
}

interface BulkAddSlotsByDayModalProps {
    isOpen: boolean;
    onClose: () => void;
    day: number;
    dayLabel: string;
    scheduleId: string;
    categories: Category[];
    existingSlots: Slot[];
    onSave: (slots: SlotInsert[]) => Promise<void>;
}

const DAY_LABELS: Record<number, string> = {
    1: 'Thứ 2',
    2: 'Thứ 3',
    3: 'Thứ 4',
    4: 'Thứ 5',
    5: 'Thứ 6',
    6: 'Thứ 7',
    7: 'Chủ nhật',
};

export function BulkAddSlotsByDayModal({
    isOpen,
    onClose,
    day,
    dayLabel,
    scheduleId,
    categories,
    existingSlots,
    onSave,
}: BulkAddSlotsByDayModalProps) {
    const [slots, setSlots] = useState<SlotInput[]>([]);
    const [saving, setSaving] = useState(false);
    const [conflicts, setConflicts] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            // Initialize with one empty slot
            setSlots([createEmptySlot()]);
            setConflicts([]);
        }
    }, [isOpen, categories]);

    function createEmptySlot(): SlotInput {
        return {
            id: Math.random().toString(36).substring(7),
            timeStart: '06:30',
            timeEnd: '07:30',
            categoryId: categories[0]?.id || '',
            label: '',
        };
    }

    function addSlot() {
        setSlots([...slots, createEmptySlot()]);
    }

    function removeSlot(id: string) {
        setSlots(slots.filter(s => s.id !== id));
    }

    function updateSlot(id: string, updates: Partial<SlotInput>) {
        setSlots(slots.map(s => s.id === id ? { ...s, ...updates } : s));
    }

    // Check for conflicts
    useEffect(() => {
        const newConflicts: string[] = [];

        slots.forEach(slot => {
            // Check time validation
            if (slot.timeStart >= slot.timeEnd) {
                newConflicts.push(`Slot "${slot.label || 'Chưa đặt tên'}" có giờ bắt đầu phải nhỏ hơn giờ kết thúc`);
                return;
            }

            // Check conflict with existing slots
            const slotStart = slot.timeStart + ':00';
            const slotEnd = slot.timeEnd + ':00';

            const hasConflict = existingSlots.some(existing => {
                if (existing.day !== day) return false;

                const existingStart = existing.time_start;
                const existingEnd = existing.time_end;

                // Check overlap
                return (
                    (slotStart >= existingStart && slotStart < existingEnd) ||
                    (slotEnd > existingStart && slotEnd <= existingEnd) ||
                    (slotStart <= existingStart && slotEnd >= existingEnd)
                );
            });

            if (hasConflict) {
                newConflicts.push(`Slot "${slot.label || 'Chưa đặt tên'}" (${slot.timeStart}-${slot.timeEnd}) trùng với slot đã có`);
            }

            // Check conflict with other new slots
            slots.forEach(otherSlot => {
                if (otherSlot.id === slot.id) return;

                const otherStart = otherSlot.timeStart + ':00';
                const otherEnd = otherSlot.timeEnd + ':00';

                const hasInternalConflict = (
                    (slotStart >= otherStart && slotStart < otherEnd) ||
                    (slotEnd > otherStart && slotEnd <= otherEnd) ||
                    (slotStart <= otherStart && slotEnd >= otherEnd)
                );

                if (hasInternalConflict) {
                    newConflicts.push(`Slot "${slot.label || 'Chưa đặt tên'}" trùng với slot "${otherSlot.label || 'Chưa đặt tên'}"`);
                }
            });
        });

        setConflicts([...new Set(newConflicts)]); // Remove duplicates
    }, [slots, existingSlots, day]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (conflicts.length > 0) return;
        if (slots.length === 0) return;

        // Validate all slots have labels
        const hasEmptyLabel = slots.some(s => !s.label.trim());
        if (hasEmptyLabel) {
            alert('Vui lòng điền nội dung cho tất cả các slots');
            return;
        }

        setSaving(true);
        try {
            const slotsToCreate: SlotInsert[] = slots.map(slot => ({
                schedule_id: scheduleId,
                category_id: slot.categoryId,
                day,
                time_start: slot.timeStart + ':00',
                time_end: slot.timeEnd + ':00',
                label: slot.label,
            }));

            await onSave(slotsToCreate);
            onClose();
        } catch (err) {
            alert('Lỗi: ' + (err as Error).message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem',
            }}
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: 'var(--bg-card)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    width: '90%',
                    maxWidth: '600px',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                }}
            >
                <h2 style={{ fontSize: '16px', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                    Thêm nhiều slots - {DAY_LABELS[day]}
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    Thêm nhiều hoạt động vào {dayLabel} cùng lúc
                </p>

                <form onSubmit={handleSubmit}>
                    {/* Slots List */}
                    <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {slots.map((slot, index) => (
                            <div
                                key={slot.id}
                                style={{
                                    padding: '0.75rem',
                                    background: 'var(--bg-hover)',
                                    borderRadius: '6px',
                                    border: '1px solid var(--border-light)',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                                        Slot {index + 1}
                                    </span>
                                    {slots.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeSlot(slot.id)}
                                            style={{
                                                padding: '2px 6px',
                                                fontSize: '11px',
                                                background: 'var(--danger-color)',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            Xóa
                                        </button>
                                    )}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px', color: 'var(--text-secondary)' }}>
                                            Giờ bắt đầu
                                        </label>
                                        <input
                                            type="time"
                                            value={slot.timeStart}
                                            onChange={(e) => updateSlot(slot.id, { timeStart: e.target.value })}
                                            style={{ width: '100%', padding: '6px', fontSize: '12px' }}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px', color: 'var(--text-secondary)' }}>
                                            Giờ kết thúc
                                        </label>
                                        <input
                                            type="time"
                                            value={slot.timeEnd}
                                            onChange={(e) => updateSlot(slot.id, { timeEnd: e.target.value })}
                                            style={{ width: '100%', padding: '6px', fontSize: '12px' }}
                                            required
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '0.5rem' }}>
                                    <CategorySelect
                                        categories={categories}
                                        selectedId={slot.categoryId}
                                        onChange={(id) => updateSlot(slot.id, { categoryId: id })}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px', color: 'var(--text-secondary)' }}>
                                        Nội dung
                                    </label>
                                    <input
                                        type="text"
                                        value={slot.label}
                                        onChange={(e) => updateSlot(slot.id, { label: e.target.value })}
                                        placeholder="VD: Dậy + Ăn sáng"
                                        style={{ width: '100%', padding: '6px', fontSize: '12px' }}
                                        required
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add Slot Button */}
                    <button
                        type="button"
                        onClick={addSlot}
                        style={{
                            width: '100%',
                            padding: '8px',
                            fontSize: '12px',
                            background: 'var(--bg-hover)',
                            border: '1px dashed var(--border-color)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: 'var(--text-primary)',
                            marginBottom: '1rem',
                        }}
                    >
                        + Thêm slot
                    </button>

                    {/* Conflicts */}
                    {conflicts.length > 0 && (
                        <div
                            style={{
                                marginBottom: '1rem',
                                padding: '0.75rem',
                                background: 'rgba(220, 53, 69, 0.1)',
                                border: '1px solid var(--danger-color)',
                                borderRadius: '6px',
                            }}
                        >
                            <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--danger-color)', marginBottom: '0.5rem' }}>
                                ⚠️ Có {conflicts.length} xung đột:
                            </div>
                            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '11px', color: 'var(--danger-color)' }}>
                                {conflicts.map((conflict, i) => (
                                    <li key={i}>{conflict}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Summary */}
                    <div
                        style={{
                            marginBottom: '1rem',
                            padding: '0.75rem',
                            background: 'var(--bg-hover)',
                            borderRadius: '6px',
                            fontSize: '12px',
                            color: 'var(--text-secondary)',
                        }}
                    >
                        Sẽ tạo {slots.length} slot{slots.length > 1 ? 's' : ''} cho {dayLabel}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            style={{
                                padding: '0.5rem 1rem',
                                fontSize: '13px',
                                background: 'var(--bg-hover)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                color: 'var(--text-primary)',
                            }}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={saving || conflicts.length > 0 || slots.length === 0}
                            style={{
                                padding: '0.5rem 1rem',
                                fontSize: '13px',
                                background: (saving || conflicts.length > 0) ? 'var(--bg-hover)' : 'var(--primary-color)',
                                color: (saving || conflicts.length > 0) ? 'var(--text-tertiary)' : '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: (saving || conflicts.length > 0) ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {saving ? 'Đang lưu...' : `Tạo ${slots.length} slot${slots.length > 1 ? 's' : ''}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
