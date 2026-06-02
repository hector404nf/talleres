'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Offcanvas from '@/components/Offcanvas';
import SelectSearch from '@/components/SelectSearch';
import { useMovimientosStockStore, useProductosStore } from '@/lib/supabase';

const tiposMovimiento = [
  { value: 'ingreso_compra', label: 'Ingreso por Compra' },
  { value: 'ingreso_ajuste', label: 'Ingreso por Ajuste' },
  { value: 'egreso_venta', label: 'Egreso por Venta' },
  { value: 'egreso_ajuste', label: 'Egreso por Ajuste' },
  { value: 'merma', label: 'Merma' },
  { value: 'robo', label: 'Robo' },
  { value: 'traslado', label: 'Traslado' },
];

export default function MovimientosStockPage() {
  const { movimientos, isLoading, fetchMovimientos, createMovimiento } = useMovimientosStockStore();
  const { productos, fetchProductos } = useProductosStore();

  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<any>({
    id: '', id_producto: '', tipo_movimiento: 'ingreso_ajuste', cantidad: 1, costo_unitario: 0, observaciones: '', saldo_anterior: 0, saldo_actual: 0
  });

  useEffect(() => { fetchMovimientos(); fetchProductos(); /* eslint-disable-next-line */ }, []);

  const selectedProduct: any = productos.find((p: any) => p.id === formData.id_producto);

  useEffect(() => {
    if (selectedProduct) {
      const stock = selectedProduct.stock_actual || 0;
      const qty = parseFloat(formData.cantidad) || 0;
      let nuevoSaldo = stock;
      if (formData.tipo_movimiento.startsWith('ingreso')) nuevoSaldo = stock + qty;
      else if (formData.tipo_movimiento.startsWith('egreso') || ['merma','robo','traslado'].includes(formData.tipo_movimiento)) nuevoSaldo = Math.max(0, stock - qty);
      setFormData((prev: any) => ({ ...prev, saldo_anterior: stock, saldo_actual: nuevoSaldo }));
    }
  }, [formData.id_producto, formData.tipo_movimiento, formData.cantidad, selectedProduct]);

  const openNew = () => {
    setFormData({ id: crypto.randomUUID(), id_producto: '', tipo_movimiento: 'ingreso_ajuste', cantidad: 1, costo_unitario: 0, observaciones: '', saldo_anterior: 0, saldo_actual: 0 });
    setShowOffcanvas(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id_producto) { toast.error('Seleccione un producto'); return; }
    if (!formData.observaciones.trim()) { toast.error('El motivo es obligatorio'); return; }
    setIsSubmitting(true);
    try {
      const result = await createMovimiento({ ...formData, fecha: new Date().toISOString() });
      if (result.success) {
        toast.success('Movimiento registrado');
        setShowOffcanvas(false);
      } else {
        toast.error('Error al registrar');
      }
    } catch { toast.error('Error inesperado'); }
    finally { setIsSubmitting(false); }
  };

  const filtered = movimientos.filter((m: any) => {
    const matchTipo = !tipoFilter || m.tipo_movimiento === tipoFilter;
    const prod: any = productos.find((p: any) => p.id === m.id_producto);
    const matchSearch = !searchTerm || (prod?.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchTipo && matchSearch;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">

        <button onClick={openNew} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2">
          <span>➕</span><span>Registrar Movimiento</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-500">Ingresos</p>
          <p className="text-2xl font-bold">{movimientos.filter((m: any) => m.tipo_movimiento?.startsWith('ingreso')).length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
          <p className="text-sm text-gray-500">Egresos</p>
          <p className="text-2xl font-bold">{movimientos.filter((m: any) => m.tipo_movimiento?.startsWith('egreso') || ['merma','robo','traslado'].includes(m.tipo_movimiento)).length}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <input type="text" placeholder="Buscar por producto..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
          <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
        </div>
        <select value={tipoFilter} onChange={e => setTipoFilter(e.target.value)} className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
          <option value="">Todos los tipos</option>
          {tiposMovimiento.map(t => (<option key={t.value} value={t.value}>{t.label}</option>))}
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-12"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div><p className="mt-2 text-gray-500">Cargando...</p></div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th><th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Cantidad</th><th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Saldo Ant.</th><th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Saldo Nuevo</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motivo</th></tr></thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center"><div className="text-4xl mb-2">📦</div><p className="text-gray-500">No hay movimientos</p></td></tr>
                ) : filtered.map((m: any) => {
                  const prod: any = productos.find((p: any) => p.id === m.id_producto);
                  const tipoLabel = tiposMovimiento.find(t => t.value === m.tipo_movimiento)?.label || m.tipo_movimiento;
                  const isEgreso = m.tipo_movimiento?.startsWith('egreso') || ['merma','robo','traslado'].includes(m.tipo_movimiento);
                  return (
                    <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm">{m.fecha ? new Date(m.fecha).toLocaleDateString('es-AR') : '—'}</td>
                      <td className="px-4 py-3 font-medium">{prod?.nombre || '—'}</td>
                      <td className="px-4 py-3 text-sm"><span className={`px-2 py-0.5 rounded text-xs font-medium ${isEgreso ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{tipoLabel}</span></td>
                      <td className="px-4 py-3 text-center font-medium">{m.cantidad}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-500">{m.saldo_anterior}</td>
                      <td className="px-4 py-3 text-center text-sm font-medium">{m.saldo_actual}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{m.observaciones || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Offcanvas isOpen={showOffcanvas} onClose={() => setShowOffcanvas(false)} title="Registrar Movimiento de Stock" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Producto *</label>
            <SelectSearch options={productos.map((p: any) => ({ value: p.id, label: `${p.nombre} (Stock: ${p.stock_actual || 0})` }))} value={formData.id_producto} onChange={v => setFormData({...formData, id_producto: v})} placeholder="Buscar producto..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Movimiento *</label>
            <select value={formData.tipo_movimiento} onChange={e => setFormData({...formData, tipo_movimiento: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
              {tiposMovimiento.map(t => (<option key={t.value} value={t.value}>{t.label}</option>))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad *</label>
              <input type="number" min={0.01} step="0.01" value={formData.cantidad} onChange={e => setFormData({...formData, cantidad: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Costo Unitario</label>
              <input type="number" min={0} step="0.01" value={formData.costo_unitario} onChange={e => setFormData({...formData, costo_unitario: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>

          {selectedProduct && (
            <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
              <div className="text-sm text-gray-600">Stock actual: <span className="font-medium">{selectedProduct.stock_actual || 0}</span></div>
              <div className="text-sm text-gray-600">Saldo proyectado: <span className="font-bold text-purple-700">{formData.saldo_actual}</span></div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo / Observaciones *</label>
            <textarea value={formData.observaciones} onChange={e => setFormData({...formData, observaciones: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" rows={3} required placeholder="Ej: Ajuste por inventario físico, merma por vencimiento, etc." />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button type="button" onClick={() => setShowOffcanvas(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">{isSubmitting ? '💾 Guardando...' : '💾 Guardar Movimiento'}</button>
          </div>
        </form>
      </Offcanvas>
    </div>
  );
}
