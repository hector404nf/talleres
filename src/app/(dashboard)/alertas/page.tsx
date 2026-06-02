'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Offcanvas from '@/components/Offcanvas';
import { useAlertasStore } from '@/lib/supabase';

const TIPOS_ALERTA = [
  { value: 'stock', label: 'Stock' },
  { value: 'venta', label: 'Venta' },
  { value: 'cobro', label: 'Cobro' },
  { value: 'cliente', label: 'Cliente' },
  { value: 'servicio', label: 'Servicio' },
  { value: 'caja', label: 'Caja' },
];

const PRIORIDADES = [
  { value: 'baja', label: 'Baja', color: 'bg-gray-100 text-gray-800' },
  { value: 'media', label: 'Media', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'alta', label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgente', label: 'Urgente', color: 'bg-red-100 text-red-800' },
];

export default function AlertasPage() {
  const { alertas, isLoading, fetchAlertas, createAlerta, updateAlerta, deleteAlerta } = useAlertasStore();
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<any>({
    id: '', codigo_alerta: '', nombre: '', tipo: 'stock', prioridad: 'media', activo: true,
    condicion_tipo: '', mensaje_titulo: '', mensaje_cuerpo: ''
  });

  useEffect(() => { fetchAlertas(); /* eslint-disable-next-line */ }, []);

  const openNew = () => {
    setEditingId(null);
    setFormData({ id: crypto.randomUUID(), codigo_alerta: `ALT-${Date.now()}`, nombre: '', tipo: 'stock', prioridad: 'media', activo: true, condicion_tipo: '', mensaje_titulo: '', mensaje_cuerpo: '' });
    setShowOffcanvas(true);
  };

  const openEdit = (a: any) => {
    setEditingId(a.id);
    setFormData({ ...a });
    setShowOffcanvas(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim()) { toast.error('Ingrese un nombre'); return; }
    if (!formData.codigo_alerta.trim()) { toast.error('Ingrese un código'); return; }
    setIsSubmitting(true);
    try {
      if (editingId) {
        const result = await updateAlerta(editingId, formData);
        if (result.success) toast.success('Alerta actualizada');
      } else {
        const result = await createAlerta(formData);
        if (result.success) toast.success('Alerta creada');
      }
      setShowOffcanvas(false);
    } catch { toast.error('Error inesperado'); }
    finally { setIsSubmitting(false); }
  };

  const toggleActivo = async (a: any) => {
    const result = await updateAlerta(a.id, { activo: !a.activo });
    if (result.success) toast.success(a.activo ? 'Alerta desactivada' : 'Alerta activada');
  };

  const filtered = alertas.filter((a: any) => {
    const matchTipo = !tipoFilter || a.tipo === tipoFilter;
    const matchSearch = !searchTerm || (a.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || (a.codigo_alerta?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchTipo && matchSearch;
  });

  return (
    <div>
      <div className="flex justify-end mb-6">\n        <button onClick={openNew} className="bg-purple-600 text-white px-4 py-2 rounded-2xl hover:bg-purple-700 transition-colors flex items-center space-x-2">
          <span>➕</span><span>Nueva Alerta</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Activas</p>
          <p className="text-2xl font-bold">{alertas.filter((a: any) => a.activo).length}</p>
        </div>
        <div className="bg-white rounded-3xl shadow-sm p-6 border-l-4 border-gray-300">
          <p className="text-sm text-gray-500">Inactivas</p>
          <p className="text-2xl font-bold">{alertas.filter((a: any) => !a.activo).length}</p>
        </div>
        {TIPOS_ALERTA.map(t => (
          <div key={t.value} className="bg-white rounded-3xl p-6 shadow-sm">
            <p className="text-sm text-gray-500">{t.label}</p>
            <p className="text-2xl font-bold">{alertas.filter((a: any) => a.tipo === t.value).length}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <input type="text" placeholder="Buscar alerta..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" />
          <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
        </div>
        <select value={tipoFilter} onChange={e => setTipoFilter(e.target.value)} className="px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500">
          <option value="">Todos los tipos</option>
          {TIPOS_ALERTA.map(t => (<option key={t.value} value={t.value}>{t.label}</option>))}
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-12"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div><p className="mt-2 text-gray-500">Cargando...</p></div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Código</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Nombre</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Tipo</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Prioridad</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Estado</th><th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Acciones</th></tr></thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center"><div className="text-4xl mb-2">🔔</div><p className="text-gray-500">No hay alertas configuradas</p></td></tr>
                ) : filtered.map((a: any) => {
                  const pri = PRIORIDADES.find(p => p.value === a.prioridad) || PRIORIDADES[1];
                  const tipoLabel = TIPOS_ALERTA.find(t => t.value === a.tipo)?.label || a.tipo;
                  return (
                    <tr key={a.id} className={`hover:bg-gray-50 transition-colors ${!a.activo ? 'opacity-60' : ''}`}>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{a.codigo_alerta}</td>
                      <td className="px-4 py-3"><div className="font-medium text-gray-900">{a.nombre}</div><div className="text-xs text-gray-500">{a.mensaje_titulo?.slice(0, 40)}{a.mensaje_titulo?.length > 40 ? '...' : ''}</div></td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">{tipoLabel}</span></td>
                      <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${pri.color}`}>{pri.label}</span></td>
                      <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${a.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{a.activo ? 'Activa' : 'Inactiva'}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center space-x-1 flex-wrap gap-1">
                          <button onClick={() => openEdit(a)} className="p-2 text-blue-600 hover:bg-white rounded-2xl shadow-sm" title="Editar">✏️</button>
                          <button onClick={() => toggleActivo(a)} className="p-2 text-yellow-600 hover:bg-white rounded-2xl shadow-sm" title={a.activo ? 'Desactivar' : 'Activar'}>{a.activo ? '⏸️' : '▶️'}</button>
                          <button onClick={() => { if (confirm('¿Eliminar?')) deleteAlerta(a.id); }} className="p-2 text-red-600 hover:bg-white rounded-2xl shadow-sm" title="Eliminar">🗑️</button>
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

      <Offcanvas isOpen={showOffcanvas} onClose={() => setShowOffcanvas(false)} title={editingId ? 'Editar Alerta' : 'Nueva Alerta'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Código *</label><input type="text" value={formData.codigo_alerta} onChange={e => setFormData({...formData, codigo_alerta: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label><input type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500">{TIPOS_ALERTA.map(t => (<option key={t.value} value={t.value}>{t.label}</option>))}</select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
              <select value={formData.prioridad} onChange={e => setFormData({...formData, prioridad: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500">{PRIORIDADES.map(p => (<option key={p.value} value={p.value}>{p.label}</option>))}</select>
            </div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Condición (ej: stock menor a 5)</label><input type="text" value={formData.condicion_tipo} onChange={e => setFormData({...formData, condicion_tipo: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" placeholder="Ej: stock_actual menor a stock_minimo" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Título del mensaje</label><input type="text" value={formData.mensaje_titulo} onChange={e => setFormData({...formData, mensaje_titulo: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" placeholder="Ej: Stock bajo detectado" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Cuerpo del mensaje</label><textarea value={formData.mensaje_cuerpo} onChange={e => setFormData({...formData, mensaje_cuerpo: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" rows={3} placeholder="Ej: El producto {nombre} tiene stock de {stock_actual} unidades." /></div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="activo" checked={formData.activo} onChange={e => setFormData({...formData, activo: e.target.checked})} className="w-5 h-5 text-purple-600 rounded" />
            <label htmlFor="activo" className="text-sm font-medium">Alerta activa</label>
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
