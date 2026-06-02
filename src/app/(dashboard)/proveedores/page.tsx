'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Offcanvas from '@/components/Offcanvas';
import { useProveedoresStore } from '@/lib/supabase';

interface Proveedor {
  id: string;
  razon_social: string;
  nombre_fantasia: string;
  cuit: string;
  condicion_iva: string;
  email: string;
  telefono: string;
  celular_contacto: string;
  direccion: string;
  localidad: string;
  provincia: string;
  codigo_postal: string;
  contacto: string;
  email_contacto: string;
  dias_plazo_default: number;
  cupo_credito: number;
  saldo_pendiente: number;
  calificacion: number;
  observaciones: string;
  fecha_alta: string;
}

const CONDICIONES_IVA = [
  { value: '', label: 'Seleccionar...' },
  { value: 'responsable_inscripto', label: 'Responsable Inscripto' },
  { value: 'monotributo', label: 'Monotributo' },
  { value: 'exento', label: 'Exento' },
  { value: 'consumidor_final', label: 'Consumidor Final' },
  { value: 'no_categorizado', label: 'No Categorizado' },
];

const PROVINCIAS = [
  'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes',
  'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza',
  'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis',
  'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'
];

const emptyForm: Proveedor = {
  id: '',
  razon_social: '',
  nombre_fantasia: '',
  cuit: '',
  condicion_iva: '',
  email: '',
  telefono: '',
  celular_contacto: '',
  direccion: '',
  localidad: '',
  provincia: '',
  codigo_postal: '',
  contacto: '',
  email_contacto: '',
  dias_plazo_default: 30,
  cupo_credito: 0,
  saldo_pendiente: 0,
  calificacion: 0,
  observaciones: '',
  fecha_alta: ''
};

export default function ProveedoresPage() {
  const { proveedores, isLoading, fetchProveedores, createProveedor, updateProveedor, deleteProveedor } = useProveedoresStore();
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Proveedor>({ ...emptyForm });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProveedores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openNew = () => {
    setEditingId(null);
    setFormData({ ...emptyForm, id: crypto.randomUUID(), fecha_alta: new Date().toISOString() });
    setShowOffcanvas(true);
  };

  const openEdit = (proveedor: Proveedor) => {
    setEditingId(proveedor.id);
    setFormData({ ...proveedor });
    setShowOffcanvas(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        const result = await updateProveedor(editingId, formData);
        if (result.success) toast.success('Proveedor actualizado correctamente');
        else toast.error('Error al actualizar');
      } else {
        const result = await createProveedor(formData);
        if (result.success) toast.success('Proveedor creado correctamente');
        else toast.error('Error al crear');
      }
      setShowOffcanvas(false);
    } catch {
      toast.error('Ocurrió un error inesperado');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este proveedor?')) {
      const result = await deleteProveedor(id);
      if (result.success) toast.success('Proveedor eliminado');
      else toast.error('Error al eliminar');
    }
  };

  const filtered = proveedores.filter((p: any) =>
    (p.razon_social?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (p.nombre_fantasia?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (p.cuit || '').includes(searchTerm) ||
    (p.email || '').includes(searchTerm.toLowerCase()) ||
    (p.telefono || '').includes(searchTerm)
  );

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <span key={star} className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
        ))}
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-end mb-6">\n        <button
          onClick={openNew}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Nuevo Proveedor</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Total Proveedores</p>
          <p className="text-2xl font-bold">{proveedores.length}</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Con Crédito</p>
          <p className="text-2xl font-bold">{proveedores.filter((p: any) => (p.cupo_credito || 0) > 0).length}</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Saldo Pendiente Total</p>
          <p className="text-2xl font-bold">
            ${proveedores.reduce((sum: number, p: any) => sum + (p.saldo_pendiente || 0), 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Calificación Promedio</p>
          <p className="text-2xl font-bold">
            {proveedores.length > 0
              ? (proveedores.reduce((sum: number, p: any) => sum + (p.calificacion || 0), 0) / proveedores.length).toFixed(1)
              : '0.0'} ⭐
          </p>
        </div>
      </div>

      {/* Buscador */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por razón social, CUIT, email, teléfono..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
        </div>
      </div>

      {/* Tabla */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-500">Cargando proveedores...</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Proveedor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Contacto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Ubicación</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Condición</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Calif.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Crédito</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-4xl mb-2">🏭</div>
                      <p className="text-gray-500 mb-1">No hay proveedores registrados</p>
                      <p className="text-sm text-gray-400">Hacé clic en "Nuevo Proveedor" para agregar uno</p>
                    </td>
                  </tr>
                ) : filtered.map((p: any) => (
                  <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{p.razon_social}</div>
                      {p.nombre_fantasia && (
                        <div className="text-xs text-gray-500">{p.nombre_fantasia}</div>
                      )}
                      <div className="font-mono text-xs text-gray-400 mt-0.5">{p.cuit || 'Sin CUIT'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">{p.telefono || p.celular_contacto || '-'}</div>
                      <div className="text-xs text-gray-500">{p.email || '-'}</div>
                      {p.contacto && (
                        <div className="text-xs text-indigo-600 mt-0.5">👤 {p.contacto}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">{p.localidad || '-'}</div>
                      <div className="text-xs text-gray-500">{p.provincia || '-'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-600">{p.condicion_iva || '-'}</span>
                    </td>
                    <td className="px-4 py-3">
                      {p.calificacion > 0 ? renderStars(p.calificacion) : <span className="text-xs text-gray-400">-</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium">${(p.cupo_credito || 0).toFixed(2)}</div>
                      {(p.saldo_pendiente || 0) > 0 && (
                        <div className="text-xs text-red-600">Debe: ${(p.saldo_pendiente || 0).toFixed(2)}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center space-x-1">
                        <button onClick={() => openEdit(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-2xl transition-colors" title="Editar">✏️</button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-2xl transition-colors" title="Eliminar">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Offcanvas */}
      <Offcanvas
        isOpen={showOffcanvas}
        onClose={() => setShowOffcanvas(false)}
        title={editingId ? 'Editar Proveedor' : 'Nuevo Proveedor'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social *</label>
            <input
              type="text"
              value={formData.razon_social}
              onChange={e => setFormData({...formData, razon_social: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Fantasía</label>
            <input
              type="text"
              value={formData.nombre_fantasia}
              onChange={e => setFormData({...formData, nombre_fantasia: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CUIT</label>
              <input
                type="text"
                value={formData.cuit}
                onChange={e => setFormData({...formData, cuit: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500"
                placeholder="30-12345678-9"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condición IVA</label>
              <select
                value={formData.condicion_iva}
                onChange={e => setFormData({...formData, condicion_iva: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500"
              >
                {CONDICIONES_IVA.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                type="text"
                value={formData.telefono}
                onChange={e => setFormData({...formData, telefono: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Celular Contacto</label>
              <input
                type="text"
                value={formData.celular_contacto}
                onChange={e => setFormData({...formData, celular_contacto: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Persona de Contacto</label>
              <input
                type="text"
                value={formData.contacto}
                onChange={e => setFormData({...formData, contacto: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email de Contacto</label>
            <input
              type="email"
              value={formData.email_contacto}
              onChange={e => setFormData({...formData, email_contacto: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
            <input
              type="text"
              value={formData.direccion}
              onChange={e => setFormData({...formData, direccion: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Localidad</label>
              <input
                type="text"
                value={formData.localidad}
                onChange={e => setFormData({...formData, localidad: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
              <select
                value={formData.provincia}
                onChange={e => setFormData({...formData, provincia: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Seleccionar...</option>
                {PROVINCIAS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
              <input
                type="text"
                value={formData.codigo_postal}
                onChange={e => setFormData({...formData, codigo_postal: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Días de Plazo</label>
              <input
                type="number"
                value={formData.dias_plazo_default}
                onChange={e => setFormData({...formData, dias_plazo_default: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cupo de Crédito</label>
              <input
                type="number"
                step="0.01"
                value={formData.cupo_credito}
                onChange={e => setFormData({...formData, cupo_credito: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Saldo Pendiente</label>
              <input
                type="number"
                step="0.01"
                value={formData.saldo_pendiente}
                onChange={e => setFormData({...formData, saldo_pendiente: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Calificación (1-5)</label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({...formData, calificacion: star})}
                  className={`text-2xl transition-colors ${star <= formData.calificacion ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'}`}
                >
                  ★
                </button>
              ))}
              <span className="text-sm text-gray-500 ml-2">
                {formData.calificacion > 0 ? `${formData.calificacion}/5` : 'Sin calificar'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea
              value={formData.observaciones}
              onChange={e => setFormData({...formData, observaciones: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setShowOffcanvas(false)}
              className="px-4 py-2 border border-gray-300 rounded-2xl hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting
                ? (editingId ? '💾 Guardando...' : '💾 Creando...')
                : (editingId ? '💾 Guardar Cambios' : '💾 Crear Proveedor')
              }
            </button>
          </div>
        </form>
      </Offcanvas>
    </div>
  );
}
