'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';
import { formatPriceConfig } from '@/lib/format';

export default function ServicioDetallePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const id = params?.id as string;
  const { theme } = useTheme();

  const [servicio, setServicio] = useState<any>(null);
  const [relacionados, setRelacionados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: s } = await supabase.from('servicios').select('*, categorias_servicios(*)').eq('id', id).single();
      if (s) {
        setServicio(s);
        const { data: r } = await supabase.from('servicios').select('*').eq('activo', true).eq('es_publicable_web', true).neq('id', id).limit(4);
        if (r) setRelacionados(r);
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading || !servicio) return <div className="py-20 text-center" style={{ color: theme.textMuted }}>Cargando...</div>;

  return (
    <div className="py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <a href={`/${slug}/servicios`} className="text-sm hover:text-[#e94560] transition-colors mb-6 inline-block" style={{ color: theme.textMuted }}>← Volver a servicios</a>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="rounded-2xl overflow-hidden h-80 lg:h-96 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${theme.accentLight}, ${theme.bgCard})` }}>
            {servicio.imagen_url ? <img src={servicio.imagen_url} alt={servicio.nombre} className="w-full h-full object-cover" /> : <span className="text-8xl">🔧</span>}
          </div>
          <div>
            {servicio.categorias_servicios && <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full" style={{ backgroundColor: theme.accentLight, color: theme.accent }}>{servicio.categorias_servicios.nombre}</span>}
            <h1 className="text-3xl md:text-4xl font-black mt-4 mb-4" style={{ color: theme.text }}>{servicio.nombre}</h1>
            <p className="text-lg leading-relaxed mb-6" style={{ color: theme.textMuted }}>{servicio.descripcion || 'Sin descripción disponible.'}</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-xl" style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}` }}>
                <p className="text-xs uppercase tracking-wider" style={{ color: theme.textDim }}>Precio desde</p>
                <p className="text-2xl font-black mt-1" style={{ color: theme.accent }}>{servicio.precio_base ? formatPriceConfig(servicio.precio_base) : 'Consultar'}</p>
              </div>
              {servicio.duracion_estimada && (
                <div className="p-4 rounded-xl" style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}` }}>
                  <p className="text-xs uppercase tracking-wider" style={{ color: theme.textDim }}>Duración estimada</p>
                  <p className="text-lg font-bold mt-1" style={{ color: theme.text }}>⏱ {servicio.duracion_estimada}</p>
                </div>
              )}
              {servicio.garantia_dias > 0 && (
                <div className="p-4 rounded-xl" style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}` }}>
                  <p className="text-xs uppercase tracking-wider" style={{ color: theme.textDim }}>Garantía</p>
                  <p className="text-lg font-bold mt-1" style={{ color: theme.text }}>🛡️ {servicio.garantia_dias} días</p>
                </div>
              )}
            </div>

            <button onClick={() => {
              const cart = JSON.parse(localStorage.getItem(`cart_${slug}`) || '[]');
              cart.push({ id: servicio.id, nombre: servicio.nombre, precio: parseFloat(servicio.precio_base) || 0, cantidad: 1, tipo: 'servicio' });
              localStorage.setItem(`cart_${slug}`, JSON.stringify(cart));
              window.location.href = `/${slug}/checkout`;
            }} className="w-full py-4 rounded-xl font-bold text-white text-sm transition-all hover:scale-[1.02]" style={{ background: theme.gradientAccent, boxShadow: `0 4px 20px ${theme.accent}40` }}>
              Agregar al carrito
            </button>
          </div>
        </div>

        {relacionados.length > 0 && (
          <div>
            <h2 className="text-2xl font-black mb-6" style={{ color: theme.text }}>Servicios relacionados</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relacionados.map((r: any) => (
                <a key={r.id} href={`/${slug}/servicios/${r.id}`} className="rounded-xl overflow-hidden transition-colors hover:border-[#e94560]" style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}` }}>
                  <div className="h-24 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${theme.accentLight}, transparent)` }}>
                    {r.imagen_url ? <img src={r.imagen_url} alt={r.nombre} className="w-full h-full object-cover" /> : <span className="text-3xl">🔧</span>}
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-sm truncate" style={{ color: theme.text }}>{r.nombre}</p>
                    <p className="font-bold text-sm" style={{ color: theme.accent }}>{r.precio_base ? formatPriceConfig(r.precio_base) : ''}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
