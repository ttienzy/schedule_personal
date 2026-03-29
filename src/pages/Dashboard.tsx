import { useState } from 'react';
import { useAuth, useSchedules, useTheme } from '../hooks';
import { ScheduleView } from './ScheduleView';
import { CreateScheduleForm, EditScheduleModal, ConfirmModal, LoadingSpinner, ThemeToggle } from '../components';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Schedule = Database['public']['Tables']['schedules']['Row'];

export function Dashboard() {
    const { user, loading: authLoading, signInWithGoogle, signOut } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const { schedules, loading: schedulesLoading, currentPage, totalPages, totalCount, setCurrentPage, createSchedule, updateSchedule, deleteSchedule, error: schedulesError } = useSchedules({ pageSize: 5, searchQuery });
    const { theme, toggleTheme } = useTheme();
    const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [scheduleToEdit, setScheduleToEdit] = useState<Schedule | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [scheduleToDelete, setScheduleToDelete] = useState<string | null>(null);

    // Auto-select first schedule when schedules load
    const currentSchedule = schedules.find(s => s.id === selectedScheduleId) || schedules[0];

    // Set initial selected schedule
    if (!selectedScheduleId && schedules.length > 0) {
        setSelectedScheduleId(schedules[0].id);
    }

    if (authLoading) {
        return <LoadingSpinner message="Đang xác thực..." />;
    }

    if (!user) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)',
                padding: '2rem 1rem',
            }}>
                <div style={{
                    maxWidth: '440px',
                    width: '100%',
                    background: 'var(--bg-card)',
                    borderRadius: '24px',
                    padding: '3rem 2.5rem',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(10px)',
                }}>
                    {/* Logo/Icon */}
                    <div style={{
                        width: '80px',
                        height: '80px',
                        margin: '0 auto 2rem',
                        background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '40px',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                    }}>
                        📅
                    </div>

                    {/* Title */}
                    <h1 style={{
                        fontSize: '28px',
                        fontWeight: 700,
                        textAlign: 'center',
                        marginBottom: '0.5rem',
                        color: 'var(--text-primary)',
                        letterSpacing: '-0.5px',
                    }}>
                        Personal Discipline
                    </h1>
                    <p style={{
                        textAlign: 'center',
                        color: 'var(--text-secondary)',
                        fontSize: '15px',
                        marginBottom: '2.5rem',
                        lineHeight: 1.6,
                    }}>
                        Quản lý lịch trình tuần của bạn một cách thông minh và hiệu quả
                    </p>

                    {/* Login Button */}
                    <button
                        onClick={signInWithGoogle}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            fontSize: '16px',
                            fontWeight: 600,
                            background: 'var(--primary-color)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                            transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.25)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Đăng nhập với Google
                    </button>

                    {/* Features */}
                    <div style={{
                        marginTop: '2.5rem',
                        paddingTop: '2rem',
                        borderTop: '1px solid var(--border-light)',
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[
                                { icon: '🎯', text: 'Drag & drop dễ dàng' },
                                { icon: '🌓', text: 'Dark mode mượt mà' },
                                { icon: '📱', text: 'Responsive mọi thiết bị' },
                            ].map((feature, idx) => (
                                <div key={idx} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    fontSize: '14px',
                                    color: 'var(--text-secondary)',
                                }}>
                                    <span style={{ fontSize: '20px' }}>{feature.icon}</span>
                                    <span>{feature.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!currentSchedule) {
        // Đang loading schedules
        if (schedulesLoading) {
            return <LoadingSpinner message="Đang tải lịch trình..." />;
        }

        return (
            <div style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: 'var(--bg-primary)', minHeight: '100vh', padding: '2rem 1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '500px', margin: '0 auto 2rem' }}>
                    <h1 style={{ fontSize: '18px', fontWeight: 500, color: 'var(--text-primary)' }}>Lịch trình tuần</h1>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <ThemeToggle theme={theme} onToggle={toggleTheme} />
                        <button onClick={signOut} style={{ padding: '0.5rem 1rem', fontSize: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-primary)' }}>
                            Đăng xuất
                        </button>
                    </div>
                </div>

                {showCreateForm ? (
                    <CreateScheduleForm
                        onSubmit={async (data) => {
                            await createSchedule(data);
                            setShowCreateForm(false);
                        }}
                        onCancel={() => setShowCreateForm(false)}
                    />
                ) : (
                    <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
                        <div style={{ padding: '3rem 2rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>📅</div>
                            <h2 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                                Chưa có lịch trình
                            </h2>
                            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                                Tạo lịch trình đầu tiên để bắt đầu quản lý thời gian của bạn
                            </p>
                            <button
                                onClick={() => setShowCreateForm(true)}
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
                                + Tạo lịch trình mới
                            </button>
                        </div>

                        {schedulesError && (
                            <div style={{ marginTop: '1rem', padding: '1rem', background: '#ffdddd', borderRadius: '8px', fontSize: '13px' }}>
                                <strong>Error:</strong> {schedulesError.message}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    const handleToggleShare = async (isShared: boolean) => {
        const { error } = await supabase
            .from('schedules')
            .update({ is_shared: isShared })
            .eq('id', currentSchedule.id);

        if (error) throw error;
        window.location.reload();
    };

    const handlePrevWeek = () => {
        const currentIndex = schedules.findIndex(s => s.id === selectedScheduleId);
        if (currentIndex < schedules.length - 1) {
            setSelectedScheduleId(schedules[currentIndex + 1].id);
        }
    };

    const handleNextWeek = async () => {
        const currentIndex = schedules.findIndex(s => s.id === selectedScheduleId);
        if (currentIndex > 0) {
            setSelectedScheduleId(schedules[currentIndex - 1].id);
        } else {
            try {
                const lastSchedule = schedules[0];
                const dateFrom = new Date(lastSchedule.date_to);
                dateFrom.setDate(dateFrom.getDate() + 1);
                const dateTo = new Date(dateFrom);
                dateTo.setDate(dateTo.getDate() + 6);

                const weekNum = parseInt(lastSchedule.week_label?.match(/\d+/)?.[0] || '0') + 1;

                const newSchedule = await createSchedule({
                    title: 'Lịch trình tuần',
                    week_label: `Tuần ${weekNum}`,
                    date_from: dateFrom.toISOString().split('T')[0],
                    date_to: dateTo.toISOString().split('T')[0],
                    is_shared: false,
                });
                if (newSchedule) {
                    setSelectedScheduleId(newSchedule.id);
                }
            } catch (err) {
                alert((err as Error).message);
            }
        }
    };

    return (
        <>
            {showCreateForm ? (
                <div style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: 'var(--bg-primary)', minHeight: '100vh', padding: '2rem 1rem' }}>
                    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h1 style={{ fontSize: '18px', fontWeight: 500, color: 'var(--text-primary)' }}>Tạo lịch trình mới</h1>
                            <ThemeToggle theme={theme} onToggle={toggleTheme} />
                        </div>
                        <CreateScheduleForm
                            onSubmit={async (data) => {
                                await createSchedule(data);
                                setShowCreateForm(false);
                            }}
                            onCancel={() => setShowCreateForm(false)}
                        />
                    </div>
                </div>
            ) : (
                <ScheduleView
                    schedule={currentSchedule}
                    isOwner={true}
                    allSchedules={schedules}
                    currentScheduleId={selectedScheduleId || ''}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalCount={totalCount}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onPageChange={setCurrentPage}
                    onSelectSchedule={(schedule) => setSelectedScheduleId(schedule.id)}
                    onEditSchedule={(schedule) => {
                        setScheduleToEdit(schedule);
                        setIsEditModalOpen(true);
                    }}
                    onDeleteSchedule={(id) => {
                        setScheduleToDelete(id);
                        setIsConfirmModalOpen(true);
                    }}
                    onCreateSchedule={() => setShowCreateForm(true)}
                    onToggleShare={handleToggleShare}
                    onPrevWeek={handlePrevWeek}
                    onNextWeek={handleNextWeek}
                    onSignOut={signOut}
                    theme={theme}
                    onToggleTheme={toggleTheme}
                    loading={schedulesLoading}
                />
            )}

            {scheduleToEdit && (
                <EditScheduleModal
                    isOpen={isEditModalOpen}
                    schedule={scheduleToEdit}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setScheduleToEdit(null);
                    }}
                    onSave={async (updates) => {
                        await updateSchedule(scheduleToEdit.id, updates);
                        setIsEditModalOpen(false);
                        setScheduleToEdit(null);
                    }}
                />
            )}

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                title="Xóa lịch trình"
                message="Bạn có chắc chắn muốn xóa lịch trình này? Tất cả slots và rules sẽ bị xóa theo."
                confirmText="Xóa"
                cancelText="Hủy"
                danger={true}
                onConfirm={async () => {
                    if (scheduleToDelete) {
                        await deleteSchedule(scheduleToDelete);
                        // If deleted schedule was selected, select first available
                        if (scheduleToDelete === selectedScheduleId && schedules.length > 1) {
                            const remainingSchedules = schedules.filter(s => s.id !== scheduleToDelete);
                            if (remainingSchedules.length > 0) {
                                setSelectedScheduleId(remainingSchedules[0].id);
                            }
                        }
                    }
                    setIsConfirmModalOpen(false);
                    setScheduleToDelete(null);
                }}
                onCancel={() => {
                    setIsConfirmModalOpen(false);
                    setScheduleToDelete(null);
                }}
            />
        </>
    );
}
