import { useState } from 'react';
import type { Database } from '../lib/database.types';

type ScheduleInsert = Omit<Database['public']['Tables']['schedules']['Insert'], 'owner_id'>;

interface CreateScheduleFormProps {
    onSubmit: (schedule: ScheduleInsert) => Promise<void>;
    onCancel?: () => void;
}

export function CreateScheduleForm({ onSubmit, onCancel }: CreateScheduleFormProps) {
    const [title, setTitle] = useState('Lịch trình tuần');
    const [weekLabel, setWeekLabel] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Auto calculate dateTo khi chọn dateFrom
    const handleDateFromChange = (date: string) => {
        setDateFrom(date);
        setErrorMessage(null); // Clear error when user changes date
        if (date) {
            const from = new Date(date);
            const to = new Date(from);
            to.setDate(to.getDate() + 6);
            setDateTo(to.toISOString().split('T')[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        setErrorMessage(null);

        try {
            await onSubmit({
                title,
                week_label: weekLabel || null,
                date_from: dateFrom,
                date_to: dateTo,
                is_shared: false,
            });
        } catch (err) {
            setErrorMessage((err as Error).message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            style={{
                maxWidth: '500px',
                margin: '2rem auto',
                padding: '2rem',
                background: 'var(--bg-card)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
            }}
        >
            <h2 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                Tạo lịch trình mới
            </h2>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                        Tiêu đề
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Lịch trình tuần"
                        style={{ width: '100%', padding: '8px', fontSize: '14px' }}
                        required
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                        Nhãn tuần (tùy chọn)
                    </label>
                    <input
                        type="text"
                        value={weekLabel}
                        onChange={(e) => setWeekLabel(e.target.value)}
                        placeholder="VD: Tuần 35 (30/03 – 05/04/2026)"
                        style={{ width: '100%', padding: '8px', fontSize: '14px' }}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                            Từ ngày
                        </label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => handleDateFromChange(e.target.value)}
                            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                            Đến ngày
                        </label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
                            required
                        />
                    </div>
                </div>

                {/* Error Message */}
                {errorMessage && (
                    <div style={{
                        marginBottom: '1rem',
                        padding: '12px',
                        background: 'rgba(220, 53, 69, 0.1)',
                        border: '1px solid var(--danger-color)',
                        borderRadius: '8px',
                        color: 'var(--danger-color)',
                        fontSize: '13px',
                        lineHeight: 1.5,
                        whiteSpace: 'pre-line',
                    }}>
                        <strong>⚠️ Lỗi:</strong>
                        <div style={{ marginTop: '6px' }}>{errorMessage}</div>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={saving}
                            style={{
                                padding: '0.75rem 1.5rem',
                                fontSize: '14px',
                                background: 'var(--bg-hover)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                color: 'var(--text-primary)',
                            }}
                        >
                            Hủy
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={saving}
                        style={{
                            padding: '0.75rem 1.5rem',
                            fontSize: '14px',
                            background: 'var(--primary-color)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                        }}
                    >
                        {saving ? 'Đang tạo...' : 'Tạo lịch trình'}
                    </button>
                </div>
            </form>

            <div style={{ marginTop: '1.5rem', padding: '12px', background: 'var(--bg-hover)', borderRadius: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                💡 Sau khi tạo, bạn có thể thêm slots (hoạt động) bằng cách click vào các ô trong lịch.
            </div>
        </div>
    );
}
