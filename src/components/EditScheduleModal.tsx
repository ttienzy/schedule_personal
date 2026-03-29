import { useState, useEffect } from 'react';
import type { Database } from '../lib/database.types';

type Schedule = Database['public']['Tables']['schedules']['Row'];
type ScheduleUpdate = Database['public']['Tables']['schedules']['Update'];

interface EditScheduleModalProps {
    isOpen: boolean;
    schedule: Schedule;
    onClose: () => void;
    onSave: (updates: ScheduleUpdate) => Promise<void>;
}

export function EditScheduleModal({ isOpen, schedule, onClose, onSave }: EditScheduleModalProps) {
    const [title, setTitle] = useState(schedule.title);
    const [weekLabel, setWeekLabel] = useState(schedule.week_label || '');
    const [dateFrom, setDateFrom] = useState(schedule.date_from);
    const [dateTo, setDateTo] = useState(schedule.date_to);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setTitle(schedule.title);
        setWeekLabel(schedule.week_label || '');
        setDateFrom(schedule.date_from);
        setDateTo(schedule.date_to);
    }, [schedule]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);

        try {
            await onSave({
                title,
                week_label: weekLabel || null,
                date_from: dateFrom,
                date_to: dateTo,
            });
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
                zIndex: 1500,
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
                    maxWidth: '450px',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                }}
            >
                <h2 style={{ fontSize: '16px', marginBottom: '1rem', color: 'var(--text-primary)' }}>Chỉnh sửa lịch trình</h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--text-secondary)' }}>Tiêu đề</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--text-secondary)' }}>Nhãn tuần</label>
                        <input
                            type="text"
                            value={weekLabel}
                            onChange={(e) => setWeekLabel(e.target.value)}
                            placeholder="VD: Tuần 35 (30/03 – 05/04/2026)"
                            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--text-secondary)' }}>Từ ngày</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                style={{ width: '100%', padding: '8px', fontSize: '14px' }}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--text-secondary)' }}>Đến ngày</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                style={{ width: '100%', padding: '8px', fontSize: '14px' }}
                                required
                            />
                        </div>
                    </div>

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
                            disabled={saving}
                            style={{
                                padding: '0.5rem 1rem',
                                fontSize: '13px',
                                background: 'var(--primary-color)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
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
