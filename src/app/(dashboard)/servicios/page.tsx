'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Offcanvas from '@/components/Offcanvas';
import SelectSearch from '@/components/SelectSearch';
import { useOrdenesStore, useClientesStore, useProductosStore } from '@/lib/supabase';
import TicketPrint from '@/components/TicketPrint';

interface RepuestoItem {
  id_producto: string;
  nombre: string;
  cantidad: number;
  precio: number;
  total: number;
}

interface HistorialEstado {
  estado: string;
  fecha: string;
  observaciones: string;
}

interface OrdenServicio {
  id: string;
  numero: number;
  id_cliente: string;
  cliente_nombre: string;
  producto_marca: string;
  producto_modelo: string;
  producto_numero_serie: string;
  producto_color: string;
  producto_accesorios: string;
  producto_falla: string;
  producto_observaciones: string;
  estado: string;
  tecnico: string;
  diagnostico: string;
  trabajo_realizado: string;
  costo_mano_obra: number;
  total: number;
  presupuesto_aprobado: boolean;
  tiene_garantia: boolean;
  dias_garantia: number;
  observaciones: string;
  fecha_ingreso: string;
  fecha_entrega_estimada: string;
  repuestos: RepuestoItem[];
  historial_estados: HistorialEstado[];
  fotos_antes: string[];
  fotos_despues: string[];
  encuesta_calificacion: number;
  encuesta_comentarios: string;
}

const ESTADOS = [
  { value: 'ingresado', label: 'Ingresado', color: 'bg-gray-100 text-gray-800' },
  { value: 'en_revision', label: 'En Revisión', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'presupuestado', label: 'Presupuestado', color: 'bg-blue-100 text-blue-800' },
  { value: 'aprobado', label: 'Aprobado', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'en_reparacion', label: 'En Reparación', color: 'bg-orange-100 text-orange-800' },
  { value: 'esperando_repuesto', label: 'Esperando Repuesto', color: 'bg-pink-100 text-pink-800' },
  { value: 'esperando_aprobacion', label: 'Esperando Aprobación', color: 'bg-purple-100 text-purple-800' },
  { value: 'listo', label: 'Listo', color: 'bg-teal-100 text-teal-800' },
  { value: 'entregado', label: 'Entregado', color: 'bg-green-100 text-green-800' },
  { value: 'garantia', label: 'En Garantía', color: 'bg-red-100 text-red-800' },
  { value: 'cancelado', label: 'Cancelado', color: 'bg-red-50 text-red-600' },
];

const emptyForm: OrdenServicio = {
  id: '',
  numero: 0,
  id_cliente: '',
  cliente_nombre: '',
  producto_marca: '',
  producto_modelo: '',
  producto_numero_serie: '',
  producto_color: '',
  producto_accesorios: '',
  producto_falla: '',
  producto_observaciones: '',
  estado: 'ingresado',
  tecnico: '',
  diagnostico: '',
  trabajo_realizado: '',
  costo_mano_obra: 0,
  total: 0,
  presupuesto_aprobado: false,
  tiene_garantia: false,
  dias_garantia: 30,
  observaciones: '',
  fecha_ingreso: '',
  fecha_entrega_estimada: '',
  repuestos: [],
  historial_estados: [],
  fotos_antes: [],
  fotos_despues: [],
  encuesta_calificacion: 0,
  encuesta_comentarios: '',
};

export default function ServiciosPage() {
  const { ordenes, isLoading, fetchOrdenes, createOrden, updateOrden, deleteOrden } = useOrdenesStore();
  const { clientes, fetchClientes } = useClientesStore();
  const { productos, fetchProductos, updateProducto } = useProductosStore();
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<OrdenServicio>({ ...emptyForm });
  const [activeTab, setActiveTab] = useState<'general' | 'equipo' | 'diagnostico' | 'presupuesto' | 'repuestos' | 'fotos' | 'entrega' | 'historial'>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchOrdenes();
    fetchClientes();
    fetchProductos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getNextNumero = () => {
    if (ordenes.length === 0) return 1;
    return Math.max(...ordenes.map((o: any) => o.numero)) + 1;
  };

  const openNew = () => {
    setEditingId(null);
    setFormData({
      ...emptyForm,
      id: crypto.randomUUID(),
      numero: getNextNumero(),
      fecha_ingreso: new Date().toISOString(),
    });
    setActiveTab('general');
    setShowOffcanvas(true);
  };

  const openEdit = (orden: OrdenServicio) => {
    setEditingId(orden.id);
    setFormData({ ...orden });
    setActiveTab('general');
    setShowOffcanvas(true);
  };

  const ajustarStockRepuestos = async (repuestosNuevos: RepuestoItem[], repuestosViejos: RepuestoItem[], estadoNuevo: string, estadoViejo: string) => {
    // Si se cancela, devolver todo
    if (estadoNuevo === 'cancelado' && estadoViejo !== 'cancelado') {
      for (const r of repuestosViejos) {
        const prod = (productos as any[]).find((p: any) => p.id === r.id_producto);
        if (prod) {
          await updateProducto(prod.id, { stock_actual: (prod.stock_actual || 0) + r.cantidad });
        }
      }
      return;
    }
    // Si se reactiva desde cancelado, descontar todo
    if (estadoViejo === 'cancelado' && estadoNuevo !== 'cancelado') {
      for (const r of repuestosNuevos) {
          const prod = (productos as any[]).find((p: any) => p.id === r.id_producto);
        if (prod && (prod.stock_actual || 0) >= r.cantidad) {
          await updateProducto(prod.id, { stock_actual: (prod.stock_actual || 0) - r.cantidad });
        } else if (prod) {
          toast.warning(`Stock insuficiente para ${prod.nombre}`);
        }
      }
      return;
    }
    // Edición normal: calcular diferencias
    const mapaViejos = new Map(repuestosViejos.map(r => [r.id_producto, r.cantidad]));
    const mapaNuevos = new Map(repuestosNuevos.map(r => [r.id_producto, r.cantidad]));
    const todosIds = new Set([...mapaViejos.keys(), ...mapaNuevos.keys()]);
    for (const id of todosIds) {
      const prod = (productos as any[]).find((p: any) => p.id === id);
      if (!prod) continue;
      const viejo = mapaViejos.get(id) || 0;
      const nuevo = mapaNuevos.get(id) || 0;
      const diff = viejo - nuevo; // positivo = devolver stock, negativo = descontar stock
      if (diff !== 0) {
        const nuevoStock = (prod.stock_actual || 0) + diff;
        if (nuevoStock < 0) {
          toast.warning(`Stock insuficiente para ${prod.nombre} (disponible: ${prod.stock_actual}, necesario: ${nuevo})`);
          continue;
        }
        await updateProducto(prod.id, { stock_actual: nuevoStock });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...formData };
      // Calcular total = mano de obra + repuestos
      const totalRepuestos = (payload.repuestos || []).reduce((sum: number, r: RepuestoItem) => sum + r.total, 0);
      payload.total = (payload.costo_mano_obra || 0) + totalRepuestos;

      if (editingId) {
        const ordenAnterior: any = ordenes.find((o: any) => o.id === editingId);
        if (ordenAnterior && ordenAnterior.estado !== payload.estado) {
          payload.historial_estados = [
            ...(ordenAnterior.historial_estados || []),
            { estado: payload.estado, fecha: new Date().toISOString(), observaciones: payload.observaciones || '' }
          ];
        }
        // Ajustar stock de repuestos
        await ajustarStockRepuestos(
          payload.repuestos,
          ordenAnterior?.repuestos || [],
          payload.estado,
          ordenAnterior?.estado || 'ingresado'
        );
        const result = await updateOrden(editingId, payload);
        if (result.success) {
          toast.success('Orden actualizada correctamente');
        } else {
          toast.error('Error al actualizar la orden');
        }
      } else {
        payload.historial_estados = [
          { estado: payload.estado, fecha: new Date().toISOString(), observaciones: 'Orden creada' }
        ];
        // Descontar stock de repuestos al crear
        for (const r of payload.repuestos) {
        const prod = (productos as any[]).find((p: any) => p.id === r.id_producto);
          if (prod && (prod.stock_actual || 0) >= r.cantidad) {
            await updateProducto(prod.id, { stock_actual: (prod.stock_actual || 0) - r.cantidad });
          } else if (prod) {
            toast.warning(`Stock insuficiente para ${prod.nombre}`);
          }
        }
        const result = await createOrden(payload);
        if (result.success) {
          toast.success('Orden creada correctamente');
        } else {
          toast.error('Error al crear la orden');
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
    if (confirm('¿Eliminar esta orden de servicio?')) {
      const result = await deleteOrden(id);
      if (result.success) {
        toast.success('Orden eliminada correctamente');
      } else {
        toast.error('Error al eliminar la orden');
      }
    }
  };

  const filtered = ordenes.filter((o: any) =>
    String(o.numero).includes(searchTerm) ||
    (o.cliente_nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (o.producto_marca?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (o.producto_modelo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (o.producto_numero_serie?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const clienteOptions = [
    { value: '', label: 'Seleccionar cliente...' },
    ...clientes.map((c: any) => ({
      value: c.id,
      label: c.tipo_persona === 'fisica'
        ? `${c.apellido || ''}, ${c.nombre || ''}`.trim()
        : c.razon_social || 'Sin nombre',
      searchText: `${c.cuil_cuit || ''} ${c.telefono || ''} ${c.email || ''}`,
    }))
  ];

  const estadoOptions = ESTADOS.map(e => ({ value: e.value, label: e.label }));

  const getEstadoBadge = (estado: string) => {
    const e = ESTADOS.find(x => x.value === estado);
    return e ? e.color : 'bg-gray-100 text-gray-800';
  };

  const getEstadoLabel = (estado: string) => {
    const e = ESTADOS.find(x => x.value === estado);
    return e ? e.label : estado;
  };

  const addRepuesto = (productoId: string) => {
    const prod: any = (productos as any[]).find((p: any) => p.id === productoId);
    if (!prod) return;
    const exists = formData.repuestos.find((r: RepuestoItem) => r.id_producto === productoId);
    if (exists) {
      setFormData(prev => ({
        ...prev,
        repuestos: prev.repuestos.map(r => r.id_producto === productoId ? { ...r, cantidad: r.cantidad + 1, total: (r.cantidad + 1) * r.precio } : r)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        repuestos: [...prev.repuestos, { id_producto: prod.id, nombre: prod.nombre, cantidad: 1, precio: prod.precio_venta || 0, total: prod.precio_venta || 0 }]
      }));
    }
  };

  const updateRepuestoQty = (index: number, qty: number) => {
    if (qty < 1) return;
    setFormData(prev => ({
      ...prev,
      repuestos: prev.repuestos.map((r, idx) => idx === index ? { ...r, cantidad: qty, total: qty * r.precio } : r)
    }));
  };

  const removeRepuesto = (index: number) => {
    setFormData(prev => ({ ...prev, repuestos: prev.repuestos.filter((_, idx) => idx !== index) }));
  };

  const handleFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const addFoto = async (tipo: 'antes' | 'despues', file: File) => {
    try {
      const base64 = await handleFileToBase64(file);
      const key = tipo === 'antes' ? 'fotos_antes' : 'fotos_despues';
      setFormData(prev => ({ ...prev, [key]: [...(prev as any)[key], base64] }));
    } catch {
      toast.error('Error al cargar la imagen');
    }
  };

  const removeFoto = (tipo: 'antes' | 'despues', index: number) => {
    const key = tipo === 'antes' ? 'fotos_antes' : 'fotos_despues';
    setFormData(prev => ({ ...prev, [key]: (prev as any)[key].filter((_: any, i: number) => i !== index) }));
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-end mb-6">\n        <button
          onClick={openNew}
          className="bg-orange-600 text-white px-4 py-2 rounded-2xl hover:bg-orange-700 transition-colors flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Nueva Orden de Servicio</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Total Órdenes</p>
          <p className="text-2xl font-bold">{ordenes.length}</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Pendientes</p>
          <p className="text-2xl font-bold">{ordenes.filter((o: any) => ['ingresado','en_revision','presupuestado','esperando_aprobacion','esperando_repuesto'].includes(o.estado)).length}</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">En Reparación</p>
          <p className="text-2xl font-bold">{ordenes.filter((o: any) => ['aprobado','en_reparacion'].includes(o.estado)).length}</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Entregados</p>
          <p className="text-2xl font-bold">{ordenes.filter((o: any) => o.estado === 'entregado').length}</p>
        </div>
      </div>

      {/* Buscador */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por número, cliente, marca, modelo, serie..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-10 bg-white border-none rounded-2xl shadow-sm px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
          />
          <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
        </div>
      </div>

      {/* Tabla */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <p className="mt-2 text-gray-500">Cargando órdenes...</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">N° OT</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Equipo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Falla</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Ingreso</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-4xl mb-2">🔧</div>
                      <p className="text-gray-500 mb-1">No hay órdenes de servicio</p>
                      <p className="text-sm text-gray-400">Hacé clic en "Nueva Orden de Servicio" para crear una</p>
                    </td>
                  </tr>
                ) : filtered.map((o: any) => (
                  <tr key={o.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-mono font-bold text-gray-900">#{o.numero}</div>
                      {o.presupuesto_aprobado && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
                          ✅ Aprobado
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{o.cliente_nombre || '-'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{o.producto_marca} {o.producto_modelo}</div>
                      <div className="text-xs text-gray-500">{o.producto_numero_serie || 'Sin serie'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-700 max-w-xs truncate">{o.producto_falla || '-'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoBadge(o.estado)}`}>
                        {getEstadoLabel(o.estado)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-700">
                        {o.fecha_ingreso ? new Date(o.fecha_ingreso).toLocaleDateString() : '-'}
                      </div>
                      {o.fecha_entrega_estimada && (
                        <div className="text-xs text-gray-500">
                          Est: {new Date(o.fecha_entrega_estimada).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => openEdit(o)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-2xl transition-colors"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <TicketPrint
                          data={{
                            titulo: 'ORDEN DE SERVICIO TECNICO',
                            numero: `OT-${o.numero}`,
                            fecha: o.fecha_ingreso,
                            cliente: o.cliente_nombre,
                            items: [
                              { nombre: `${o.producto_marca} ${o.producto_modelo}`, cantidad: 1, precio: o.total, total: o.total }
                            ],
                            total: o.total,
                            observaciones: `Falla: ${o.producto_falla || '-'} | Estado: ${getEstadoLabel(o.estado)}`,
                            pie: 'Gracias por confiar en nosotros.',
                          }}
                          buttonLabel="🖨️"
                          buttonClassName="p-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm"
                        />
                        <button
                          onClick={() => handleDelete(o.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-2xl transition-colors"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
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
        title={editingId ? `Editar Orden #${formData.numero}` : 'Nueva Orden de Servicio'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tabs */}
          <div className="border-b">
            <nav className="flex space-x-6 overflow-x-auto">
              {(['general', 'equipo', 'diagnostico', 'presupuesto', 'repuestos', 'fotos', 'entrega', 'historial'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab === 'general' && 'General'}
                  {tab === 'equipo' && 'Equipo'}
                  {tab === 'diagnostico' && 'Diagnóstico'}
                  {tab === 'presupuesto' && 'Presupuesto'}
                  {tab === 'repuestos' && 'Repuestos'}
                  {tab === 'fotos' && 'Fotos'}
                  {tab === 'entrega' && 'Entrega'}
                  {tab === 'historial' && 'Historial'}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab General */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">N° Orden</label>
                  <input
                    type="text"
                    value={formData.numero}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Ingreso</label>
                  <input
                    type="datetime-local"
                    value={formData.fecha_ingreso ? new Date(formData.fecha_ingreso).toISOString().slice(0, 16) : ''}
                    onChange={e => setFormData({...formData, fecha_ingreso: new Date(e.target.value).toISOString()})}
                    className="w-full px-3 py-2 bg-white border-none rounded-2xl shadow-sm px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                  />
                </div>
              </div>

              <SelectSearch
                label="Cliente *"
                value={formData.id_cliente}
                onChange={(value) => {
                  const cliente = (clientes as any[]).find((c: any) => c.id === value);
                  setFormData({
                    ...formData,
                    id_cliente: value,
                    cliente_nombre: cliente
                      ? (cliente.tipo_persona === 'fisica'
                          ? `${cliente.apellido || ''}, ${cliente.nombre || ''}`.trim()
                          : cliente.razon_social || '')
                      : ''
                  });
                }}
                options={clienteOptions}
                required
              />

              <SelectSearch
                label="Estado"
                value={formData.estado}
                onChange={(value) => setFormData({...formData, estado: value})}
                options={estadoOptions}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Técnico Asignado</label>
                <input
                  type="text"
                  value={formData.tecnico}
                  onChange={e => setFormData({...formData, tecnico: e.target.value})}
                  className="w-full px-3 py-2 bg-white border-none rounded-2xl shadow-sm px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                  placeholder="Nombre del técnico"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Estimada de Entrega</label>
                <input
                  type="date"
                  value={formData.fecha_entrega_estimada ? formData.fecha_entrega_estimada.slice(0, 10) : ''}
                  onChange={e => setFormData({...formData, fecha_entrega_estimada: e.target.value})}
                  className="w-full px-3 py-2 bg-white border-none rounded-2xl shadow-sm px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones Generales</label>
                <textarea
                  value={formData.observaciones}
                  onChange={e => setFormData({...formData, observaciones: e.target.value})}
                  className="w-full px-3 py-2 bg-white border-none rounded-2xl shadow-sm px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                  rows={3}
                  placeholder="Notas internas de la orden..."
                />
              </div>
            </div>
          )}

          {/* Tab Equipo */}
          {activeTab === 'equipo' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                  <input
                    type="text"
                    value={formData.producto_marca}
                    onChange={e => setFormData({...formData, producto_marca: e.target.value})}
                    className="w-full px-3 py-2 bg-white border-none rounded-2xl shadow-sm px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                    placeholder="Ej: Samsung, Ford, Bosch"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                  <input
                    type="text"
                    value={formData.producto_modelo}
                    onChange={e => setFormData({...formData, producto_modelo: e.target.value})}
                    className="w-full px-3 py-2 bg-white border-none rounded-2xl shadow-sm px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                    placeholder="Ej: Galaxy S21, Focus, GWS 7-115"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">N° de Serie</label>
                  <input
                    type="text"
                    value={formData.producto_numero_serie}
                    onChange={e => setFormData({...formData, producto_numero_serie: e.target.value})}
                    className="w-full px-3 py-2 bg-white border-none rounded-2xl shadow-sm px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                    placeholder="Número de serie o IMEI"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <input
                    type="text"
                    value={formData.producto_color}
                    onChange={e => setFormData({...formData, producto_color: e.target.value})}
                    className="w-full px-3 py-2 bg-white border-none rounded-2xl shadow-sm px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                    placeholder="Ej: Negro, Rojo, Plateado"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Accesorios Entregados</label>
                <textarea
                  value={formData.producto_accesorios}
                  onChange={e => setFormData({...formData, producto_accesorios: e.target.value})}
                  className="w-full px-3 py-2 bg-white border-none rounded-2xl shadow-sm px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                  rows={2}
                  placeholder="Cargador, funda, batería, control remoto..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Falla Reportada *</label>
                <textarea
                  value={formData.producto_falla}
                  onChange={e => setFormData({...formData, producto_falla: e.target.value})}
                  className="w-full px-3 py-2 bg-white border-none rounded-2xl shadow-sm px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                  rows={3}
                  placeholder="Descripción de la falla según el cliente"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones del Equipo</label>
                <textarea
                  value={formData.producto_observaciones}
                  onChange={e => setFormData({...formData, producto_observaciones: e.target.value})}
                  className="w-full px-3 py-2 bg-white border-none rounded-2xl shadow-sm px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                  rows={2}
                  placeholder="Estado físico, rayones, golpes, etc."
                />
              </div>
            </div>
          )}

          {/* Tab Diagnóstico */}
          {activeTab === 'diagnostico' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Diagnóstico Técnico</label>
                <textarea
                  value={formData.diagnostico}
                  onChange={e => setFormData({...formData, diagnostico: e.target.value})}
                  className="w-full px-3 py-2 bg-white border-none rounded-2xl shadow-sm px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                  rows={4}
                  placeholder="Descripción del diagnóstico realizado..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trabajo Realizado</label>
                <textarea
                  value={formData.trabajo_realizado}
                  onChange={e => setFormData({...formData, trabajo_realizado: e.target.value})}
                  className="w-full px-3 py-2 bg-white border-none rounded-2xl shadow-sm px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                  rows={4}
                  placeholder="Detalle de las tareas ejecutadas..."
                />
              </div>
            </div>
          )}

          {/* Tab Presupuesto */}
          {activeTab === 'presupuesto' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 p-4 bg-white rounded-2xl shadow-sm">
                <input
                  type="checkbox"
                  id="presupuesto_aprobado"
                  checked={formData.presupuesto_aprobado}
                  onChange={e => setFormData({...formData, presupuesto_aprobado: e.target.checked})}
                  className="w-5 h-5 text-green-600 rounded"
                />
                <label htmlFor="presupuesto_aprobado" className="text-sm font-medium text-green-800">
                  Presupuesto Aprobado por el Cliente
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Costo Mano de Obra ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costo_mano_obra}
                    onChange={e => setFormData({...formData, costo_mano_obra: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 bg-white border-none rounded-2xl shadow-sm px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.total}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">Se calcula automáticamente: Mano de Obra + Repuestos</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 p-4 bg-white rounded-2xl shadow-sm">
                <input
                  type="checkbox"
                  id="tiene_garantia"
                  checked={formData.tiene_garantia}
                  onChange={e => setFormData({...formData, tiene_garantia: e.target.checked})}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <label htmlFor="tiene_garantia" className="text-sm font-medium text-blue-800">
                  Aplica Garantía del Servicio
                </label>
              </div>

              {formData.tiene_garantia && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Días de Garantía</label>
                  <input
                    type="number"
                    value={formData.dias_garantia}
                    onChange={e => setFormData({...formData, dias_garantia: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 bg-white border-none rounded-2xl shadow-sm px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                  />
                </div>
              )}
            </div>
          )}

          {/* Tab Repuestos */}
          {activeTab === 'repuestos' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agregar Producto</label>
                <SelectSearch
                  options={productos.map((p: any) => ({ value: p.id, label: `${p.nombre} - $${p.precio_venta || 0}` }))}
                  value=""
                  onChange={v => { if (v) addRepuesto(v); }}
                  placeholder="Buscar producto..."
                />
              </div>

              {formData.repuestos.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50/50"><tr><th className="px-3 py-2 text-left">Producto</th><th className="px-3 py-2 text-center">Cant</th><th className="px-3 py-2 text-right">Precio</th><th className="px-3 py-2 text-right">Total</th><th className="px-3 py-2"></th></tr></thead>
                    <tbody>
                      {formData.repuestos.map((item, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="px-3 py-2">{item.nombre}</td>
                          <td className="px-3 py-2 text-center"><input type="number" min={1} value={item.cantidad} onChange={e => updateRepuestoQty(idx, parseInt(e.target.value) || 1)} className="w-16 text-center border rounded" /></td>
                          <td className="px-3 py-2 text-right">${item.precio.toFixed(2)}</td>
                          <td className="px-3 py-2 text-right font-medium">${item.total.toFixed(2)}</td>
                          <td className="px-3 py-2 text-center"><button type="button" onClick={() => removeRepuesto(idx)} className="text-red-500 hover:text-red-700">✕</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex justify-between items-center p-3 bg-white rounded-2xl shadow-sm">
                <span className="text-sm text-gray-600">Total repuestos:</span>
                <span className="font-bold text-orange-700">${formData.repuestos.reduce((sum, r) => sum + r.total, 0).toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Tab Fotos */}
          {activeTab === 'fotos' && (
            <div className="space-y-6">
              {/* Fotos Antes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fotos Antes del Servicio</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={e => {
                    if (e.target.files) {
                      Array.from(e.target.files).forEach(f => addFoto('antes', f));
                      e.target.value = '';
                    }
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                />
                {formData.fotos_antes.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {formData.fotos_antes.map((foto, idx) => (
                      <div key={idx} className="relative group">
                        <img src={foto} alt={`Antes ${idx + 1}`} className="w-full h-24 object-cover rounded-lg border" />
                        <button
                          type="button"
                          onClick={() => removeFoto('antes', idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Fotos Después */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fotos Después del Servicio</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={e => {
                    if (e.target.files) {
                      Array.from(e.target.files).forEach(f => addFoto('despues', f));
                      e.target.value = '';
                    }
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                {formData.fotos_despues.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {formData.fotos_despues.map((foto, idx) => (
                      <div key={idx} className="relative group">
                        <img src={foto} alt={`Después ${idx + 1}`} className="w-full h-24 object-cover rounded-lg border" />
                        <button
                          type="button"
                          onClick={() => removeFoto('despues', idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab Entrega */}
          {activeTab === 'entrega' && (
            <div className="space-y-4">
              {formData.estado === 'entregado' ? (
                <>
                  <div className="p-4 bg-white rounded-2xl shadow-sm">
                    <h4 className="font-medium text-green-800 mb-2">Encuesta de Satisfacción</h4>
                    <p className="text-sm text-green-700 mb-3">¿Cómo calificaría el servicio recibido?</p>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, encuesta_calificacion: star }))}
                          className={`text-2xl transition-colors ${star <= formData.encuesta_calificacion ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.encuesta_calificacion > 0 ? `${formData.encuesta_calificacion} estrella${formData.encuesta_calificacion > 1 ? 's' : ''}` : 'Sin calificar'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comentarios del Cliente</label>
                    <textarea
                      value={formData.encuesta_comentarios}
                      onChange={e => setFormData({...formData, encuesta_comentarios: e.target.value})}
                      className="w-full px-3 py-2 bg-white border-none rounded-2xl shadow-sm px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                      rows={4}
                      placeholder="Comentarios, sugerencias o reclamos..."
                    />
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📋</div>
                  <p>La encuesta de satisfacción estará disponible cuando el estado sea <strong>Entregado</strong>.</p>
                </div>
              )}
            </div>
          )}

          {/* Tab Historial */}
          {activeTab === 'historial' && (
            <div className="space-y-4">
              {formData.historial_estados.length === 0 ? (
                <div className="text-center py-8 text-gray-400">No hay cambios de estado registrados.</div>
              ) : (
                <div className="space-y-3">
                  {formData.historial_estados.map((h, idx) => (
                    <div key={idx} className="flex items-start space-x-3 p-3 bg-white rounded-2xl shadow-sm">
                      <div className="mt-1 w-2 h-2 rounded-full bg-orange-500 flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-sm">{getEstadoLabel(h.estado)}</span>
                          <span className="text-xs text-gray-500">{new Date(h.fecha).toLocaleString('es-AR')}</span>
                        </div>
                        {h.observaciones && <p className="text-xs text-gray-600 mt-1">{h.observaciones}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer */}
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
              className="px-4 py-2 bg-orange-600 text-white rounded-2xl hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting 
                ? (editingId ? '💾 Guardando...' : '💾 Creando...') 
                : (editingId ? '💾 Guardar Cambios' : '💾 Crear Orden')
              }
            </button>
          </div>
        </form>
      </Offcanvas>
    </div>
  );
}
