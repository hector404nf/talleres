'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import Offcanvas from '@/components/Offcanvas';
import SelectSearch from '@/components/SelectSearch';
import { useComprasStore, useProveedoresStore, useProductosStore } from '@/lib/supabase';
import { formatPriceConfig } from '@/lib/format';

interface Item {
  id_producto: string;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  total: number;
}

const ESTADOS = {
  pendiente: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  recibido_parcial: { label: 'Recibido Parcial', color: 'bg-orange-100 text-orange-800' },
  recibido_total: { label: 'Recibido Total', color: 'bg-green-100 text-green-800' },
  anulado: { label: 'Anulado', color: 'bg-gray-200 text-gray-600' },
};

export default function ComprasPage() {
  const { compras, isLoading, fetchCompras, createCompra, updateCompra, deleteCompra } = useComprasStore();
  const { proveedores, fetchProveedores } = useProveedoresStore();
  const { productos, fetchProductos } = useProductosStore();

  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<any>({
    id: '', numero: 1, id_proveedor: '', fecha: new Date().toISOString().slice(0, 10),
    fecha_entrega: '', observaciones: '', estado: 'pendiente', items: [] as Item[],
    total: 0, costo_envio: 0
  });

  useEffect(() => { fetchCompras(); fetchProveedores(); fetchProductos(); /* eslint-disable-next-line */ }, []);

  const nextNumero = useMemo(() => {
    if (!compras.length) return 1;
    return Math.max(...compras.map((c: any) => c.numero || 0)) + 1;
  }, [compras]);

  const openNew = () => {
    setEditingId(null);
    setFormData({ id: crypto.randomUUID(), numero: nextNumero, id_proveedor: '', fecha: new Date().toISOString().slice(0, 10), fecha_entrega: '', observaciones: '', estado: 'pendiente', items: [], total: 0, costo_envio: 0 });
    setShowOffcanvas(true);
  };

  const parseItems = (items: any): Item[] => {
    if (Array.isArray(items)) return items;
    if (typeof items === 'string') { try { return JSON.parse(items); } catch { return []; } }
    return [];
  };

  const openEdit = (c: any) => {
    setEditingId(c.id);
    setFormData({ ...c, items: parseItems(c.items) });
    setShowOffcanvas(true);
  };

  const addItem = (productoId: string) => {
    const prod: any = productos.find((p: any) => p.id === productoId);
    if (!prod) return;
    const exists = formData.items.find((i: Item) => i.id_producto === productoId);
    if (exists) {
      setFormData((prev: any) => ({
        ...prev,
        items: prev.items.map((i: Item) => i.id_producto === productoId ? { ...i, cantidad: i.cantidad + 1, total: (i.cantidad + 1) * i.precio_unitario } : i)
      }));
    } else {
      setFormData((prev: any) => ({
        ...prev,
        items: [...prev.items, { id_producto: prod.id, nombre: prod.nombre, cantidad: 1, precio_unitario: prod.precio_costo || 0, total: prod.precio_costo || 0 }]
      }));
    }
  };

  const updateItemQty = (index: number, qty: number) => {
    if (qty < 1) return;
    setFormData((prev: any) => ({
      ...prev,
      items: prev.items.map((i: Item, idx: number) => idx === index ? { ...i, cantidad: qty, total: qty * i.precio_unitario } : i)
    }));
  };

  const updateItemPrice = (index: number, price: number) => {
    setFormData((prev: any) => ({
      ...prev,
      items: prev.items.map((i: Item, idx: number) => idx === index ? { ...i, precio_unitario: price, total: i.cantidad * price } : i)
    }));
  };

  const removeItem = (index: number) => {
    setFormData((prev: any) => ({ ...prev, items: prev.items.filter((_: any, idx: number) => idx !== index) }));
  };

  const subtotal = useMemo(() => formData.items.reduce((sum: number, i: Item) => sum + i.total, 0), [formData.items]);
  const total = useMemo(() => subtotal + (parseFloat(formData.costo_envio) || 0), [subtotal, formData.costo_envio]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id_proveedor) { toast.error('Seleccione un proveedor'); return; }
    if (!formData.items.length) { toast.error('Agregue al menos un item'); return; }
    setIsSubmitting(true);
    const payload = { ...formData, total, fecha: new Date(formData.fecha).toISOString() };
    try {
      if (editingId) {
        const result = await updateCompra(editingId, payload);
        if (result.success) toast.success('Compra actualizada');
      } else {
        const result = await createCompra(payload);
        if (result.success) toast.success('Compra creada');
      }
      setShowOffcanvas(false);
    } catch { toast.error('Error inesperado'); }
    finally { setIsSubmitting(false); }
  };

  const cambiarEstado = async (id: string, nuevoEstado: string) => {
    const result = await updateCompra(id, { estado: nuevoEstado });
    if (result.success) toast.success(`Compra ${ESTADOS[nuevoEstado as keyof typeof ESTADOS]?.label || nuevoEstado}`);
  };

  const filtered = compras.filter((c: any) => {
    const matchEstado = !estadoFilter || c.estado === estadoFilter;
    const prov: any = proveedores.find((p: any) => p.id === c.id_proveedor);
    const matchSearch = !searchTerm || c.numero?.toString().includes(searchTerm) || (prov?.razon_social?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchEstado && matchSearch;
  });

  return (
    <div>
      <div className="flex justify-end mb-6">\n        <button onClick={openNew} className="bg-purple-600 text-white px-4 py-2 rounded-2xl hover:bg-purple-700 transition-colors flex items-center space-x-2">
          <span>➕</span><span>Nueva Compra</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(ESTADOS).map(([key, cfg]) => (
          <div key={key} className="bg-white rounded-3xl p-6 shadow-sm">
            <p className="text-sm text-gray-500">{cfg.label}</p>
            <p className="text-2xl font-bold">{compras.filter((c: any) => c.estado === key).length}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <input type="text" placeholder="Buscar por número o proveedor..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" />
          <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
        </div>
        <select value={estadoFilter} onChange={e => setEstadoFilter(e.target.value)} className="px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500">
          <option value="">Todos los estados</option>
          {Object.entries(ESTADOS).map(([key, cfg]) => (<option key={key} value={key}>{cfg.label}</option>))}
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-12"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div><p className="mt-2 text-gray-500">Cargando...</p></div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Nº</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Proveedor</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Fecha</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Items</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Total</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Estado</th><th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Acciones</th></tr></thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center"><div className="text-4xl mb-2">📦</div><p className="text-gray-500">No hay compras registradas</p></td></tr>
                ) : filtered.map((c: any) => {
                  const prov: any = proveedores.find((p: any) => p.id === c.id_proveedor);
                  const cfg = ESTADOS[c.estado as keyof typeof ESTADOS] || ESTADOS.pendiente;
                  return (
                    <tr key={c.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium">#{c.numero}</td>
                      <td className="px-4 py-3">{prov?.razon_social || '—'}</td>
                      <td className="px-4 py-3 text-sm">{c.fecha ? new Date(c.fecha).toLocaleDateString('es-AR') : '—'}</td>
                      <td className="px-4 py-3 text-sm">{parseItems(c.items).length} productos</td>
                      <td className="px-4 py-3 font-medium">{formatPriceConfig(c.total || 0)}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${cfg.color}`}>{cfg.label}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center space-x-1 flex-wrap gap-1">
                          <button onClick={() => openEdit(c)} className="p-2 text-blue-600 hover:bg-white rounded-2xl shadow-sm" title="Editar">✏️</button>
                          {c.estado === 'pendiente' && (
                            <><button onClick={() => cambiarEstado(c.id, 'recibido_parcial')} className="p-2 text-orange-600 hover:bg-white rounded-2xl shadow-sm" title="Recibido Parcial">📦</button>
                            <button onClick={() => cambiarEstado(c.id, 'recibido_total')} className="p-2 text-green-600 hover:bg-white rounded-2xl shadow-sm" title="Recibido Total">✅</button></>
                          )}
                          {c.estado === 'recibido_parcial' && (
                            <button onClick={() => cambiarEstado(c.id, 'recibido_total')} className="p-2 text-green-600 hover:bg-white rounded-2xl shadow-sm" title="Recibido Total">✅</button>
                          )}
                          {['pendiente','recibido_parcial'].includes(c.estado) && (
                            <button onClick={() => cambiarEstado(c.id, 'anulado')} className="p-2 text-gray-600 hover:bg-white rounded-2xl shadow-sm" title="Anular">🚫</button>
                          )}
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

      <Offcanvas isOpen={showOffcanvas} onClose={() => setShowOffcanvas(false)} title={editingId ? 'Editar Compra' : 'Nueva Compra'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor *</label>
              <SelectSearch options={proveedores.map((p: any) => ({ value: p.id, label: p.razon_social }))} value={formData.id_proveedor} onChange={v => setFormData({...formData, id_proveedor: v})} placeholder="Buscar proveedor..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Entrega Estimada</label>
              <input type="date" value={formData.fecha_entrega} onChange={e => setFormData({...formData, fecha_entrega: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Agregar Producto</label>
            <SelectSearch options={productos.map((p: any) => ({ value: p.id, label: `${p.nombre} - Costo: ${formatPriceConfig(p.precio_costo || 0)}` }))} value="" onChange={v => { if (v) addItem(v); }} placeholder="Buscar producto..." />
          </div>

          {formData.items.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/50"><tr><th className="px-3 py-2 text-left">Producto</th><th className="px-3 py-2 text-center">Cant</th><th className="px-3 py-2 text-right">Costo Unit.</th><th className="px-3 py-2 text-right">Total</th><th className="px-3 py-2"></th></tr></thead>
                <tbody>
                  {formData.items.map((item: Item, idx: number) => (
                    <tr key={idx} className="border-t">
                      <td className="px-3 py-2">{item.nombre}</td>
                      <td className="px-3 py-2 text-center"><input type="number" min={1} value={item.cantidad} onChange={e => updateItemQty(idx, parseInt(e.target.value) || 1)} className="w-16 text-center border rounded" /></td>
                      <td className="px-3 py-2 text-right"><input type="number" min={0} step="0.01" value={item.precio_unitario} onChange={e => updateItemPrice(idx, parseFloat(e.target.value) || 0)} className="w-20 text-right border rounded px-1" /></td>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Costo de Envío ($)</label>
              <input type="number" min={0} step="0.01" value={formData.costo_envio} onChange={e => setFormData({...formData, costo_envio: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" />
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
