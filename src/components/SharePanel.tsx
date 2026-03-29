import { useState } from 'react';
import { copyToClipboard } from '../utils/exportUtils';
import type { Database } from '../lib/database.types';

type Schedule = Database['public']['Tables']['schedules']['Row'];

interface SharePanelProps {
    schedule: Schedule;
    onToggleShare: (isShared: boolean) => Promise<void>;
}

export function SharePanel({ schedule, onToggleShare }: SharePanelProps) {
    const [copied, setCopied] = useState(false);

    const shareUrl = `${window.location.origin}/view/${schedule.id}`;

    const handleCopyLink = async () => {
        const success = await copyToClipboard(shareUrl);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleToggle = async () => {
        await onToggleShare(!schedule.is_shared);
    };

    return (
        <div
            style={{
                marginTop: '1rem',
                padding: '12px 16px',
                background: '#fff',
                borderRadius: '8px',
                border: '0.5px solid #d3d1c7',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#3d3d3a' }}>
                    Chia sẻ công khai
                </span>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={schedule.is_shared}
                        onChange={handleToggle}
                        style={{ marginRight: '6px' }}
                    />
                    <span style={{ fontSize: '12px', color: '#5f5e5a' }}>
                        {schedule.is_shared ? 'Đang bật' : 'Tắt'}
                    </span>
                </label>
            </div>

            {schedule.is_shared && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                        type="text"
                        value={shareUrl}
                        readOnly
                        style={{
                            flex: 1,
                            padding: '6px 8px',
                            fontSize: '12px',
                            background: '#f1efe8',
                            border: '1px solid #d3d1c7',
                            borderRadius: '4px',
                            color: '#5f5e5a',
                        }}
                    />
                    <button
                        onClick={handleCopyLink}
                        style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            background: copied ? '#9FE1CB' : '#185FA5',
                            color: copied ? '#085041' : '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                        }}
                    >
                        {copied ? '✓ Đã copy' : 'Copy link'}
                    </button>
                </div>
            )}
        </div>
    );
}
