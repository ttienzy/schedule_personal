import { useState, useEffect } from 'react';
import { CategorySelect } from './CategorySelect';
import type { Database } from '../lib/database.types';

type Slot = Database['public']['Tables']['slots']['Row'];
type SlotInsert = Database['public']['Tables']['slots']['Insert'];
type Category = Database['public']['Tables']['categories']['Row'];

interface SlotModalProps {
    isOpen: boolean;
    onClose: () => void;
    slot: Slot | null;
    scheduleId: string;
    categories: Category[];
    onSave: (data: SlotInsert) => Promise<void>;
    onDelete?: (id: string) => Promise<void>;
    initialDay?: number;
    initialTime?: string;
}

export function SlotModal({
    isOpen,
    onClose,
    slot,
    scheduleId,
    categories,
    onSave,
    onDelete,
    initialDay,
    initialTime,
}: SlotModalProps) {
    const [day, setDay] = useState(initialDay || 1);
    const [timeStart, setTimeStart] = useState(initialTime || '06:30');
    const [timeEnd, setTimeEnd] = useState('07:30');
    const [categoryId, setCategoryId] = useState('');
    const [label, setLabel] = useState('');
    const [saving, setSaving] = useState(false);
    const [timeError, setTimeError] = useState<string | null>(null);

    useEffect(() => {
        if (slot) {
            setDay(slot.day);
            setTimeStart(slot.time_start.substring(0, 5));
            setTimeEnd(slot.time_end.substring(0, 5));
            setCategoryId(slot.category_id);
            setLabel(slot.label);
        } else {
            setDay(initialDay || 1);
            setTimeStart(initialTime || '06:30');
            setTimeEnd('07:30');
            setCategoryId(categories[0]?.id || '');
            setLabel('');
        }
        setTimeError(null);
    }, [slot, initialDay, initialTime, categories]);

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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validate time
        if (timeStart >= timeEnd) {
            setTimeError('Giờ bắt đầu phải nhỏ hơn giờ kết thúc');
            return;
        }

        setSaving(true);
        try {
            await onSave({
                schedule_id: scheduleId,
                category_id: categoryId,
                day,
                time_start: timeStart + ':00',
                time_end: timeEnd + ':00',
                label,
            });
            onClose();
        } catch (err) {
            alert('Lỗi: ' + (err as Error).message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!slot || !onDelete) return;
        if (!confirm('Xóa slot này?')) return;

        setSaving(true);
        try {
            await onDelete(slot.id);
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
                    maxWidth: '400px',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                }}
            >
                <h2 style={{ fontSize: '16px', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                    {slot ? 'Sửa slot' : 'Thêm slot mới'}
                </h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: 'var(--text-secondary)' }}>Ngày</label>
                        <select
                            value={day}
                            onChange={(e) => setDay(Number(e.target.value))}
                            style={{ width: '100%', padding: '6px', fontSize: '13px' }}
                        >
                            <option value={1}>Thứ 2</option>
                            <option value={2}>Thứ 3</option>
                            <option value={3}>Thứ 4</option>
                            <option value={4}>Thứ 5</option>
                            <option value={5}>Thứ 6</option>
                            <option value={6}>Thứ 7</option>
                            <option value={7}>Chủ nhật</option>
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: 'var(--text-secondary)' }}>Giờ bắt đầu</label>
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
                            <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: 'var(--text-secondary)' }}>Giờ kết thúc</label>
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

                    <div style={{ marginBottom: '1rem' }}>
                        <CategorySelect
                            categories={categories}
                            selectedId={categoryId}
                            onChange={setCategoryId}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: 'var(--text-secondary)' }}>Nội dung</label>
                        <input
                            type="text"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="VD: Dậy + Ăn sáng"
                            style={{ width: '100%', padding: '6px', fontSize: '13px' }}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        {slot && onDelete && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={saving}
                                style={{
                                    padding: '0.5rem 1rem',
                                    fontSize: '13px',
                                    background: 'var(--danger-color)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    marginRight: 'auto',
                                }}
                            >
                                Xóa
                            </button>
                        )}
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
                            disabled={saving || !!timeError}
                            style={{
                                padding: '0.5rem 1rem',
                                fontSize: '13px',
                                background: (saving || timeError) ? 'var(--bg-hover)' : 'var(--primary-color)',
                                color: (saving || timeError) ? 'var(--text-tertiary)' : '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: (saving || timeError) ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {saving ? 'Đang lưu...' : 'Lưu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
