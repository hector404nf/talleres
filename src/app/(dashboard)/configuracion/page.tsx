'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Database } from 'lucide-react';

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
};

export default function ConfiguracionPage() {
  const [config, setConfig] = useState<ConfigData>({ ...emptyConfig });
  const [activeTab, setActiveTab] = useState<'empresa' | 'ventas' | 'sistema'>('empresa');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('configuracion');
    if (stored) {
      try {
        setConfig(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing config:', e);
      }
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      localStorage.setItem('configuracion', JSON.stringify(config));
      toast.success('Configuración guardada correctamente');
    } catch {
      toast.error('Error al guardar la configuración');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {(['empresa', 'ventas', 'sistema'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'empresa' && '🏢 Datos de la Empresa'}
                {tab === 'ventas' && '💰 Configuración de Ventas'}
                {tab === 'sistema' && '⚙️ Configuración del Sistema'}
              </button>
            ))}
          </nav>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          {activeTab === 'empresa' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social</label>
                <input
                  type="text"
                  value={config.razon_social}
                  onChange={e => setConfig({...config, razon_social: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Fantasía</label>
                <input
                  type="text"
                  value={config.nombre_fantasia}
                  onChange={e => setConfig({...config, nombre_fantasia: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CUIT</label>
                <input
                  type="text"
                  value={config.cuit}
                  onChange={e => setConfig({...config, cuit: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500"
                  placeholder="30-12345678-9"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  type="text"
                  value={config.telefono}
                  onChange={e => setConfig({...config, telefono: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={config.email}
                  onChange={e => setConfig({...config, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input
                  type="text"
                  value={config.direccion}
                  onChange={e => setConfig({...config, direccion: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Localidad</label>
                <input
                  type="text"
                  value={config.localidad}
                  onChange={e => setConfig({...config, localidad: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
                <input
                  type="text"
                  value={config.provincia}
                  onChange={e => setConfig({...config, provincia: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
                <input
                  type="text"
                  value={config.codigo_postal}
                  onChange={e => setConfig({...config, codigo_postal: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Pie de Factura / Ticket</label>
                <textarea
                  value={config.pie_factura}
                  onChange={e => setConfig({...config, pie_factura: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Texto que aparece al pie de los comprobantes..."
                />
              </div>
            </div>
          )}

          {activeTab === 'ventas' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
                <select
                  value={config.moneda}
                  onChange={e => setConfig({...config, moneda: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ARS">ARS - Peso Argentino ($1.234,56)</option>
                  <option value="USD">USD - Dólar Estadounidense ($1,234.56)</option>
                  <option value="EUR">EUR - Euro (1.234,56€)</option>
                  <option value="PYG">PYG - Guaraní Paraguayo (Gs.1.234)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo por Defecto</label>
                <input
                  type="number"
                  value={config.stock_minimo_default}
                  onChange={e => setConfig({...config, stock_minimo_default: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Margen de Ganancia por Defecto (%)</label>
                <input
                  type="number"
                  value={config.margen_ganancia_default}
                  onChange={e => setConfig({...config, margen_ganancia_default: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Puntos de Fidelidad por $</label>
                <input
                  type="number"
                  step="0.01"
                  value={config.puntos_por_peso}
                  onChange={e => setConfig({...config, puntos_por_peso: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 1 punto cada $100"
                />
                <p className="text-xs text-gray-500 mt-1">Cantidad de puntos que se otorgan por cada $1 de compra.</p>
              </div>
            </div>
          )}

          {activeTab === 'sistema' && (
            <div className="space-y-6">
              <div className="p-4 bg-white rounded-2xl shadow-sm">
                <h4 className="font-medium text-blue-800 mb-2">Información del Sistema</h4>
                <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
                  <div>Versión: <span className="font-medium">1.0.0</span></div>
                  <div>Next.js: <span className="font-medium">15.5.18</span></div>
                  <div>React: <span className="font-medium">19</span></div>
                  <div>Tailwind: <span className="font-medium">3.4.1</span></div>
                  <div>Supabase: <span className="font-medium">Conectado</span></div>
                  <div>Tablas: <span className="font-medium">29</span></div>
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl shadow-sm">
                <h4 className="font-medium text-blue-800 mb-2">Datos de Prueba</h4>
                <p className="text-sm text-blue-700 mb-4">
                  Cargá datos de demostración para probar todas las funcionalidades del sistema sin afectar datos reales.
                </p>
                <Link
                  href="/seed"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#4f46e5] text-white rounded-2xl hover:bg-[#4338ca] transition-colors text-sm font-medium"
                >
                  <Database className="w-4 h-4" />
                  Abrir Cargador de Datos
                </Link>
              </div>

              <div className="p-4 bg-white rounded-2xl shadow-sm">
                <h4 className="font-medium text-yellow-800 mb-2">Zona de Peligro</h4>
                <p className="text-sm text-yellow-700 mb-4">
                  Estas acciones son irreversibles. Usalas con precaución.
                </p>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('¿Estás seguro de limpiar TODOS los datos locales? Esta acción no se puede deshacer.')) {
                        localStorage.clear();
                        toast.success('Datos locales eliminados. Recargá la página.');
                      }
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-colors text-sm"
                  >
                    Limpiar Datos Locales
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? '💾 Guardando...' : '💾 Guardar Configuración'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
