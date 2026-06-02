'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';
import { formatPriceConfig } from '@/lib/format';

declare global {
  interface Window { L: any; }
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { theme } = useTheme();
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [cart, setCart] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [metodosPago, setMetodosPago] = useState<any[]>([]);
  const [tipoEntrega, setTipoEntrega] = useState<'retiro' | 'delivery'>('retiro');
  const [metodoPago, setMetodoPago] = useState('');
  const [direccion, setDireccion] = useState('');
  const [referencia, setReferencia] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    const c = JSON.parse(localStorage.getItem(`cart_${slug}`) || '[]');
    setCart(c);
    const u = localStorage.getItem(`user_${slug}`);
    if (u) {
      const userData = JSON.parse(u);
      setUser(userData);
      setNombre(userData.nombre_completo || '');
      setTelefono(userData.telefono || '');
      setDireccion(userData.direccion || '');
    }
    supabase.from('metodos_pago').select('*').eq('activo', true).order('orden').then(({ data }) => { if (data) setMetodosPago(data); });
  }, [slug]);

  useEffect(() => {
    if (tipoEntrega === 'delivery' && !mapReady) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => setMapReady(true);
      document.body.appendChild(script);
    }
  }, [tipoEntrega]);

  useEffect(() => {
    if (mapReady && tipoEntrega === 'delivery' && !mapRef.current) {
      setTimeout(() => {
        const map = window.L.map('map').setView([-25.2637, -57.5759], 13);
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap'
        }).addTo(map);

        const marker = window.L.marker([-25.2637, -57.5759], { draggable: true }).addTo(map);
        marker.on('dragend', (e: any) => {
          const pos = e.target.getLatLng();
          setLat(pos.lat);
          setLng(pos.lng);
        });

        map.on('click', (e: any) => {
          marker.setLatLng(e.latlng);
          setLat(e.latlng.lat);
          setLng(e.latlng.lng);
        });

        mapRef.current = map;
        markerRef.current = marker;

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((pos) => {
            const { latitude, longitude } = pos.coords;
            map.setView([latitude, longitude], 15);
            marker.setLatLng([latitude, longitude]);
            setLat(latitude);
            setLng(longitude);
          });
        }

        setTimeout(() => map.invalidateSize(), 100);
      }, 100);
    }
  }, [mapReady, tipoEntrega]);

  const cartTotal = cart.reduce((s, i) => s + (i.precio || 0) * (i.cantidad || 1), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !telefono || !metodoPago) return;
    if (tipoEntrega === 'delivery' && !direccion) return;

    setLoading(true);
    try {
      const pedido = {
        numero: Math.floor(Math.random() * 9000) + 1000,
        id_usuario_web: user?.id || null,
        id_cliente: null,
        id_vendedor: null,
        fecha: new Date().toISOString(),
        estado: 'pendiente',
        total: cartTotal,
        senia: 0,
        saldo_pendiente: cartTotal,
        origen: 'web',
        tipo_entrega: tipoEntrega,
        direccion_entrega: tipoEntrega === 'delivery' ? direccion : null,
        latitud: lat,
        longitud: lng,
        referencia_ubicacion: referencia,
        id_metodo_pago: metodoPago,
        estado_pago: 'pendiente',
        confirmado: false,
        notas_cliente: `Nombre: ${nombre}, Tel: ${telefono}${notas ? '. Notas: ' + notas : ''}`,
        items: JSON.stringify(cart.map(i => ({ id_producto: i.id, nombre: i.nombre, cantidad: i.cantidad || 1, precio_unitario: i.precio, total: (i.precio || 0) * (i.cantidad || 1), tipo: i.tipo }))),
      };
      const { data, error } = await supabase.from('pedidos').insert([pedido]).select().single();
      if (error) throw error;

      await supabase.from('seguimiento_pedidos').insert([{ id_pedido: data.id, estado: 'pendiente', mensaje: 'Pedido recibido. Esperando confirmación.' }]);

      setOrderId(data.numero);
      setOrderPlaced(true);
      localStorage.removeItem(`cart_${slug}`);
    } catch {
      alert('Error al crear el pedido');
    }
    setLoading(false);
  };

  if (orderPlaced) {
    return (
      <div className="py-12 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6" style={{ backgroundColor: 'rgba(34,197,94,0.15)' }}>✅</div>
          <h1 className="text-2xl font-black mb-2" style={{ color: theme.text }}>¡Pedido Confirmado!</h1>
          <p className="mb-2" style={{ color: theme.textMuted }}>Tu pedido <span className="font-bold" style={{ color: theme.accent }}>#{orderId}</span> fue recibido</p>
          <p className="text-sm mb-8" style={{ color: theme.textMuted }}>Te contactaremos por WhatsApp para confirmar los detalles y el pago.</p>
          <div className="space-y-3">
            <a href={`/${slug}/pedidos`} className="block w-full py-3 rounded-xl font-bold text-white text-sm transition-all hover:scale-[1.02]" style={{ background: theme.gradientAccent }}>📦 Ver mis pedidos</a>
            <a href={`/${slug}/menu`} className="block w-full py-3 rounded-xl font-bold text-sm transition-colors" style={{ color: theme.textMuted, border: `1px solid ${theme.border}` }}>Volver al inicio</a>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="py-12 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-black mb-2" style={{ color: theme.text }}>Tu carrito está vacío</h1>
          <p className="mb-8" style={{ color: theme.textMuted }}>Agregá productos o servicios para hacer tu pedido</p>
          <a href={`/${slug}/menu`} className="inline-block px-8 py-3 rounded-xl font-bold text-white text-sm transition-all hover:scale-[1.02]" style={{ background: theme.gradientAccent }}>Ver catálogo</a>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-black mb-8" style={{ color: theme.text }}>Finalizar Pedido</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Datos del cliente */}
          <div className="p-6 rounded-2xl" style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}` }}>
            <h2 className="text-lg font-bold mb-4" style={{ color: theme.text }}>👤 Datos de contacto</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>Nombre *</label>
                <input type="text" required value={nombre} onChange={e => setNombre(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all" style={{ backgroundColor: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}` }} onFocus={e => e.target.style.borderColor = theme.accent} onBlur={e => e.target.style.borderColor = theme.border} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>Teléfono *</label>
                <input type="tel" required value={telefono} onChange={e => setTelefono(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all" style={{ backgroundColor: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}` }} onFocus={e => e.target.style.borderColor = theme.accent} onBlur={e => e.target.style.borderColor = theme.border} placeholder="0981 234 567" />
              </div>
            </div>
          </div>

          {/* Tipo de entrega */}
          <div className="p-6 rounded-2xl" style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}` }}>
            <h2 className="text-lg font-bold mb-4" style={{ color: theme.text }}>🚚 Tipo de entrega</h2>
            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={() => setTipoEntrega('retiro')} className={`p-4 rounded-xl border-2 text-center transition-all ${tipoEntrega === 'retiro' ? '' : ''}`} style={{ borderColor: tipoEntrega === 'retiro' ? theme.accent : theme.border, backgroundColor: tipoEntrega === 'retiro' ? theme.accentLight : 'transparent' }}>
                <span className="text-2xl block mb-2">🏪</span>
                <span className="font-bold text-sm" style={{ color: theme.text }}>Retiro en local</span>
                <p className="text-xs mt-1" style={{ color: theme.textDim }}>Gratis</p>
              </button>
              <button type="button" onClick={() => setTipoEntrega('delivery')} className={`p-4 rounded-xl border-2 text-center transition-all`} style={{ borderColor: tipoEntrega === 'delivery' ? theme.accent : theme.border, backgroundColor: tipoEntrega === 'delivery' ? theme.accentLight : 'transparent' }}>
                <span className="text-2xl block mb-2">🚚</span>
                <span className="font-bold text-sm" style={{ color: theme.text }}>Delivery</span>
                <p className="text-xs mt-1" style={{ color: theme.textDim }}>Consultar costo</p>
              </button>
            </div>
            {tipoEntrega === 'delivery' && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>Dirección de entrega *</label>
                  <input type="text" required value={direccion} onChange={e => setDireccion(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all" style={{ backgroundColor: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}` }} onFocus={e => e.target.style.borderColor = theme.accent} onBlur={e => e.target.style.borderColor = theme.border} placeholder="Calle, número, barrio" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>Referencia / Ubicación en el mapa</label>
                  <input type="text" value={referencia} onChange={e => setReferencia(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all" style={{ backgroundColor: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}` }} onFocus={e => e.target.style.borderColor = theme.accent} onBlur={e => e.target.style.borderColor = theme.border} placeholder="Entre calles, landmarks..." />
                </div>
                <div id="map" className="h-64 rounded-xl overflow-hidden" style={{ border: `1px solid ${theme.border}` }} />
                {lat && lng && <p className="text-xs" style={{ color: theme.textDim }}>📍 Ubicación: {lat.toFixed(6)}, {lng.toFixed(6)}</p>}
              </div>
            )}
          </div>

          {/* Método de pago */}
          <div className="p-6 rounded-2xl" style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}` }}>
            <h2 className="text-lg font-bold mb-4" style={{ color: theme.text }}>💳 Método de pago</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {metodosPago.map((m: any) => (
                <button key={m.id} type="button" onClick={() => setMetodoPago(m.id)} className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all`} style={{ borderColor: metodoPago === m.id ? theme.accent : theme.border, backgroundColor: metodoPago === m.id ? theme.accentLight : 'transparent' }}>
                  <span className="text-2xl">{m.icono || '💰'}</span>
                  <div className="text-left">
                    <span className="font-bold text-sm" style={{ color: theme.text }}>{m.nombre}</span>
                    <p className="text-xs capitalize" style={{ color: theme.textDim }}>{m.tipo}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Resumen */}
          <div className="p-6 rounded-2xl" style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}` }}>
            <h2 className="text-lg font-bold mb-4" style={{ color: theme.text }}>📋 Resumen del pedido</h2>
            <div className="space-y-3 mb-4">
              {cart.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: item.tipo === 'servicio' ? theme.accentLight : `${theme.accent}10`, color: theme.accent }}>
                      {item.tipo === 'servicio' ? '🔧' : '📦'}
                    </span>
                    <span style={{ color: theme.text }}>{item.nombre}</span>
                    <span style={{ color: theme.textDim }}>x{item.cantidad || 1}</span>
                  </div>
                  <span className="font-medium" style={{ color: theme.text }}>{formatPriceConfig((item.precio || 0) * (item.cantidad || 1))}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 flex justify-between items-center" style={{ borderColor: theme.border }}>
              <span className="font-bold text-lg" style={{ color: theme.text }}>Total</span>
              <span className="font-black text-2xl" style={{ color: theme.accent }}>{formatPriceConfig(cartTotal)}</span>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>Notas adicionales</label>
            <textarea value={notas} onChange={e => setNotas(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all resize-none" style={{ backgroundColor: theme.bgCard, color: theme.text, border: `1px solid ${theme.border}` }} onFocus={e => e.target.style.borderColor = theme.accent} onBlur={e => e.target.style.borderColor = theme.border} rows={2} placeholder="Horario preferido, indicaciones especiales..." />
          </div>

          <button type="submit" disabled={loading || !metodoPago} className="w-full py-4 rounded-xl font-bold text-white text-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: theme.gradientAccent, boxShadow: `0 4px 20px ${theme.accent}40` }}>
            {loading ? 'Procesando...' : `Confirmar Pedido - ${formatPriceConfig(cartTotal)}`}
          </button>
        </form>
      </div>
    </div>
  );
}
