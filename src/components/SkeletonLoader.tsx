export function SkeletonLoader() {
    return (
        <div style={{ padding: '1rem 0' }}>
            {/* Week Grid Skeleton */}
            <div style={{ display: 'grid', gridTemplateColumns: '52px repeat(7, 1fr)', gap: '2px', marginBottom: '1rem' }}>
                {/* Headers */}
                <div />
                {[...Array(7)].map((_, i) => (
                    <div
                        key={i}
                        style={{
                            height: '32px',
                            background: 'var(--skeleton-bg)',
                            borderRadius: '4px',
                            animation: 'pulse 1.5s ease-in-out infinite',
                        }}
                    />
                ))}

                {/* Time slots */}
                {[...Array(10)].map((_, rowIdx) => (
                    <>
                        <div
                            key={`time-${rowIdx}`}
                            style={{
                                height: '28px',
                                background: 'var(--skeleton-bg)',
                                borderRadius: '4px',
                                animation: 'pulse 1.5s ease-in-out infinite',
                                animationDelay: `${rowIdx * 0.05}s`,
                            }}
                        />
                        {[...Array(7)].map((_, colIdx) => (
                            <div
                                key={`cell-${rowIdx}-${colIdx}`}
                                style={{
                                    height: '28px',
                                    background: Math.random() > 0.6 ? 'var(--skeleton-bg)' : 'transparent',
                                    borderRadius: '4px',
                                    animation: 'pulse 1.5s ease-in-out infinite',
                                    animationDelay: `${(rowIdx * 7 + colIdx) * 0.02}s`,
                                }}
                            />
                        ))}
                    </>
                ))}
            </div>

            <style>
                {`
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.5; }
                    }
                `}
            </style>
        </div>
    );
}
