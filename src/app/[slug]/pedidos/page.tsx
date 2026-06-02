'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';
import { formatPriceConfig } from '@/lib/format';

const ESTADOS = {
  pendiente: { label: 'Pendiente', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', icon: '⏳' },
  confirmado: { label: 'Confirmado', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30', icon: '✅' },
  en_preparacion: { label: 'En preparación', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30', icon: '🔧' },
  listo: { label: 'Listo para retiro', color: 'bg-green-500/15 text-green-400 border-green-500/30', icon: '📦' },
  en_camino: { label: 'En camino', color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30', icon: '🚚' },
  entregado: { label: 'Entregado', color: 'bg-gray-500/15 text-gray-400 border-gray-500/30', icon: '✅' },
  cancelado: { label: 'Cancelado', color: 'bg-red-500/15 text-red-400 border-red-500/30', icon: '❌' },
};

export default function PedidosPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { theme } = useTheme();
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = localStorage.getItem(`user_${slug}`);
    setUser(u ? JSON.parse(u) : null);

    (async () => {
      let query = supabase.from('pedidos').select('*, metodos_pago(*)').eq('origen', 'web').order('fecha', { ascending: false });
      if (u) {
        const userData = JSON.parse(u);
        query = query.eq('id_usuario_web', userData.id);
      }
      const { data } = await query;
      if (data) setPedidos(data);
      setLoading(false);
    })();
  }, [slug]);

  return (
    <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-black" style={{ color: theme.text }}>Mis Pedidos</h1>
          {!user && <a href={`/${slug}/auth`} className="text-sm hover:underline" style={{ color: theme.accent }}>Iniciá sesión para ver tu historial</a>}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-t-transparent" style={{ borderColor: theme.accent, borderTopColor: 'transparent' }} /></div>
        ) : pedidos.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-xl font-bold mb-2" style={{ color: theme.text }}>No tenés pedidos aún</h2>
            <p className="mb-6" style={{ color: theme.textMuted }}>Hacé tu primer pedido desde el catálogo</p>
            <a href={`/${slug}/menu`} className="inline-block px-6 py-3 rounded-xl font-bold text-white text-sm transition-all hover:scale-[1.02]" style={{ background: theme.gradientAccent }}>Ver catálogo</a>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidos.map((p: any) => {
              const cfg = ESTADOS[p.estado as keyof typeof ESTADOS] || ESTADOS.pendiente;
              const items = typeof p.items === 'string' ? JSON.parse(p.items) : p.items || [];
              return (
                <a key={p.id} href={`/${slug}/pedidos/${p.id}`} className="block p-5 rounded-2xl transition-all hover:border-[#e94560]" style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-sm font-bold" style={{ color: theme.text }}>Pedido #{p.numero}</span>
                      <p className="text-xs mt-1" style={{ color: theme.textDim }}>{new Date(p.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${cfg.color}`}>{cfg.icon} {cfg.label}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs mb-3" style={{ color: theme.textMuted }}>
                    <span>{p.tipo_entrega === 'delivery' ? '🚚 Delivery' : '🏪 Retiro en local'}</span>
                    {p.metodos_pago && <span>• {p.metodos_pago.icono} {p.metodos_pago.nombre}</span>}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: theme.border }}>
                    <span className="text-xs" style={{ color: theme.textDim }}>{items.length} item(s)</span>
                    <span className="font-black" style={{ color: theme.accent }}>{formatPriceConfig(p.total || 0)}</span>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
