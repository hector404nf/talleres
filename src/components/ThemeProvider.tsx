'use client';

import { ReactNode, useEffect, useState } from 'react';
import { applyTheme, getStoredTheme } from '@/lib/theme';

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const theme = getStoredTheme();
    applyTheme(theme);
    setMounted(true);

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme('system');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
