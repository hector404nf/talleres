'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Offcanvas from '@/components/Offcanvas';
import { useCategoriasStore } from '@/lib/supabase';

interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
  orden: number;
  activo: boolean;
}

const emptyForm: Categoria = {
  id: '',
  nombre: '',
  descripcion: '',
  orden: 0,
  activo: true,
};

export default function CategoriasPage() {
  const { categorias, isLoading, fetchCategorias, createCategoria, updateCategoria, deleteCategoria } = useCategoriasStore();
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Categoria>({ ...emptyForm });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategorias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openNew = () => {
    setEditingId(null);
    setFormData({ ...emptyForm, id: crypto.randomUUID() });
    setShowOffcanvas(true);
  };

  const openEdit = (c: Categoria) => {
    setEditingId(c.id);
    setFormData({ ...c });
    setShowOffcanvas(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        const result = await updateCategoria(editingId, formData);
        if (result.success) toast.success('Categoría actualizada');
        else toast.error('Error al actualizar');
      } else {
        const result = await createCategoria(formData);
        if (result.success) toast.success('Categoría creada');
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
    if (confirm('¿Eliminar esta categoría?')) {
      const result = await deleteCategoria(id);
      if (result.success) toast.success('Categoría eliminada');
      else toast.error('Error al eliminar');
    }
  };

  const filtered = categorias.filter((c: any) =>
    (c.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-end mb-6">\n        <button onClick={openNew} className="bg-purple-600 text-white px-4 py-2 rounded-2xl hover:bg-purple-700 transition-colors flex items-center space-x-2">
          <span>➕</span><span>Nueva Categoría</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Total Categorías</p>
          <p className="text-2xl font-bold">{categorias.length}</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input type="text" placeholder="Buscar categoría..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" />
          <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div><p className="mt-2 text-gray-500">Cargando...</p></div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Nombre</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Descripción</th><th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Acciones</th></tr></thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-12 text-center"><div className="text-4xl mb-2">📂</div><p className="text-gray-500">No hay categorías</p></td></tr>
                ) : filtered.map((c: any) => (
                  <tr key={c.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.nombre}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{c.descripcion || '-'}</td>
                    <td className="px-4 py-3"><div className="flex items-center justify-center space-x-1"><button onClick={() => openEdit(c)} className="p-2 text-blue-600 hover:bg-white rounded-2xl shadow-sm" title="Editar">✏️</button><button onClick={() => handleDelete(c.id)} className="p-2 text-red-600 hover:bg-white rounded-2xl shadow-sm" title="Eliminar">🗑️</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Offcanvas isOpen={showOffcanvas} onClose={() => setShowOffcanvas(false)} title={editingId ? 'Editar Categoría' : 'Nueva Categoría'} size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" rows={3} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
            <input type="number" value={formData.orden} onChange={e => setFormData({...formData, orden: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" />
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
