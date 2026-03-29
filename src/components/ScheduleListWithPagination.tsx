import { useState } from 'react';
import type { Database } from '../lib/database.types';

type Schedule = Database['public']['Tables']['schedules']['Row'];

interface ScheduleListWithPaginationProps {
    schedules: Schedule[];
    currentScheduleId: string;
    currentPage: number;
    totalPages: number;
    totalCount: number;
    loading: boolean;
    onSelectSchedule: (schedule: Schedule) => void;
    onEditSchedule: (schedule: Schedule) => void;
    onDeleteSchedule: (id: string) => void;
    onCreateNew: () => void;
    onPageChange: (page: number) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

export function ScheduleListWithPagination({
    schedules,
    currentScheduleId,
    currentPage,
    totalPages,
    totalCount,
    loading,
    onSelectSchedule,
    onEditSchedule,
    onDeleteSchedule,
    onCreateNew,
    onPageChange,
    searchQuery,
    onSearchChange,
}: ScheduleListWithPaginationProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

    return (
        <div style={{
            background: 'var(--bg-card)',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid var(--border-light)',
        }}>
            {/* Header with Search */}
            <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                        Lịch trình ({totalCount})
                    </h3>
                    <button
                        onClick={onCreateNew}
                        style={{
                            padding: '4px 10px',
                            fontSize: '12px',
                            background: 'var(--primary-color)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        + Tạo mới
                    </button>
                </div>

                {/* Search Input */}
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Tìm kiếm lịch trình..."
                    style={{
                        width: '100%',
                        padding: '6px 10px',
                        fontSize: '12px',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                    }}
                />
            </div>

            {/* Schedule List */}
            {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                    Đang tải...
                </div>
            ) : schedules.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                    {searchQuery ? 'Không tìm thấy lịch trình' : 'Chưa có lịch trình'}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                    {schedules.map((schedule) => (
                        <div
                            key={schedule.id}
                            onClick={() => onSelectSchedule(schedule)}
                            style={{
                                padding: '10px 12px',
                                background: schedule.id === currentScheduleId ? 'var(--primary-color)' : 'var(--bg-hover)',
                                color: schedule.id === currentScheduleId ? '#fff' : 'var(--text-primary)',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                border: schedule.id === currentScheduleId ? 'none' : '1px solid var(--border-light)',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '2px' }}>
                                        {schedule.title}
                                    </div>
                                    <div style={{
                                        fontSize: '11px',
                                        opacity: 0.8,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '2px',
                                    }}>
                                        {schedule.week_label && <span>{schedule.week_label}</span>}
                                        <span>{schedule.date_from} → {schedule.date_to}</span>
                                    </div>
                                </div>

                                {schedule.id === currentScheduleId && (
                                    <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEditSchedule(schedule);
                                            }}
                                            style={{
                                                padding: '4px 8px',
                                                fontSize: '11px',
                                                background: 'rgba(255,255,255,0.2)',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                color: '#fff',
                                            }}
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowDeleteConfirm(schedule.id);
                                            }}
                                            style={{
                                                padding: '4px 8px',
                                                fontSize: '11px',
                                                background: 'rgba(255,255,255,0.2)',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                color: '#fff',
                                            }}
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Delete Confirmation */}
                            {showDeleteConfirm === schedule.id && (
                                <div
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                        marginTop: '8px',
                                        padding: '8px',
                                        background: 'rgba(255,0,0,0.1)',
                                        borderRadius: '4px',
                                        fontSize: '11px',
                                    }}
                                >
                                    <div style={{ marginBottom: '6px', color: 'var(--danger-color)' }}>
                                        Xác nhận xóa lịch trình này?
                                    </div>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button
                                            onClick={() => {
                                                onDeleteSchedule(schedule.id);
                                                setShowDeleteConfirm(null);
                                            }}
                                            style={{
                                                padding: '4px 8px',
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
                                        <button
                                            onClick={() => setShowDeleteConfirm(null)}
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
                                            Hủy
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.5rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border-light)',
                }}>
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            background: currentPage === 1 ? 'var(--bg-hover)' : 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '4px',
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                            color: 'var(--text-primary)',
                            opacity: currentPage === 1 ? 0.5 : 1,
                        }}
                    >
                        ←
                    </button>

                    {/* Page Numbers */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                            // Show first, last, current, and adjacent pages
                            const showPage = page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                            const showEllipsis = (page === 2 && currentPage > 3) || (page === totalPages - 1 && currentPage < totalPages - 2);

                            if (!showPage && !showEllipsis) return null;

                            if (showEllipsis) {
                                return (
                                    <span key={page} style={{ padding: '4px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                                        ...
                                    </span>
                                );
                            }

                            return (
                                <button
                                    key={page}
                                    onClick={() => onPageChange(page)}
                                    style={{
                                        padding: '4px 8px',
                                        fontSize: '12px',
                                        background: page === currentPage ? 'var(--primary-color)' : 'var(--bg-card)',
                                        color: page === currentPage ? '#fff' : 'var(--text-primary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        minWidth: '28px',
                                    }}
                                >
                                    {page}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            background: currentPage === totalPages ? 'var(--bg-hover)' : 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '4px',
                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                            color: 'var(--text-primary)',
                            opacity: currentPage === totalPages ? 0.5 : 1,
                        }}
                    >
                        →
                    </button>
                </div>
            )}
        </div>
    );
}
