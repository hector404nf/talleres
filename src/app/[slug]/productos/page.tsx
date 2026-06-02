'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';
import { formatPriceConfig } from '@/lib/format';

function getImagenes(item: any): string[] {
  if (!item) return [];
  if (item.imagenes) {
    try {
      const parsed = typeof item.imagenes === 'string' ? JSON.parse(item.imagenes) : item.imagenes;
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
  }
  if (item.imagen_url) return [item.imagen_url];
  return [];
}

function ProductCard({ p, slug, theme }: { p: any; slug: string; theme: any }) {
  const [activeImg, setActiveImg] = useState(0);
  const imgs = getImagenes(p);

  return (
    <a
      href={`/${slug}/productos/${p.id}`}
      className="group block rounded-2xl overflow-hidden bg-white border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {imgs.length > 0 ? (
          <>
            {imgs.map((img: string, i: number) => (
              <img
                key={i}
                src={img}
                alt={p.nombre}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${i === activeImg ? 'opacity-100' : 'opacity-0'}`}
              />
            ))}
            {imgs.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {imgs.map((_: string, i: number) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => { e.preventDefault(); setActiveImg(i); }}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeImg ? 'bg-white w-3' : 'bg-white/60'}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}
        {p.precio_promocion > 0 && (
          <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-red-500 text-white">
            Promo
          </span>
        )}
        {p.stock !== undefined && p.stock !== null && p.stock <= 0 && (
          <span className="absolute top-2 right-2 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-gray-800 text-white">
            Sin stock
          </span>
        )}
      </div>
      <div className="p-4">
        {p.categorias && (
          <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
            {p.categorias.nombre}
          </span>
        )}
        <h3 className="font-medium text-sm text-gray-900 line-clamp-2 leading-snug mt-1 mb-2 group-hover:text-gray-600 transition-colors">
          {p.nombre}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-lg" style={{ color: theme.accent }}>
            {formatPriceConfig(p.precio_venta || 0)}
          </span>
          {p.precio_promocion > 0 && (
            <span className="text-xs text-gray-400 line-through">
              {formatPriceConfig(p.precio_promocion)}
            </span>
          )}
        </div>
        {p.stock !== undefined && p.stock !== null && (
          <p className={`text-xs mt-2 ${p.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {p.stock > 0 ? `${p.stock} disponibles` : 'Sin stock'}
          </p>
        )}
      </div>
    </a>
  );
}

export default function ProductosPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { theme } = useTheme();
  const [productos, setProductos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: p }, { data: c }] = await Promise.all([
        supabase.from('productos').select('*, categorias(*)').eq('activo', true).eq('es_publicable_web', true).order('nombre'),
        supabase.from('categorias').select('*').eq('activo', true).order('nombre'),
      ]);
      if (p) setProductos(p);
      if (c) setCategorias(c);
      setLoading(false);
    })();
  }, []);

  const filtered = productos.filter(p => {
    const matchCat = !filter || p.id_categoria === filter;
    const matchSearch = !search || p.nombre?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto py-16 px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Nuestros Productos
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Explorá nuestro catálogo de productos y repuestos de calidad
          </p>
          <div className="w-8 h-0.5 bg-gray-200 mx-auto mt-6" />
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar producto..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl text-sm bg-white border border-gray-200 focus:border-gray-300 focus:outline-none transition-colors"
            />
          </div>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="px-4 py-3 rounded-xl text-sm bg-white border border-gray-200 focus:border-gray-300 focus:outline-none cursor-pointer transition-colors min-w-[200px]"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((c: any) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-gray-400 mt-4">
            {filtered.length} {filtered.length === 1 ? 'producto encontrado' : 'productos encontrados'}
          </p>
        )}
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-600" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filtered.map((p: any) => (
                <ProductCard key={p.id} p={p} slug={slug} theme={theme} />
              ))}
            </div>
            {!loading && filtered.length === 0 && (
              <div className="text-center py-20">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="text-gray-500 text-lg">No se encontraron productos</p>
                <p className="text-gray-400 text-sm mt-1">Probá con otros filtros o términos de búsqueda</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
