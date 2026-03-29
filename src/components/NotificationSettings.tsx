import { usePushNotifications } from '../hooks/usePushNotifications';

interface NotificationSettingsProps {
    userId: string | null;
}

export function NotificationSettings({ userId }: NotificationSettingsProps) {
    const { isSupported, isSubscribed, permission, loading, error, subscribe, unsubscribe } = usePushNotifications(userId);

    if (!isSupported) {
        return (
            <div style={{
                padding: '1rem',
                background: 'var(--bg-card)',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '20px' }}>🔔</span>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Thông báo
                    </h3>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Trình duyệt của bạn không hỗ trợ thông báo đẩy
                </p>
            </div>
        );
    }

    const handleToggle = async () => {
        if (isSubscribed) {
            await unsubscribe();
        } else {
            await subscribe();
        }
    };

    return (
        <div style={{
            padding: '1rem',
            background: 'var(--bg-card)',
            borderRadius: '8px',
            border: '1px solid var(--border-light)',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '20px' }}>🔔</span>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Thông báo nhắc nhở
                </h3>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
                Nhận thông báo trước khi hoạt động bắt đầu để không bỏ lỡ lịch trình của bạn
            </p>

            {error && (
                <div style={{
                    padding: '0.75rem',
                    background: 'rgba(220, 53, 69, 0.1)',
                    border: '1px solid var(--danger-color)',
                    borderRadius: '6px',
                    marginBottom: '1rem',
                }}>
                    <p style={{ fontSize: '12px', color: 'var(--danger-color)' }}>
                        ⚠️ {error}
                    </p>
                </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                        {isSubscribed ? 'Đã bật' : 'Tắt'}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        {permission === 'granted' ? 'Đã cấp quyền' : permission === 'denied' ? 'Đã từ chối' : 'Chưa cấp quyền'}
                    </p>
                </div>

                <button
                    onClick={handleToggle}
                    disabled={loading || permission === 'denied'}
                    style={{
                        padding: '0.5rem 1rem',
                        fontSize: '13px',
                        background: isSubscribed ? 'var(--danger-color)' : 'var(--primary-color)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: loading || permission === 'denied' ? 'not-allowed' : 'pointer',
                        opacity: loading || permission === 'denied' ? 0.6 : 1,
                        fontWeight: 500,
                        transition: 'all 0.2s',
                    }}
                >
                    {loading ? 'Đang xử lý...' : isSubscribed ? 'Tắt thông báo' : 'Bật thông báo'}
                </button>
            </div>

            {permission === 'denied' && (
                <div style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    background: 'var(--bg-hover)',
                    borderRadius: '6px',
                }}>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        💡 Bạn đã chặn thông báo. Để bật lại, vui lòng vào cài đặt trình duyệt và cho phép thông báo cho trang web này.
                    </p>
                </div>
            )}
        </div>
    );
}
