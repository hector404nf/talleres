'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  LayoutDashboard, Users, Building, Download, Package, FolderOpen, Tag,
  Scale, FileText, ShoppingCart, DollarSign, Wrench, Building2,
  Landmark, CreditCard, BarChart3, Megaphone, Bell, UserCog, Settings, LogOut, Globe,
  ChevronLeft, ChevronRight, Search, Menu, X
} from 'lucide-react';
import { useConfigStore } from '@/lib/supabase';
import { applyBrandColors } from '@/lib/theme';
import ThemeToggle from '@/components/ThemeToggle';

const navItems = [
  { href: '/', Icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/clientes', Icon: Users, label: 'Clientes' },
  { href: '/proveedores', Icon: Building, label: 'Proveedores' },
  { href: '/compras', Icon: Download, label: 'Compras' },
  { href: '/productos', Icon: Package, label: 'Productos' },
  { href: '/categorias', Icon: FolderOpen, label: 'Categorías' },
  { href: '/marcas', Icon: Tag, label: 'Marcas' },
  { href: '/unidades', Icon: Scale, label: 'Unidades' },
  { href: '/presupuestos', Icon: FileText, label: 'Presupuestos' },
  { href: '/pedidos', Icon: ShoppingCart, label: 'Pedidos' },
  { href: '/ventas', Icon: DollarSign, label: 'Ventas' },
  { href: '/facturacion', Icon: FileText, label: 'Facturación' },
  { href: '/servicios', Icon: Wrench, label: 'Servicios' },
  { href: '/stock/movimientos', Icon: Package, label: 'Mov. Stock' },
  { href: '/depositos', Icon: Building2, label: 'Depósitos' },
  { href: '/caja', Icon: Landmark, label: 'Caja' },
  { href: '/planes-credito', Icon: CreditCard, label: 'Planes Crédito' },
  { href: '/reportes', Icon: BarChart3, label: 'Reportes' },
  { href: '/campanias', Icon: Megaphone, label: 'Campañas' },
  { href: '/alertas', Icon: Bell, label: 'Alertas' },
  { href: '/usuarios', Icon: UserCog, label: 'Usuarios' },
  { href: '/auditoria', Icon: FileText, label: 'Auditoría' },
  { href: '/configuracion', Icon: Settings, label: 'Configuración' },
  { href: '/config-web', Icon: Globe, label: 'Config Web' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { config: rawConfig, fetchConfig } = useConfigStore();
  const config = rawConfig as any;

  useEffect(() => {
    fetchConfig();
    const auth = localStorage.getItem('isAuthenticated');
    const userData = localStorage.getItem('user');
    const savedCollapsed = localStorage.getItem('sidebar-collapsed');
    if (savedCollapsed !== null) setCollapsed(savedCollapsed === 'true');
    if (auth === 'true' && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    } else {
      router.replace('/login');
    }
    setIsLoading(false);
  }, [router, fetchConfig]);

  useEffect(() => {
    if (config) {
      applyBrandColors(config.color_primario, config.color_secundario);
    }
  }, [config]);

  const toggleSidebar = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('sidebar-collapsed', String(next));
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    router.replace('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-brand-primary" />
      </div>
    );
  }
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <p className="text-gray-500 dark:text-gray-400">Redirigiendo al login...</p>
      </div>
    );
  }

  const sidebarWidth = collapsed ? 'w-[72px]' : 'w-[260px]';
  const pageTitle = pathname === '/' ? 'Dashboard' : navItems.find(item => item.href === pathname)?.label || 'Panel de Control';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${sidebarWidth} ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-shrink-0 flex flex-col h-screen fixed lg:sticky top-0 z-50 transition-all duration-300`}
      >
        {/* Logo */}
        <div className="h-[64px] flex items-center border-b border-gray-100 dark:border-gray-800 px-5">
          <Link href="/" className="flex items-center gap-3 overflow-hidden">
            {config?.logo_url ? (
              <img src={config.logo_url} alt="" className="h-8 w-8 object-contain rounded" />
            ) : (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 text-white" style={{ backgroundColor: config?.color_primario || '#4f46e5' }}>
                {(config?.nombre_fantasia?.[0] || config?.razon_social?.[0] || 'T').toUpperCase()}
              </div>
            )}
            {!collapsed && (
              <span className="font-semibold text-sm whitespace-nowrap text-gray-900 dark:text-white">
                {config?.nombre_fantasia || config?.razon_social || 'Talleres Pro'}
              </span>
            )}
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto scrollbar-hide px-3">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`group relative flex items-center ${collapsed ? 'justify-center w-12 h-11 mx-auto' : 'justify-start px-3 h-10 w-full'} rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-primary/10 text-brand-primary font-medium'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <item.Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.8} />
                  {!collapsed && (
                    <span className="ml-3 text-sm whitespace-nowrap">{item.label}</span>
                  )}
                  {collapsed && (
                    <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom */}
        <div className="py-3 border-t border-gray-100 dark:border-gray-800 px-3">
          <button
            onClick={handleLogout}
            className={`group relative flex items-center ${collapsed ? 'justify-center w-12 h-11 mx-auto' : 'justify-start px-3 h-10 w-full'} rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all`}
            title={collapsed ? 'Cerrar Sesión' : undefined}
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" strokeWidth={1.8} />
            {!collapsed && <span className="ml-3 text-sm whitespace-nowrap">Cerrar Sesión</span>}
          </button>
        </div>

        {/* Collapse toggle - desktop only */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex absolute -right-3 top-[80px] z-50 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all"
          title={collapsed ? 'Expandir' : 'Contraer'}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200/60 dark:border-gray-800/60">
          <div className="px-4 sm:px-8 h-[64px] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{pageTitle}</h1>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <BuscadorGlobal />
              <ThemeToggle />
              <NotificacionesBell />
              <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-800">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{ backgroundColor: config?.color_primario || '#4f46e5' }}>
                  {(user?.nombre_completo || user?.username || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">{user?.nombre_completo || user?.username || 'Usuario'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize leading-tight">{user?.rol || 'Admin'}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

function BuscadorGlobal() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [abierto, setAbierto] = useState(false);
  const [resultados, setResultados] = useState<any[]>([]);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResultados([]);
      return;
    }
    const q = query.toLowerCase();
    const res: any[] = [];
    navItems.forEach((item) => {
      if (item.label.toLowerCase().includes(q)) {
        res.push({ tipo: 'navegacion', titulo: item.label, icono: item.label[0], href: item.href });
      }
    });
    try {
      const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
      clientes.filter((c: any) => (c.nombre || '').toLowerCase().includes(q) || (c.apellido || '').toLowerCase().includes(q) || (c.cuil_cuit || '').includes(q))
        .slice(0, 3).forEach((c: any) => res.push({ tipo: 'cliente', titulo: `${c.apellido || ''} ${c.nombre || ''}`.trim(), subtitulo: c.cuil_cuit || '', href: '/clientes' }));
    } catch { /* noop */ }
    try {
      const productos = JSON.parse(localStorage.getItem('productos') || '[]');
      productos.filter((p: any) => (p.nombre || '').toLowerCase().includes(q) || (p.codigo || '').toLowerCase().includes(q))
        .slice(0, 3).forEach((p: any) => res.push({ tipo: 'producto', titulo: p.nombre, subtitulo: p.codigo || '', href: '/productos' }));
    } catch { /* noop */ }
    setResultados(res);
  }, [query]);

  const handleSelect = (href: string) => {
    setAbierto(false);
    setQuery('');
    router.push(href);
  };

  return (
    <div className="relative hidden sm:block" ref={ref}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setAbierto(true); }}
          onFocus={() => setAbierto(true)}
          placeholder="Buscar..."
          className="w-64 pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:outline-none transition-all"
        />
      </div>
      {abierto && resultados.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 z-50 max-h-80 overflow-y-auto">
          {resultados.map((r, i) => (
            <button
              key={i}
              onClick={() => handleSelect(r.href)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center space-x-3 border-b border-gray-50 dark:border-gray-800 last:border-0 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">
                {r.icono?.[0] || (r.tipo === 'cliente' ? 'C' : r.tipo === 'producto' ? 'P' : 'N')}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-800 dark:text-gray-100">{r.titulo}</div>
                {r.subtitulo && <div className="text-xs text-gray-400 dark:text-gray-500">{r.subtitulo}</div>}
              </div>
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">{r.tipo}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function NotificacionesBell() {
  const [abierto, setAbierto] = useState(false);
  const [notifs, setNotifs] = useState<any[]>([]);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function load() {
      try {
        const data = JSON.parse(localStorage.getItem('notificaciones') || '[]');
        setNotifs(data);
      } catch { setNotifs([]); }
    }
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  const noLeidas = notifs.filter((n: any) => !n.leida).length;

  const marcarLeida = (id: string) => {
    const nuevas = notifs.map((n: any) => (n.id === id ? { ...n, leida: true } : n));
    setNotifs(nuevas);
    localStorage.setItem('notificaciones', JSON.stringify(nuevas));
  };

  const marcarTodasLeidas = () => {
    const nuevas = notifs.map((n: any) => ({ ...n, leida: true }));
    setNotifs(nuevas);
    localStorage.setItem('notificaciones', JSON.stringify(nuevas));
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setAbierto(!abierto)} className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <Bell className="w-4 h-4" />
        {noLeidas > 0 && (
          <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>
      {abierto && (
        <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 z-50 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
            <span className="font-semibold text-sm text-gray-900 dark:text-white">Notificaciones</span>
            {noLeidas > 0 && (
              <button onClick={marcarTodasLeidas} className="text-xs text-brand-primary hover:underline font-medium">Marcar todas como leídas</button>
            )}
          </div>
          {notifs.length === 0 ? (
            <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-sm">
              <div className="text-3xl mb-2">📭</div>
              Sin notificaciones
            </div>
          ) : (
            <div>
              {notifs.slice(0, 15).map((n: any) => (
                <div
                  key={n.id}
                  onClick={() => marcarLeida(n.id)}
                  className={`p-4 border-b border-gray-100 dark:border-gray-800 last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${!n.leida ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}
                >
                  <div className="text-sm text-gray-800 dark:text-gray-100 font-medium">{n.titulo}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{n.mensaje}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">{new Date(n.fecha).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
