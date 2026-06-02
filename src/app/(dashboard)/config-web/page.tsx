'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Offcanvas from '@/components/Offcanvas';
import SelectSearch from '@/components/SelectSearch';
import { useWebConfigStore, usePromocionesStore, useUsuariosWebStore, usePedidosWebStore, useClientesStore } from '@/lib/supabase';
import { formatPriceConfig } from '@/lib/format';

const DIAS_SEMANA = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'] as const;
const DIAS_LABELS: Record<string, string> = { lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles', jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado', domingo: 'Domingo' };

const ESTADOS_PEDIDO = {
  pendiente: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  en_preparacion: { label: 'En preparación', color: 'bg-blue-100 text-blue-800' },
  listo: { label: 'Listo', color: 'bg-green-100 text-green-800' },
  entregado: { label: 'Entregado', color: 'bg-gray-100 text-gray-800' },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
};

export default function ConfigWebPage() {
  const { config, isLoading: configLoading, fetchConfig, updateConfig } = useWebConfigStore();
  const { promociones, isLoading: promoLoading, fetchPromociones, createPromocion, updatePromocion, deletePromocion } = usePromocionesStore();
  const { usuarios, isLoading: usuariosLoading, fetchUsuariosWeb, createUsuarioWeb, updateUsuarioWeb, deleteUsuarioWeb } = useUsuariosWebStore();
  const { pedidos, isLoading: pedidosLoading, fetchPedidosWeb, updatePedidoWeb } = usePedidosWebStore();
  const { clientes, fetchClientes } = useClientesStore();

  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState<any>({});
  const [horarios, setHorarios] = useState<any>({});
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [menuUrlCopied, setMenuUrlCopied] = useState(false);

  // Promociones
  const [showPromoOffcanvas, setShowPromoOffcanvas] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any>(null);
  const [promoForm, setPromoForm] = useState<any>({ titulo: '', descripcion: '', imagen_url: '', enlace_url: '', tipo: 'banner', fecha_desde: '', fecha_hasta: '', orden: 0 });

  // Usuarios web
  const [showUserOffcanvas, setShowUserOffcanvas] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userForm, setUserForm] = useState<any>({ id_cliente: '', email: '', username: '', password: '', nombre_completo: '', telefono: '', puede_comprar: true, puede_ver_historial: true, puede_ver_pedidos: true });

  // Pedidos web
  const [pedidoSearch, setPedidoSearch] = useState('');
  const [pedidoEstadoFilter, setPedidoEstadoFilter] = useState('');

  useEffect(() => {
    fetchConfig();
    fetchPromociones();
    fetchUsuariosWeb();
    fetchPedidosWeb();
    fetchClientes();
  }, []);

  useEffect(() => {
    if (config) {
      const c = config as any;
      setFormData({
        slug: c.slug || '',
        nombre_sitio: c.nombre_sitio || '',
        tagline: c.tagline || '',
        descripcion: c.descripcion || '',
        logo_url: c.logo_url || '',
        favicon_url: c.favicon_url || '',
        url_web: c.url_web || '',
        telefono: c.telefono || '',
        email: c.email || '',
        whatsapp: c.whatsapp || '',
        seo_titulo: c.seo_titulo || '',
        seo_descripcion: c.seo_descripcion || '',
      });
      const colores = typeof c.colores === 'string' ? JSON.parse(c.colores) : c.colores || {};
      setFormData((prev: any) => ({
        ...prev,
        color_primary: colores.primary || '#4f46e5',
        color_secondary: colores.secondary || '#7c3aed',
        color_background: colores.background || '#f5f5f7',
      }));
      const redes = typeof c.redes_sociales === 'string' ? JSON.parse(c.redes_sociales) : c.redes_sociales || {};
      setFormData((prev: any) => ({
        ...prev,
        facebook: redes.facebook || '',
        instagram: redes.instagram || '',
        twitter: redes.twitter || '',
        youtube: redes.youtube || '',
      }));
      const imgs = typeof c.hero_images === 'string' ? JSON.parse(c.hero_images) : c.hero_images || [];
      setHeroImages(imgs);
      const hrs = typeof c.horarios === 'string' ? JSON.parse(c.horarios) : c.horarios || {};
      setHorarios(hrs);
    }
  }, [config]);

  const handleSaveGeneral = async () => {
    const colores = { primary: formData.color_primary, secondary: formData.color_secondary, background: formData.color_background };
    const redes_sociales = { facebook: formData.facebook, instagram: formData.instagram, twitter: formData.twitter, youtube: formData.youtube };
    const result = await updateConfig({
      ...formData,
      colores: JSON.stringify(colores),
      redes_sociales: JSON.stringify(redes_sociales),
      hero_images: JSON.stringify(heroImages),
      horarios: JSON.stringify(horarios),
    });
    if (result.success) toast.success('Configuración guardada');
  };

  const addHeroImage = () => {
    if (newImageUrl.trim()) {
      setHeroImages([...heroImages, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const removeHeroImage = (idx: number) => {
    setHeroImages(heroImages.filter((_, i) => i !== idx));
  };

  const toggleHorario = (dia: string) => {
    setHorarios({ ...horarios, [dia]: { ...horarios[dia], abierto: !horarios[dia]?.abierto } });
  };

  const updateHorarioTime = (dia: string, field: string, value: string) => {
    setHorarios({ ...horarios, [dia]: { ...horarios[dia], [field]: value } });
  };

  // Promociones handlers
  const openNewPromo = () => {
    setEditingPromo(null);
    setPromoForm({ titulo: '', descripcion: '', imagen_url: '', enlace_url: '', tipo: 'banner', fecha_desde: '', fecha_hasta: '', orden: promociones.length });
    setShowPromoOffcanvas(true);
  };

  const openEditPromo = (p: any) => {
    setEditingPromo(p);
    setPromoForm({
      titulo: p.titulo || '',
      descripcion: p.descripcion || '',
      imagen_url: p.imagen_url || '',
      enlace_url: p.enlace_url || '',
      tipo: p.tipo || 'banner',
      fecha_desde: p.fecha_desde ? new Date(p.fecha_desde).toISOString().slice(0, 10) : '',
      fecha_hasta: p.fecha_hasta ? new Date(p.fecha_hasta).toISOString().slice(0, 10) : '',
      orden: p.orden || 0,
    });
    setShowPromoOffcanvas(true);
  };

  const handleSavePromo = async () => {
    if (!promoForm.titulo) { toast.error('El título es obligatorio'); return; }
    if (editingPromo) {
      await updatePromocion(editingPromo.id, promoForm);
      toast.success('Promoción actualizada');
    } else {
      await createPromocion(promoForm);
      toast.success('Promoción creada');
    }
    setShowPromoOffcanvas(false);
  };

  const handleDeletePromo = async (id: string) => {
    if (confirm('¿Eliminar esta promoción?')) {
      await deletePromocion(id);
      toast.success('Promoción eliminada');
    }
  };

  // Usuarios web handlers
  const openNewUser = () => {
    setEditingUser(null);
    setUserForm({ id_cliente: '', email: '', username: '', password: '', nombre_completo: '', telefono: '', puede_comprar: true, puede_ver_historial: true, puede_ver_pedidos: true });
    setShowUserOffcanvas(true);
  };

  const openEditUser = (u: any) => {
    setEditingUser(u);
    setUserForm({
      id_cliente: u.id_cliente || '',
      email: u.email || '',
      username: u.username || '',
      password: '',
      nombre_completo: u.nombre_completo || '',
      telefono: u.telefono || '',
      puede_comprar: u.puede_comprar !== false,
      puede_ver_historial: u.puede_ver_historial !== false,
      puede_ver_pedidos: u.puede_ver_pedidos !== false,
    });
    setShowUserOffcanvas(true);
  };

  const handleSaveUser = async () => {
    if (!userForm.username) { toast.error('El usuario es obligatorio'); return; }
    if (!editingUser && !userForm.password) { toast.error('La contraseña es obligatoria'); return; }
    if (editingUser) {
      await updateUsuarioWeb(editingUser.id, userForm);
      toast.success('Usuario actualizado');
    } else {
      await createUsuarioWeb(userForm);
      toast.success('Usuario creado');
    }
    setShowUserOffcanvas(false);
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('¿Eliminar este usuario web?')) {
      await deleteUsuarioWeb(id);
      toast.success('Usuario eliminado');
    }
  };

  const filteredPedidos = pedidos.filter((p: any) => {
    const matchEstado = !pedidoEstadoFilter || p.estado === pedidoEstadoFilter;
    const clienteNombre = p.clientes?.razon_social || `${p.clientes?.nombre || ''} ${p.clientes?.apellido || ''}`;
    const matchSearch = !pedidoSearch || p.numero?.toString().includes(pedidoSearch) || clienteNombre.toLowerCase().includes(pedidoSearch.toLowerCase());
    return matchEstado && matchSearch;
  });

  const tabs = [
    { id: 'general', label: '🌐 General' },
    { id: 'horarios', label: '🕐 Horarios' },
    { id: 'promociones', label: '🎯 Promociones' },
    { id: 'usuarios', label: '👥 Usuarios Web' },
    { id: 'pedidos', label: '📦 Pedidos Web' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Configuración Web</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* GENERAL TAB */}
      {activeTab === 'general' && (
        <div className="space-y-6 max-w-4xl">
          {/* Menu Online URL Card */}
          {(config as any)?.slug && (
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-6 shadow-sm text-white">
              <h2 className="text-lg font-semibold mb-2">🌐 Tu Menú Online</h2>
              <p className="text-sm text-white/80 mb-3">Compartí este enlace con tus clientes para que vean tu catálogo y hagan pedidos:</p>
              <div className="flex items-center gap-3">
                <code className="flex-1 bg-white/20 rounded-xl px-4 py-3 text-sm font-mono break-all">{`${typeof window !== 'undefined' ? window.location.origin : ''}/${(config as any).slug}/menu`}</code>
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(`${typeof window !== 'undefined' ? window.location.origin : ''}/${(config as any).slug}/menu`);
                    setMenuUrlCopied(true);
                    setTimeout(() => setMenuUrlCopied(false), 2000);
                  }}
                  className="px-4 py-3 bg-white text-purple-600 rounded-xl font-medium text-sm hover:bg-white/90 whitespace-nowrap"
                >
                  {menuUrlCopied ? '✅ Copiado' : '📋 Copiar'}
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Información del Sitio</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug del Menú</label>
                <input type="text" value={formData.slug || ''} onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" placeholder="mi-comercio" />
                <p className="text-xs text-gray-400 mt-1">Se usará en la URL: /<span className="font-mono">{formData.slug || 'mi-comercio'}</span>/menu</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Sitio</label>
                <input type="text" value={formData.nombre_sitio || ''} onChange={e => setFormData({...formData, nombre_sitio: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tagline / Eslogan</label>
                <input type="text" value={formData.tagline || ''} onChange={e => setFormData({...formData, tagline: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" placeholder="Tu taller de confianza" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea value={formData.descripcion || ''} onChange={e => setFormData({...formData, descripcion: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL del Sitio</label>
                <input type="url" value={formData.url_web || ''} onChange={e => setFormData({...formData, url_web: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" placeholder="https://tallerespro.com" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Imágenes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL del Logo</label>
                <input type="url" value={formData.logo_url || ''} onChange={e => setFormData({...formData, logo_url: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" placeholder="https://..." />
                {formData.logo_url && <img src={formData.logo_url} alt="Logo preview" className="mt-2 h-16 object-contain border rounded-lg p-2" />}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL del Favicon</label>
                <input type="url" value={formData.favicon_url || ''} onChange={e => setFormData({...formData, favicon_url: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" placeholder="https://..." />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Imágenes Hero / Portada</label>
              <div className="flex gap-2 mb-2">
                <input type="url" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} className="flex-1 px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" placeholder="https://..." />
                <button type="button" onClick={addHeroImage} className="px-4 py-2 bg-purple-600 text-white rounded-2xl hover:bg-purple-700">Agregar</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {heroImages.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img src={img} alt={`Hero ${idx + 1}`} className="h-20 w-32 object-cover rounded-lg border" />
                    <button onClick={() => removeHeroImage(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Colores del Tema</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color Primario</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={formData.color_primary || '#4f46e5'} onChange={e => setFormData({...formData, color_primary: e.target.value})} className="w-10 h-10 rounded-lg border cursor-pointer" />
                  <input type="text" value={formData.color_primary || '#4f46e5'} onChange={e => setFormData({...formData, color_primary: e.target.value})} className="flex-1 px-3 py-2 border border-gray-200 rounded-2xl" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color Secundario</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={formData.color_secondary || '#7c3aed'} onChange={e => setFormData({...formData, color_secondary: e.target.value})} className="w-10 h-10 rounded-lg border cursor-pointer" />
                  <input type="text" value={formData.color_secondary || '#7c3aed'} onChange={e => setFormData({...formData, color_secondary: e.target.value})} className="flex-1 px-3 py-2 border border-gray-200 rounded-2xl" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color de Fondo</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={formData.color_background || '#f5f5f7'} onChange={e => setFormData({...formData, color_background: e.target.value})} className="w-10 h-10 rounded-lg border cursor-pointer" />
                  <input type="text" value={formData.color_background || '#f5f5f7'} onChange={e => setFormData({...formData, color_background: e.target.value})} className="flex-1 px-3 py-2 border border-gray-200 rounded-2xl" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Contacto y Redes Sociales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input type="text" value={formData.telefono || ''} onChange={e => setFormData({...formData, telefono: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp (con código de país)</label>
                <input type="text" value={formData.whatsapp || ''} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl" placeholder="5491143215678" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
                <input type="url" value={formData.facebook || ''} onChange={e => setFormData({...formData, facebook: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
                <input type="url" value={formData.instagram || ''} onChange={e => setFormData({...formData, instagram: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Twitter / X URL</label>
                <input type="url" value={formData.twitter || ''} onChange={e => setFormData({...formData, twitter: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
                <input type="url" value={formData.youtube || ''} onChange={e => setFormData({...formData, youtube: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">SEO</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Título</label>
                <input type="text" value={formData.seo_titulo || ''} onChange={e => setFormData({...formData, seo_titulo: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl" placeholder="Talleres Pro - Repuestos y Servicio Técnico" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Descripción</label>
                <textarea value={formData.seo_descripcion || ''} onChange={e => setFormData({...formData, seo_descripcion: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl" rows={2} />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={handleSaveGeneral} className="px-6 py-3 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 font-medium">💾 Guardar Configuración</button>
          </div>
        </div>
      )}

      {/* HORARIOS TAB */}
      {activeTab === 'horarios' && (
        <div className="max-w-3xl">
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Horarios de Atención</h2>
            <div className="space-y-3">
              {DIAS_SEMANA.map(dia => (
                <div key={dia} className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl">
                  <button onClick={() => toggleHorario(dia)} className={`w-12 h-6 rounded-full transition-colors relative ${horarios[dia]?.abierto ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${horarios[dia]?.abierto ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                  <span className="w-24 font-medium">{DIAS_LABELS[dia]}</span>
                  {horarios[dia]?.abierto ? (
                    <div className="flex items-center gap-2">
                      <input type="time" value={horarios[dia]?.apertura || '08:00'} onChange={e => updateHorarioTime(dia, 'apertura', e.target.value)} className="px-2 py-1 border rounded-lg text-sm" />
                      <span className="text-gray-400">a</span>
                      <input type="time" value={horarios[dia]?.cierre || '18:00'} onChange={e => updateHorarioTime(dia, 'cierre', e.target.value)} className="px-2 py-1 border rounded-lg text-sm" />
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">Cerrado</span>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={handleSaveGeneral} className="px-6 py-3 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 font-medium">💾 Guardar Horarios</button>
            </div>
          </div>
        </div>
      )}

      {/* PROMOCIONES TAB */}
      {activeTab === 'promociones' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={openNewPromo} className="bg-purple-600 text-white px-4 py-2 rounded-2xl hover:bg-purple-700 flex items-center gap-2">
              <span>➕</span><span>Nueva Promoción</span>
            </button>
          </div>

          {promoLoading ? (
            <div className="text-center py-12"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {promociones.map((p: any) => (
                <div key={p.id} className="bg-white rounded-3xl shadow-sm overflow-hidden">
                  {p.imagen_url && <img src={p.imagen_url} alt={p.titulo} className="w-full h-40 object-cover" />}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{p.titulo}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${p.tipo === 'banner' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>{p.tipo}</span>
                    </div>
                    {p.descripcion && <p className="text-sm text-gray-500 mb-2">{p.descripcion}</p>}
                    {p.enlace_url && <p className="text-xs text-blue-500 mb-2 truncate">{p.enlace_url}</p>}
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Orden: {p.orden}</span>
                      <div className="flex gap-1">
                        <button onClick={() => openEditPromo(p)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">✏️</button>
                        <button onClick={() => handleDeletePromo(p.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">🗑️</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {promociones.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-400">No hay promociones configuradas</div>
              )}
            </div>
          )}

          <Offcanvas isOpen={showPromoOffcanvas} onClose={() => setShowPromoOffcanvas(false)} title={editingPromo ? 'Editar Promoción' : 'Nueva Promoción'} size="md">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input type="text" value={promoForm.titulo} onChange={e => setPromoForm({...promoForm, titulo: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea value={promoForm.descripcion} onChange={e => setPromoForm({...promoForm, descripcion: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl" rows={2} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de Imagen</label>
                <input type="url" value={promoForm.imagen_url} onChange={e => setPromoForm({...promoForm, imagen_url: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl" />
                {promoForm.imagen_url && <img src={promoForm.imagen_url} alt="Preview" className="mt-2 h-24 object-cover rounded-lg" />}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enlace / URL destino</label>
                <input type="url" value={promoForm.enlace_url} onChange={e => setPromoForm({...promoForm, enlace_url: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select value={promoForm.tipo} onChange={e => setPromoForm({...promoForm, tipo: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl">
                    <option value="banner">Banner</option>
                    <option value="promo">Promoción</option>
                    <option value="aviso">Aviso</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
                  <input type="number" value={promoForm.orden} onChange={e => setPromoForm({...promoForm, orden: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Desde</label>
                  <input type="date" value={promoForm.fecha_desde} onChange={e => setPromoForm({...promoForm, fecha_desde: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Hasta</label>
                  <input type="date" value={promoForm.fecha_hasta} onChange={e => setPromoForm({...promoForm, fecha_hasta: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowPromoOffcanvas(false)} className="px-4 py-2 border border-gray-300 rounded-2xl hover:bg-gray-50">Cancelar</button>
                <button onClick={handleSavePromo} className="px-4 py-2 bg-purple-600 text-white rounded-2xl hover:bg-purple-700">💾 Guardar</button>
              </div>
            </div>
          </Offcanvas>
        </div>
      )}

      {/* USUARIOS WEB TAB */}
      {activeTab === 'usuarios' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={openNewUser} className="bg-purple-600 text-white px-4 py-2 rounded-2xl hover:bg-purple-700 flex items-center gap-2">
              <span>➕</span><span>Nuevo Usuario Web</span>
            </button>
          </div>

          {usuariosLoading ? (
            <div className="text-center py-12"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50/50"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Usuario</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Cliente</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Email</th><th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Permisos</th><th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Estado</th><th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Acciones</th></tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {usuarios.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No hay usuarios web</td></tr>
                  ) : usuarios.map((u: any) => (
                    <tr key={u.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <div className="font-medium">{u.username}</div>
                        <div className="text-sm text-gray-400">{u.nombre_completo}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">{u.clientes?.razon_social || `${u.clientes?.nombre || ''} ${u.clientes?.apellido || ''}` || '—'}</td>
                      <td className="px-4 py-3 text-sm">{u.email || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-1">
                          {u.puede_comprar && <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs" title="Puede comprar">🛒</span>}
                          {u.puede_ver_historial && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs" title="Ver historial">📋</span>}
                          {u.puede_ver_pedidos && <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs" title="Ver pedidos">📦</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${u.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{u.activo ? 'Activo' : 'Inactivo'}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-1">
                          <button onClick={() => openEditUser(u)} className="p-2 text-blue-600 hover:bg-white rounded-2xl shadow-sm">✏️</button>
                          <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-red-600 hover:bg-white rounded-2xl shadow-sm">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Offcanvas isOpen={showUserOffcanvas} onClose={() => setShowUserOffcanvas(false)} title={editingUser ? 'Editar Usuario Web' : 'Nuevo Usuario Web'} size="md">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente Vinculado</label>
                <SelectSearch options={clientes.map((c: any) => ({ value: c.id, label: c.razon_social || `${c.nombre} ${c.apellido}` }))} value={userForm.id_cliente} onChange={v => setUserForm({...userForm, id_cliente: v})} placeholder="Seleccionar cliente..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usuario *</label>
                  <input type="text" value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{editingUser ? 'Nueva Contraseña (opcional)' : 'Contraseña *'}</label>
                  <input type="password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                  <input type="text" value={userForm.nombre_completo} onChange={e => setUserForm({...userForm, nombre_completo: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input type="text" value={userForm.telefono} onChange={e => setUserForm({...userForm, telefono: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permisos</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2"><input type="checkbox" checked={userForm.puede_comprar} onChange={e => setUserForm({...userForm, puede_comprar: e.target.checked})} className="rounded" /> Puede realizar compras</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={userForm.puede_ver_historial} onChange={e => setUserForm({...userForm, puede_ver_historial: e.target.checked})} className="rounded" /> Puede ver historial de compras</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={userForm.puede_ver_pedidos} onChange={e => setUserForm({...userForm, puede_ver_pedidos: e.target.checked})} className="rounded" /> Puede ver y gestionar pedidos</label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowUserOffcanvas(false)} className="px-4 py-2 border border-gray-300 rounded-2xl hover:bg-gray-50">Cancelar</button>
                <button onClick={handleSaveUser} className="px-4 py-2 bg-purple-600 text-white rounded-2xl hover:bg-purple-700">💾 Guardar</button>
              </div>
            </div>
          </Offcanvas>
        </div>
      )}

      {/* PEDIDOS WEB TAB */}
      {activeTab === 'pedidos' && (
        <div>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <input type="text" placeholder="Buscar por número o cliente..." value={pedidoSearch} onChange={e => setPedidoSearch(e.target.value)} className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" />
              <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
            </div>
            <select value={pedidoEstadoFilter} onChange={e => setPedidoEstadoFilter(e.target.value)} className="px-4 py-3 border border-gray-200 rounded-2xl">
              <option value="">Todos los estados</option>
              {Object.entries(ESTADOS_PEDIDO).map(([key, cfg]) => (<option key={key} value={key}>{cfg.label}</option>))}
            </select>
          </div>

          {pedidosLoading ? (
            <div className="text-center py-12"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50/50"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Nº</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Cliente</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Fecha</th><th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Total</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Estado</th><th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Acciones</th></tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredPedidos.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No hay pedidos web</td></tr>
                  ) : filteredPedidos.map((p: any) => {
                    const clienteNombre = p.clientes?.razon_social || `${p.clientes?.nombre || ''} ${p.clientes?.apellido || ''}`;
                    const cfg = ESTADOS_PEDIDO[p.estado as keyof typeof ESTADOS_PEDIDO] || ESTADOS_PEDIDO.pendiente;
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium">#{p.numero}</td>
                        <td className="px-4 py-3 text-sm">{clienteNombre || '—'}</td>
                        <td className="px-4 py-3 text-sm">{p.fecha ? new Date(p.fecha).toLocaleDateString('es-AR') : '—'}</td>
                        <td className="px-4 py-3 text-right font-medium">{formatPriceConfig(p.total || 0)}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${cfg.color}`}>{cfg.label}</span></td>
                        <td className="px-4 py-3 text-center">
                          <select value={p.estado} onChange={async (e) => { await updatePedidoWeb(p.id, { estado: e.target.value }); toast.success('Estado actualizado'); }} className="text-sm border rounded-lg px-2 py-1">
                            {Object.entries(ESTADOS_PEDIDO).map(([key, cfg]) => (<option key={key} value={key}>{cfg.label}</option>))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
