import type { Database } from '../lib/database.types';

type Schedule = Database['public']['Tables']['schedules']['Row'];

interface WeekSwitcherProps {
    currentSchedule: Schedule;
    onPrevWeek: () => void;
    onNextWeek: () => void;
}

export function WeekSwitcher({ currentSchedule, onPrevWeek, onNextWeek }: WeekSwitcherProps) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
            <button
                onClick={onPrevWeek}
                style={{
                    padding: '6px 12px',
                    fontSize: '13px',
                    background: '#e8e6dd',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                }}
            >
                ← Tuần trước
            </button>

            <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#1a1a18' }}>
                    {currentSchedule.week_label}
                </div>
                <div style={{ fontSize: '11px', color: '#888780' }}>
                    {currentSchedule.date_from} → {currentSchedule.date_to}
                </div>
            </div>

            <button
                onClick={onNextWeek}
                style={{
                    padding: '6px 12px',
                    fontSize: '13px',
                    background: '#e8e6dd',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                }}
            >
                Tuần sau →
            </button>
        </div>
    );
}
