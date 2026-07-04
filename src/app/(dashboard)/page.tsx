'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useClientesStore, useProductosStore, useVentasStore, useOrdenesStore } from '@/lib/supabase';
import {
  DollarSign, BarChart3, Users, Package, ArrowUpRight, ArrowRight, Plus,
  Pencil, Trash2, FileText, ShoppingBag, Wrench, FileSpreadsheet, Download,
  Landmark, TrendingUp, AlertTriangle
} from 'lucide-react';
import { formatPriceConfig } from '@/lib/format';

export default function DashboardPage() {
  const { clientes, fetchClientes } = useClientesStore();
  const { productos, fetchProductos } = useProductosStore();
  const { ventas, fetchVentas } = useVentasStore();
  const { ordenes, fetchOrdenes } = useOrdenesStore();

  useEffect(() => {
    fetchClientes();
    fetchProductos();
    fetchVentas();
    fetchOrdenes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ventasHoy = useMemo(() =>
    ventas.filter((v: any) => new Date(v.fecha).toDateString() === new Date().toDateString()),
  [ventas]);

  const montoHoy = useMemo(() => ventasHoy.reduce((sum: number, v: any) => sum + (v.total || 0), 0), [ventasHoy]);
  const montoTotal = useMemo(() => ventas.reduce((sum: number, v: any) => sum + (v.total || 0), 0), [ventas]);
  const productosStockBajo = useMemo(() => productos.filter((p: any) => (p.stock_actual || 0) <= (p.stock_minimo || 0)), [productos]);
  const ordenesPendientes = useMemo(() => ordenes.filter((o: any) => !['entregado', 'cancelado'].includes(o.estado)), [ordenes]);

  useEffect(() => {
    if (productosStockBajo.length > 0) {
      toast.warning(`${productosStockBajo.length} producto${productosStockBajo.length > 1 ? 's' : ''} con stock bajo`, {
        description: 'Revisá el panel de Productos para ver los detalles.',
        duration: 6000,
      });
    }
    const hoy = new Date();
    const cumpleaneros = clientes.filter((c: any) => {
      if (!c.fecha_nacimiento) return false;
      const fn = new Date(c.fecha_nacimiento);
      return fn.getDate() === hoy.getDate() && fn.getMonth() === hoy.getMonth();
    });
    if (cumpleaneros.length > 0) {
      toast.success(`🎂 ${cumpleaneros.length} cliente${cumpleaneros.length > 1 ? 's' : ''} cumple años hoy!`, {
        description: cumpleaneros.map((c: any) => `${c.nombre} ${c.apellido || ''}`).join(', '),
        duration: 10000,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productos.length, clientes.length]);

  const statCards = [
    { title: 'Ventas Hoy', value: formatPriceConfig(montoHoy), sub: `+${ventasHoy.length} ventas`, href: '/ventas', Icon: DollarSign, trend: 'up' },
    { title: 'Total Ventas', value: formatPriceConfig(montoTotal), sub: `${ventas.length} totales`, href: '/reportes', Icon: BarChart3, trend: 'up' },
    { title: 'Clientes', value: clientes.length.toString(), sub: 'registrados', href: '/clientes', Icon: Users, trend: 'neutral' },
    { title: 'Stock Bajo', value: productosStockBajo.length.toString(), sub: 'productos', href: '/productos', Icon: Package, trend: productosStockBajo.length > 0 ? 'down' : 'neutral' },
  ];

  const quickActions = [
    { label: 'Nueva Venta', href: '/ventas', Icon: ShoppingBag, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' },
    { label: 'Nuevo Cliente', href: '/clientes', Icon: Users, color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' },
    { label: 'Nueva Orden', href: '/servicios', Icon: Wrench, color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' },
    { label: 'Presupuesto', href: '/presupuestos', Icon: FileSpreadsheet, color: 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
    { label: 'Compra', href: '/compras', Icon: Download, color: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400' },
    { label: 'Caja', href: '/caja', Icon: Landmark, color: 'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400' },
    { label: 'Producto', href: '/productos', Icon: Plus, color: 'bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400' },
    { label: 'Reportes', href: '/reportes', Icon: BarChart3, color: 'bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome + Quick Actions */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Resumen del día</p>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatPriceConfig(montoHoy)}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{ventasHoy.length} ventas hoy</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {quickActions.slice(0, 4).map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-transform hover:scale-105 ${action.color}`}
              >
                <action.Icon className="w-4 h-4" />
                {action.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:w-[360px] bg-gradient-to-br from-brand-primary to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Órdenes pendientes</p>
              <h2 className="text-3xl font-bold mt-1">{ordenesPendientes.length}</h2>
            </div>
            <div className="p-3 rounded-xl bg-white/20">
              <Wrench className="w-6 h-6" />
            </div>
          </div>
          <p className="text-white/80 text-sm mt-4">
            {ordenesPendientes.length > 0 ? 'Tenés órdenes esperando atención.' : 'No hay órdenes pendientes.'}
          </p>
          <Link href="/servicios" className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-white hover:text-white/80">
            Ver órdenes <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, index) => (
          <Link key={index} href={card.href} className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow block group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{card.value}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${card.trend === 'down' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>
                <card.Icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className={`inline-flex items-center gap-1 font-medium ${card.trend === 'down' ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                <ArrowUpRight className="w-3.5 h-3.5" />
                {card.sub}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Ingresos</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Resumen de ventas por período</p>
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">Últimos 6 meses</span>
          </div>
          <RevenueChart ventas={ventas} />
        </div>

        {/* Stock Alerts */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Stock Bajo</h3>
            {productosStockBajo.length > 0 && (
              <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {productosStockBajo.length}
              </span>
            )}
          </div>
          {productosStockBajo.length === 0 ? (
            <div className="text-center py-10 text-gray-400 dark:text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Todo en orden</p>
            </div>
          ) : (
            <div className="space-y-3">
              {productosStockBajo.slice(0, 6).map((p: any) => (
                <Link
                  key={p.id}
                  href="/productos"
                  className="flex items-center justify-between p-3 rounded-xl bg-red-50/50 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{p.nombre}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{p.codigo || 'Sin código'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-red-600 dark:text-red-400">{p.stock_actual} u.</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Min: {p.stock_minimo}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Actividad Reciente</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Últimos movimientos del sistema</p>
          </div>
          <Link href="/auditoria" className="text-sm font-medium text-brand-primary hover:underline">Ver todo</Link>
        </div>
        <ActividadReciente />
      </div>
    </div>
  );
}

function RevenueChart({ ventas }: { ventas: any[] }) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const data = useMemo(() => {
    const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN'];
    const now = new Date();
    return months.map((month, i) => {
      const monthVentas = ventas.filter((v: any) => {
        const d = new Date(v.fecha);
        return d.getMonth() === (now.getMonth() - 5 + i + 12) % 12;
      });
      return {
        month,
        value: monthVentas.reduce((s: number, v: any) => s + (v.total || 0), 0),
      };
    });
  }, [ventas]);

  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="flex items-end justify-between gap-3 h-56 px-4">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-3">
          <div className="relative w-full flex justify-center">
            {hoveredBar === i && (
              <div className="absolute -top-10 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-medium px-2 py-1 rounded-lg whitespace-nowrap z-10">
                {formatPriceConfig(d.value)}
              </div>
            )}
            <div
              className="w-full max-w-[56px] bg-brand-primary rounded-t-xl transition-all duration-300 hover:opacity-80 cursor-pointer"
              style={{ height: `${(d.value / maxValue) * 160}px` }}
              onMouseEnter={() => setHoveredBar(i)}
              onMouseLeave={() => setHoveredBar(null)}
            />
          </div>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{d.month}</span>
        </div>
      ))}
    </div>
  );
}

function ActividadReciente() {
  const [registros, setRegistros] = useState<any[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('auditoria') || '[]');
      setRegistros(stored.slice(0, 6));
    } catch { setRegistros([]); }
  }, []);

  const iconMap: Record<string, React.ElementType> = { crear: Plus, actualizar: Pencil, eliminar: Trash2 };
  const badgeMap: Record<string, string> = {
    crear: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30',
    actualizar: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-100 dark:border-blue-900/30',
    eliminar: 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 border-rose-100 dark:border-rose-900/30',
  };

  if (registros.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 dark:text-gray-500">
        <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Aún no hay actividad registrada</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            <th className="pb-3 pl-4">Acción</th>
            <th className="pb-3">Tabla</th>
            <th className="pb-3">Usuario</th>
            <th className="pb-3">Fecha</th>
            <th className="pb-3 text-right pr-4">Estado</th>
          </tr>
        </thead>
        <tbody>
          {registros.map((r: any) => {
            const IconComp = iconMap[r.accion] || FileText;
            return (
            <tr key={r.id} className="border-t border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
              <td className="py-4 pl-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <IconComp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{r.accion}</span>
                </div>
              </td>
              <td className="py-4 text-sm text-gray-600 dark:text-gray-300 capitalize">{r.tabla}</td>
              <td className="py-4 text-sm text-gray-600 dark:text-gray-300">{r.usuario}</td>
              <td className="py-4 text-sm text-gray-500 dark:text-gray-400">
                {new Date(r.fecha).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </td>
              <td className="py-4 text-right pr-4">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${badgeMap[r.accion] || 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-100 dark:border-gray-700'}`}>
                  {r.accion === 'crear' ? 'Nuevo' : r.accion === 'actualizar' ? 'Modificado' : 'Eliminado'}
                </span>
              </td>
            </tr>
          )})}
        </tbody>
      </table>
    </div>
  );
}
