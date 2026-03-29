interface ThemeToggleProps {
    theme: 'light' | 'dark';
    onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
    return (
        <button
            onClick={onToggle}
            style={{
                padding: '0.5rem',
                fontSize: '18px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                transition: 'all 0.2s',
            }}
            title={theme === 'light' ? 'Chuyển sang chế độ tối' : 'Chuyển sang chế độ sáng'}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-hover)';
                e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--bg-card)';
                e.currentTarget.style.transform = 'scale(1)';
            }}
        >
            {theme === 'light' ? '🌙' : '☀️'}
        </button>
    );
}
