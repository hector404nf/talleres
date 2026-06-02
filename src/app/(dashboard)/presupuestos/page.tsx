'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import Offcanvas from '@/components/Offcanvas';
import SelectSearch from '@/components/SelectSearch';
import { usePresupuestosStore, useClientesStore, useProductosStore, useVentasStore } from '@/lib/supabase';
import { exportComprobantePDF } from '@/lib/pdf-export';
import { formatPriceConfig } from '@/lib/format';

interface Item {
  id_producto: string;
  nombre: string;
  cantidad: number;
  precio: number;
  total: number;
}

const estadosConfig: Record<string, { label: string; color: string }> = {
  pendiente: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  aprobado: { label: 'Aprobado', color: 'bg-green-100 text-green-800' },
  rechazado: { label: 'Rechazado', color: 'bg-red-100 text-red-800' },
  vencido: { label: 'Vencido', color: 'bg-gray-100 text-gray-800' },
  anulado: { label: 'Anulado', color: 'bg-gray-200 text-gray-600' },
  convertido_venta: { label: 'Convertido', color: 'bg-blue-100 text-blue-800' },
};

export default function PresupuestosPage() {
  const { presupuestos, isLoading, fetchPresupuestos, createPresupuesto, updatePresupuesto, deletePresupuesto } = usePresupuestosStore();
  const { clientes, fetchClientes } = useClientesStore();
  const { productos, fetchProductos } = useProductosStore();
  const { createVenta } = useVentasStore();

  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<any>({
    id: '', numero: 1, id_cliente: '', fecha_vencimiento: '', observaciones: '', descuento: 0, estado: 'pendiente', items: [] as Item[]
  });

  useEffect(() => { fetchPresupuestos(); fetchClientes(); fetchProductos(); /* eslint-disable-next-line */ }, []);

  const nextNumero = useMemo(() => {
    if (!presupuestos.length) return 1;
    return Math.max(...presupuestos.map((p: any) => p.numero || 0)) + 1;
  }, [presupuestos]);

  const openNew = () => {
    setEditingId(null);
    setFormData({ id: crypto.randomUUID(), numero: nextNumero, id_cliente: '', fecha_vencimiento: '', observaciones: '', descuento: 0, estado: 'pendiente', items: [] });
    setShowOffcanvas(true);
  };

  const openEdit = (p: any) => {
    setEditingId(p.id);
    setFormData({ ...p, items: p.items || [] });
    setShowOffcanvas(true);
  };

  const addItem = (productoId: string) => {
    const prod: any = productos.find((p: any) => p.id === productoId);
    if (!prod) return;
    const exists = formData.items.find((i: Item) => i.id_producto === productoId);
    if (exists) {
      setFormData((prev: any) => ({
        ...prev,
        items: prev.items.map((i: Item) => i.id_producto === productoId ? { ...i, cantidad: i.cantidad + 1, total: (i.cantidad + 1) * i.precio } : i)
      }));
    } else {
      setFormData((prev: any) => ({
        ...prev,
        items: [...prev.items, { id_producto: prod.id, nombre: prod.nombre, cantidad: 1, precio: prod.precio_venta || 0, total: prod.precio_venta || 0 }]
      }));
    }
  };

  const updateItemQty = (index: number, qty: number) => {
    if (qty < 1) return;
    setFormData((prev: any) => ({
      ...prev,
      items: prev.items.map((i: Item, idx: number) => idx === index ? { ...i, cantidad: qty, total: qty * i.precio } : i)
    }));
  };

  const removeItem = (index: number) => {
    setFormData((prev: any) => ({ ...prev, items: prev.items.filter((_: any, idx: number) => idx !== index) }));
  };

  const subtotal = useMemo(() => formData.items.reduce((sum: number, i: Item) => sum + i.total, 0), [formData.items]);
  const total = useMemo(() => Math.max(0, subtotal - (parseFloat(formData.descuento) || 0)), [subtotal, formData.descuento]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id_cliente) { toast.error('Seleccione un cliente'); return; }
    if (!formData.items.length) { toast.error('Agregue al menos un item'); return; }
    setIsSubmitting(true);
    const payload = { ...formData, total, fecha: new Date().toISOString() };
    try {
      if (editingId) {
        const result = await updatePresupuesto(editingId, payload);
        if (result.success) toast.success('Presupuesto actualizado');
      } else {
        const result = await createPresupuesto(payload);
        if (result.success) toast.success('Presupuesto creado');
      }
      setShowOffcanvas(false);
    } catch { toast.error('Error inesperado'); }
    finally { setIsSubmitting(false); }
  };

  const cambiarEstado = async (id: string, nuevoEstado: string) => {
    const result = await updatePresupuesto(id, { estado: nuevoEstado });
    if (result.success) toast.success(`Presupuesto ${estadosConfig[nuevoEstado]?.label || nuevoEstado}`);
    else toast.error('Error al cambiar estado');
  };

  const convertirAVenta = async (p: any) => {
    if (!confirm('¿Convertir este presupuesto a venta?')) return;
    const ventaData = {
      id: crypto.randomUUID(),
      tipo_comprobante: 'ticket',
      punto_venta: 1,
      numero: p.numero,
      id_cliente: p.id_cliente,
      fecha: new Date().toISOString(),
      estado: 'finalizada',
      total: p.total,
      descuento: p.descuento || 0,
      subtotal: (p.total || 0) + (p.descuento || 0),
      id_presupuesto: p.id,
      condicion_venta: 'contado',
      items: p.items || [],
    };
    const vResult = await createVenta(ventaData);
    if (vResult.success) {
      await updatePresupuesto(p.id, { estado: 'convertido_venta' });
      toast.success('Presupuesto convertido a venta');
    } else {
      toast.error('Error al crear venta');
    }
  };

  const filtered = presupuestos.filter((p: any) => {
    const matchEstado = !estadoFilter || p.estado === estadoFilter;
    const matchSearch = !searchTerm || (p.numero?.toString().includes(searchTerm)) || (clientes.find((c: any) => c.id === p.id_cliente) as any)?.nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchEstado && matchSearch;
  });

  return (
    <div>
      <div className="flex justify-end mb-6">\n        <button onClick={openNew} className="bg-purple-600 text-white px-4 py-2 rounded-2xl hover:bg-purple-700 transition-colors flex items-center space-x-2">
          <span>➕</span><span>Nuevo Presupuesto</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(estadosConfig).map(([key, cfg]) => (
          <div key={key} className="bg-white rounded-3xl p-6 shadow-sm">
            <p className="text-sm text-gray-500">{cfg.label}</p>
            <p className="text-2xl font-bold">{presupuestos.filter((p: any) => p.estado === key).length}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <input type="text" placeholder="Buscar por número o cliente..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" />
          <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
        </div>
        <select value={estadoFilter} onChange={e => setEstadoFilter(e.target.value)} className="px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500">
          <option value="">Todos los estados</option>
          {Object.entries(estadosConfig).map(([key, cfg]) => (<option key={key} value={key}>{cfg.label}</option>))}
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-12"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div><p className="mt-2 text-gray-500">Cargando...</p></div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Nº</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Cliente</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Fecha</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Vencimiento</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Total</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Estado</th><th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Acciones</th></tr></thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center"><div className="text-4xl mb-2">📋</div><p className="text-gray-500">No hay presupuestos</p></td></tr>
                ) : filtered.map((p: any) => {
                  const cliente: any = clientes.find((c: any) => c.id === p.id_cliente);
                  const cfg = estadosConfig[p.estado] || estadosConfig.pendiente;
                  return (
                    <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium">#{p.numero}</td>
                      <td className="px-4 py-3">{cliente ? `${cliente.nombre} ${cliente.apellido || ''}` : '—'}</td>
                      <td className="px-4 py-3 text-sm">{p.fecha ? new Date(p.fecha).toLocaleDateString('es-AR') : '—'}</td>
                      <td className="px-4 py-3 text-sm">{p.fecha_vencimiento ? new Date(p.fecha_vencimiento).toLocaleDateString('es-AR') : '—'}</td>
                      <td className="px-4 py-3 font-medium">{formatPriceConfig(p.total || 0)}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${cfg.color}`}>{cfg.label}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center space-x-1 flex-wrap gap-1">
                          {p.estado === 'pendiente' && (
                            <><button onClick={() => openEdit(p)} className="p-2 text-blue-600 hover:bg-white rounded-2xl shadow-sm" title="Editar">✏️</button>
                            <button onClick={() => cambiarEstado(p.id, 'aprobado')} className="p-2 text-green-600 hover:bg-white rounded-2xl shadow-sm" title="Aprobar">✅</button>
                            <button onClick={() => cambiarEstado(p.id, 'rechazado')} className="p-2 text-red-600 hover:bg-white rounded-2xl shadow-sm" title="Rechazar">❌</button></>
                          )}
                          {p.estado === 'aprobado' && (
                            <button onClick={() => convertirAVenta(p)} className="p-2 text-blue-600 hover:bg-white rounded-2xl shadow-sm" title="Convertir a venta">🔄</button>
                          )}
                          {(p.estado === 'pendiente' || p.estado === 'aprobado') && (
                            <button onClick={() => cambiarEstado(p.id, 'anulado')} className="p-2 text-gray-600 hover:bg-white rounded-2xl shadow-sm" title="Anular">🚫</button>
                          )}
                          <button
                            onClick={() => exportComprobantePDF({
                              tipo: 'Presupuesto',
                              numero: p.numero?.toString() || p.id?.slice(0, 8),
                              fecha: p.fecha,
                              cliente: clientes.find((c: any) => c.id === p.id_cliente) ? `${(clientes.find((c: any) => c.id === p.id_cliente) as any).nombre} ${(clientes.find((c: any) => c.id === p.id_cliente) as any).apellido || ''}` : '—',
                              items: (p.items || []).map((i: any) => ({ nombre: i.nombre, cantidad: i.cantidad, precio: i.precio, total: i.total })),
                              total: parseFloat(p.total || 0),
                              observaciones: `Estado: ${estadosConfig[p.estado]?.label || p.estado} | Vence: ${p.fecha_vencimiento ? new Date(p.fecha_vencimiento).toLocaleDateString('es-AR') : '—'}`,
                            })}
                            className="p-2 text-red-600 hover:bg-white rounded-2xl shadow-sm"
                            title="Exportar PDF"
                          >
                            📄
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Offcanvas isOpen={showOffcanvas} onClose={() => setShowOffcanvas(false)} title={editingId ? 'Editar Presupuesto' : 'Nuevo Presupuesto'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
              <SelectSearch options={clientes.map((c: any) => ({ value: c.id, label: `${c.nombre} ${c.apellido || ''}` }))} value={formData.id_cliente} onChange={v => setFormData({...formData, id_cliente: v})} placeholder="Buscar cliente..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vencimiento</label>
              <input type="date" value={formData.fecha_vencimiento} onChange={e => setFormData({...formData, fecha_vencimiento: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Agregar Producto</label>
            <SelectSearch options={productos.map((p: any) => ({ value: p.id, label: `${p.nombre} - ${formatPriceConfig(p.precio_venta || 0)}` }))} value="" onChange={v => { if (v) addItem(v); }} placeholder="Buscar producto..." />
          </div>

          {formData.items.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/50"><tr><th className="px-3 py-2 text-left">Producto</th><th className="px-3 py-2 text-center">Cant</th><th className="px-3 py-2 text-right">Precio</th><th className="px-3 py-2 text-right">Total</th><th className="px-3 py-2"></th></tr></thead>
                <tbody>
                  {formData.items.map((item: Item, idx: number) => (
                    <tr key={idx} className="border-t">
                      <td className="px-3 py-2">{item.nombre}</td>
                      <td className="px-3 py-2 text-center"><input type="number" min={1} value={item.cantidad} onChange={e => updateItemQty(idx, parseInt(e.target.value) || 1)} className="w-16 text-center border rounded" /></td>
                      <td className="px-3 py-2 text-right">{formatPriceConfig(item.precio)}</td>
                      <td className="px-3 py-2 text-right font-medium">{formatPriceConfig(item.total)}</td>
                      <td className="px-3 py-2 text-center"><button type="button" onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700">✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descuento ($)</label>
              <input type="number" min={0} step="0.01" value={formData.descuento} onChange={e => setFormData({...formData, descuento: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" />
            </div>
            <div className="flex flex-col justify-end items-end">
              <div className="text-sm text-gray-500">Subtotal: <span className="font-medium">{formatPriceConfig(subtotal)}</span></div>
              <div className="text-xl font-bold text-purple-700">Total: {formatPriceConfig(total)}</div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea value={formData.observaciones} onChange={e => setFormData({...formData, observaciones: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" rows={2} />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button type="button" onClick={() => setShowOffcanvas(false)} className="px-4 py-2 border border-gray-300 rounded-2xl hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 disabled:opacity-50">{isSubmitting ? '💾 Guardando...' : '💾 Guardar'}</button>
          </div>
        </form>
      </Offcanvas>
    </div>
  );
}
