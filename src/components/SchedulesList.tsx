import type { Database } from '../lib/database.types';

type Schedule = Database['public']['Tables']['schedules']['Row'];

interface SchedulesListProps {
    schedules: Schedule[];
    currentIndex: number;
    onSelect: (index: number) => void;
    onEdit: (schedule: Schedule) => void;
    onDelete: (id: string) => void;
    onCreateNew: () => void;
}

export function SchedulesList({ schedules, currentIndex, onSelect, onEdit, onDelete, onCreateNew }: SchedulesListProps) {
    return (
        <div
            style={{
                marginBottom: '1rem',
                padding: '12px 16px',
                background: '#fff',
                borderRadius: '8px',
                border: '0.5px solid #d3d1c7',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#3d3d3a' }}>
                    Lịch trình của bạn ({schedules.length})
                </span>
                <button
                    onClick={onCreateNew}
                    style={{
                        padding: '4px 10px',
                        fontSize: '12px',
                        background: '#185FA5',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    + Tạo mới
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {schedules.map((schedule, idx) => (
                    <div
                        key={schedule.id}
                        onClick={() => onSelect(idx)}
                        style={{
                            padding: '8px 10px',
                            background: idx === currentIndex ? '#e8f4ff' : '#f9f9f7',
                            border: idx === currentIndex ? '1px solid #185FA5' : '1px solid #e8e6dd',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'all 0.2s',
                        }}
                    >
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: 500, color: '#1a1a18' }}>
                                {schedule.title}
                            </div>
                            <div style={{ fontSize: '11px', color: '#888780' }}>
                                {schedule.week_label || `${schedule.date_from} → ${schedule.date_to}`}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(schedule);
                                }}
                                style={{
                                    padding: '4px 8px',
                                    fontSize: '11px',
                                    background: '#e8f4ff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    color: '#185FA5',
                                }}
                            >
                                Sửa
                            </button>
                            {schedules.length > 1 && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(schedule.id);
                                    }}
                                    style={{
                                        padding: '4px 8px',
                                        fontSize: '11px',
                                        background: '#ffdddd',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Xóa
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
