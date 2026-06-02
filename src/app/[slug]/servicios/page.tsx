'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';
import { formatPriceConfig } from '@/lib/format';

export default function ServiciosPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { theme } = useTheme();
  const [servicios, setServicios] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: s }, { data: c }] = await Promise.all([
        supabase.from('servicios').select('*, categorias_servicios(*)').eq('activo', true).eq('es_publicable_web', true).order('orden'),
        supabase.from('categorias_servicios').select('*').eq('activo', true).order('orden'),
      ]);
      if (s) setServicios(s);
      if (c) setCategorias(c);
      setLoading(false);
    })();
  }, []);

  const filtered = servicios.filter(s => {
    const matchCat = !filter || s.id_categoria_servicio === filter;
    const matchSearch = !search || s.nombre?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full" style={{ backgroundColor: theme.accentLight, color: theme.accent }}>Lo que ofrecemos</span>
          <h1 className="text-3xl md:text-5xl font-black mt-6 mb-4" style={{ color: theme.text }}>Nuestros Servicios</h1>
          <div className="w-12 h-1 mx-auto mt-4 rounded-full" style={{ backgroundColor: theme.accent }} />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-10 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <input type="text" placeholder="Buscar servicio..." value={search} onChange={e => setSearch(e.target.value)} className="w-full px-5 py-3.5 rounded-xl text-sm focus:outline-none transition-all" style={{ backgroundColor: theme.bgInput, color: theme.text, border: `2px solid ${theme.border}` }} onFocus={e => e.target.style.borderColor = theme.accent} onBlur={e => e.target.style.borderColor = theme.border} />
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value)} className="px-5 py-3.5 rounded-xl text-sm focus:outline-none cursor-pointer transition-all" style={{ backgroundColor: theme.bgInput, color: theme.text, border: `2px solid ${theme.border}` }} onFocus={e => e.target.style.borderColor = theme.accent} onBlur={e => e.target.style.borderColor = theme.border}>
            <option value="">Todas las categorías</option>
            {categorias.map((c: any) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-t-transparent" style={{ borderColor: theme.accent, borderTopColor: 'transparent' }} /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((s: any) => (
              <a key={s.id} href={`/${slug}/servicios/${s.id}`} className="group rounded-2xl overflow-hidden transition-all hover:-translate-y-2" style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
                <div className="h-48 flex items-center justify-center overflow-hidden" style={{ background: `linear-gradient(135deg, ${theme.accentLight}, transparent)` }}>
                  {s.imagen_url ? <img src={s.imagen_url} alt={s.nombre} className="w-full h-full object-cover" /> : <span className="text-6xl">🔧</span>}
                </div>
                <div className="p-6">
                  {s.categorias_servicios && <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full" style={{ backgroundColor: theme.accentLight, color: theme.accent }}>{s.categorias_servicios.nombre}</span>}
                  <h3 className="font-bold text-lg mt-3 mb-2 group-hover:text-[#e94560] transition-colors" style={{ color: theme.text }}>{s.nombre}</h3>
                  {s.descripcion && <p className="text-sm line-clamp-3 mb-4" style={{ color: theme.textMuted }}>{s.descripcion}</p>}
                  <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: theme.border }}>
                    <div>
                      <span className="text-2xl font-black" style={{ color: theme.accent }}>{s.precio_base ? formatPriceConfig(s.precio_base) : 'Consultar'}</span>
                      {s.duracion_estimada && <p className="text-xs mt-1" style={{ color: theme.textDim }}>⏱ {s.duracion_estimada}</p>}
                    </div>
                    <span className="text-sm font-medium" style={{ color: theme.accent }}>Ver más →</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20" style={{ color: theme.textDim }}>
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-lg">No se encontraron servicios</p>
          </div>
        )}
      </div>
    </div>
  );
}
