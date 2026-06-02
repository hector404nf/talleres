'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ThemeProvider, useTheme } from '@/lib/theme';

function MenuLayoutContent({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const slug = params?.slug as string;
  const { darkMode, toggleDarkMode, theme } = useTheme();

  const [config, setConfig] = useState<any>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data } = await supabase.from('configuracion_web').select('*').eq('slug', slug).eq('activo', true).single();
      if (!data) { router.replace('/'); return; }
      setConfig(data);
      setConfigLoading(false);

      const stored = localStorage.getItem(`cart_${slug}`);
      if (stored) setCart(JSON.parse(stored));
    })();
  }, [slug]);

  useEffect(() => {
    localStorage.setItem(`cart_${slug}`, JSON.stringify(cart));
  }, [cart, slug]);

  const cartCount = cart.reduce((s: number, i: any) => s + (i.cantidad || 1), 0);

  const navItems = [
    { path: `/${slug}/menu`, label: 'Inicio' },
    { path: `/${slug}/servicios`, label: 'Servicios' },
    { path: `/${slug}/productos`, label: 'Productos' },
    { path: `/${slug}/pedidos`, label: 'Mis Pedidos' },
  ];

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

  if (configLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.bg }}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: theme.accent, borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.bg, color: theme.text, fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-all" style={{ backgroundColor: theme.bgNav, borderColor: theme.border }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              {config?.logo_url && <img src={config.logo_url} alt="Logo" className="h-8 w-auto object-contain" />}
              <span className="font-bold text-lg hidden sm:block" style={{ color: theme.text }}>{config?.nombre_sitio || 'Taller'}</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              {navItems.map(item => (
                <a key={item.path} href={item.path} className={`text-sm font-medium transition-colors ${isActive(item.path) ? '' : 'opacity-60 hover:opacity-100'}`} style={{ color: isActive(item.path) ? theme.accent : theme.text }}>
                  {item.label}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={toggleDarkMode} className="p-2 rounded-lg transition-colors hover:bg-white/10" style={{ color: theme.textMuted }} title={darkMode ? 'Modo claro' : 'Modo oscuro'}>
                {darkMode ? '☀️' : '🌙'}
              </button>
              <a href={`/${slug}/auth`} className="p-2 rounded-lg transition-colors hover:bg-white/10" style={{ color: theme.textMuted }} title="Mi cuenta">
                👤
              </a>
              <a href={`/${slug}/checkout`} className="relative p-2 rounded-lg transition-colors hover:bg-white/10" style={{ color: theme.text }}>
                🛒
                {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center" style={{ backgroundColor: theme.accent }}>{cartCount}</span>}
              </a>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg" style={{ color: theme.text }}>
                {mobileMenuOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 border-t pt-3 space-y-1" style={{ borderColor: theme.border }}>
              {navItems.map(item => (
                <a key={item.path} href={item.path} className="block px-3 py-2.5 rounded-lg text-sm font-medium" style={{ color: isActive(item.path) ? theme.accent : theme.textMuted, backgroundColor: isActive(item.path) ? theme.accentLight : 'transparent' }}>
                  {item.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </nav>

      <main className="pt-16">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="py-8 text-center text-sm border-t" style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.textDim }}>
        <p>© {new Date().getFullYear()} {config?.nombre_sitio || 'Taller'}. Todos los derechos reservados.</p>
      </footer>

      {/* WhatsApp Float */}
      {config?.whatsapp && (
        <a href={`https://wa.me/${config.whatsapp}`} target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg transition-all hover:scale-110 z-40" style={{ backgroundColor: '#22c55e', color: '#fff', boxShadow: '0 4px 20px rgba(34,197,94,0.4)' }}>
          💬
        </a>
      )}
    </div>
  );
}

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <MenuLayoutContent>{children}</MenuLayoutContent>
    </ThemeProvider>
  );
}
