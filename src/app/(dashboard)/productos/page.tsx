'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import Offcanvas from '@/components/Offcanvas';
import SelectSearch from '@/components/SelectSearch';
import { useProductosStore, useProveedoresStore, useCategoriasStore, useMarcasStore, uploadProductoImagen, deleteProductoImagen } from '@/lib/supabase';
import { formatPriceConfig } from '@/lib/format';
import { Image, X, Upload } from 'lucide-react';

interface Producto {
  id: string;
  codigo: string;
  codigo_barra: string;
  nombre: string;
  descripcion: string;
  descripcion_corta: string;
  id_categoria: string;
  id_marca: string;
  id_proveedor: string;
  id_unidad: string;
  precio_costo: number;
  precio_venta: number;
  precio_mayorista: number;
  precio_promocion: number;
  precio_lista_2: number;
  precio_lista_3: number;
  precio_minimo_venta: number;
  iva_porcentaje: number;
  impuestos_internos: number;
  stock_actual: number;
  stock_minimo: number;
  stock_maximo: number;
  stock_comprometido: number;
  stock_en_pedido: number;
  punto_reposicion: number;
  peso: number;
  volumen: number;
  es_insumo: boolean;
  es_servicio: boolean;
  es_kit: boolean;
  es_compuesto: boolean;
  requiere_envase: boolean;
  controla_stock: boolean;
  es_publicable_web: boolean;
  destacado_web: boolean;
  disponible_online: boolean;
  codigo_proveedor: string;
  tiempo_reposicion: number;
  ubicacion_deposito: string;
  observaciones: string;
  fecha_alta: string;
  imagenes: string;
}

const emptyForm: Producto = {
  id: '',
  codigo: '',
  codigo_barra: '',
  nombre: '',
  descripcion: '',
  descripcion_corta: '',
  id_categoria: '',
  id_marca: '',
  id_proveedor: '',
  id_unidad: '',
  precio_costo: 0,
  precio_venta: 0,
  precio_mayorista: 0,
  precio_promocion: 0,
  precio_lista_2: 0,
  precio_lista_3: 0,
  precio_minimo_venta: 0,
  iva_porcentaje: 21,
  impuestos_internos: 0,
  stock_actual: 0,
  stock_minimo: 5,
  stock_maximo: 0,
  stock_comprometido: 0,
  stock_en_pedido: 0,
  punto_reposicion: 0,
  peso: 0,
  volumen: 0,
  es_insumo: false,
  es_servicio: false,
  es_kit: false,
  es_compuesto: false,
  requiere_envase: false,
  controla_stock: true,
  es_publicable_web: true,
  destacado_web: false,
  disponible_online: true,
  codigo_proveedor: '',
  tiempo_reposicion: 0,
  ubicacion_deposito: '',
  observaciones: '',
  fecha_alta: '',
  imagenes: '[]'
};

export default function ProductosPage() {
  const { productos, isLoading, fetchProductos, createProducto, updateProducto, deleteProducto } = useProductosStore();
  const { proveedores, fetchProveedores } = useProveedoresStore();
  const { categorias, fetchCategorias } = useCategoriasStore();
  const { marcas, fetchMarcas } = useMarcasStore();
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Producto>({ ...emptyForm });
  const [activeTab, setActiveTab] = useState<'general' | 'precios' | 'stock' | 'avanzado' | 'imagenes'>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProductos();
    fetchProveedores();
    fetchCategorias();
    fetchMarcas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openNew = () => {
    setEditingId(null);
    setFormData({ ...emptyForm, id: crypto.randomUUID(), fecha_alta: new Date().toISOString() });
    setImagenes([]);
    setActiveTab('general');
    setShowOffcanvas(true);
  };

  const openEdit = (producto: Producto) => {
    setEditingId(producto.id);
    const sanitized: any = {};
    for (const key of Object.keys(emptyForm)) {
      const val = (producto as any)[key];
      sanitized[key] = val === null || val === undefined ? emptyForm[key as keyof Producto] : val;
    }
    setFormData(sanitized);
    const imgs = producto.imagenes ? (typeof producto.imagenes === 'string' ? JSON.parse(producto.imagenes) : producto.imagenes) : [];
    setImagenes(Array.isArray(imgs) ? imgs : []);
    setActiveTab('general');
    setShowOffcanvas(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...formData, imagenes: JSON.stringify(imagenes) };
      if (editingId) {
        const result = await updateProducto(editingId, payload);
        if (result.success) {
          toast.success('Producto actualizado correctamente');
        } else {
          toast.error('Error al actualizar el producto');
        }
      } else {
        const result = await createProducto(payload);
        if (result.success) {
          toast.success('Producto creado correctamente');
        } else {
          toast.error('Error al crear el producto');
        }
      }
      setShowOffcanvas(false);
    } catch {
      toast.error('Ocurrió un error inesperado');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (!editingId) {
      toast.error('Primero guardá el producto para poder subir imágenes');
      return;
    }
    setUploadingImages(true);
    const newUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} supera los 5MB`);
        continue;
      }
      const url = await uploadProductoImagen(file, editingId);
      if (url) {
        newUrls.push(url);
      } else {
        toast.error(`Error al subir ${file.name}`);
      }
    }
    if (newUrls.length > 0) {
      setImagenes(prev => [...prev, ...newUrls]);
      toast.success(`${newUrls.length} imagen(es) subida(s)`);
    }
    setUploadingImages(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [editingId]);

  const removeImage = useCallback(async (index: number) => {
    const url = imagenes[index];
    if (url && url.includes('supabase.co')) {
      await deleteProductoImagen(url);
    }
    setImagenes(prev => prev.filter((_, i) => i !== index));
  }, [imagenes]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    if (!editingId) {
      toast.error('Primero guardá el producto para poder subir imágenes');
      return;
    }
    setUploadingImages(true);
    const newUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} supera los 5MB`);
        continue;
      }
      const url = await uploadProductoImagen(file, editingId);
      if (url) {
        newUrls.push(url);
      } else {
        toast.error(`Error al subir ${file.name}`);
      }
    }
    if (newUrls.length > 0) {
      setImagenes(prev => [...prev, ...newUrls]);
      toast.success(`${newUrls.length} imagen(es) subida(s)`);
    }
    setUploadingImages(false);
  }, [editingId]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este producto?')) {
      const result = await deleteProducto(id);
      if (result.success) {
        toast.success('Producto eliminado correctamente');
      } else {
        toast.error('Error al eliminar el producto');
      }
    }
  };

  const getImagenes = (p: any): string[] => {
    if (!p) return [];
    if (p.imagenes) {
      try {
        const parsed = typeof p.imagenes === 'string' ? JSON.parse(p.imagenes) : p.imagenes;
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return [];
  };

  const filtered = productos.filter((p: any) =>
    (p.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (p.codigo || '').includes(searchTerm) ||
    (p.codigo_barra || '').includes(searchTerm)
  );

  const proveedorOptions = [
    { value: '', label: 'Seleccionar proveedor...' },
    ...proveedores.map((p: any) => ({ value: p.id, label: p.razon_social || p.nombre, searchText: p.cuit }))
  ];

  const categoriaOptions = [
    { value: '', label: 'Seleccionar categoría...' },
    ...categorias.map((c: any) => ({ value: c.id, label: c.nombre }))
  ];

  const marcaOptions = [
    { value: '', label: 'Seleccionar marca...' },
    ...marcas.map((m: any) => ({ value: m.id, label: m.nombre }))
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex justify-end mb-6">
        <button 
          onClick={openNew} 
          className="bg-blue-600 text-white px-4 py-2 rounded-2xl hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Total Productos</p>
          <p className="text-2xl font-bold">{productos.length}</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Stock Bajo</p>
          <p className="text-2xl font-bold">{productos.filter((p: any) => p.stock_actual <= p.stock_minimo).length}</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">En Web</p>
          <p className="text-2xl font-bold">{productos.filter((p: any) => p.es_publicable_web).length}</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Servicios</p>
          <p className="text-2xl font-bold">{productos.filter((p: any) => p.es_servicio).length}</p>
        </div>
      </div>

      {/* Buscador */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nombre, código, código de barra..."
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
          <p className="mt-2 text-gray-500">Cargando productos...</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Imagen</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Producto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Código</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Precios</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Proveedor</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-4xl mb-2">📦</div>
                      <p className="text-gray-500 mb-1">No hay productos registrados</p>
                      <p className="text-sm text-gray-400">Hacé clic en "Nuevo Producto" para agregar uno</p>
                    </td>
                  </tr>
                ) : filtered.map((p: any) => {
                  const prov = (proveedores as any[]).find((pr: any) => pr.id === p.id_proveedor);
                  const imgs = getImagenes(p);
                  return (
                    <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        {imgs.length > 0 ? (
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                            <img src={imgs[0]} alt={p.nombre} className="w-full h-full object-cover" />
                            {imgs.length > 1 && (
                              <span className="absolute bottom-0 right-0 bg-black/60 text-white text-[9px] px-1 rounded-tl">
                                +{imgs.length - 1}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{p.nombre}</div>
                        <div className="text-sm text-gray-500">{p.descripcion}</div>
                        {p.es_publicable_web && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
                            🌐 Web
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-mono text-sm">{p.codigo || '-'}</div>
                        <div className="text-xs text-gray-500">{p.codigo_barra || ''}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{formatPriceConfig(p.precio_venta)}</div>
                        <div className="text-xs text-gray-500">Costo: {formatPriceConfig(p.precio_costo)}</div>
                        {p.precio_mayorista > 0 && (
                          <div className="text-xs text-blue-600">Mayorista: {formatPriceConfig(p.precio_mayorista)}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs ${
                          p.stock_actual <= p.stock_minimo 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {p.stock_actual} / min: {p.stock_minimo}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">{prov ? prov.razon_social || prov.nombre : '-'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center space-x-1">
                          <button onClick={() => openEdit(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-2xl transition-colors" title="Editar">✏️</button>
                          <button onClick={() => handleDelete(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-2xl transition-colors" title="Eliminar">🗑️</button>
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
        title={editingId ? 'Editar Producto' : 'Nuevo Producto'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tabs */}
          <div className="border-b">
            <nav className="flex space-x-8">
              {(['general', 'precios', 'stock', 'avanzado', 'imagenes'] as const).map((tab) => (
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
                  {tab === 'precios' && 'Precios'}
                  {tab === 'stock' && 'Stock'}
                  {tab === 'avanzado' && 'Avanzado'}
                  {tab === 'imagenes' && 'Imágenes'}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab General */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                  <input
                    type="text"
                    value={formData.codigo}
                    onChange={e => setFormData({...formData, codigo: e.target.value})}
                    className="w-full px-3 py-2 bg-white border-none rounded-2xl shadow-sm px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                    placeholder="Ej: PROD-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código de Barra</label>
                  <input
                    type="text"
                    value={formData.codigo_barra}
                    onChange={e => setFormData({...formData, codigo_barra: e.target.value})}
                    className="w-full px-3 py-2 bg-white border-none rounded-2xl shadow-sm px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                    placeholder="Ej: 7791234567890"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={e => setFormData({...formData, nombre: e.target.value})}
                  className="w-full px-3 py-2 bg-white border-none rounded-2xl shadow-sm px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={e => setFormData({...formData, descripcion: e.target.value})}
                  className="w-full px-3 py-2 bg-white border-none rounded-2xl shadow-sm px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <SelectSearch
                  label="Categoría"
                  value={formData.id_categoria}
                  onChange={(value) => setFormData({...formData, id_categoria: value})}
                  options={categoriaOptions}
                />
                <SelectSearch
                  label="Marca"
                  value={formData.id_marca}
                  onChange={(value) => setFormData({...formData, id_marca: value})}
                  options={marcaOptions}
                />
              </div>

              <SelectSearch
                label="Proveedor"
                value={formData.id_proveedor}
                onChange={(value) => setFormData({...formData, id_proveedor: value})}
                options={proveedorOptions}
              />

              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" checked={formData.es_servicio} onChange={e => setFormData({...formData, es_servicio: e.target.checked})} className="w-4 h-4" />
                  <span className="text-sm">Es Servicio</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" checked={formData.es_insumo} onChange={e => setFormData({...formData, es_insumo: e.target.checked})} className="w-4 h-4" />
                  <span className="text-sm">Es Insumo</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" checked={formData.es_publicable_web} onChange={e => setFormData({...formData, es_publicable_web: e.target.checked})} className="w-4 h-4" />
                  <span className="text-sm">Publicar en Web</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                <textarea
                  value={formData.observaciones}
                  onChange={e => setFormData({...formData, observaciones: e.target.value})}
                  className="w-full px-3 py-2 bg-white border-none rounded-2xl shadow-sm px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Tab Precios */}
          {activeTab === 'precios' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio Costo</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.precio_costo}
                    onChange={e => setFormData({...formData, precio_costo: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 bg-white border-none rounded-2xl shadow-sm px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio Venta *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.precio_venta}
                    onChange={e => setFormData({...formData, precio_venta: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 bg-white border-none rounded-2xl shadow-sm px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio Mayorista</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.precio_mayorista}
                    onChange={e => setFormData({...formData, precio_mayorista: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 bg-white border-none rounded-2xl shadow-sm px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IVA (%)</label>
                <input
                  type="number"
                  value={formData.iva_porcentaje}
                  onChange={e => setFormData({...formData, iva_porcentaje: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-white border-none rounded-2xl shadow-sm px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  placeholder="21"
                />
              </div>
            </div>
          )}

          {/* Tab Stock */}
          {activeTab === 'stock' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Actual</label>
                  <input
                    type="number"
                    value={formData.stock_actual}
                    onChange={e => setFormData({...formData, stock_actual: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 bg-white border-none rounded-2xl shadow-sm px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo</label>
                  <input
                    type="number"
                    value={formData.stock_minimo}
                    onChange={e => setFormData({...formData, stock_minimo: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 bg-white border-none rounded-2xl shadow-sm px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Máximo</label>
                  <input
                    type="number"
                    value={formData.stock_maximo}
                    onChange={e => setFormData({...formData, stock_maximo: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 bg-white border-none rounded-2xl shadow-sm px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Comprometido</label>
                  <input type="number" value={formData.stock_comprometido} onChange={e => setFormData({...formData, stock_comprometido: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock en Pedido</label>
                  <input type="number" value={formData.stock_en_pedido} onChange={e => setFormData({...formData, stock_en_pedido: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Punto Reposición</label>
                  <input type="number" value={formData.punto_reposicion} onChange={e => setFormData({...formData, punto_reposicion: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" checked={formData.controla_stock} onChange={e => setFormData({...formData, controla_stock: e.target.checked})} className="w-4 h-4" />
                  <span className="text-sm">Controlar Stock</span>
                </label>
              </div>
            </div>
          )}

          {/* Tab Avanzado */}
          {activeTab === 'avanzado' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción Corta</label>
                <input type="text" value={formData.descripcion_corta} onChange={e => setFormData({...formData, descripcion_corta: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500" placeholder="Máx 100 caracteres para web" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Precio Promoción</label><input type="number" step="0.01" value={formData.precio_promocion} onChange={e => setFormData({...formData, precio_promocion: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Precio Mínimo Venta</label><input type="number" step="0.01" value={formData.precio_minimo_venta} onChange={e => setFormData({...formData, precio_minimo_venta: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Precio Lista 2</label><input type="number" step="0.01" value={formData.precio_lista_2} onChange={e => setFormData({...formData, precio_lista_2: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Precio Lista 3</label><input type="number" step="0.01" value={formData.precio_lista_3} onChange={e => setFormData({...formData, precio_lista_3: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500" /></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Impuestos Internos</label><input type="number" step="0.01" value={formData.impuestos_internos} onChange={e => setFormData({...formData, impuestos_internos: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Tiempo Reposición (días)</label><input type="number" value={formData.tiempo_reposicion} onChange={e => setFormData({...formData, tiempo_reposicion: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500" /></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label><input type="number" step="0.01" value={formData.peso} onChange={e => setFormData({...formData, peso: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Volumen (m³)</label><input type="number" step="0.01" value={formData.volumen} onChange={e => setFormData({...formData, volumen: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500" /></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Código Proveedor</label><input type="text" value={formData.codigo_proveedor} onChange={e => setFormData({...formData, codigo_proveedor: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Ubicación Depósito</label><input type="text" value={formData.ubicacion_deposito} onChange={e => setFormData({...formData, ubicacion_deposito: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500" placeholder="Ej: Estante A-3" /></div>
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" checked={formData.es_kit} onChange={e => setFormData({...formData, es_kit: e.target.checked})} className="w-4 h-4" /><span className="text-sm">Es Kit</span></label>
                <label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" checked={formData.es_compuesto} onChange={e => setFormData({...formData, es_compuesto: e.target.checked})} className="w-4 h-4" /><span className="text-sm">Es Compuesto</span></label>
                <label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" checked={formData.requiere_envase} onChange={e => setFormData({...formData, requiere_envase: e.target.checked})} className="w-4 h-4" /><span className="text-sm">Requiere Envase</span></label>
                <label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" checked={formData.destacado_web} onChange={e => setFormData({...formData, destacado_web: e.target.checked})} className="w-4 h-4" /><span className="text-sm">Destacado Web</span></label>
                <label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" checked={formData.disponible_online} onChange={e => setFormData({...formData, disponible_online: e.target.checked})} className="w-4 h-4" /><span className="text-sm">Disponible Online</span></label>
              </div>
            </div>
          )}

          {/* Tab Imágenes */}
          {activeTab === 'imagenes' && (
            <div className="space-y-4">
              {!editingId ? (
                <div className="text-center py-8 text-gray-500">
                  <Image className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Guardá el producto primero para poder subir imágenes</p>
                </div>
              ) : (
                <>
                  <div
                    className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                  >
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">Hacé clic o arrastrá imágenes aquí</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP, GIF (máx 5MB)</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>

                  {uploadingImages && (
                    <div className="text-center py-2 text-sm text-blue-600">
                      Subiendo imágenes...
                    </div>
                  )}

                  {imagenes.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {imagenes.map((url, index) => (
                        <div key={index} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-50">
                          <img
                            src={url}
                            alt={`Imagen ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          {index === 0 && (
                            <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-blue-500 text-white text-[10px] rounded">
                              Principal
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
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
              className="px-4 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting 
                ? (editingId ? '💾 Guardando...' : '💾 Creando...') 
                : (editingId ? '💾 Guardar Cambios' : '💾 Crear Producto')
              }
            </button>
          </div>
        </form>
      </Offcanvas>
    </div>
  );
}
