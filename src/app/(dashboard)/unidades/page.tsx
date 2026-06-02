'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Offcanvas from '@/components/Offcanvas';
import { useUnidadesStore } from '@/lib/supabase';

interface Unidad {
  id: string;
  nombre: string;
  abreviatura: string;
  activo: boolean;
}

const emptyForm: Unidad = {
  id: '',
  nombre: '',
  abreviatura: '',
  activo: true,
};

export default function UnidadesPage() {
  const { unidades, isLoading, fetchUnidades, createUnidad, updateUnidad, deleteUnidad } = useUnidadesStore();
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Unidad>({ ...emptyForm });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUnidades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openNew = () => {
    setEditingId(null);
    setFormData({ ...emptyForm, id: crypto.randomUUID() });
    setShowOffcanvas(true);
  };

  const openEdit = (u: Unidad) => {
    setEditingId(u.id);
    setFormData({ ...u });
    setShowOffcanvas(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        const result = await updateUnidad(editingId, formData);
        if (result.success) toast.success('Unidad actualizada');
        else toast.error('Error al actualizar');
      } else {
        const result = await createUnidad(formData);
        if (result.success) toast.success('Unidad creada');
        else toast.error('Error al crear');
      }
      setShowOffcanvas(false);
    } catch {
      toast.error('Error inesperado');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar esta unidad?')) {
      const result = await deleteUnidad(id);
      if (result.success) toast.success('Unidad eliminada');
      else toast.error('Error al eliminar');
    }
  };

  const filtered = unidades.filter((u: any) =>
    (u.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (u.abreviatura?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-end mb-6">\n        <button onClick={openNew} className="bg-purple-600 text-white px-4 py-2 rounded-2xl hover:bg-purple-700 transition-colors flex items-center space-x-2">
          <span>➕</span><span>Nueva Unidad</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Total Unidades</p>
          <p className="text-2xl font-bold">{unidades.length}</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input type="text" placeholder="Buscar unidad..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" />
          <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div><p className="mt-2 text-gray-500">Cargando...</p></div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Nombre</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Abreviatura</th><th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Acciones</th></tr></thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-12 text-center"><div className="text-4xl mb-2">⚖️</div><p className="text-gray-500">No hay unidades</p></td></tr>
                ) : filtered.map((u: any) => (
                  <tr key={u.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{u.nombre}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{u.abreviatura || '-'}</td>
                    <td className="px-4 py-3"><div className="flex items-center justify-center space-x-1"><button onClick={() => openEdit(u)} className="p-2 text-blue-600 hover:bg-white rounded-2xl shadow-sm" title="Editar">✏️</button><button onClick={() => handleDelete(u.id)} className="p-2 text-red-600 hover:bg-white rounded-2xl shadow-sm" title="Eliminar">🗑️</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Offcanvas isOpen={showOffcanvas} onClose={() => setShowOffcanvas(false)} title={editingId ? 'Editar Unidad' : 'Nueva Unidad'} size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Abreviatura *</label>
            <input type="text" value={formData.abreviatura} onChange={e => setFormData({...formData, abreviatura: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" required placeholder="ej: UN, KG, LT, M" />
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
