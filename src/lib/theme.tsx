'use client';

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

// ============================================================
// ADMIN THEME UTILITIES (light/dark/system + brand colors)
// ============================================================
export type ThemeMode = 'light' | 'dark' | 'system';

const ADMIN_THEME_KEY = 'talleres-theme';

export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  try {
    return (localStorage.getItem(ADMIN_THEME_KEY) as ThemeMode) || 'system';
  } catch {
    return 'system';
  }
}

export function setStoredTheme(theme: ThemeMode) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ADMIN_THEME_KEY, theme);
  } catch { /* noop */ }
}

export function applyTheme(theme: ThemeMode) {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = theme === 'dark' || (theme === 'system' && systemDark);

  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function listenSystemTheme(callback: (isDark: boolean) => void) {
  if (typeof window === 'undefined') return () => {};
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = (e: MediaQueryListEvent) => callback(e.matches);
  mq.addEventListener('change', handler);
  return () => mq.removeEventListener('change', handler);
}

export function hexToRgb(hex: string) {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

export function applyBrandColors(primary: string, secondary: string) {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  const primaryRgb = hexToRgb(primary || '#4f46e5');
  const secondaryRgb = hexToRgb(secondary || '#ffffff');

  root.style.setProperty('--brand-primary', primary || '#4f46e5');
  root.style.setProperty('--brand-secondary', secondary || '#ffffff');
  root.style.setProperty('--brand-primary-rgb', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`);
  root.style.setProperty('--brand-secondary-rgb', `${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}`);
}

// ============================================================
// STORE THEME PROVIDER (legacy, used by public /[slug] pages)
// ============================================================
interface ThemeColors {
  bg: string;
  bgCard: string;
  bgCardHover: string;
  bgNav: string;
  bgSection: string;
  bgInput: string;
  text: string;
  textMuted: string;
  textDim: string;
  accent: string;
  accentHover: string;
  accentLight: string;
  border: string;
  borderLight: string;
  shadow: string;
  shadowHover: string;
  gradient: string;
  gradientAccent: string;
}

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  theme: ThemeColors;
}

const darkTheme: ThemeColors = {
  bg: '#0a0a0a',
  bgCard: '#1a1a2e',
  bgCardHover: '#22223a',
  bgNav: 'rgba(10,10,10,0.95)',
  bgSection: '#0f0f1a',
  bgInput: '#1a1a2e',
  text: '#ffffff',
  textMuted: '#8892b0',
  textDim: '#5a6380',
  accent: '#e94560',
  accentHover: '#ff6b81',
  accentLight: 'rgba(233,69,96,0.15)',
  border: '#2a2a4a',
  borderLight: '#3a3a5a',
  shadow: '0 4px 24px rgba(0,0,0,0.4)',
  shadowHover: '0 8px 32px rgba(233,69,96,0.2)',
  gradient: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
  gradientAccent: 'linear-gradient(135deg, #e94560 0%, #ff6b81 100%)',
};

const lightTheme: ThemeColors = {
  bg: '#ffffff',
  bgCard: '#ffffff',
  bgCardHover: '#f8f9fa',
  bgNav: 'rgba(255,255,255,0.95)',
  bgSection: '#f5f5f7',
  bgInput: '#f5f5f7',
  text: '#1a1a2e',
  textMuted: '#6c757d',
  textDim: '#adb5bd',
  accent: '#e94560',
  accentHover: '#d63851',
  accentLight: 'rgba(233,69,96,0.1)',
  border: '#e9ecef',
  borderLight: '#dee2e6',
  shadow: '0 4px 24px rgba(0,0,0,0.08)',
  shadowHover: '0 8px 32px rgba(233,69,96,0.15)',
  gradient: 'linear-gradient(135deg, #ffffff 0%, #f5f5f7 100%)',
  gradientAccent: 'linear-gradient(135deg, #e94560 0%, #ff6b81 100%)',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('theme-dark');
    if (saved !== null) setDarkMode(saved === 'true');
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      localStorage.setItem('theme-dark', String(!prev));
      return !prev;
    });
  };

  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
