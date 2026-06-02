'use client';

import { useState, useEffect, useMemo } from 'react';
import { useVentasStore, useClientesStore, useProductosStore } from '@/lib/supabase';
import SelectSearch from '@/components/SelectSearch';
import { exportReportePDF } from '@/lib/pdf-export';
import { formatPriceConfig } from '@/lib/format';

export default function ReportesPage() {
  const { ventas, fetchVentas } = useVentasStore();
  const { clientes, fetchClientes } = useClientesStore();
  const { productos, fetchProductos } = useProductosStore();

  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [clienteFiltro, setClienteFiltro] = useState('');
  const [formaPagoFiltro, setFormaPagoFiltro] = useState('');

  useEffect(() => {
    fetchVentas();
    fetchClientes();
    fetchProductos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ventasFiltradas = useMemo(() => {
    return ventas.filter((v: any) => {
      const fecha = new Date(v.fecha);
      const desde = fechaDesde ? new Date(fechaDesde) : null;
      const hasta = fechaHasta ? new Date(fechaHasta + 'T23:59:59') : null;

      if (desde && fecha < desde) return false;
      if (hasta && fecha > hasta) return false;
      if (clienteFiltro && v.id_cliente !== clienteFiltro) return false;
      if (formaPagoFiltro && v.forma_pago !== formaPagoFiltro) return false;
      return true;
    });
  }, [ventas, fechaDesde, fechaHasta, clienteFiltro, formaPagoFiltro]);

  const totalMonto = ventasFiltradas.reduce((sum: number, v: any) => sum + (v.total || 0), 0);
  const totalItems = ventasFiltradas.reduce((sum: number, v: any) => sum + ((v.items || []).length), 0);

  // Top clients
  const ventasPorCliente = useMemo(() => {
    const map = new Map<string, { nombre: string; cantidad: number; monto: number }>();
    ventasFiltradas.forEach((v: any) => {
      const key = v.id_cliente || 'sin-cliente';
      const actual = map.get(key) || { nombre: v.cliente_nombre || 'Desconocido', cantidad: 0, monto: 0 };
      actual.cantidad += 1;
      actual.monto += v.total || 0;
      map.set(key, actual);
    });
    return Array.from(map.values()).sort((a, b) => b.monto - a.monto).slice(0, 5);
  }, [ventasFiltradas]);

  // Top products
  const ventasPorProducto = useMemo(() => {
    const map = new Map<string, { nombre: string; cantidad: number; monto: number }>();
    ventasFiltradas.forEach((v: any) => {
      (v.items || []).forEach((item: any) => {
        const key = item.id || item.nombre;
        const actual = map.get(key) || { nombre: item.nombre, cantidad: 0, monto: 0 };
        actual.cantidad += item.cantidad || 1;
        actual.monto += item.total || 0;
        map.set(key, actual);
      });
    });
    return Array.from(map.values()).sort((a, b) => b.monto - a.monto).slice(0, 5);
  }, [ventasFiltradas]);

  // Sales by payment method
  const ventasPorPago = useMemo(() => {
    const map = new Map<string, { label: string; cantidad: number; monto: number; color: string }>();
    const colores: Record<string, string> = {
      efectivo: '#22c55e',
      tarjeta_debito: '#3b82f6',
      tarjeta_credito: '#8b5cf6',
      transferencia: '#f59e0b',
      cheque: '#ef4444',
    };
    const labels: Record<string, string> = {
      efectivo: 'Efectivo',
      tarjeta_debito: 'Débito',
      tarjeta_credito: 'Crédito',
      transferencia: 'Transferencia',
      cheque: 'Cheque',
    };
    ventasFiltradas.forEach((v: any) => {
      const key = v.forma_pago || 'otro';
      const actual = map.get(key) || { label: labels[key] || key, cantidad: 0, monto: 0, color: colores[key] || '#6b7280' };
      actual.cantidad += 1;
      actual.monto += v.total || 0;
      map.set(key, actual);
    });
    return Array.from(map.values());
  }, [ventasFiltradas]);

  const clienteOptions = [
    { value: '', label: 'Todos los clientes' },
    ...clientes.map((c: any) => ({
      value: c.id,
      label: c.tipo_persona === 'fisica'
        ? `${c.apellido || ''}, ${c.nombre || ''}`.trim()
        : c.razon_social || 'Sin nombre',
    }))
  ];

  const formaPagoOptions = [
    { value: '', label: 'Todas las formas' },
    { value: 'efectivo', label: '💵 Efectivo' },
    { value: 'tarjeta_debito', label: '💳 Débito' },
    { value: 'tarjeta_credito', label: '💳 Crédito' },
    { value: 'transferencia', label: '🏦 Transferencia' },
    { value: 'cheque', label: '📄 Cheque' },
  ];

  const maxMontoPago = Math.max(...ventasPorPago.map(v => v.monto), 1);
  const maxMontoCliente = Math.max(...ventasPorCliente.map(v => v.monto), 1);
  const maxMontoProducto = Math.max(...ventasPorProducto.map(v => v.monto), 1);

  const handleExportPDF = () => {
    exportReportePDF({
      titulo: 'Reporte de Ventas',
      subtitulo: `Período: ${fechaDesde || 'Inicio'} - ${fechaHasta || 'Hoy'}`,
      columnas: ['Fecha', 'Cliente', 'Items', 'Total', 'Forma de Pago'],
      filas: ventasFiltradas.map((v: any) => [
        new Date(v.fecha).toLocaleDateString('es-AR'),
        v.cliente_nombre || 'Consumidor Final',
        (v.items || []).length.toString(),
        formatPriceConfig(v.total || 0),
        v.forma_pago || '-',
      ]),
      resumen: [
        { label: 'Total Ventas', value: ventasFiltradas.length.toString() },
        { label: 'Monto Total', value: formatPriceConfig(totalMonto) },
        { label: 'Productos Vendidos', value: totalItems.toString() },
        { label: 'Ticket Promedio', value: ventasFiltradas.length > 0 ? formatPriceConfig(totalMonto / ventasFiltradas.length) : formatPriceConfig(0) },
      ],
    });
  };

  return (
    <div>
      {/* Filters */}
      <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={e => setFechaDesde(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={e => setFechaHasta(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <SelectSearch
            label="Cliente"
            value={clienteFiltro}
            onChange={setClienteFiltro}
            options={clienteOptions}
          />
          <SelectSearch
            label="Forma de Pago"
            value={formaPagoFiltro}
            onChange={setFormaPagoFiltro}
            options={formaPagoOptions}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Ventas</p>
          <p className="text-2xl font-bold">{ventasFiltradas.length}</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Monto Total</p>
          <p className="text-2xl font-bold">{formatPriceConfig(totalMonto)}</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Productos Vendidos</p>
          <p className="text-2xl font-bold">{totalItems}</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Ticket Promedio</p>
          <p className="text-2xl font-bold">
            {formatPriceConfig(ventasFiltradas.length > 0 ? totalMonto / ventasFiltradas.length : 0)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Payment methods chart */}
        <div className="bg-white rounded-3xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Ventas por Forma de Pago</h3>
          {ventasPorPago.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay datos</p>
          ) : (
            <div className="space-y-3">
              {ventasPorPago.map((vp) => (
                <div key={vp.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{vp.label}</span>
                    <span className="font-medium">{formatPriceConfig(vp.monto)} ({vp.cantidad})</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${(vp.monto / maxMontoPago) * 100}%`, backgroundColor: vp.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top clients */}
        <div className="bg-white rounded-3xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Top Clientes</h3>
          {ventasPorCliente.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay datos</p>
          ) : (
            <div className="space-y-3">
              {ventasPorCliente.map((vc, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="truncate mr-2">{i + 1}. {vc.nombre}</span>
                    <span className="font-medium flex-shrink-0">{formatPriceConfig(vc.monto)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${(vc.monto / maxMontoCliente) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top products */}
        <div className="bg-white rounded-3xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Top Productos</h3>
          {ventasPorProducto.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay datos</p>
          ) : (
            <div className="space-y-3">
              {ventasPorProducto.map((vp, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="truncate mr-2">{i + 1}. {vp.nombre}</span>
                    <span className="font-medium flex-shrink-0">{vp.cantidad} u.</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${(vp.monto / maxMontoProducto) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sales table */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Detalle de Ventas</h3>
          <button
            onClick={handleExportPDF}
            disabled={ventasFiltradas.length === 0}
            className="px-3 py-2 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📄 Exportar PDF
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Items</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Pago</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ventasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No hay ventas en el período seleccionado
                  </td>
                </tr>
              ) : ventasFiltradas.map((v: any) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{new Date(v.fecha).toLocaleDateString('es-AR')}</td>
                  <td className="px-4 py-3 text-sm font-medium">{v.cliente_nombre}</td>
                  <td className="px-4 py-3 text-sm">{(v.items || []).length}</td>
                  <td className="px-4 py-3 text-sm font-bold">{formatPriceConfig(v.total || 0)}</td>
                  <td className="px-4 py-3 text-sm">{v.forma_pago}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
