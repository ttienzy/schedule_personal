interface EmptyStateProps {
    icon?: string;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function EmptyState({ icon = '📅', title, description, action }: EmptyStateProps) {
    return (
        <div
            style={{
                padding: '3rem 2rem',
                textAlign: 'center',
                background: 'var(--bg-card)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
            }}
        >
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>{icon}</div>
            <h2
                style={{
                    fontSize: '16px',
                    fontWeight: 500,
                    marginBottom: '0.5rem',
                    color: 'var(--text-primary)',
                }}
            >
                {title}
            </h2>
            <p
                style={{
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    marginBottom: action ? '1.5rem' : 0,
                }}
            >
                {description}
            </p>
            {action && (
                <button
                    onClick={action.onClick}
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
                    {action.label}
                </button>
            )}
        </div>
    );
}
