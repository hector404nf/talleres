'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Offcanvas from '@/components/Offcanvas';
import SelectSearch from '@/components/SelectSearch';
import { useClientesStore, useVentasStore } from '@/lib/supabase';

interface Cliente {
  id: string;
  tipo_persona: 'fisica' | 'juridica';
  nombre: string;
  apellido: string;
  razon_social: string;
  cuil_cuit: string;
  email: string;
  email_secundario: string;
  telefono: string;
  celular: string;
  whatsapp: string;
  direccion: string;
  localidad: string;
  provincia: string;
  pais: string;
  codigo_postal: string;
  fecha_nacimiento: string;
  genero: string;
  profesion: string;
  condicion_iva: string;
  es_recurrente: boolean;
  tipo_recurrente: string;
  frecuencia_compra_dias: number;
  frecuencia_compra_compras: number;
  frecuencia_compra_monto: number;
  cupo_credito: number;
  saldo_pendiente: number;
  limite_credito_negro: number;
  saldo_credito_negro: number;
  categoria_cliente: string;
  etiqueta_personalizada: string;
  acepta_email: boolean;
  acepta_sms: boolean;
  acepta_whatsapp: boolean;
  acepta_promociones: boolean;
  acepta_cumpleanos: boolean;
  observaciones: string;
  fecha_alta: string;
  puntos_acumulados: number;
  puntos_disponibles: number;
  bloqueado: boolean;
  motivo_bloqueo: string;
  en_lista_negra_set: boolean;
}

const PROVINCIAS = [
  'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes',
  'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza',
  'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis',
  'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'
];

const GENEROS = [
  { value: '', label: 'Seleccionar...' },
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' },
  { value: 'prefiero_no_decir', label: 'Prefiero no decir' }
];

const TIPOS_RECURRENTE = [
  { value: 'automatico', label: 'Automático (por sistema)' },
  { value: 'manual', label: 'Manual (asignado por usuario)' }
];

const emptyForm: Cliente = {
  id: '',
  tipo_persona: 'fisica',
  nombre: '',
  apellido: '',
  razon_social: '',
  cuil_cuit: '',
  email: '',
  email_secundario: '',
  telefono: '',
  celular: '',
  whatsapp: '',
  direccion: '',
  localidad: '',
  provincia: '',
  pais: 'Argentina',
  codigo_postal: '',
  fecha_nacimiento: '',
  genero: '',
  profesion: '',
  condicion_iva: '',
  es_recurrente: false,
  tipo_recurrente: '',
  frecuencia_compra_dias: 30,
  frecuencia_compra_compras: 5,
  frecuencia_compra_monto: 50000,
  cupo_credito: 0,
  saldo_pendiente: 0,
  limite_credito_negro: 0,
  saldo_credito_negro: 0,
  categoria_cliente: '',
  etiqueta_personalizada: '',
  acepta_email: true,
  acepta_sms: true,
  acepta_whatsapp: true,
  acepta_promociones: true,
  acepta_cumpleanos: true,
  observaciones: '',
  fecha_alta: '',
  puntos_acumulados: 0,
  puntos_disponibles: 0,
  bloqueado: false,
  motivo_bloqueo: '',
  en_lista_negra_set: false,
};

export default function ClientesPage() {
  const { clientes, isLoading, fetchClientes, createCliente, updateCliente, deleteCliente } = useClientesStore();
  const { ventas, fetchVentas } = useVentasStore();
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Cliente>({ ...emptyForm });
  const [activeTab, setActiveTab] = useState<'general' | 'contacto' | 'recurrente' | 'alertas' | 'avanzado' | 'historial'>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchClientes();
    fetchVentas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openNew = () => {
    setEditingId(null);
    setFormData({ ...emptyForm, id: crypto.randomUUID(), fecha_alta: new Date().toISOString() });
    setActiveTab('general');
    setShowOffcanvas(true);
  };

  const openEdit = (cliente: Cliente) => {
    setEditingId(cliente.id);
    setFormData({ ...cliente });
    setActiveTab('general');
    setShowOffcanvas(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        const result = await updateCliente(editingId, formData);
        if (result.success) {
          toast.success('Cliente actualizado correctamente');
        } else {
          toast.error('Error al actualizar el cliente');
        }
      } else {
        const result = await createCliente(formData);
        if (result.success) {
          toast.success('Cliente creado correctamente');
        } else {
          toast.error('Error al crear el cliente');
        }
      }
      setShowOffcanvas(false);
    } catch {
      toast.error('Ocurrió un error inesperado');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
      const result = await deleteCliente(id);
      if (result.success) {
        toast.success('Cliente eliminado correctamente');
      } else {
        toast.error('Error al eliminar el cliente');
      }
    }
  };

  const filtered = clientes.filter((c: any) =>
    (c.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (c.apellido?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (c.razon_social?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (c.cuil_cuit || '').includes(searchTerm) ||
    (c.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (c.telefono || '').includes(searchTerm)
  );

  const provinciaOptions = PROVINCIAS.map(p => ({ value: p, label: p }));

  return (
    <div>
      {/* Header */}
      <div className="flex justify-end mb-6">
        <button 
          onClick={openNew} 
          className="bg-blue-600 text-white px-4 py-2 rounded-2xl hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Nuevo Cliente</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Total Clientes</p>
          <p className="text-2xl font-bold">{clientes.length}</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Recurrentes</p>
          <p className="text-2xl font-bold">{clientes.filter((c: any) => c.es_recurrente).length}</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Personas</p>
          <p className="text-2xl font-bold">{clientes.filter((c: any) => c.tipo_persona === 'fisica').length}</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Empresas</p>
          <p className="text-2xl font-bold">{clientes.filter((c: any) => c.tipo_persona === 'juridica').length}</p>
        </div>
      </div>

      {/* Buscador */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nombre, CUIT, email, teléfono..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white border-none rounded-2xl shadow-sm pl-10 pr-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
          />
          <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
        </div>
      </div>

      {/* Tabla */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-500">Cargando clientes...</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Documento</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Contacto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Ubicación</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Tipo</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-4xl mb-2">👥</div>
                      <p className="text-gray-500 mb-1">No hay clientes registrados</p>
                      <p className="text-sm text-gray-400">Hacé clic en "Nuevo Cliente" para agregar uno</p>
                    </td>
                  </tr>
                ) : filtered.map((c: any) => {
                  const hoy = new Date();
                  const esCumple = c.fecha_nacimiento && new Date(c.fecha_nacimiento).getDate() === hoy.getDate() && new Date(c.fecha_nacimiento).getMonth() === hoy.getMonth();
                  return (
                  <tr key={c.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {c.tipo_persona === 'fisica' 
                          ? `${c.apellido}, ${c.nombre}` 
                          : c.razon_social}
                        {c.bloqueado && <span className="ml-2 text-red-500" title="Bloqueado">🚫</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {esCumple && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                            🎂 Cumpleaños hoy
                          </span>
                        )}
                        {c.es_recurrente && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            ⭐ Recurrente
                          </span>
                        )}
                        {c.cupo_credito > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            💳 Crédito: ${c.cupo_credito}
                          </span>
                        )}
                        {c.en_lista_negra_set && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            ⬛ SET
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm text-gray-600">{c.cuil_cuit || '-'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">{c.telefono || c.celular || '-'}</div>
                      <div className="text-xs text-gray-500">{c.email || '-'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">{c.localidad || '-'}</div>
                      <div className="text-xs text-gray-500">{c.provincia || '-'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        c.tipo_persona === 'fisica' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {c.tipo_persona === 'fisica' ? '👤 Persona' : '🏢 Empresa'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center space-x-1">
                        <button 
                          onClick={() => openEdit(c)} 
                          className="p-2 text-blue-600 hover:bg-gray-50 rounded-2xl transition-colors"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDelete(c.id)} 
                          className="p-2 text-red-600 hover:bg-gray-50 rounded-2xl transition-colors"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
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

      {/* Offcanvas */}
      <Offcanvas
        isOpen={showOffcanvas}
        onClose={() => setShowOffcanvas(false)}
        title={editingId ? 'Editar Cliente' : 'Nuevo Cliente'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tabs */}
          <div className="border-b border-gray-100">
            <nav className="flex space-x-8">
              {(['general', 'contacto', 'recurrente', 'alertas', 'avanzado', 'historial'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab === 'general' && 'General'}
                  {tab === 'contacto' && 'Contacto'}
                  {tab === 'recurrente' && 'Recurrente'}
                  {tab === 'alertas' && 'Alertas'}
                  {tab === 'avanzado' && 'Avanzado'}
                  {tab === 'historial' && 'Historial'}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab General */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Persona</label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tipo_persona"
                      value="fisica"
                      checked={formData.tipo_persona === 'fisica'}
                      onChange={e => setFormData({...formData, tipo_persona: e.target.value as 'fisica' | 'juridica'})}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">Persona Física</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tipo_persona"
                      value="juridica"
                      checked={formData.tipo_persona === 'juridica'}
                      onChange={e => setFormData({...formData, tipo_persona: e.target.value as 'fisica' | 'juridica'})}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">Persona Jurídica</span>
                  </label>
                </div>
              </div>

              {formData.tipo_persona === 'fisica' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={e => setFormData({...formData, nombre: e.target.value})}
                      className="w-full bg-white border border-gray-100 rounded-2xl shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                    <input
                      type="text"
                      value={formData.apellido}
                      onChange={e => setFormData({...formData, apellido: e.target.value})}
                      className="w-full bg-white border border-gray-100 rounded-2xl shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social *</label>
                  <input
                    type="text"
                    value={formData.razon_social}
                    onChange={e => setFormData({...formData, razon_social: e.target.value})}
                    className="w-full bg-white border border-gray-100 rounded-2xl shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CUIT/CUIL</label>
                  <input
                    type="text"
                    value={formData.cuil_cuit}
                    onChange={e => setFormData({...formData, cuil_cuit: e.target.value})}
                    className="w-full bg-white border border-gray-100 rounded-2xl shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                    placeholder="20-12345678-9"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    value={formData.fecha_nacimiento}
                    onChange={e => setFormData({...formData, fecha_nacimiento: e.target.value})}
                    className="w-full bg-white border border-gray-100 rounded-2xl shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <SelectSearch
                  label="Género"
                  value={formData.genero}
                  onChange={(value) => setFormData({...formData, genero: value})}
                  options={GENEROS}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profesión/Actividad</label>
                  <input
                    type="text"
                    value={formData.profesion}
                    onChange={e => setFormData({...formData, profesion: e.target.value})}
                    className="w-full bg-white border border-gray-100 rounded-2xl shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                    placeholder="Ej: Mecánico, Comerciante"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cupo de Crédito</label>
                  <input
                    type="number"
                    value={formData.cupo_credito}
                    onChange={e => setFormData({...formData, cupo_credito: parseFloat(e.target.value) || 0})}
                    className="w-full bg-white border border-gray-100 rounded-2xl shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Puntos Disponibles</label>
                  <input
                    type="number"
                    value={formData.puntos_disponibles}
                    onChange={e => setFormData({...formData, puntos_disponibles: parseInt(e.target.value) || 0})}
                    className="w-full bg-white border border-gray-100 rounded-2xl shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
              </div>
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-3">
                <p className="text-sm text-gray-800">
                  ⭐ Puntos acumulados: <span className="font-bold">{formData.puntos_acumulados || 0}</span>
                </p>
              </div>
            </div>
          )}

          {/* Tab Contacto */}
          {activeTab === 'contacto' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-white border border-gray-100 rounded-2xl shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={e => setFormData({...formData, telefono: e.target.value})}
                    className="w-full bg-white border border-gray-100 rounded-2xl shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Celular</label>
                <input
                  type="text"
                  value={formData.celular}
                  onChange={e => setFormData({...formData, celular: e.target.value})}
                  className="w-full bg-white border border-gray-100 rounded-2xl shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={e => setFormData({...formData, direccion: e.target.value})}
                  className="w-full bg-white border border-gray-100 rounded-2xl shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Localidad</label>
                  <input
                    type="text"
                    value={formData.localidad}
                    onChange={e => setFormData({...formData, localidad: e.target.value})}
                    className="w-full bg-white border border-gray-100 rounded-2xl shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
                <SelectSearch
                  label="Provincia"
                  value={formData.provincia}
                  onChange={(value) => setFormData({...formData, provincia: value})}
                  options={provinciaOptions}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
                  <input
                    type="text"
                    value={formData.codigo_postal}
                    onChange={e => setFormData({...formData, codigo_postal: e.target.value})}
                    className="w-full bg-white border border-gray-100 rounded-2xl shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                <textarea
                  value={formData.observaciones}
                  onChange={e => setFormData({...formData, observaciones: e.target.value})}
                  className="w-full bg-white border border-gray-100 rounded-2xl shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  rows={3}
                  placeholder="Notas adicionales sobre el cliente..."
                />
              </div>
            </div>
          )}

          {/* Tab Recurrente */}
          {activeTab === 'recurrente' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 p-4 bg-white rounded-3xl shadow-sm border border-gray-100">
                <input
                  type="checkbox"
                  id="es_recurrente"
                  checked={formData.es_recurrente}
                  onChange={e => setFormData({...formData, es_recurrente: e.target.checked})}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <label htmlFor="es_recurrente" className="text-sm font-medium text-gray-800">
                  Marcar como Cliente Recurrente
                </label>
              </div>

              {formData.es_recurrente && (
                <div className="space-y-4">
                  <SelectSearch
                    label="Tipo de Recurrencia"
                    value={formData.tipo_recurrente}
                    onChange={(value) => setFormData({...formData, tipo_recurrente: value})}
                    options={TIPOS_RECURRENTE}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Compras mínimas</label>
                      <input
                        type="number"
                        value={formData.frecuencia_compra_compras}
                        onChange={e => setFormData({...formData, frecuencia_compra_compras: parseInt(e.target.value) || 0})}
                        className="w-full bg-white border border-gray-100 rounded-2xl shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Monto mínimo acumulado ($)</label>
                      <input
                        type="number"
                        value={formData.frecuencia_compra_monto}
                        onChange={e => setFormData({...formData, frecuencia_compra_monto: parseFloat(e.target.value) || 0})}
                        className="w-full bg-white border border-gray-100 rounded-2xl shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Frecuencia en días</label>
                      <input
                        type="number"
                        value={formData.frecuencia_compra_dias}
                        onChange={e => setFormData({...formData, frecuencia_compra_dias: parseInt(e.target.value) || 0})}
                        className="w-full bg-white border border-gray-100 rounded-2xl shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab Alertas */}
          {activeTab === 'alertas' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 p-4 bg-white rounded-3xl shadow-sm border border-gray-100">
                <input
                  type="checkbox"
                  id="bloqueado"
                  checked={formData.bloqueado}
                  onChange={e => setFormData({...formData, bloqueado: e.target.checked})}
                  className="w-5 h-5 text-red-600 rounded"
                />
                <label htmlFor="bloqueado" className="text-sm font-medium text-gray-800">
                  Cliente Bloqueado (no se le pueden realizar ventas)
                </label>
              </div>

              {formData.bloqueado && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Motivo del Bloqueo</label>
                  <textarea
                    value={formData.motivo_bloqueo}
                    onChange={e => setFormData({...formData, motivo_bloqueo: e.target.value})}
                    className="w-full bg-white border border-gray-100 rounded-2xl shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                    rows={3}
                    placeholder="Ej: Deudas pendientes, comportamiento fraudulento..."
                  />
                </div>
              )}

              <div className="flex items-center space-x-2 p-4 bg-white rounded-3xl shadow-sm border border-gray-100">
                <input
                  type="checkbox"
                  id="en_lista_negra_set"
                  checked={formData.en_lista_negra_set}
                  onChange={e => setFormData({...formData, en_lista_negra_set: e.target.checked})}
                  className="w-5 h-5 text-gray-600 rounded"
                />
                <label htmlFor="en_lista_negra_set" className="text-sm font-medium text-gray-800">
                  En Lista Negra SET (Crédito Negro / Informal)
                </label>
              </div>
              <p className="text-xs text-gray-500">
                Los clientes en lista negra pueden recibir ventas marcadas como "crédito negro" sin generar comprobante fiscal.
              </p>
            </div>
          )}

          {/* Tab Avanzado */}
          {activeTab === 'avanzado' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Email Secundario</label><input type="email" value={formData.email_secundario} onChange={e => setFormData({...formData, email_secundario: e.target.value})} className="w-full bg-white border border-gray-100 rounded-2xl shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label><input type="text" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full bg-white border border-gray-100 rounded-2xl shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Condición IVA</label><input type="text" value={formData.condicion_iva} onChange={e => setFormData({...formData, condicion_iva: e.target.value})} className="w-full bg-white border border-gray-100 rounded-2xl shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" placeholder="Ej: Responsable Inscripto" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">País</label><input type="text" value={formData.pais} onChange={e => setFormData({...formData, pais: e.target.value})} className="w-full bg-white border border-gray-100 rounded-2xl shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Categoría Cliente</label><select value={formData.categoria_cliente} onChange={e => setFormData({...formData, categoria_cliente: e.target.value})} className="w-full bg-white border border-gray-100 rounded-2xl shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"><option value="">Sin categoría</option><option value="A">A - Premium</option><option value="B">B - Gold</option><option value="C">C - Silver</option><option value="D">D - Bronce</option><option value="E">E - Básico</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Etiqueta Personalizada</label><input type="text" value={formData.etiqueta_personalizada} onChange={e => setFormData({...formData, etiqueta_personalizada: e.target.value})} className="w-full bg-white border border-gray-100 rounded-2xl shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" placeholder="Ej: VIP, Mayorista" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Saldo Pendiente</label><input type="number" value={formData.saldo_pendiente} onChange={e => setFormData({...formData, saldo_pendiente: parseFloat(e.target.value) || 0})} className="w-full bg-white border border-gray-100 rounded-2xl shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Límite Crédito Negro</label><input type="number" value={formData.limite_credito_negro} onChange={e => setFormData({...formData, limite_credito_negro: parseFloat(e.target.value) || 0})} className="w-full bg-white border border-gray-100 rounded-2xl shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Saldo Crédito Negro</label><input type="number" value={formData.saldo_credito_negro} onChange={e => setFormData({...formData, saldo_credito_negro: parseFloat(e.target.value) || 0})} className="w-full bg-white border border-gray-100 rounded-2xl shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" /></div>
              </div>
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Preferencias de Contacto</p>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" checked={formData.acepta_email} onChange={e => setFormData({...formData, acepta_email: e.target.checked})} className="w-4 h-4" /><span className="text-sm">Email</span></label>
                  <label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" checked={formData.acepta_sms} onChange={e => setFormData({...formData, acepta_sms: e.target.checked})} className="w-4 h-4" /><span className="text-sm">SMS</span></label>
                  <label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" checked={formData.acepta_whatsapp} onChange={e => setFormData({...formData, acepta_whatsapp: e.target.checked})} className="w-4 h-4" /><span className="text-sm">WhatsApp</span></label>
                  <label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" checked={formData.acepta_promociones} onChange={e => setFormData({...formData, acepta_promociones: e.target.checked})} className="w-4 h-4" /><span className="text-sm">Promociones</span></label>
                  <label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" checked={formData.acepta_cumpleanos} onChange={e => setFormData({...formData, acepta_cumpleanos: e.target.checked})} className="w-4 h-4" /><span className="text-sm">Cumpleaños</span></label>
                </div>
              </div>
            </div>
          )}

          {/* Tab Historial */}
          {activeTab === 'historial' && (
            <div className="space-y-4">
              {(() => {
                const ventasCliente = (ventas as any[]).filter((v: any) => v.id_cliente === editingId);
                const totalAcumulado = ventasCliente.reduce((sum: number, v: any) => sum + (v.total || 0), 0);
                const ticketPromedio = ventasCliente.length > 0 ? totalAcumulado / ventasCliente.length : 0;
                const ultimaCompra = ventasCliente.length > 0 
                  ? ventasCliente.sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0] 
                  : null;
                return (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-3 text-center">
                        <p className="text-xs text-gray-500">Compras</p>
                        <p className="text-xl font-bold text-gray-900">{ventasCliente.length}</p>
                      </div>
                      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-3 text-center">
                        <p className="text-xs text-gray-500">Total Acumulado</p>
                        <p className="text-xl font-bold text-gray-900">${totalAcumulado.toFixed(2)}</p>
                      </div>
                      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-3 text-center">
                        <p className="text-xs text-gray-500">Ticket Promedio</p>
                        <p className="text-xl font-bold text-gray-900">${ticketPromedio.toFixed(2)}</p>
                      </div>
                    </div>
                    {ultimaCompra && (
                      <p className="text-sm text-gray-500">Última compra: {new Date(ultimaCompra.fecha).toLocaleDateString('es-AR')} — ${parseFloat(ultimaCompra.total || 0).toFixed(2)}</p>
                    )}
                    {ventasCliente.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">No hay compras registradas para este cliente.</div>
                    ) : (
                      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50/50"><tr><th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">Fecha</th><th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">Items</th><th className="px-3 py-2 text-right text-xs font-medium text-gray-400 uppercase">Total</th></tr></thead>
                          <tbody>
                            {ventasCliente.sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).map((v: any) => (
                              <tr key={v.id} className="border-t border-gray-50">
                                <td className="px-3 py-2">{new Date(v.fecha).toLocaleDateString('es-AR')}</td>
                                <td className="px-3 py-2">{(v.items || []).length} productos</td>
                                <td className="px-3 py-2 text-right font-medium">${parseFloat(v.total || 0).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setShowOffcanvas(false)}
              className="px-4 py-2 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting 
                ? (editingId ? '💾 Guardando...' : '💾 Creando...') 
                : (editingId ? '💾 Guardar Cambios' : '💾 Crear Cliente')
              }
            </button>
          </div>
        </form>
      </Offcanvas>
    </div>
  );
}
