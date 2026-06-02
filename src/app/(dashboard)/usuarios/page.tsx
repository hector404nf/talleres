'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Offcanvas from '@/components/Offcanvas';
import { useUsuariosStore } from '@/lib/supabase';

interface Usuario {
  id: string;
  username: string;
  email: string;
  nombre_completo: string;
  rol: 'admin' | 'vendedor' | 'encargado' | 'tecnico';
  activo: boolean;
  permiso_ventas: boolean;
  permiso_compras: boolean;
  permiso_inventario: boolean;
  permiso_reportes: boolean;
  permiso_configuracion: boolean;
  permiso_caja: boolean;
  permiso_anular: boolean;
  permiso_credito: boolean;
  limite_descuento: number;
}

const ROLES = [
  { value: 'admin', label: 'Administrador' },
  { value: 'vendedor', label: 'Vendedor' },
  { value: 'encargado', label: 'Encargado' },
  { value: 'tecnico', label: 'Técnico' },
];

const emptyForm: Usuario = {
  id: '',
  username: '',
  email: '',
  nombre_completo: '',
  rol: 'vendedor',
  activo: true,
  permiso_ventas: true,
  permiso_compras: false,
  permiso_inventario: false,
  permiso_reportes: false,
  permiso_configuracion: false,
  permiso_caja: false,
  permiso_anular: false,
  permiso_credito: false,
  limite_descuento: 10,
};

export default function UsuariosPage() {
  const { usuarios, isLoading, fetchUsuarios, createUsuario, updateUsuario, deleteUsuario } = useUsuariosStore();
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Usuario>({ ...emptyForm });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchUsuarios(); /* eslint-disable-next-line */ }, []);

  const openNew = () => {
    setEditingId(null);
    setFormData({ ...emptyForm, id: crypto.randomUUID() });
    setShowOffcanvas(true);
  };

  const openEdit = (u: any) => {
    setEditingId(u.id);
    setFormData({ ...emptyForm, ...u });
    setShowOffcanvas(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        const result = await updateUsuario(editingId, formData);
        if (result.success) toast.success('Usuario actualizado');
        else toast.error('Error al actualizar');
      } else {
        const result = await createUsuario(formData);
        if (result.success) toast.success('Usuario creado');
        else toast.error('Error al crear');
      }
      setShowOffcanvas(false);
    } catch { toast.error('Error inesperado'); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este usuario?')) {
      const result = await deleteUsuario(id);
      if (result.success) toast.success('Usuario eliminado');
      else toast.error('Error al eliminar');
    }
  };

  const filtered = usuarios.filter((u: any) =>
    (u.nombre_completo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (u.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (u.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-end mb-6">\n        <button onClick={openNew} className="bg-purple-600 text-white px-4 py-2 rounded-2xl hover:bg-purple-700 transition-colors flex items-center space-x-2">
          <span>➕</span><span>Nuevo Usuario</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Total Usuarios</p>
          <p className="text-2xl font-bold">{usuarios.length}</p>
        </div>
        {ROLES.map(r => (
          <div key={r.value} className="bg-white rounded-3xl shadow-sm p-6 border-l-4 border-gray-300">
            <p className="text-sm text-gray-500">{r.label}</p>
            <p className="text-2xl font-bold">{usuarios.filter((u: any) => u.rol === r.value).length}</p>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <div className="relative">
          <input type="text" placeholder="Buscar usuario..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" />
          <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div><p className="mt-2 text-gray-500">Cargando...</p></div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Usuario</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Rol</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Permisos</th><th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Acciones</th></tr></thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-12 text-center"><div className="text-4xl mb-2">👤</div><p className="text-gray-500">No hay usuarios</p></td></tr>
                ) : filtered.map((u: any) => (
                  <tr key={u.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{u.nombre_completo || u.username}</div>
                      <div className="text-xs text-gray-500">{u.email || u.username}</div>
                    </td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${u.rol === 'admin' ? 'bg-red-100 text-red-800' : u.rol === 'tecnico' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{ROLES.find(r => r.value === u.rol)?.label || u.rol}</span></td>
                    <td className="px-4 py-3"><div className="flex flex-wrap gap-1">{Object.entries({ ventas: u.permiso_ventas, compras: u.permiso_compras, inventario: u.permiso_inventario, reportes: u.permiso_reportes, config: u.permiso_configuracion, caja: u.permiso_caja, anular: u.permiso_anular, credito: u.permiso_credito }).filter(([,v]) => v).map(([k]) => (<span key={k} className="px-1.5 py-0.5 bg-purple-50 text-purple-700 text-[10px] rounded capitalize">{k}</span>))}</div></td>
                    <td className="px-4 py-3"><div className="flex items-center justify-center space-x-1"><button onClick={() => openEdit(u)} className="p-2 text-blue-600 hover:bg-white rounded-2xl shadow-sm" title="Editar">✏️</button><button onClick={() => handleDelete(u.id)} className="p-2 text-red-600 hover:bg-white rounded-2xl shadow-sm" title="Eliminar">🗑️</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Offcanvas isOpen={showOffcanvas} onClose={() => setShowOffcanvas(false)} title={editingId ? 'Editar Usuario' : 'Nuevo Usuario'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label><input type="text" value={formData.nombre_completo} onChange={e => setFormData({...formData, nombre_completo: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Username *</label><input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Rol *</label><select value={formData.rol} onChange={e => setFormData({...formData, rol: e.target.value as any})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500">{ROLES.map(r => (<option key={r.value} value={r.value}>{r.label}</option>))}</select></div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Límite de Descuento (%)</label>
            <input type="number" min={0} max={100} value={formData.limite_descuento} onChange={e => setFormData({...formData, limite_descuento: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" />
          </div>

          <div className="border rounded-lg p-4 bg-gray-50">
            <p className="text-sm font-medium text-gray-700 mb-3">Permisos</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'permiso_ventas', label: 'Ventas' },
                { key: 'permiso_compras', label: 'Compras' },
                { key: 'permiso_inventario', label: 'Inventario' },
                { key: 'permiso_reportes', label: 'Reportes' },
                { key: 'permiso_configuracion', label: 'Configuración' },
                { key: 'permiso_caja', label: 'Caja' },
                { key: 'permiso_anular', label: 'Anular' },
                { key: 'permiso_credito', label: 'Crédito' },
              ].map(p => (
                <label key={p.key} className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" checked={(formData as any)[p.key]} onChange={e => setFormData({...formData, [p.key]: e.target.checked} as any)} className="w-4 h-4 text-purple-600 rounded" />
                  <span className="text-sm">{p.label}</span>
                </label>
              ))}
            </div>
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
