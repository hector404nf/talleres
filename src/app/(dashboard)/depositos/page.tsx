'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Offcanvas from '@/components/Offcanvas';
import { useDepositosStore } from '@/lib/supabase';

interface Deposito {
  id: string;
  nombre: string;
  direccion: string;
  localidad: string;
  telefono: string;
  encargado: string;
  es_principal: boolean;
  activo: boolean;
}

const emptyForm: Deposito = {
  id: '',
  nombre: '',
  direccion: '',
  localidad: '',
  telefono: '',
  encargado: '',
  es_principal: false,
  activo: true,
};

export default function DepositosPage() {
  const { depositos, isLoading, fetchDepositos, createDeposito, updateDeposito, deleteDeposito } = useDepositosStore();
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Deposito>({ ...emptyForm });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchDepositos(); /* eslint-disable-next-line */ }, []);

  const openNew = () => {
    setEditingId(null);
    setFormData({ ...emptyForm, id: crypto.randomUUID() });
    setShowOffcanvas(true);
  };

  const openEdit = (d: Deposito) => {
    setEditingId(d.id);
    setFormData({ ...d });
    setShowOffcanvas(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        const result = await updateDeposito(editingId, formData);
        if (result.success) toast.success('Depósito actualizado');
      } else {
        const result = await createDeposito(formData);
        if (result.success) toast.success('Depósito creado');
      }
      setShowOffcanvas(false);
    } catch { toast.error('Error inesperado'); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este depósito?')) {
      const result = await deleteDeposito(id);
      if (result.success) toast.success('Depósito eliminado');
    }
  };

  const filtered = depositos.filter((d: any) =>
    (d.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (d.localidad?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-end mb-6">\n        <button onClick={openNew} className="bg-purple-600 text-white px-4 py-2 rounded-2xl hover:bg-purple-700 transition-colors flex items-center space-x-2">
          <span>➕</span><span>Nuevo Depósito</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Total Depósitos</p>
          <p className="text-2xl font-bold">{depositos.length}</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Principal</p>
          <p className="text-2xl font-bold">{depositos.filter((d: any) => d.es_principal).length}</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input type="text" placeholder="Buscar depósito..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" />
          <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div><p className="mt-2 text-gray-500">Cargando...</p></div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Nombre</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Dirección</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Localidad</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Encargado</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Tipo</th><th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Acciones</th></tr></thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center"><div className="text-4xl mb-2">🏭</div><p className="text-gray-500">No hay depósitos</p></td></tr>
                ) : filtered.map((d: any) => (
                  <tr key={d.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{d.nombre}</td>
                    <td className="px-4 py-3 text-sm">{d.direccion || '-'}</td>
                    <td className="px-4 py-3 text-sm">{d.localidad || '-'}</td>
                    <td className="px-4 py-3 text-sm">{d.encargado || '-'}</td>
                    <td className="px-4 py-3">{d.es_principal ? <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">Principal</span> : <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">Secundario</span>}</td>
                    <td className="px-4 py-3"><div className="flex items-center justify-center space-x-1"><button onClick={() => openEdit(d)} className="p-2 text-blue-600 hover:bg-white rounded-2xl shadow-sm" title="Editar">✏️</button><button onClick={() => handleDelete(d.id)} className="p-2 text-red-600 hover:bg-white rounded-2xl shadow-sm" title="Eliminar">🗑️</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Offcanvas isOpen={showOffcanvas} onClose={() => setShowOffcanvas(false)} title={editingId ? 'Editar Depósito' : 'Nuevo Depósito'} size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label><input type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label><input type="text" value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Localidad</label><input type="text" value={formData.localidad} onChange={e => setFormData({...formData, localidad: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label><input type="text" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Encargado</label><input type="text" value={formData.encargado} onChange={e => setFormData({...formData, encargado: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" /></div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="es_principal" checked={formData.es_principal} onChange={e => setFormData({...formData, es_principal: e.target.checked})} className="w-5 h-5 text-purple-600 rounded" />
            <label htmlFor="es_principal" className="text-sm font-medium">Es depósito principal</label>
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
