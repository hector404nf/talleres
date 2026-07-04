'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Database, Palette, ImageIcon, Store, Settings2 } from 'lucide-react';
import { useConfigStore } from '@/lib/supabase';
import { applyBrandColors, applyTheme, getStoredTheme, setStoredTheme, ThemeMode } from '@/lib/theme';

interface ConfigData {
  razon_social: string;
  nombre_fantasia: string;
  cuit: string;
  telefono: string;
  email: string;
  direccion: string;
  localidad: string;
  provincia: string;
  codigo_postal: string;
  pie_factura: string;
  moneda: string;
  stock_minimo_default: number;
  margen_ganancia_default: number;
  puntos_por_peso: number;
  logo_url: string;
  favicon_url: string;
  color_primario: string;
  color_secundario: string;
  dark_mode_default: boolean;
}

const emptyConfig: ConfigData = {
  razon_social: '',
  nombre_fantasia: '',
  cuit: '',
  telefono: '',
  email: '',
  direccion: '',
  localidad: '',
  provincia: '',
  codigo_postal: '',
  pie_factura: '',
  moneda: 'ARS',
  stock_minimo_default: 5,
  margen_ganancia_default: 30,
  puntos_por_peso: 1,
  logo_url: '',
  favicon_url: '',
  color_primario: '#4f46e5',
  color_secundario: '#ffffff',
  dark_mode_default: false,
};

const presetColors = [
  '#4f46e5', '#e63946', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#111827', '#64748b'
];

export default function ConfiguracionPage() {
  const { config: rawConfig, fetchConfig, updateConfig } = useConfigStore();
  const config = rawConfig as ConfigData | null;
  const [form, setForm] = useState<ConfigData>({ ...emptyConfig });
  const [activeTab, setActiveTab] = useState<'empresa' | 'ventas' | 'marca' | 'sistema'>('empresa');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>('system');

  useEffect(() => {
    fetchConfig();
    setTheme(getStoredTheme());
  }, [fetchConfig]);

  useEffect(() => {
    if (config) {
      setForm({ ...emptyConfig, ...config });
    }
  }, [config]);

  const handleChange = (field: keyof ConfigData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateConfig(form);
      applyBrandColors(form.color_primario, form.color_secundario);
      toast.success('Configuración guardada correctamente');
    } catch {
      toast.error('Error al guardar la configuración');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleThemeChange = (next: ThemeMode) => {
    setTheme(next);
    setStoredTheme(next);
    applyTheme(next);
  };

  const tabs = [
    { id: 'empresa', label: 'Empresa', icon: Store },
    { id: 'ventas', label: 'Ventas', icon: Settings2 },
    { id: 'marca', label: 'Marca y Apariencia', icon: Palette },
    { id: 'sistema', label: 'Sistema', icon: Database },
  ] as const;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="border-b border-gray-100 dark:border-gray-800">
          <nav className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-6 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-brand-primary text-brand-primary'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          {activeTab === 'empresa' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Razón Social" value={form.razon_social} onChange={v => handleChange('razon_social', v)} />
              <Field label="Nombre de Fantasía" value={form.nombre_fantasia} onChange={v => handleChange('nombre_fantasia', v)} />
              <Field label="CUIT" value={form.cuit} onChange={v => handleChange('cuit', v)} placeholder="30-12345678-9" />
              <Field label="Teléfono" value={form.telefono} onChange={v => handleChange('telefono', v)} />
              <Field label="Email" type="email" value={form.email} onChange={v => handleChange('email', v)} />
              <Field label="Dirección" value={form.direccion} onChange={v => handleChange('direccion', v)} />
              <Field label="Localidad" value={form.localidad} onChange={v => handleChange('localidad', v)} />
              <Field label="Provincia" value={form.provincia} onChange={v => handleChange('provincia', v)} />
              <Field label="Código Postal" value={form.codigo_postal} onChange={v => handleChange('codigo_postal', v)} />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Pie de Factura / Ticket</label>
                <textarea
                  value={form.pie_factura}
                  onChange={e => handleChange('pie_factura', e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                  rows={3}
                  placeholder="Texto que aparece al pie de los comprobantes..."
                />
              </div>
            </div>
          )}

          {activeTab === 'ventas' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Moneda</label>
                <select
                  value={form.moneda}
                  onChange={e => handleChange('moneda', e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                >
                  <option value="ARS">ARS - Peso Argentino ($1.234,56)</option>
                  <option value="USD">USD - Dólar Estadounidense ($1,234.56)</option>
                  <option value="EUR">EUR - Euro (1.234,56€)</option>
                  <option value="PYG">PYG - Guaraní Paraguayo (Gs.1.234)</option>
                </select>
              </div>
              <Field label="Stock Mínimo por Defecto" type="number" value={form.stock_minimo_default} onChange={v => handleChange('stock_minimo_default', parseInt(v) || 0)} />
              <Field label="Margen de Ganancia por Defecto (%)" type="number" value={form.margen_ganancia_default} onChange={v => handleChange('margen_ganancia_default', parseFloat(v) || 0)} />
              <Field label="Puntos de Fidelidad por $" type="number" step="0.01" value={form.puntos_por_peso} onChange={v => handleChange('puntos_por_peso', parseFloat(v) || 0)} hint="Cantidad de puntos que se otorgan por cada $1 de compra." />
            </div>
          )}

          {activeTab === 'marca' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Logo URL</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={form.logo_url}
                      onChange={e => handleChange('logo_url', e.target.value)}
                      placeholder="https://..."
                      className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                    />
                    {form.logo_url && (
                      <div className="w-11 h-11 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex-shrink-0">
                        <img src={form.logo_url} alt="" className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">Se muestra en el sidebar y en la tienda online.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Favicon URL</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={form.favicon_url}
                      onChange={e => handleChange('favicon_url', e.target.value)}
                      placeholder="https://..."
                      className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                    />
                    {form.favicon_url && (
                      <div className="w-11 h-11 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex-shrink-0">
                        <img src={form.favicon_url} alt="" className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ColorPicker label="Color Primario" value={form.color_primario} onChange={v => handleChange('color_primario', v)} />
                <ColorPicker label="Color Secundario" value={form.color_secundario} onChange={v => handleChange('color_secundario', v)} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Tema del Administrador</label>
                <div className="flex flex-wrap gap-3">
                  {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => handleThemeChange(mode)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                        theme === mode
                          ? 'bg-brand-primary text-white border-brand-primary'
                          : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-brand-primary'
                      }`}
                    >
                      {mode === 'light' && 'Claro'}
                      {mode === 'dark' && 'Oscuro'}
                      {mode === 'system' && 'Sistema'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sistema' && (
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Información del Sistema</h4>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
                  <div>Versión: <span className="font-medium">1.0.0</span></div>
                  <div>Next.js: <span className="font-medium">15.5.18</span></div>
                  <div>React: <span className="font-medium">19</span></div>
                  <div>Tailwind: <span className="font-medium">3.4.1</span></div>
                  <div>Supabase: <span className="font-medium">Conectado</span></div>
                  <div>Tablas: <span className="font-medium">29</span></div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Datos de Prueba</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Cargá datos de demostración para probar todas las funcionalidades del sistema sin afectar datos reales.
                </p>
                <Link
                  href="/seed"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-xl hover:opacity-90 transition-opacity text-sm font-medium"
                >
                  <Database className="w-4 h-4" />
                  Abrir Cargador de Datos
                </Link>
              </div>

              <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20">
                <h4 className="font-medium text-red-800 dark:text-red-400 mb-2">Zona de Peligro</h4>
                <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                  Estas acciones son irreversibles. Usalas con precaución.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('¿Estás seguro de limpiar TODOS los datos locales? Esta acción no se puede deshacer.')) {
                      localStorage.clear();
                      toast.success('Datos locales eliminados. Recargá la página.');
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Limpiar Datos Locales
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-brand-primary text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-sm font-medium"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder, hint, step }: { label: string; value: string | number; onChange: (val: string) => void; type?: string; placeholder?: string; hint?: string; step?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        step={step}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
      />
      {hint && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">{hint}</p>}
    </div>
  );
}

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (val: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-12 h-10 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all uppercase"
        />
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        {presetColors.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${value.toLowerCase() === c.toLowerCase() ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'}`}
            style={{ backgroundColor: c }}
            title={c}
          />
        ))}
      </div>
    </div>
  );
}
