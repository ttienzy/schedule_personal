import type { Database } from '../lib/database.types';

type Schedule = Database['public']['Tables']['schedules']['Row'];
type Slot = Database['public']['Tables']['slots']['Row'];
type Rule = Database['public']['Tables']['rules']['Row'];

export interface ScheduleExport {
    schedule: Omit<Schedule, 'id' | 'owner_id' | 'created_at' | 'updated_at'>;
    slots: Array<Omit<Slot, 'id' | 'schedule_id' | 'created_at'>>;
    rules: Array<Omit<Rule, 'id' | 'schedule_id' | 'created_at'>>;
    exportedAt: string;
}

export function exportScheduleToJSON(
    schedule: Schedule,
    slots: Slot[],
    rules: Rule[]
): string {
    const data: ScheduleExport = {
        schedule: {
            title: schedule.title,
            week_label: schedule.week_label,
            date_from: schedule.date_from,
            date_to: schedule.date_to,
            is_shared: schedule.is_shared,
        },
        slots: slots.map(s => ({
            category_id: s.category_id,
            day: s.day,
            time_start: s.time_start,
            time_end: s.time_end,
            label: s.label,
        })),
        rules: rules.map(r => ({
            order: r.order,
            content: r.content,
        })),
        exportedAt: new Date().toISOString(),
    };

    return JSON.stringify(data, null, 2);
}

export function downloadJSON(filename: string, content: string) {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}
