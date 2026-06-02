'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';
import { formatPriceConfig } from '@/lib/format';

const ESTADOS_ORDER = ['pendiente', 'confirmado', 'en_preparacion', 'listo', 'en_camino', 'entregado'];
const ESTADOS_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  pendiente: { label: 'Pendiente', icon: '⏳', color: '#eab308' },
  confirmado: { label: 'Confirmado', icon: '✅', color: '#3b82f6' },
  en_preparacion: { label: 'En preparación', icon: '🔧', color: '#a855f7' },
  listo: { label: 'Listo', icon: '📦', color: '#22c55e' },
  en_camino: { label: 'En camino', icon: '🚚', color: '#6366f1' },
  entregado: { label: 'Entregado', icon: '✅', color: '#6b7280' },
  cancelado: { label: 'Cancelado', icon: '❌', color: '#ef4444' },
};

export default function PedidoDetallePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const id = params?.id as string;
  const { theme } = useTheme();

  const [pedido, setPedido] = useState<any>(null);
  const [seguimiento, setSeguimiento] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [{ data: p }, { data: s }] = await Promise.all([
        supabase.from('pedidos').select('*, metodos_pago(*)').eq('id', id).single(),
        supabase.from('seguimiento_pedidos').select('*').eq('id_pedido', id).order('fecha', { ascending: true }),
      ]);
      if (p) setPedido(p);
      if (s) setSeguimiento(s);
      setLoading(false);
    })();
  }, [id]);

  if (loading || !pedido) return <div className="py-20 text-center" style={{ color: theme.textMuted }}>Cargando...</div>;

  const items = typeof pedido.items === 'string' ? JSON.parse(pedido.items) : pedido.items || [];
  const currentIdx = ESTADOS_ORDER.indexOf(pedido.estado);
  const cfg = ESTADOS_LABELS[pedido.estado] || ESTADOS_LABELS.pendiente;

  return (
    <div className="py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <a href={`/${slug}/pedidos`} className="text-sm hover:text-[#e94560] transition-colors mb-6 inline-block" style={{ color: theme.textMuted }}>← Volver a mis pedidos</a>

        {/* Estado actual */}
        <div className="p-6 rounded-2xl mb-6" style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}` }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-black" style={{ color: theme.text }}>Pedido #{pedido.numero}</h1>
              <p className="text-sm mt-1" style={{ color: theme.textMuted }}>{new Date(pedido.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <span className="px-4 py-2 rounded-full text-sm font-bold" style={{ backgroundColor: cfg.color + '20', color: cfg.color, border: `1px solid ${cfg.color}40` }}>
              {cfg.icon} {cfg.label}
            </span>
          </div>

          {/* Progress bar */}
          <div className="flex items-center justify-between mb-2">
            {ESTADOS_ORDER.map((estado, idx) => {
              const isActive = idx <= currentIdx;
              const isCurrent = idx === currentIdx;
              const lbl = ESTADOS_LABELS[estado];
              return (
                <div key={estado} className="flex flex-col items-center flex-1">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all" style={{ backgroundColor: isActive ? (isCurrent ? cfg.color : '#22c55e') : theme.border, color: isActive ? '#fff' : theme.textDim }}>
                    {isActive ? (isCurrent ? '●' : '✓') : idx + 1}
                  </div>
                  <span className="text-[10px] mt-1 text-center hidden sm:block" style={{ color: isActive ? theme.text : theme.textDim }}>{lbl.label}</span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-1 mt-2">
            {ESTADOS_ORDER.map((_, idx) => (
              <div key={idx} className="flex-1 h-1 rounded-full" style={{ backgroundColor: idx <= currentIdx ? cfg.color : theme.border }} />
            ))}
          </div>
        </div>

        {/* Info entrega y pago */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="p-5 rounded-2xl" style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}` }}>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: theme.textMuted }}>Entrega</h3>
            <p className="font-medium" style={{ color: theme.text }}>{pedido.tipo_entrega === 'delivery' ? '🚚 Delivery' : '🏪 Retiro en local'}</p>
            {pedido.tipo_entrega === 'delivery' && pedido.direccion_entrega && (
              <p className="text-sm mt-1" style={{ color: theme.textMuted }}>{pedido.direccion_entrega}</p>
            )}
            {pedido.referencia_ubicacion && <p className="text-sm mt-1" style={{ color: theme.textMuted }}>📌 {pedido.referencia_ubicacion}</p>}
            {pedido.latitud && pedido.longitud && (
              <a href={`https://www.openstreetmap.org/?mlat=${pedido.latitud}&mlon=${pedido.longitud}#map=16/${pedido.latitud}/${pedido.longitud}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm mt-2 hover:underline" style={{ color: theme.accent }}>
                🗺️ Ver en mapa
              </a>
            )}
          </div>
          <div className="p-5 rounded-2xl" style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}` }}>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: theme.textMuted }}>Pago</h3>
            <p className="font-medium" style={{ color: theme.text }}>{pedido.metodos_pago ? `${pedido.metodos_pago.icono} ${pedido.metodos_pago.nombre}` : 'No especificado'}</p>
            <p className={`text-sm mt-1 ${pedido.estado_pago === 'pagado' ? 'text-green-500' : 'text-yellow-500'}`}>
              {pedido.estado_pago === 'pagado' ? '✅ Pagado' : '⏳ Pendiente de pago'}
            </p>
          </div>
        </div>

        {/* Items */}
        <div className="p-5 rounded-2xl mb-6" style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}` }}>
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: theme.textMuted }}>Detalle del pedido</h3>
          <div className="space-y-3">
            {items.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: theme.border }}>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: item.tipo === 'servicio' ? theme.accentLight : `${theme.accent}10`, color: theme.accent }}>
                    {item.tipo === 'servicio' ? '🔧' : '📦'}
                  </span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: theme.text }}>{item.nombre}</p>
                    <p className="text-xs" style={{ color: theme.textDim }}>{item.cantidad} x {formatPriceConfig(item.precio_unitario || 0)}</p>
                  </div>
                </div>
                <span className="font-bold text-sm" style={{ color: theme.text }}>{formatPriceConfig(item.total || 0)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-4 mt-2 border-t" style={{ borderColor: theme.border }}>
            <span className="font-bold text-lg" style={{ color: theme.text }}>Total</span>
            <span className="font-black text-2xl" style={{ color: theme.accent }}>{formatPriceConfig(pedido.total || 0)}</span>
          </div>
        </div>

        {/* Seguimiento */}
        {seguimiento.length > 0 && (
          <div className="p-5 rounded-2xl" style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}` }}>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: theme.textMuted }}>Seguimiento</h3>
            <div className="space-y-4">
              {seguimiento.map((s: any, idx: number) => (
                <div key={s.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.accent }} />
                    {idx < seguimiento.length - 1 && <div className="w-0.5 flex-1 mt-1" style={{ backgroundColor: theme.border }} />}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium" style={{ color: theme.text }}>{s.mensaje || `Estado: ${s.estado}`}</p>
                    <p className="text-xs mt-1" style={{ color: theme.textDim }}>{new Date(s.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contacto */}
        <div className="mt-6 p-5 rounded-2xl text-center" style={{ backgroundColor: theme.accentLight, border: `1px solid ${theme.accent}40` }}>
          <p className="font-medium mb-2" style={{ color: theme.text }}>¿Tenés alguna consulta sobre tu pedido?</p>
          <p className="text-sm mb-4" style={{ color: theme.textMuted }}>Contactanos y te respondemos a la brevedad</p>
          <a href={`https://wa.me/?text=Hola!%20Consulta%20sobre%20pedido%20%23${pedido.numero}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm bg-green-500 hover:bg-green-600 transition-colors">
            💬 Consultar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
