'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { supabase, usePromocionesStore } from '@/lib/supabase';
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
      className="group block rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
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
      </div>
      <div className="p-3">
        <h3 className="font-medium text-sm text-gray-900 line-clamp-2 leading-snug mb-1 group-hover:text-gray-600 transition-colors">
          {p.nombre}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-base" style={{ color: theme.accent }}>
            {formatPriceConfig(p.precio_venta || 0)}
          </span>
          {p.precio_promocion > 0 && (
            <span className="text-xs text-gray-400 line-through">
              {formatPriceConfig(p.precio_promocion)}
            </span>
          )}
        </div>
      </div>
    </a>
  );
}

function ServicioCard({ s, slug, theme }: { s: any; slug: string; theme: any }) {
  const imgs = getImagenes(s);

  return (
    <a
      href={`/${slug}/servicios/${s.id}`}
      className="group block rounded-2xl overflow-hidden bg-white border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        {imgs.length > 0 ? (
          <img src={imgs[0]} alt={s.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-gray-600 transition-colors">
          {s.nombre}
        </h3>
        {s.descripcion && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">{s.descripcion}</p>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <span className="text-xl font-bold" style={{ color: theme.accent }}>
            {s.precio_base ? formatPriceConfig(s.precio_base) : 'Consultar'}
          </span>
          <span className="text-xs font-medium text-gray-400 group-hover:text-gray-600 transition-colors">
            Ver más
          </span>
        </div>
      </div>
    </a>
  );
}

export default function MenuHomePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { theme } = useTheme();
  const { promociones } = usePromocionesStore();

  const [config, setConfig] = useState<any>(null);
  const [servicios, setServicios] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const [{ data: cfg }, { data: servs }, { data: prods }, { data: promos }] = await Promise.all([
        supabase.from('configuracion_web').select('*').eq('slug', slug).single(),
        supabase.from('servicios').select('*').eq('activo', true).eq('es_publicable_web', true).order('orden').limit(6),
        supabase.from('productos').select('*').eq('activo', true).eq('es_publicable_web', true).order('nombre').limit(8),
        supabase.from('promociones_web').select('*').eq('activo', true).order('orden'),
      ]);
      if (cfg) setConfig(cfg);
      if (servs) setServicios(servs);
      if (prods) setProductos(prods);
      if (promos) (usePromocionesStore.setState as any)({ promociones: promos });
      setLoading(false);
    })();
  }, [slug]);

  if (loading || !config) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-600" />
    </div>
  );

  const heroImages = config?.hero_images ? (typeof config.hero_images === 'string' ? JSON.parse(config.hero_images) : config.hero_images) : [];
  const [heroIdx, setHeroIdx] = useState(0);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const interval = setInterval(() => {
      setHeroIdx(prev => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {heroImages.length > 0 ? (
          <>
            {heroImages.map((img: string, i: number) => (
              <div
                key={i}
                className="absolute inset-0 transition-opacity duration-1000"
                style={{ opacity: i === heroIdx ? 1 : 0 }}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
            {heroImages.length > 1 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {heroImages.map((_: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setHeroIdx(i)}
                    className={`h-1 rounded-full transition-all duration-300 ${i === heroIdx ? 'w-8 bg-white' : 'w-4 bg-white/40 hover:bg-white/60'}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0" style={{ background: theme.gradient }} />
        )}
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-xs font-semibold uppercase tracking-widest bg-white/10 backdrop-blur-sm text-white/90 border border-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Taller Profesional
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black mb-6 leading-[1.05] text-white tracking-tight">
            {config.nombre_sitio || 'Nuestro Taller'}
          </h1>
          {config.tagline && (
            <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto text-white/70 font-light leading-relaxed">
              {config.tagline}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`/${slug}/servicios`}
              className="px-8 py-4 rounded-full font-semibold text-sm bg-white text-gray-900 hover:bg-gray-100 transition-all hover:scale-105 shadow-lg"
            >
              Ver Servicios
            </a>
            <a
              href={`/${slug}/productos`}
              className="px-8 py-4 rounded-full font-semibold text-sm border border-white/30 text-white hover:bg-white/10 transition-all hover:scale-105 backdrop-blur-sm"
            >
              Ver Productos
            </a>
          </div>
        </div>
      </section>

      {/* PROMOS */}
      {promociones.length > 0 && (
        <section className="py-12 border-b border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {promociones.map((p: any) => (
                <div
                  key={p.id}
                  className="flex-shrink-0 w-72 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  {p.imagen_url && (
                    <img src={p.imagen_url} alt={p.titulo} className="w-full h-32 object-cover" />
                  )}
                  <div className="p-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                      {p.tipo}
                    </span>
                    <h3 className="font-semibold mt-2 text-gray-900">{p.titulo}</h3>
                    {p.descripcion && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.descripcion}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SERVICIOS DESTACADOS */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Nuestros Servicios
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Soluciones profesionales para tu vehículo con la mejor calidad y garantía
            </p>
            <div className="w-8 h-0.5 bg-gray-200 mx-auto mt-6" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicios.map((s: any) => (
              <ServicioCard key={s.id} s={s} slug={slug} theme={theme} />
            ))}
          </div>
          {servicios.length > 0 && (
            <div className="text-center mt-12">
              <a
                href={`/${slug}/servicios`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 transition-all"
              >
                Ver todos los servicios
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          )}
        </div>
      </section>

      {/* PRODUCTOS DESTACADOS */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Productos Destacados
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Los mejores productos y repuestos para tu vehículo
            </p>
            <div className="w-8 h-0.5 bg-gray-200 mx-auto mt-6" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {productos.map((p: any) => (
              <ProductCard key={p.id} p={p} slug={slug} theme={theme} />
            ))}
          </div>
          {productos.length > 0 && (
            <div className="text-center mt-12">
              <a
                href={`/${slug}/productos`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 transition-all"
              >
                Ver todos los productos
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ¿Necesitas un servicio?
          </h2>
          <p className="text-gray-400 mb-10 text-lg">
            Contactanos y te asesoramos sin compromiso
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {config.whatsapp && (
              <a
                href={`https://wa.me/${config.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 rounded-full font-semibold text-sm bg-green-600 text-white hover:bg-green-700 transition-all hover:scale-105"
              >
                WhatsApp
              </a>
            )}
            {config.telefono && (
              <a
                href={`tel:${config.telefono}`}
                className="px-8 py-4 rounded-full font-semibold text-sm border border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white transition-all"
              >
                {config.telefono}
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
