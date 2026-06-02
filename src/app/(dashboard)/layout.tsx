'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  LayoutDashboard, Users, Building, Download, Package, FolderOpen, Tag,
  Scale, FileText, ShoppingCart, DollarSign, Wrench, Building2,
  Landmark, CreditCard, BarChart3, Megaphone, Bell, UserCog, Settings, LogOut, Globe,
  ChevronLeft, ChevronRight
} from 'lucide-react';

const navItems = [
  { href: '/', Icon: LayoutDashboard, label: 'Dashboard', icon: '📊' },
  { href: '/clientes', Icon: Users, label: 'Clientes', icon: '👥' },
  { href: '/proveedores', Icon: Building, label: 'Proveedores', icon: '🏭' },
  { href: '/compras', Icon: Download, label: 'Compras', icon: '📥' },
  { href: '/productos', Icon: Package, label: 'Productos', icon: '📦' },
  { href: '/categorias', Icon: FolderOpen, label: 'Categorías', icon: '📂' },
  { href: '/marcas', Icon: Tag, label: 'Marcas', icon: '🏷️' },
  { href: '/unidades', Icon: Scale, label: 'Unidades', icon: '⚖️' },
  { href: '/presupuestos', Icon: FileText, label: 'Presupuestos', icon: '📋' },
  { href: '/pedidos', Icon: ShoppingCart, label: 'Pedidos', icon: '🛒' },
  { href: '/ventas', Icon: DollarSign, label: 'Ventas', icon: '💰' },
  { href: '/facturacion', Icon: FileText, label: 'Facturación', icon: '📄' },
  { href: '/servicios', Icon: Wrench, label: 'Servicios', icon: '🔧' },
  { href: '/stock/movimientos', Icon: Package, label: 'Mov. Stock', icon: '📦' },
  { href: '/depositos', Icon: Building2, label: 'Depósitos', icon: '🏭' },
  { href: '/caja', Icon: Landmark, label: 'Caja', icon: '💵' },
  { href: '/planes-credito', Icon: CreditCard, label: 'Planes Crédito', icon: '💳' },
  { href: '/reportes', Icon: BarChart3, label: 'Reportes', icon: '📈' },
  { href: '/campanias', Icon: Megaphone, label: 'Campañas', icon: '📢' },
  { href: '/alertas', Icon: Bell, label: 'Alertas', icon: '🔔' },
  { href: '/usuarios', Icon: UserCog, label: 'Usuarios', icon: '👤' },
  { href: '/auditoria', Icon: FileText, label: 'Auditoría', icon: '📋' },
  { href: '/configuracion', Icon: Settings, label: 'Configuración', icon: '⚙️' },
  { href: '/config-web', Icon: Globe, label: 'Config Web', icon: '🌐' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
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
  }, [router]);

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
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#3b82f6]" />
      </div>
    );
  }
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
        <p className="text-gray-500">Redirigiendo al login...</p>
      </div>
    );
  }

  const sidebarWidth = collapsed ? 'w-[72px]' : 'w-[220px]';

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex">
      {/* Sidebar */}
      <aside className={`${sidebarWidth} bg-[#111] text-white flex-shrink-0 flex flex-col h-screen sticky top-0 z-40 transition-all duration-300 relative`}>
        {/* Collapse toggle — floating on the edge */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-[80px] z-50 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-gray-900 hover:shadow-lg transition-all"
          title={collapsed ? 'Expandir' : 'Contraer'}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {/* Logo */}
        <div className={`h-[72px] flex items-center border-b border-white/10 ${collapsed ? 'justify-center' : 'px-5'}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#4f46e5] rounded-lg flex items-center justify-center text-sm font-bold shrink-0">T</div>
            {!collapsed && <span className="font-semibold text-sm whitespace-nowrap">Talleres Pro</span>}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style jsx>{`nav::-webkit-scrollbar { display: none; }`}</style>
          <div className={`space-y-0.5 ${collapsed ? 'px-2' : 'px-3'}`}>
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center ${collapsed ? 'justify-center w-12 h-12 mx-auto' : 'justify-start px-3 h-11 w-full'} rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-[#4f46e5] text-white shadow-lg shadow-indigo-500/30'
                      : 'text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <item.Icon className="w-5 h-5 shrink-0" strokeWidth={1.8} />
                  {!collapsed && (
                    <span className="ml-3 text-sm font-medium whitespace-nowrap">{item.label}</span>
                  )}
                  {collapsed && (
                    <span className="absolute left-full ml-3 px-2 py-1 bg-[#1a1a1a] text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 border border-white/10">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom */}
        <div className={`py-3 border-t border-white/10 ${collapsed ? 'px-2' : 'px-3'}`}>
          <button
            onClick={handleLogout}
            className={`group relative flex items-center ${collapsed ? 'justify-center w-12 h-12 mx-auto' : 'justify-start px-3 h-11 w-full'} rounded-xl text-gray-400 hover:bg-white/10 hover:text-white transition-all`}
            title={collapsed ? 'Cerrar Sesión' : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" strokeWidth={1.8} />
            {!collapsed && <span className="ml-3 text-sm font-medium whitespace-nowrap">Cerrar Sesión</span>}
            {collapsed && (
              <span className="absolute left-full ml-3 px-2 py-1 bg-[#1a1a1a] text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 border border-white/10">
                Cerrar Sesión
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto min-w-0">
        {/* Header */}
        <header className="px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {pathname === '/' ? `Hola, ${user?.nombre_completo || user?.username || 'Usuario'}!` : navItems.find(item => item.href === pathname)?.label || 'Panel de Control'}
              </h1>
              {pathname === '/' && (
                <p className="text-sm text-gray-500 mt-0.5">Aquí está tu resumen del día</p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <BuscadorGlobal />
              <NotificacionesBell />
              <div className="w-10 h-10 rounded-full bg-[#4f46e5] flex items-center justify-center text-white font-semibold text-sm">
                {(user?.nombre_completo || user?.username || 'U').charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div className="px-8 pb-8">
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
        res.push({ tipo: 'navegacion', titulo: item.label, icono: item.icon, href: item.href });
      }
    });
    try {
      const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
      clientes.filter((c: any) => (c.nombre || '').toLowerCase().includes(q) || (c.apellido || '').toLowerCase().includes(q) || (c.documento || '').includes(q))
        .slice(0, 3).forEach((c: any) => res.push({ tipo: 'cliente', titulo: `${c.nombre} ${c.apellido || ''}`.trim(), subtitulo: c.documento || '', href: '/clientes' }));
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
    <div className="relative w-64" ref={ref}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setAbierto(true); }}
          onFocus={() => setAbierto(true)}
          placeholder="Buscar..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border-none rounded-2xl text-sm text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#4f46e5]/20 focus:outline-none shadow-sm"
        />
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      {abierto && resultados.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 max-h-80 overflow-y-auto">
          {resultados.map((r, i) => (
            <button
              key={i}
              onClick={() => handleSelect(r.href)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-50 last:border-0 transition-colors"
            >
              <span className="text-lg">{r.icono || (r.tipo === 'cliente' ? '👤' : r.tipo === 'producto' ? '📦' : '📄')}</span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-800">{r.titulo}</div>
                {r.subtitulo && <div className="text-xs text-gray-400">{r.subtitulo}</div>}
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
      <button onClick={() => setAbierto(!abierto)} className="relative w-10 h-10 flex items-center justify-center rounded-2xl bg-white hover:bg-gray-50 transition-colors shadow-sm">
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {noLeidas > 0 && (
          <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>
      {abierto && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b border-gray-50">
            <span className="font-semibold text-sm text-gray-900">Notificaciones</span>
            {noLeidas > 0 && (
              <button onClick={marcarTodasLeidas} className="text-xs text-[#4f46e5] hover:underline font-medium">Marcar todas como leídas</button>
            )}
          </div>
          {notifs.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              <div className="text-3xl mb-2">📭</div>
              Sin notificaciones
            </div>
          ) : (
            <div>
              {notifs.slice(0, 15).map((n: any) => (
                <div
                  key={n.id}
                  onClick={() => marcarLeida(n.id)}
                  className={`p-4 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 transition-colors ${!n.leida ? 'bg-blue-50/50' : ''}`}
                >
                  <div className="text-sm text-gray-800 font-medium">{n.titulo}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{n.mensaje}</div>
                  <div className="text-xs text-gray-400 mt-1.5">{new Date(n.fecha).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
