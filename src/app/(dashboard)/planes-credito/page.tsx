'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Offcanvas from '@/components/Offcanvas';
import { usePlanesCreditoStore } from '@/lib/supabase';

const emptyForm = {
  id: '',
  nombre: '',
  descripcion: '',
  cantidad_cuotas: 1,
  tasa_interes: 0,
  recargo: 0,
  dia_vencimiento: 10,
  activo: true,
};

export default function PlanesCreditoPage() {
  const { planes, isLoading, fetchPlanes, createPlan, updatePlan, deletePlan } = usePlanesCreditoStore();
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ ...emptyForm });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchPlanes(); /* eslint-disable-next-line */ }, []);

  const openNew = () => {
    setEditingId(null);
    setFormData({ ...emptyForm, id: crypto.randomUUID() });
    setShowOffcanvas(true);
  };

  const openEdit = (p: any) => {
    setEditingId(p.id);
    setFormData({ ...p });
    setShowOffcanvas(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim()) { toast.error('Ingrese un nombre'); return; }
    setIsSubmitting(true);
    try {
      if (editingId) {
        const result = await updatePlan(editingId, formData);
        if (result.success) toast.success('Plan actualizado');
      } else {
        const result = await createPlan(formData);
        if (result.success) toast.success('Plan creado');
      }
      setShowOffcanvas(false);
    } catch { toast.error('Error inesperado'); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este plan?')) {
      const result = await deletePlan(id);
      if (result.success) toast.success('Plan eliminado');
    }
  };

  const filtered = planes.filter((p: any) =>
    (p.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-end mb-6">\n        <button onClick={openNew} className="bg-purple-600 text-white px-4 py-2 rounded-2xl hover:bg-purple-700 transition-colors flex items-center space-x-2">
          <span>➕</span><span>Nuevo Plan</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Total Planes</p>
          <p className="text-2xl font-bold">{planes.length}</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input type="text" placeholder="Buscar plan..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" />
          <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div><p className="mt-2 text-gray-500">Cargando...</p></div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Nombre</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Cuotas</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Interés</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Recargo</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Vencimiento</th><th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Acciones</th></tr></thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center"><div className="text-4xl mb-2">💳</div><p className="text-gray-500">No hay planes de crédito</p></td></tr>
                ) : filtered.map((p: any) => (
                  <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3"><div className="font-medium text-gray-900">{p.nombre}</div><div className="text-xs text-gray-500">{p.descripcion?.slice(0, 40)}{p.descripcion?.length > 40 ? '...' : ''}</div></td>
                    <td className="px-4 py-3 text-sm">{p.cantidad_cuotas}</td>
                    <td className="px-4 py-3 text-sm">{p.tasa_interes}%</td>
                    <td className="px-4 py-3 text-sm">{p.recargo > 0 ? `${p.recargo}%` : '-'}</td>
                    <td className="px-4 py-3 text-sm">Día {p.dia_vencimiento}</td>
                    <td className="px-4 py-3"><div className="flex items-center justify-center space-x-1"><button onClick={() => openEdit(p)} className="p-2 text-blue-600 hover:bg-white rounded-2xl shadow-sm" title="Editar">✏️</button><button onClick={() => handleDelete(p.id)} className="p-2 text-red-600 hover:bg-white rounded-2xl shadow-sm" title="Eliminar">🗑️</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Offcanvas isOpen={showOffcanvas} onClose={() => setShowOffcanvas(false)} title={editingId ? 'Editar Plan' : 'Nuevo Plan de Crédito'} size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label><input type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label><textarea value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" rows={2} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Cantidad Cuotas</label><input type="number" min={1} value={formData.cantidad_cuotas} onChange={e => setFormData({...formData, cantidad_cuotas: parseInt(e.target.value) || 1})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Día Vencimiento</label><input type="number" min={1} max={31} value={formData.dia_vencimiento} onChange={e => setFormData({...formData, dia_vencimiento: parseInt(e.target.value) || 10})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Tasa Interés (%)</label><input type="number" step="0.01" value={formData.tasa_interes} onChange={e => setFormData({...formData, tasa_interes: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Recargo (%)</label><input type="number" step="0.01" value={formData.recargo} onChange={e => setFormData({...formData, recargo: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" /></div>
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
