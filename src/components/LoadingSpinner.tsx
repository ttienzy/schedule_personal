interface LoadingSpinnerProps {
    message?: string;
}

export function LoadingSpinner({ message = 'Đang tải...' }: LoadingSpinnerProps) {
    return (
        <div
            style={{
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                background: 'var(--bg-primary)',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <div style={{ textAlign: 'center' }}>
                <div
                    style={{
                        width: '48px',
                        height: '48px',
                        margin: '0 auto 1rem',
                        border: '4px solid var(--border-light)',
                        borderTop: '4px solid var(--primary-color)',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                    }}
                />
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>{message}</p>
                <style>
                    {`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}
                </style>
            </div>
        </div>
    );
}
