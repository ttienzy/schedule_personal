import { useParams } from 'react-router-dom';
import { useSchedule } from '../hooks';
import { ScheduleView } from './ScheduleView';

export function PublicView() {
    const { scheduleId } = useParams<{ scheduleId: string }>();
    const { schedule, loading, error } = useSchedule(scheduleId || null, false);

    if (loading) {
        return <div style={{ padding: '2rem' }}>Đang tải...</div>;
    }

    if (error || !schedule) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h1>Không tìm thấy lịch trình</h1>
                <p style={{ color: '#888', marginTop: '1rem' }}>{error?.message || 'Schedule không tồn tại'}</p>
            </div>
        );
    }

    return <ScheduleView schedule={schedule} isOwner={false} />;
}
