'use client';

import { useTheme } from '@/app/ThemeProvider';

export function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] transition-colors"
      aria-label="Toggle dark mode"
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
