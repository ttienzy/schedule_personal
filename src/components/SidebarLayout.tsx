import type { ReactNode } from 'react';

interface SidebarLayoutProps {
    leftSidebar?: ReactNode;
    rightSidebar?: ReactNode;
    children: ReactNode;
}

export function SidebarLayout({ leftSidebar, rightSidebar, children }: SidebarLayoutProps) {
    return (
        <>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: leftSidebar && rightSidebar
                        ? 'minmax(280px, 320px) 1fr minmax(280px, 320px)'
                        : leftSidebar
                            ? 'minmax(280px, 320px) 1fr'
                            : '1fr minmax(280px, 320px)',
                    gap: '1.5rem',
                    maxWidth: '1600px',
                    margin: '0 auto',
                    padding: '2rem 1rem',
                    width: '100%',
                }}
                className="sidebar-layout"
            >
                {leftSidebar && (
                    <aside className="left-sidebar">
                        {leftSidebar}
                    </aside>
                )}

                <main className="main-content">
                    {children}
                </main>

                {rightSidebar && (
                    <aside className="right-sidebar">
                        {rightSidebar}
                    </aside>
                )}
            </div>

            <style>
                {`
                    @media (max-width: 1200px) {
                        .sidebar-layout {
                            grid-template-columns: 1fr !important;
                        }
                        
                        /* Mobile: Schedules list first, then main content, then sidebars */
                        .left-sidebar {
                            order: 1;
                        }
                        
                        .main-content {
                            order: 2;
                        }
                        
                        .right-sidebar {
                            order: 3;
                        }
                    }
                    
                    @media (max-width: 768px) {
                        .sidebar-layout {
                            padding: 1rem !important;
                            gap: 1rem !important;
                        }
                    }
                    
                    @media (max-width: 480px) {
                        .sidebar-layout {
                            padding: 0.75rem !important;
                            gap: 0.75rem !important;
                        }
                    }
                `}
            </style>
        </>
    );
}
