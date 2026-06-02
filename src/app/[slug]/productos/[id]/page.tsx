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

export default function ProductoDetallePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const id = params?.id as string;
  const { theme } = useTheme();

  const [producto, setProducto] = useState<any>(null);
  const [relacionados, setRelacionados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: p } = await supabase.from('productos').select('*, categorias(*)').eq('id', id).single();
      if (p) {
        setProducto(p);
        const { data: r } = await supabase.from('productos').select('*, categorias(*)').eq('activo', true).eq('es_publicable_web', true).neq('id', id).limit(4);
        if (r) setRelacionados(r);
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading || !producto) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-600" />
    </div>
  );

  const imgs = getImagenes(producto);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <a
          href={`/${slug}/productos`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a productos
        </a>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Image Gallery */}
          <div>
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-gray-100 mb-4">
              {imgs.length > 0 ? (
                <img
                  src={imgs[activeImg]}
                  alt={producto.nombre}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-300">
                  <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              )}
              {producto.precio_promocion > 0 && (
                <span className="absolute top-4 left-4 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-red-500 text-white">
                  Promo
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {imgs.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {imgs.map((img: string, i: number) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      i === activeImg ? 'border-gray-900' : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            {producto.categorias && (
              <span className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">
                {producto.categorias.nombre}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {producto.nombre}
            </h1>
            {producto.descripcion && (
              <p className="text-gray-500 leading-relaxed mb-8">
                {producto.descripcion}
              </p>
            )}

            {/* Price */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold" style={{ color: theme.accent }}>
                  {formatPriceConfig(producto.precio_venta || 0)}
                </span>
                {producto.precio_promocion > 0 && (
                  <span className="text-lg text-gray-400 line-through">
                    {formatPriceConfig(producto.precio_promocion)}
                  </span>
                )}
              </div>
              {producto.precio_mayorista > 0 && (
                <p className="text-sm text-gray-400 mt-2">
                  Mayorista: <span className="font-medium text-gray-600">{formatPriceConfig(producto.precio_mayorista)}</span>
                </p>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-3 mb-8">
              <div className={`w-2.5 h-2.5 rounded-full ${producto.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={`text-sm font-medium ${producto.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {producto.stock > 0 ? `${producto.stock} unidades disponibles` : 'Sin stock'}
              </span>
            </div>

            {/* Add to Cart */}
            <button
              onClick={() => {
                if (producto.stock <= 0) return;
                const cart = JSON.parse(localStorage.getItem(`cart_${slug}`) || '[]');
                const existing = cart.find((item: any) => item.id === producto.id);
                if (existing) {
                  existing.cantidad += 1;
                } else {
                  cart.push({ id: producto.id, nombre: producto.nombre, precio: parseFloat(producto.precio_venta) || 0, cantidad: 1, tipo: 'producto' });
                }
                localStorage.setItem(`cart_${slug}`, JSON.stringify(cart));
                window.location.href = `/${slug}/checkout`;
              }}
              disabled={producto.stock <= 0}
              className="w-full py-4 rounded-xl font-semibold text-white text-sm transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{ background: theme.gradientAccent, boxShadow: `0 4px 20px ${theme.accent}40` }}
            >
              {producto.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}
            </button>

            {/* Additional Info */}
            {(producto.codigo || producto.codigo_barra || producto.observaciones) && (
              <div className="mt-8 pt-8 border-t border-gray-100 space-y-3">
                {producto.codigo && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Código</span>
                    <span className="font-mono text-gray-600">{producto.codigo}</span>
                  </div>
                )}
                {producto.codigo_barra && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Código de barra</span>
                    <span className="font-mono text-gray-600">{producto.codigo_barra}</span>
                  </div>
                )}
                {producto.observaciones && (
                  <div className="text-sm">
                    <span className="text-gray-400 block mb-1">Observaciones</span>
                    <span className="text-gray-600">{producto.observaciones}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relacionados.length > 0 && (
          <div className="border-t border-gray-100 pt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Productos relacionados
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relacionados.map((r: any) => {
                const rImgs = getImagenes(r);
                return (
                  <a
                    key={r.id}
                    href={`/${slug}/productos/${r.id}`}
                    className="group block rounded-xl overflow-hidden bg-white border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all"
                  >
                    <div className="aspect-square overflow-hidden bg-gray-50">
                      {rImgs.length > 0 ? (
                        <img src={rImgs[0]} alt={r.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-300">
                          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="font-medium text-sm text-gray-900 truncate group-hover:text-gray-600 transition-colors">
                        {r.nombre}
                      </p>
                      <p className="font-bold text-sm mt-1" style={{ color: theme.accent }}>
                        {formatPriceConfig(r.precio_venta || 0)}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
