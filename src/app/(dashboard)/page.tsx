'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useClientesStore, useProductosStore, useVentasStore, useOrdenesStore } from '@/lib/supabase';
import { DollarSign, BarChart3, Users, Package, ArrowUpRight, ArrowRight, Plus, Pencil, Trash2, FileText } from 'lucide-react';
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

  const ventasHoy = ventas.filter((v: any) => new Date(v.fecha).toDateString() === new Date().toDateString());
  const montoHoy = ventasHoy.reduce((sum: number, v: any) => sum + (v.total || 0), 0);
  const montoTotal = ventas.reduce((sum: number, v: any) => sum + (v.total || 0), 0);
  const productosStockBajo = productos.filter((p: any) => (p.stock_actual || 0) <= (p.stock_minimo || 0));

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
    { title: 'Ventas Hoy', value: formatPriceConfig(montoHoy), change: `+${ventasHoy.length} hoy`, positive: true, href: '/ventas', Icon: DollarSign },
    { title: 'Total Ventas', value: formatPriceConfig(montoTotal), change: `${ventas.length} totales`, positive: true, href: '/reportes', Icon: BarChart3 },
    { title: 'Clientes', value: clientes.length.toString(), change: 'registrados', positive: true, href: '/clientes', Icon: Users },
    { title: 'Productos', value: productos.length.toString(), change: `${productosStockBajo.length} stock bajo`, positive: productosStockBajo.length === 0, href: '/productos', Icon: Package },
  ];

  const quickActions = [
    { label: 'Nuevo Cliente', href: '/clientes', color: 'bg-indigo-50 text-indigo-600', Icon: Users },
    { label: 'Nuevo Producto', href: '/productos', color: 'bg-violet-50 text-violet-600', Icon: Package },
    { label: 'Nueva Venta', href: '/ventas', color: 'bg-emerald-50 text-emerald-600', Icon: DollarSign },
    { label: 'Nueva Orden', href: '/servicios', color: 'bg-amber-50 text-amber-600', Icon: BarChart3 },
    { label: 'Presupuesto', href: '/presupuestos', color: 'bg-slate-50 text-slate-600', Icon: BarChart3 },
    { label: 'Compra', href: '/compras', color: 'bg-rose-50 text-rose-600', Icon: Package },
    { label: 'Caja', href: '/caja', color: 'bg-teal-50 text-teal-600', Icon: DollarSign },
    { label: 'Reportes', href: '/reportes', color: 'bg-sky-50 text-sky-600', Icon: BarChart3 },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, index) => (
          <Link key={index} href={card.href} className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow block">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">{card.title}</span>
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${card.positive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                <ArrowUpRight className="w-3 h-3" />
                {card.change}
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            <div className="mt-4 flex items-center text-sm font-medium text-[#4f46e5] group">
              <span>Ver Reporte</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Accesos Rápidos</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all text-center group"
            >
              <div className={`w-12 h-12 ${action.color} rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                <action.Icon className="w-5 h-5" strokeWidth={1.8} />
              </div>
              <p className="text-xs font-medium text-gray-700">{action.label}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart Placeholder */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Ingresos</h3>
              <p className="text-sm text-gray-500">Resumen de ventas por período</p>
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">Mes</span>
          </div>
          <RevenueChart ventas={ventas} />
        </div>

        {/* Stock Alerts */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Stock Bajo</h3>
            {productosStockBajo.length > 0 && (
              <span className="bg-red-100 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full">
                {productosStockBajo.length}
              </span>
            )}
          </div>
          {productosStockBajo.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-sm">Todo en orden</p>
            </div>
          ) : (
            <div className="space-y-3">
              {productosStockBajo.slice(0, 6).map((p: any) => (
                <Link
                  key={p.id}
                  href="/productos"
                  className="flex items-center justify-between p-3 rounded-2xl bg-red-50/50 hover:bg-red-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.nombre}</p>
                    <p className="text-xs text-gray-500">{p.codigo || 'Sin código'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-red-600">{p.stock_actual} u.</p>
                    <p className="text-xs text-gray-400">Min: {p.stock_minimo}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Actividad Reciente</h3>
            <p className="text-sm text-gray-500">Últimos movimientos del sistema</p>
          </div>
          <Link href="/auditoria" className="text-sm font-medium text-[#4f46e5] hover:underline">Ver todo</Link>
        </div>
        <ActividadReciente />
      </div>
    </div>
  );
}

function RevenueChart({ ventas }: { ventas: any[] }) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const data = useState(() => {
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
  })[0];

  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="flex items-end justify-between gap-3 h-48 px-4">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2">
          <div className="relative w-full flex justify-center">
            {hoveredBar === i && (
              <div className="absolute -top-10 bg-gray-900 text-white text-xs font-medium px-2 py-1 rounded-lg whitespace-nowrap z-10">
                {formatPriceConfig(d.value)}
              </div>
            )}
            <div
              className="w-full max-w-[48px] bg-[#4f46e5] rounded-t-xl transition-all duration-300 hover:bg-[#4338ca] cursor-pointer"
              style={{ height: `${(d.value / maxValue) * 140}px` }}
              onMouseEnter={() => setHoveredBar(i)}
              onMouseLeave={() => setHoveredBar(null)}
            />
          </div>
          <span className="text-xs font-medium text-gray-500">{d.month}</span>
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
    crear: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    actualizar: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    eliminar: 'bg-rose-50 text-rose-700 border-rose-100',
  };

  if (registros.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Aún no hay actividad registrada</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
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
            <tr key={r.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
              <td className="py-4 pl-4">
                <div className="flex items-center gap-3">
                  <IconComp className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-900 capitalize">{r.accion}</span>
                </div>
              </td>
              <td className="py-4 text-sm text-gray-600 capitalize">{r.tabla}</td>
              <td className="py-4 text-sm text-gray-600">{r.usuario}</td>
              <td className="py-4 text-sm text-gray-500">
                {new Date(r.fecha).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </td>
              <td className="py-4 text-right pr-4">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${badgeMap[r.accion] || 'bg-gray-50 text-gray-700 border-gray-100'}`}>
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
