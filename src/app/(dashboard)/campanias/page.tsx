'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Offcanvas from '@/components/Offcanvas';
import { useCampaniasStore } from '@/lib/supabase';

const TIPOS = [
  { value: 'descuento', label: 'Descuento' },
  { value: 'puntos_extra', label: 'Puntos Extra' },
  { value: 'cumpleanos', label: 'Cumpleaños' },
  { value: 'recompra', label: 'Recompra' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
];

const ESTADOS = {
  activa: { label: 'Activa', color: 'bg-green-100 text-green-800' },
  pausada: { label: 'Pausada', color: 'bg-yellow-100 text-yellow-800' },
  finalizada: { label: 'Finalizada', color: 'bg-gray-100 text-gray-800' },
};

export default function CampaniasPage() {
  const { campanias, isLoading, fetchCampanias, createCampania, updateCampania, deleteCampania } = useCampaniasStore();
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<any>({
    id: '', nombre: '', tipo: 'descuento', descripcion: '', beneficio: '', fecha_desde: '', fecha_hasta: '', estado: 'activa', condicion: '', activo: true
  });

  useEffect(() => { fetchCampanias(); /* eslint-disable-next-line */ }, []);

  const openNew = () => {
    setEditingId(null);
    setFormData({ id: crypto.randomUUID(), nombre: '', tipo: 'descuento', descripcion: '', beneficio: '', fecha_desde: '', fecha_hasta: '', estado: 'activa', condicion: '', activo: true });
    setShowOffcanvas(true);
  };

  const openEdit = (c: any) => {
    setEditingId(c.id);
    setFormData({ ...c });
    setShowOffcanvas(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim()) { toast.error('Ingrese un nombre'); return; }
    setIsSubmitting(true);
    try {
      if (editingId) {
        const result = await updateCampania(editingId, formData);
        if (result.success) toast.success('Campaña actualizada');
      } else {
        const result = await createCampania(formData);
        if (result.success) toast.success('Campaña creada');
      }
      setShowOffcanvas(false);
    } catch { toast.error('Error inesperado'); }
    finally { setIsSubmitting(false); }
  };

  const cambiarEstado = async (id: string, estado: string) => {
    const result = await updateCampania(id, { estado });
    if (result.success) toast.success(`Campaña ${ESTADOS[estado as keyof typeof ESTADOS]?.label || estado}`);
  };

  const filtered = campanias.filter((c: any) =>
    (c.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (c.tipo?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-end mb-6">\n        <button onClick={openNew} className="bg-purple-600 text-white px-4 py-2 rounded-2xl hover:bg-purple-700 transition-colors flex items-center space-x-2">
          <span>➕</span><span>Nueva Campaña</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(ESTADOS).map(([key, cfg]) => (
          <div key={key} className="bg-white rounded-3xl p-6 shadow-sm">
            <p className="text-sm text-gray-500">{cfg.label}</p>
            <p className="text-2xl font-bold">{campanias.filter((c: any) => c.estado === key).length}</p>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <div className="relative">
          <input type="text" placeholder="Buscar campaña..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" />
          <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div><p className="mt-2 text-gray-500">Cargando...</p></div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Nombre</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Tipo</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Beneficio</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Vigencia</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Estado</th><th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Acciones</th></tr></thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center"><div className="text-4xl mb-2">📢</div><p className="text-gray-500">No hay campañas</p></td></tr>
                ) : filtered.map((c: any) => {
                  const cfg = ESTADOS[c.estado as keyof typeof ESTADOS] || ESTADOS.activa;
                  const tipoLabel = TIPOS.find(t => t.value === c.tipo)?.label || c.tipo;
                  return (
                    <tr key={c.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3"><div className="font-medium text-gray-900">{c.nombre}</div><div className="text-xs text-gray-500">{c.descripcion?.slice(0, 60)}{c.descripcion?.length > 60 ? '...' : ''}</div></td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">{tipoLabel}</span></td>
                      <td className="px-4 py-3 text-sm">{c.beneficio || '—'}</td>
                      <td className="px-4 py-3 text-sm">{c.fecha_desde ? `${new Date(c.fecha_desde).toLocaleDateString('es-AR')} - ${c.fecha_hasta ? new Date(c.fecha_hasta).toLocaleDateString('es-AR') : 'Sin fin'}` : 'Sin vigencia'}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${cfg.color}`}>{cfg.label}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center space-x-1 flex-wrap gap-1">
                          <button onClick={() => openEdit(c)} className="p-2 text-blue-600 hover:bg-white rounded-2xl shadow-sm" title="Editar">✏️</button>
                          {c.estado === 'activa' && <button onClick={() => cambiarEstado(c.id, 'pausada')} className="p-2 text-yellow-600 hover:bg-white rounded-2xl shadow-sm" title="Pausar">⏸️</button>}
                          {c.estado === 'pausada' && <button onClick={() => cambiarEstado(c.id, 'activa')} className="p-2 text-green-600 hover:bg-white rounded-2xl shadow-sm" title="Activar">▶️</button>}
                          {['activa','pausada'].includes(c.estado) && <button onClick={() => cambiarEstado(c.id, 'finalizada')} className="p-2 text-gray-600 hover:bg-white rounded-2xl shadow-sm" title="Finalizar">🚫</button>}
                          <button onClick={() => { if (confirm('¿Eliminar?')) deleteCampania(c.id); }} className="p-2 text-red-600 hover:bg-white rounded-2xl shadow-sm" title="Eliminar">🗑️</button>
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

      <Offcanvas isOpen={showOffcanvas} onClose={() => setShowOffcanvas(false)} title={editingId ? 'Editar Campaña' : 'Nueva Campaña'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label><input type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" required /></div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500">
              {TIPOS.map(t => (<option key={t.value} value={t.value}>{t.label}</option>))}
            </select>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label><textarea value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" rows={2} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Beneficio (ej: 10% off, 2x1)</label><input type="text" value={formData.beneficio} onChange={e => setFormData({...formData, beneficio: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Desde</label><input type="date" value={formData.fecha_desde} onChange={e => setFormData({...formData, fecha_desde: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label><input type="date" value={formData.fecha_hasta} onChange={e => setFormData({...formData, fecha_hasta: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Condición / Segmento</label><textarea value={formData.condicion} onChange={e => setFormData({...formData, condicion: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" rows={2} placeholder="Ej: clientes recurrentes, mayores de $5000..." /></div>
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button type="button" onClick={() => setShowOffcanvas(false)} className="px-4 py-2 border border-gray-300 rounded-2xl hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 disabled:opacity-50">{isSubmitting ? '💾 Guardando...' : '💾 Guardar'}</button>
          </div>
        </form>
      </Offcanvas>
    </div>
  );
}
