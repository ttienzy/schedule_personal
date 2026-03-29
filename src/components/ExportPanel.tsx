import { useRef } from 'react';
import { exportScheduleToJSON, downloadJSON } from '../utils/exportUtils';
import type { Database } from '../lib/database.types';

type Schedule = Database['public']['Tables']['schedules']['Row'];
type Slot = Database['public']['Tables']['slots']['Row'];
type Rule = Database['public']['Tables']['rules']['Row'];

interface ExportPanelProps {
    schedule: Schedule;
    slots: Slot[];
    rules: Rule[];
    onImport: (data: any) => Promise<void>;
}

export function ExportPanel({ schedule, slots, rules, onImport }: ExportPanelProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const json = exportScheduleToJSON(schedule, slots, rules);
        const filename = `schedule-${schedule.week_label?.replace(/\s/g, '-') || 'export'}.json`;
        downloadJSON(filename, json);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);
            await onImport(data);
            alert('Import thành công!');
        } catch (err) {
            alert('Lỗi import: ' + (err as Error).message);
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div
            style={{
                marginTop: '1rem',
                padding: '12px 16px',
                background: '#fff',
                borderRadius: '8px',
                border: '0.5px solid #d3d1c7',
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
            }}
        >
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#3d3d3a', flex: 1 }}>
                Backup & Restore
            </span>

            <button
                onClick={handleExport}
                style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    background: '#185FA5',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                }}
            >
                ↓ Export JSON
            </button>

            <button
                onClick={handleImportClick}
                style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    background: '#e8e6dd',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                }}
            >
                ↑ Import JSON
            </button>

            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />
        </div>
    );
}
