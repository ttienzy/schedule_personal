interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    danger?: boolean;
}

export function ConfirmModal({
    isOpen,
    title,
    message,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    onConfirm,
    onCancel,
    danger = false,
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2000,
            }}
            onClick={onCancel}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: 'var(--bg-card)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    width: '90%',
                    maxWidth: '400px',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                }}
            >
                <h2 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                    {title}
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                    {message}
                </p>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button
                        onClick={onCancel}
                        style={{
                            padding: '0.5rem 1rem',
                            fontSize: '13px',
                            background: 'var(--bg-hover)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: 'var(--text-primary)',
                        }}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            padding: '0.5rem 1rem',
                            fontSize: '13px',
                            background: danger ? 'var(--danger-color)' : 'var(--primary-color)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
