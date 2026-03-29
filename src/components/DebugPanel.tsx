import { useState } from 'react';
import type { Database } from '../lib/database.types';

type Schedule = Database['public']['Tables']['schedules']['Row'];
type Slot = Database['public']['Tables']['slots']['Row'];
type Rule = Database['public']['Tables']['rules']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

interface DebugPanelProps {
    user: any;
    schedules: Schedule[];
    slots: Slot[];
    rules: Rule[];
    categories: Category[];
    errors: {
        schedules?: Error | null;
        slots?: Error | null;
        rules?: Error | null;
        categories?: Error | null;
    };
}

export function DebugPanel({ user, schedules, slots, rules, categories, errors }: DebugPanelProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    position: 'fixed',
                    bottom: '1rem',
                    right: '1rem',
                    padding: '8px 12px',
                    background: '#ff6b6b',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    zIndex: 1000,
                }}
            >
                🐛 Debug
            </button>
        );
    }

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '1rem',
                right: '1rem',
                width: '400px',
                maxHeight: '500px',
                overflow: 'auto',
                background: '#fff',
                border: '2px solid #ff6b6b',
                borderRadius: '8px',
                padding: '1rem',
                fontSize: '12px',
                zIndex: 1000,
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <strong>Debug Panel</strong>
                <button onClick={() => setIsOpen(false)} style={{ cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <strong>User:</strong>
                <pre style={{ background: '#f5f5f5', padding: '8px', borderRadius: '4px', overflow: 'auto' }}>
                    {JSON.stringify({ id: user?.id, email: user?.email }, null, 2)}
                </pre>
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <strong>Schedules ({schedules.length}):</strong>
                {errors.schedules && <div style={{ color: 'red' }}>Error: {errors.schedules.message}</div>}
                <pre style={{ background: '#f5f5f5', padding: '8px', borderRadius: '4px', overflow: 'auto', maxHeight: '100px' }}>
                    {JSON.stringify(schedules.map(s => ({ id: s.id, title: s.title, owner_id: s.owner_id })), null, 2)}
                </pre>
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <strong>Categories ({categories.length}):</strong>
                {errors.categories && <div style={{ color: 'red' }}>Error: {errors.categories.message}</div>}
                <pre style={{ background: '#f5f5f5', padding: '8px', borderRadius: '4px', overflow: 'auto', maxHeight: '80px' }}>
                    {JSON.stringify(categories.map(c => c.id), null, 2)}
                </pre>
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <strong>Slots ({slots.length}):</strong>
                {errors.slots && <div style={{ color: 'red' }}>Error: {errors.slots.message}</div>}
                <pre style={{ background: '#f5f5f5', padding: '8px', borderRadius: '4px', overflow: 'auto', maxHeight: '80px' }}>
                    {JSON.stringify(slots.slice(0, 3).map(s => ({ day: s.day, time: s.time_start, label: s.label })), null, 2)}
                </pre>
            </div>

            <div>
                <strong>Rules ({rules.length}):</strong>
                {errors.rules && <div style={{ color: 'red' }}>Error: {errors.rules.message}</div>}
            </div>

            <div style={{ marginTop: '1rem', padding: '8px', background: '#fff3cd', borderRadius: '4px' }}>
                <strong>💡 Checklist:</strong>
                <ul style={{ marginTop: '4px', paddingLeft: '20px' }}>
                    <li>RLS policies đã chạy?</li>
                    <li>Categories đã seed?</li>
                    <li>Schedule owner_id = user.id?</li>
                    <li>Check console logs</li>
                </ul>
            </div>
        </div>
    );
}
