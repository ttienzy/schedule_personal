import { useState, useMemo } from 'react';
import { useSlots, useRules, useCategories } from '../hooks';
import {
    WeekGrid, SlotModal, BulkAddSlotsModal, BulkAddSlotsByDayModal, RulesBox, CategoryLegend, CategoryLegendCollapsible,
    SharePanel, ExportPanel, ScheduleListWithPagination, SidebarLayout, EmptyState, ThemeToggle
} from '../components';
import { findConflicts } from '../utils/timeUtils';
import type { ScheduleExport } from '../utils/exportUtils';
import type { Database } from '../lib/database.types';

type Schedule = Database['public']['Tables']['schedules']['Row'];
type Slot = Database['public']['Tables']['slots']['Row'];
type SlotInsert = Database['public']['Tables']['slots']['Insert'];

interface ScheduleViewProps {
    schedule: Schedule;
    isOwner: boolean;
    allSchedules?: Schedule[];
    currentScheduleId?: string;
    currentPage?: number;
    totalPages?: number;
    totalCount?: number;
    searchQuery?: string;
    loading?: boolean;
    onSearchChange?: (query: string) => void;
    onPageChange?: (page: number) => void;
    onSelectSchedule?: (schedule: Schedule) => void;
    onEditSchedule?: (schedule: Schedule) => void;
    onDeleteSchedule?: (id: string) => void;
    onCreateSchedule?: () => void;
    onToggleShare?: (isShared: boolean) => Promise<void>;
    onPrevWeek?: () => void;
    onNextWeek?: () => void;
    onSignOut?: () => void;
    theme?: 'light' | 'dark';
    onToggleTheme?: () => void;
}

export function ScheduleView({
    schedule,
    isOwner,
    allSchedules,
    currentScheduleId,
    currentPage = 1,
    totalPages = 1,
    totalCount = 0,
    searchQuery = '',
    loading = false,
    onSearchChange,
    onPageChange,
    onSelectSchedule,
    onEditSchedule,
    onDeleteSchedule,
    onCreateSchedule,
    onToggleShare,
    onPrevWeek,
    onNextWeek,
    onSignOut,
    theme,
    onToggleTheme,
}: ScheduleViewProps) {
    const { slots, createSlot, updateSlot, deleteSlot } = useSlots(schedule.id);
    const { rules, createRule, updateRule, deleteRule } = useRules(schedule.id);
    const { categories } = useCategories();

    const [modalOpen, setModalOpen] = useState(false);
    const [bulkModalOpen, setBulkModalOpen] = useState(false);
    const [bulkByDayModalOpen, setBulkByDayModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
    const [selectedDay, setSelectedDay] = useState<number>(1);
    const [selectedDayLabel, setSelectedDayLabel] = useState<string>('Thứ 2');
    const [modalInitialDay, setModalInitialDay] = useState<number | undefined>();
    const [modalInitialTime, setModalInitialTime] = useState<string | undefined>();

    const conflicts = useMemo(() => findConflicts(slots), [slots]);

    const handleSlotClick = (slot: Slot) => {
        if (!isOwner) return;
        setSelectedSlot(slot);
        setModalInitialDay(undefined);
        setModalInitialTime(undefined);
        setModalOpen(true);
    };

    const handleEmptyClick = (day: number, timeSlot: string) => {
        if (!isOwner) return;
        setSelectedSlot(null);
        setModalInitialDay(day);
        setModalInitialTime(timeSlot);
        setModalOpen(true);
    };

    const handleBulkAddClick = (day: number, dayLabel: string) => {
        if (!isOwner) return;
        setSelectedDay(day);
        setSelectedDayLabel(dayLabel);
        setBulkByDayModalOpen(true);
    };

    const handleSaveSlot = async (data: Database['public']['Tables']['slots']['Insert']) => {
        if (selectedSlot) {
            await updateSlot(selectedSlot.id, data);
        } else {
            await createSlot(data);
        }
    };

    const handleBulkSaveSlots = async (slots: SlotInsert[]) => {
        // Create all slots sequentially
        for (const slot of slots) {
            await createSlot(slot);
        }
    };

    const handleAddRule = async (content: string) => {
        await createRule({
            schedule_id: schedule.id,
            content,
            order: rules.length,
        });
    };

    const handleUpdateRule = async (id: string, content: string) => {
        await updateRule(id, { content });
    };

    const handleImport = async (data: ScheduleExport) => {
        for (const slot of data.slots) {
            await createSlot({
                schedule_id: schedule.id,
                ...slot,
            });
        }
        for (const rule of data.rules) {
            await createRule({
                schedule_id: schedule.id,
                ...rule,
            });
        }
    };

    return (
        <div style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: 'var(--bg-primary)', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
            {/* Header */}
            <div style={{
                background: 'var(--bg-card)',
                borderBottom: '1px solid var(--border-light)',
                padding: '1rem 1.5rem',
                position: 'sticky',
                top: 0,
                zIndex: 100,
            }}
                className="schedule-header"
            >
                <div style={{ maxWidth: '1600px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', flex: '1 1 auto' }}>
                        <div style={{ minWidth: '0' }}>
                            <h1 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {schedule.title}
                            </h1>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                Personal Discipline {!isOwner && '(Read-only)'}
                            </p>
                        </div>

                        {/* Week Switcher in Header */}
                        {isOwner && onPrevWeek && onNextWeek && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.5rem 1rem',
                                background: 'var(--bg-hover)',
                                borderRadius: '8px',
                                border: '1px solid var(--border-light)',
                            }}
                                className="week-switcher"
                            >
                                <button
                                    onClick={onPrevWeek}
                                    style={{
                                        padding: '0.25rem 0.5rem',
                                        fontSize: '16px',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: 'var(--text-secondary)',
                                    }}
                                >
                                    ←
                                </button>
                                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', minWidth: '180px', textAlign: 'center' }}
                                    className="week-label"
                                >
                                    {schedule.week_label || `${schedule.date_from} → ${schedule.date_to}`}
                                </span>
                                <button
                                    onClick={onNextWeek}
                                    style={{
                                        padding: '0.25rem 0.5rem',
                                        fontSize: '16px',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: 'var(--text-secondary)',
                                    }}
                                >
                                    →
                                </button>
                            </div>
                        )}
                    </div>
                    {isOwner && onSignOut && onToggleTheme && theme && (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
                            <button
                                onClick={onSignOut}
                                style={{
                                    padding: '0.5rem 1rem',
                                    fontSize: '12px',
                                    background: 'var(--bg-hover)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    color: 'var(--text-primary)',
                                    whiteSpace: 'nowrap',
                                }}
                                className="signout-btn"
                            >
                                Đăng xuất
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar Layout */}
            <SidebarLayout
                leftSidebar={
                    isOwner ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Schedules List with Pagination */}
                            {allSchedules && onSelectSchedule && onEditSchedule && onDeleteSchedule && onCreateSchedule && onSearchChange && onPageChange && (
                                <ScheduleListWithPagination
                                    schedules={allSchedules}
                                    currentScheduleId={currentScheduleId || schedule.id}
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    totalCount={totalCount}
                                    loading={loading}
                                    searchQuery={searchQuery}
                                    onSearchChange={onSearchChange}
                                    onPageChange={onPageChange}
                                    onSelectSchedule={onSelectSchedule}
                                    onEditSchedule={onEditSchedule}
                                    onDeleteSchedule={onDeleteSchedule}
                                    onCreateNew={onCreateSchedule}
                                />
                            )}

                            {/* Category Legend - Desktop only */}
                            <CategoryLegendCollapsible categories={categories} initialShowCount={8} />
                        </div>
                    ) : undefined
                }
                rightSidebar={
                    isOwner ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Rules Box */}
                            <RulesBox
                                rules={rules}
                                onAdd={handleAddRule}
                                onUpdate={handleUpdateRule}
                                onDelete={deleteRule}
                            />

                            {/* Share & Export */}
                            {onToggleShare && (
                                <>
                                    <SharePanel schedule={schedule} onToggleShare={onToggleShare} />
                                    <ExportPanel
                                        schedule={schedule}
                                        slots={slots}
                                        rules={rules}
                                        onImport={handleImport}
                                    />
                                </>
                            )}
                        </div>
                    ) : undefined
                }
            >
                {/* Main Content - Week Grid */}
                <div>

                    {/* Action Buttons */}
                    {isOwner && (
                        <div
                            style={{
                                display: 'flex',
                                gap: '0.5rem',
                                marginBottom: '1rem',
                                justifyContent: 'flex-end',
                            }}
                            className="action-buttons"
                        >
                            <button
                                onClick={() => setBulkModalOpen(true)}
                                style={{
                                    padding: '10px 18px',
                                    fontSize: '13px',
                                    background: 'var(--accent-color)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    boxShadow: '0 2px 6px rgba(253, 126, 20, 0.25)',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = '0 4px 10px rgba(253, 126, 20, 0.35)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(253, 126, 20, 0.25)';
                                }}
                            >
                                Thêm theo nhiều ngày
                            </button>
                        </div>
                    )}

                    {slots.length === 0 ? (
                        <EmptyState
                            icon="📅"
                            title="Chưa có hoạt động nào"
                            description="Thêm slot đầu tiên để bắt đầu lên lịch trình của bạn"
                            action={isOwner ? {
                                label: '+ Thêm slot',
                                onClick: () => {
                                    setModalInitialDay(1);
                                    setModalInitialTime('06:30');
                                    setModalOpen(true);
                                }
                            } : undefined}
                        />
                    ) : (
                        <WeekGrid
                            slots={slots}
                            categories={categories}
                            conflicts={conflicts}
                            onSlotClick={handleSlotClick}
                            onEmptyClick={handleEmptyClick}
                            onBulkAddClick={handleBulkAddClick}
                            isOwner={isOwner}
                        />
                    )}

                    <div style={{ marginTop: '1.5rem', fontSize: '11px', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                        Personal Discipline · Cập nhật {new Date().toLocaleDateString('vi-VN')}
                    </div>
                </div>
            </SidebarLayout>

            {isOwner && (
                <>
                    <SlotModal
                        isOpen={modalOpen}
                        onClose={() => setModalOpen(false)}
                        slot={selectedSlot}
                        scheduleId={schedule.id}
                        categories={categories}
                        onSave={handleSaveSlot}
                        onDelete={selectedSlot ? deleteSlot : undefined}
                        initialDay={modalInitialDay}
                        initialTime={modalInitialTime}
                    />

                    <BulkAddSlotsModal
                        isOpen={bulkModalOpen}
                        onClose={() => setBulkModalOpen(false)}
                        scheduleId={schedule.id}
                        categories={categories}
                        existingSlots={slots}
                        onSave={handleBulkSaveSlots}
                    />

                    <BulkAddSlotsByDayModal
                        isOpen={bulkByDayModalOpen}
                        onClose={() => setBulkByDayModalOpen(false)}
                        day={selectedDay}
                        dayLabel={selectedDayLabel}
                        scheduleId={schedule.id}
                        categories={categories}
                        existingSlots={slots}
                        onSave={handleBulkSaveSlots}
                    />
                </>
            )}
        </div>
    );
}
