'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { applyTheme, getStoredTheme, setStoredTheme, ThemeMode } from '@/lib/theme';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>('system');

  useEffect(() => {
    setTheme(getStoredTheme());
  }, []);

  const handleChange = (next: ThemeMode) => {
    setTheme(next);
    setStoredTheme(next);
    applyTheme(next);
  };

  const options: { value: ThemeMode; icon: React.ReactNode; label: string }[] = [
    { value: 'light', icon: <Sun className="w-4 h-4" />, label: 'Claro' },
    { value: 'dark', icon: <Moon className="w-4 h-4" />, label: 'Oscuro' },
    { value: 'system', icon: <Monitor className="w-4 h-4" />, label: 'Sistema' },
  ];

  return (
    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 gap-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => handleChange(opt.value)}
          title={opt.label}
          className={`p-1.5 rounded-md transition-colors ${
            theme === opt.value
              ? 'bg-white dark:bg-gray-700 text-brand-primary shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
}
