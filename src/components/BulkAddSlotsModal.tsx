import { useState, useEffect } from 'react';
import { CategorySelect } from './CategorySelect';
import type { Database } from '../lib/database.types';

type SlotInsert = Database['public']['Tables']['slots']['Insert'];
type Category = Database['public']['Tables']['categories']['Row'];
type Slot = Database['public']['Tables']['slots']['Row'];

interface BulkAddSlotsModalProps {
    isOpen: boolean;
    onClose: () => void;
    scheduleId: string;
    categories: Category[];
    existingSlots: Slot[];
    onSave: (slots: SlotInsert[]) => Promise<void>;
}

const DAYS = [
    { value: 1, label: 'Thứ 2' },
    { value: 2, label: 'Thứ 3' },
    { value: 3, label: 'Thứ 4' },
    { value: 4, label: 'Thứ 5' },
    { value: 5, label: 'Thứ 6' },
    { value: 6, label: 'Thứ 7' },
    { value: 7, label: 'Chủ nhật' },
];

export function BulkAddSlotsModal({
    isOpen,
    onClose,
    scheduleId,
    categories,
    existingSlots,
    onSave,
}: BulkAddSlotsModalProps) {
    const [selectedDays, setSelectedDays] = useState<number[]>([]);
    const [timeStart, setTimeStart] = useState('06:30');
    const [timeEnd, setTimeEnd] = useState('07:30');
    const [categoryId, setCategoryId] = useState('');
    const [label, setLabel] = useState('');
    const [saving, setSaving] = useState(false);
    const [conflicts, setConflicts] = useState<string[]>([]);
    const [showConflicts, setShowConflicts] = useState(false);
    const [timeError, setTimeError] = useState<string | null>(null);

    useEffect(() => {
        if (categories.length > 0 && !categoryId) {
            setCategoryId(categories[0].id);
        }
    }, [categories, categoryId]);

    useEffect(() => {
        if (isOpen) {
            checkConflicts();
        }
    }, [selectedDays, timeStart, timeEnd, isOpen]);

    // Validate time whenever timeStart or timeEnd changes
    useEffect(() => {
        if (timeStart && timeEnd) {
            if (timeStart >= timeEnd) {
                setTimeError('Giờ bắt đầu phải nhỏ hơn giờ kết thúc');
            } else {
                setTimeError(null);
            }
        }
    }, [timeStart, timeEnd]);

    if (!isOpen) return null;

    const toggleDay = (day: number) => {
        setSelectedDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
        );
    };

    const toggleAllDays = () => {
        if (selectedDays.length === 7) {
            setSelectedDays([]);
        } else {
            setSelectedDays([1, 2, 3, 4, 5, 6, 7]);
        }
    };

    const checkConflicts = () => {
        const conflictMessages: string[] = [];
        const startTime = timeStart + ':00';
        const endTime = timeEnd + ':00';

        selectedDays.forEach(day => {
            const dayLabel = DAYS.find(d => d.value === day)?.label || `Ngày ${day}`;
            const daySlots = existingSlots.filter(s => s.day === day);

            daySlots.forEach(slot => {
                // Check if time ranges overlap
                const slotStart = slot.time_start;
                const slotEnd = slot.time_end;

                const hasOverlap = (
                    (startTime >= slotStart && startTime < slotEnd) ||
                    (endTime > slotStart && endTime <= slotEnd) ||
                    (startTime <= slotStart && endTime >= slotEnd)
                );

                if (hasOverlap) {
                    conflictMessages.push(
                        `${dayLabel}: Trùng với "${slot.label}" (${slot.time_start.slice(0, 5)} - ${slot.time_end.slice(0, 5)})`
                    );
                }
            });
        });

        setConflicts(conflictMessages);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (selectedDays.length === 0) {
            alert('Vui lòng chọn ít nhất 1 ngày');
            return;
        }

        // Validate time
        if (timeStart >= timeEnd) {
            setTimeError('Giờ bắt đầu phải nhỏ hơn giờ kết thúc');
            return;
        }

        if (conflicts.length > 0) {
            setShowConflicts(true);
            return;
        }

        setSaving(true);
        try {
            const slots: SlotInsert[] = selectedDays.map(day => ({
                schedule_id: scheduleId,
                category_id: categoryId,
                day,
                time_start: timeStart + ':00',
                time_end: timeEnd + ':00',
                label,
            }));

            await onSave(slots);

            // Reset form
            setSelectedDays([]);
            setTimeStart('06:30');
            setTimeEnd('07:30');
            setLabel('');
            setConflicts([]);
            setShowConflicts(false);
            setTimeError(null);

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
                    maxWidth: '500px',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                }}
            >
                <h2 style={{ fontSize: '16px', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                    Thêm nhiều slots cùng lúc
                </h2>

                <form onSubmit={handleSubmit}>
                    {/* Day Selection */}
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                Chọn ngày ({selectedDays.length}/7)
                            </label>
                            <button
                                type="button"
                                onClick={toggleAllDays}
                                style={{
                                    padding: '4px 8px',
                                    fontSize: '11px',
                                    background: 'var(--bg-hover)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    color: 'var(--text-primary)',
                                }}
                            >
                                {selectedDays.length === 7 ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                            </button>
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                            gap: '8px',
                        }}>
                            {DAYS.map(day => (
                                <button
                                    key={day.value}
                                    type="button"
                                    onClick={() => toggleDay(day.value)}
                                    style={{
                                        padding: '8px 12px',
                                        fontSize: '12px',
                                        background: selectedDays.includes(day.value)
                                            ? 'var(--primary-color)'
                                            : 'var(--bg-hover)',
                                        color: selectedDays.includes(day.value)
                                            ? '#fff'
                                            : 'var(--text-primary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {day.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Time Range */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: 'var(--text-secondary)' }}>
                                Giờ bắt đầu
                            </label>
                            <input
                                type="time"
                                value={timeStart}
                                onChange={(e) => setTimeStart(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '6px',
                                    fontSize: '13px',
                                    borderColor: timeError ? 'var(--danger-color)' : undefined,
                                }}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: 'var(--text-secondary)' }}>
                                Giờ kết thúc
                            </label>
                            <input
                                type="time"
                                value={timeEnd}
                                onChange={(e) => setTimeEnd(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '6px',
                                    fontSize: '13px',
                                    borderColor: timeError ? 'var(--danger-color)' : undefined,
                                }}
                                required
                            />
                        </div>
                    </div>

                    {/* Time Error Message */}
                    {timeError && (
                        <div style={{
                            marginBottom: '1rem',
                            padding: '8px 12px',
                            background: 'rgba(220, 53, 69, 0.1)',
                            border: '1px solid var(--danger-color)',
                            borderRadius: '6px',
                            color: 'var(--danger-color)',
                            fontSize: '12px',
                        }}>
                            ⚠️ {timeError}
                        </div>
                    )}

                    {/* Category */}
                    <div style={{ marginBottom: '1rem' }}>
                        <CategorySelect
                            categories={categories}
                            selectedId={categoryId}
                            onChange={setCategoryId}
                        />
                    </div>

                    {/* Label */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: 'var(--text-secondary)' }}>
                            Nội dung
                        </label>
                        <input
                            type="text"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="VD: Dậy + Ăn sáng"
                            style={{ width: '100%', padding: '6px', fontSize: '13px' }}
                            required
                        />
                    </div>

                    {/* Conflicts Warning */}
                    {conflicts.length > 0 && (
                        <div style={{
                            marginBottom: '1rem',
                            padding: '12px',
                            background: 'rgba(255, 152, 0, 0.1)',
                            border: '1px solid #ff9800',
                            borderRadius: '8px',
                            fontSize: '12px',
                        }}>
                            <div style={{ fontWeight: 500, marginBottom: '6px', color: '#ff9800' }}>
                                ⚠️ Phát hiện {conflicts.length} xung đột:
                            </div>
                            {showConflicts && (
                                <ul style={{ margin: '6px 0 0 20px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                    {conflicts.map((conflict, idx) => (
                                        <li key={idx}>{conflict}</li>
                                    ))}
                                </ul>
                            )}
                            {!showConflicts && (
                                <button
                                    type="button"
                                    onClick={() => setShowConflicts(true)}
                                    style={{
                                        padding: '4px 8px',
                                        fontSize: '11px',
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#ff9800',
                                        cursor: 'pointer',
                                        textDecoration: 'underline',
                                    }}
                                >
                                    Xem chi tiết
                                </button>
                            )}
                        </div>
                    )}

                    {/* Preview */}
                    {selectedDays.length > 0 && conflicts.length === 0 && !timeError && (
                        <div style={{
                            marginBottom: '1rem',
                            padding: '12px',
                            background: 'var(--bg-hover)',
                            borderRadius: '8px',
                            fontSize: '12px',
                            color: 'var(--text-secondary)',
                        }}>
                            <div style={{ fontWeight: 500, marginBottom: '4px' }}>
                                ✓ Sẽ tạo {selectedDays.length} slot{selectedDays.length > 1 ? 's' : ''}
                            </div>
                            <div>
                                {DAYS.filter(d => selectedDays.includes(d.value))
                                    .map(d => d.label)
                                    .join(', ')} · {timeStart} - {timeEnd}
                            </div>
                        </div>
                    )}

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
                            disabled={saving || selectedDays.length === 0 || conflicts.length > 0 || !!timeError}
                            style={{
                                padding: '0.5rem 1rem',
                                fontSize: '13px',
                                background: (saving || selectedDays.length === 0 || conflicts.length > 0 || timeError)
                                    ? 'var(--bg-hover)'
                                    : 'var(--primary-color)',
                                color: (saving || selectedDays.length === 0 || conflicts.length > 0 || timeError)
                                    ? 'var(--text-tertiary)'
                                    : '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: (saving || selectedDays.length === 0 || conflicts.length > 0 || timeError)
                                    ? 'not-allowed'
                                    : 'pointer',
                            }}
                        >
                            {saving ? 'Đang lưu...' : `Tạo ${selectedDays.length} slot${selectedDays.length > 1 ? 's' : ''}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
