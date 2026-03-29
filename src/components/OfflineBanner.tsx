interface OfflineBannerProps {
    isOnline: boolean;
}

export function OfflineBanner({ isOnline }: OfflineBannerProps) {
    if (isOnline) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                background: '#ff6b6b',
                color: '#fff',
                padding: '8px 16px',
                fontSize: '13px',
                textAlign: 'center',
                zIndex: 9999,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
        >
            ⚠️ Mất kết nối — Một số tính năng có thể không hoạt động
        </div>
    );
}
