'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';

export default function AuthPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { theme } = useTheme();

  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', password: '', direccion: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = localStorage.getItem(`user_${slug}`);
    if (u) { setUser(JSON.parse(u)); }
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isLogin) {
      const { data, error: err } = await supabase.from('usuarios_web').select('*').eq('email', form.email).eq('password', form.password).eq('activo', true).single();
      if (err || !data) { setError('Email o contraseña incorrectos'); setLoading(false); return; }
      localStorage.setItem(`user_${slug}`, JSON.stringify(data));
      setUser(data);
      router.push(`/${slug}/checkout`);
    } else {
      if (!form.nombre || !form.email || !form.password) { setError('Completa todos los campos obligatorios'); setLoading(false); return; }
      const { data: existing } = await supabase.from('usuarios_web').select('id').eq('email', form.email).single();
      if (existing) { setError('Ya existe una cuenta con ese email'); setLoading(false); return; }
      const { data, error: err } = await supabase.from('usuarios_web').insert([{
        username: form.email.split('@')[0],
        email: form.email,
        password: form.password,
        nombre_completo: form.nombre,
        telefono: form.telefono,
        puede_comprar: true,
        puede_ver_historial: true,
        puede_ver_pedidos: true,
        activo: true,
      }]).select().single();
      if (err) { setError('Error al crear la cuenta'); setLoading(false); return; }
      localStorage.setItem(`user_${slug}`, JSON.stringify(data));
      setUser(data);
      router.push(`/${slug}/checkout`);
    }
    setLoading(false);
  };

  if (user) {
    return (
      <div className="py-12 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6" style={{ backgroundColor: theme.accentLight }}>👤</div>
          <h1 className="text-2xl font-black mb-2" style={{ color: theme.text }}>¡Hola, {user.nombre_completo || user.username}!</h1>
          <p className="mb-8" style={{ color: theme.textMuted }}>{user.email}</p>
          <div className="space-y-3">
            <a href={`/${slug}/pedidos`} className="block w-full py-3 rounded-xl font-bold text-sm transition-colors" style={{ backgroundColor: theme.bgCard, color: theme.text, border: `1px solid ${theme.border}` }}>📦 Mis Pedidos</a>
            <a href={`/${slug}/checkout`} className="block w-full py-3 rounded-xl font-bold text-white text-sm transition-all hover:scale-[1.02]" style={{ background: theme.gradientAccent }}>🛒 Ir al carrito</a>
            <button onClick={() => { localStorage.removeItem(`user_${slug}`); setUser(null); }} className="block w-full py-3 rounded-xl font-bold text-sm transition-colors" style={{ color: theme.textMuted, border: `1px solid ${theme.border}` }}>Cerrar sesión</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black" style={{ color: theme.text }}>{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</h1>
          <p className="text-sm mt-2" style={{ color: theme.textMuted }}>{isLogin ? 'Ingresá con tu cuenta' : 'Registrate para hacer pedidos'}</p>
        </div>

        {error && <div className="p-3 rounded-xl text-sm mb-6" style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>Nombre completo *</label>
              <input type="text" required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all" style={{ backgroundColor: theme.bgInput, color: theme.text, border: `2px solid ${theme.border}` }} onFocus={e => e.target.style.borderColor = theme.accent} onBlur={e => e.target.style.borderColor = theme.border} />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>Email *</label>
            <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all" style={{ backgroundColor: theme.bgInput, color: theme.text, border: `2px solid ${theme.border}` }} onFocus={e => e.target.style.borderColor = theme.accent} onBlur={e => e.target.style.borderColor = theme.border} />
          </div>
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>Teléfono</label>
              <input type="tel" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all" style={{ backgroundColor: theme.bgInput, color: theme.text, border: `2px solid ${theme.border}` }} onFocus={e => e.target.style.borderColor = theme.accent} onBlur={e => e.target.style.borderColor = theme.border} />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>Contraseña *</label>
            <input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all" style={{ backgroundColor: theme.bgInput, color: theme.text, border: `2px solid ${theme.border}` }} onFocus={e => e.target.style.borderColor = theme.accent} onBlur={e => e.target.style.borderColor = theme.border} />
          </div>
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>Dirección</label>
              <input type="text" value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all" style={{ backgroundColor: theme.bgInput, color: theme.text, border: `2px solid ${theme.border}` }} onFocus={e => e.target.style.borderColor = theme.accent} onBlur={e => e.target.style.borderColor = theme.border} placeholder="Calle, número, ciudad" />
            </div>
          )}
          <button type="submit" disabled={loading} className="w-full py-4 rounded-xl font-bold text-white text-sm transition-all hover:scale-[1.02] disabled:opacity-50" style={{ background: theme.gradientAccent }}>
            {loading ? 'Cargando...' : isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: theme.textMuted }}>
          {isLogin ? '¿No tenés cuenta?' : '¿Ya tenés cuenta?'}{' '}
          <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="font-medium hover:underline" style={{ color: theme.accent }}>
            {isLogin ? 'Registrate' : 'Iniciá sesión'}
          </button>
        </p>

        {isLogin && (
          <div className="mt-8 p-4 rounded-xl" style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}` }}>
            <p className="text-sm text-center" style={{ color: theme.textMuted }}>¿No querés registrarte? Podés hacer tu pedido como invitado desde el carrito.</p>
          </div>
        )}
      </div>
    </div>
  );
}
