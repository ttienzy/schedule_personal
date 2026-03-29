import { useState } from 'react';
import { CategoryLegend } from './CategoryLegend';
import type { Database } from '../lib/database.types';

type Category = Database['public']['Tables']['categories']['Row'];

interface CategoryLegendCollapsibleProps {
    categories: Category[];
    initialShowCount?: number;
}

export function CategoryLegendCollapsible({ categories, initialShowCount = 8 }: CategoryLegendCollapsibleProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Desktop: Always show */}
            <div className="category-legend-desktop">
                <CategoryLegend categories={categories} initialShowCount={initialShowCount} />
            </div>

            {/* Mobile: Collapsible with icon */}
            <div className="category-legend-mobile">
                {!isOpen ? (
                    <button
                        onClick={() => setIsOpen(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '8px 12px',
                            background: 'var(--bg-hover)',
                            border: '1px solid var(--border-light)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            color: 'var(--text-secondary)',
                            fontWeight: 500,
                            width: '100%',
                            justifyContent: 'center',
                        }}
                    >
                        <span>Danh mục ({categories.length})</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </button>
                ) : (
                    <div
                        style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-light)',
                            borderRadius: '8px',
                            padding: '1rem',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                Danh mục
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{
                                    padding: '4px 8px',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--text-secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="18 15 12 9 6 15" />
                                </svg>
                            </button>
                        </div>
                        <CategoryLegend categories={categories} initialShowCount={initialShowCount} />
                    </div>
                )}
            </div>

            <style>
                {`
                    .category-legend-desktop {
                        display: block;
                    }
                    
                    .category-legend-mobile {
                        display: none;
                        margin-bottom: 1rem;
                    }
                    
                    @media (max-width: 768px) {
                        .category-legend-desktop {
                            display: none;
                        }
                        
                        .category-legend-mobile {
                            display: block;
                        }
                    }
                `}
            </style>
        </>
    );
}
