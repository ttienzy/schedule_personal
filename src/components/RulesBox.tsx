import { useState } from 'react';
import type { Database } from '../lib/database.types';

type Rule = Database['public']['Tables']['rules']['Row'];

interface RulesBoxProps {
    rules: Rule[];
    onAdd: (content: string) => Promise<void>;
    onUpdate: (id: string, content: string) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

export function RulesBox({ rules, onAdd, onUpdate, onDelete }: RulesBoxProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [newContent, setNewContent] = useState('');

    const handleEdit = (rule: Rule) => {
        setEditingId(rule.id);
        setEditContent(rule.content);
    };

    const handleSaveEdit = async (id: string) => {
        await onUpdate(id, editContent);
        setEditingId(null);
    };

    const handleAdd = async () => {
        if (!newContent.trim()) return;
        await onAdd(newContent);
        setNewContent('');
        setIsAdding(false);
    };

    return (
        <div
            style={{
                padding: '14px 16px',
                background: 'var(--bg-card)',
                borderRadius: '10px',
                border: '0.5px solid var(--border-color)',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '.02em' }}>
                    Quy tắc không thương lượng
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    style={{
                        padding: '4px 8px',
                        fontSize: '11px',
                        background: 'var(--primary-color)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    + Thêm
                </button>
            </div>

            {rules.length === 0 && !isAdding ? (
                <div style={{
                    padding: '1.5rem',
                    textAlign: 'center',
                    color: 'var(--text-tertiary)',
                    fontSize: '13px',
                }}>
                    Chưa có quy tắc nào
                </div>
            ) : (
                rules.map((rule, idx) => (
                    <div
                        key={rule.id}
                        style={{
                            display: 'flex',
                            gap: '8px',
                            alignItems: 'flex-start',
                            fontSize: '13px',
                            color: 'var(--text-primary)',
                            lineHeight: 1.55,
                            marginBottom: '6px',
                        }}
                    >
                        <span style={{ fontWeight: 600, color: 'var(--primary-color)', minWidth: '16px' }}>{idx + 1}.</span>

                        {editingId === rule.id ? (
                            <div style={{ flex: 1, display: 'flex', gap: '4px' }}>
                                <input
                                    type="text"
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    style={{ flex: 1, padding: '4px', fontSize: '13px' }}
                                />
                                <button
                                    onClick={() => handleSaveEdit(rule.id)}
                                    style={{ padding: '4px 8px', fontSize: '11px', background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Lưu
                                </button>
                                <button
                                    onClick={() => setEditingId(null)}
                                    style={{ padding: '4px 8px', fontSize: '11px', background: 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-primary)' }}
                                >
                                    Hủy
                                </button>
                            </div>
                        ) : (
                            <>
                                <span style={{ flex: 1 }}>{rule.content}</span>
                                <button
                                    onClick={() => handleEdit(rule)}
                                    style={{ padding: '2px 6px', fontSize: '10px', background: 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: '3px', cursor: 'pointer', color: 'var(--text-primary)' }}
                                >
                                    Sửa
                                </button>
                                <button
                                    onClick={() => onDelete(rule.id)}
                                    style={{ padding: '2px 6px', fontSize: '10px', background: '#ffdddd', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                                >
                                    Xóa
                                </button>
                            </>
                        )}
                    </div>
                ))
            )}

            {isAdding && (
                <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                    <input
                        type="text"
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        placeholder="Nhập quy tắc mới..."
                        style={{ flex: 1, padding: '6px', fontSize: '13px' }}
                        autoFocus
                    />
                    <button
                        onClick={handleAdd}
                        style={{ padding: '6px 12px', fontSize: '11px', background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Thêm
                    </button>
                    <button
                        onClick={() => { setIsAdding(false); setNewContent(''); }}
                        style={{ padding: '6px 12px', fontSize: '11px', background: 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-primary)' }}
                    >
                        Hủy
                    </button>
                </div>
            )}
        </div>
    );
}
