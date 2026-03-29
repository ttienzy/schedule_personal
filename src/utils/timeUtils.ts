export function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function checkOverlap(
    start1: string,
    end1: string,
    start2: string,
    end2: string
): boolean {
    const s1 = timeToMinutes(start1);
    const e1 = timeToMinutes(end1);
    const s2 = timeToMinutes(start2);
    const e2 = timeToMinutes(end2);

    return s1 < e2 && s2 < e1;
}

export function findConflicts(
    slots: Array<{ id: string; day: number; time_start: string; time_end: string }>
): Set<string> {
    const conflicts = new Set<string>();

    for (let i = 0; i < slots.length; i++) {
        for (let j = i + 1; j < slots.length; j++) {
            if (slots[i].day === slots[j].day) {
                if (checkOverlap(
                    slots[i].time_start.substring(0, 5),
                    slots[i].time_end.substring(0, 5),
                    slots[j].time_start.substring(0, 5),
                    slots[j].time_end.substring(0, 5)
                )) {
                    conflicts.add(slots[i].id);
                    conflicts.add(slots[j].id);
                }
            }
        }
    }

    return conflicts;
}
