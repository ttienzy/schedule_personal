import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(() => {
        // Lấy theme từ localStorage hoặc mặc định là light
        const saved = localStorage.getItem('theme') as Theme;
        return saved || 'light';
    });

    useEffect(() => {
        // Áp dụng theme vào document
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return { theme, toggleTheme };
}
