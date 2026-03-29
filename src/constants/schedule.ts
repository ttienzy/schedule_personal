// Schedule constants
export const DAYS = [
    { value: 1, label: 'T2', fullLabel: 'Thứ 2', weekend: false },
    { value: 2, label: 'T3', fullLabel: 'Thứ 3', weekend: false },
    { value: 3, label: 'T4', fullLabel: 'Thứ 4', weekend: false },
    { value: 4, label: 'T5', fullLabel: 'Thứ 5', weekend: false },
    { value: 5, label: 'T6', fullLabel: 'Thứ 6', weekend: false },
    { value: 6, label: 'T7', fullLabel: 'Thứ 7', weekend: true },
    { value: 7, label: 'CN', fullLabel: 'Chủ nhật', weekend: true },
] as const;

export const DEFAULT_TIME_START = '06:30';
export const DEFAULT_TIME_END = '07:30';
export const DEFAULT_INITIAL_DAY = 1;

export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 5,
    DEFAULT_PAGE: 1,
} as const;

export const LAYOUT = {
    MAX_WIDTH: '1600px',
    SIDEBAR_MIN_WIDTH: '280px',
    SIDEBAR_MAX_WIDTH: '320px',
} as const;

export const BREAKPOINTS = {
    MOBILE: 480,
    TABLET: 768,
    DESKTOP: 1200,
} as const;
