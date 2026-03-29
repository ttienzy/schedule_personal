import type { ReactNode } from 'react';

interface SidebarLayoutProps {
    leftSidebar?: ReactNode;
    rightSidebar?: ReactNode;
    children: ReactNode;
}

export function SidebarLayout({ leftSidebar, rightSidebar, children }: SidebarLayoutProps) {
    return (
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

            <style>
                {`
                    @media (max-width: 1200px) {
                        .sidebar-layout {
                            grid-template-columns: 1fr !important;
                        }
                        
                        .left-sidebar, .right-sidebar {
                            order: 2;
                        }
                        
                        .main-content {
                            order: 1;
                        }
                    }
                    
                    @media (max-width: 768px) {
                        .sidebar-layout {
                            padding: 1rem 0.5rem !important;
                            gap: 1rem !important;
                        }
                    }
                `}
            </style>
        </div>
    );
}
