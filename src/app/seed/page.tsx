'use client';

import { useState } from 'react';
import { seedAllData, clearAllData } from '@/lib/seed-data';
import { seedSupabase, SeedResult } from '@/lib/seed-supabase';
import { Database, Trash2, CheckCircle, AlertTriangle, ArrowLeft, RefreshCw, Server, HardDrive, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

export default function SeedPage() {
  const [localResult, setLocalResult] = useState<Record<string, number> | null>(null);
  const [supaResult, setSupaResult] = useState<SeedResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'idle' | 'local' | 'supabase'>('idle');
  const [cleared, setCleared] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleSeedLocal = () => {
    if (!confirm('¿Cargar datos de prueba en localStorage? Esto sobreescribirá datos locales existentes.')) return;
    setLoading(true);
    setMode('local');
    setCleared(false);
    setLocalResult(null);
    setSupaResult(null);
    setTimeout(() => {
      const res = seedAllData();
      setLocalResult(res);
      setLoading(false);
    }, 600);
  };

  const handleSeedSupabase = async () => {
    if (!confirm('¿Cargar datos de prueba en Supabase? Esto insertará filas en la base de datos online. Si ya existen datos podría fallar por duplicados.')) return;
    setLoading(true);
    setMode('supabase');
    setCleared(false);
    setLocalResult(null);
    setSupaResult(null);
    try {
      const res = await seedSupabase();
      setSupaResult(res);
    } catch (e: any) {
      setSupaResult([{ table: 'general', status: 'error', count: 0, message: e.message || 'Error desconocido' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    if (!confirm('¿Borrar TODOS los datos de prueba de localStorage?')) return;
    setLoading(true);
    setLocalResult(null);
    setSupaResult(null);
    setMode('idle');
    setTimeout(() => {
      clearAllData();
      setCleared(true);
      setLoading(false);
    }, 400);
  };

  const okCount = supaResult?.filter((r) => r.status === 'ok').length ?? 0;
  const errCount = supaResult?.filter((r) => r.status === 'error').length ?? 0;

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl p-8 md:p-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-[#4f46e5] rounded-2xl flex items-center justify-center">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Datos de Prueba</h1>
            <p className="text-sm text-gray-500">Elegí dónde querés cargar los datos de demostración</p>
          </div>
        </div>

        <div className="mt-8 space-y-5">
          {/* Info box */}
          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">¿Cuál elegir?</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Supabase</strong>: los datos se guardan en la base online. Los vas a ver desde cualquier navegador o dispositivo. Es lo recomendado para probar el sistema en serio.</li>
                  <li><strong>localStorage</strong>: los datos quedan solo en este navegador. Es útil para probar sin tocar la base online.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={handleSeedSupabase}
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-3.5 px-6 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-semibold rounded-2xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading && mode === 'supabase' ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Server className="w-5 h-5" />}
              {loading && mode === 'supabase' ? 'Insertando...' : 'Cargar en Supabase'}
            </button>

            <button
              onClick={handleSeedLocal}
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-3.5 px-6 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-semibold rounded-2xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading && mode === 'local' ? <RefreshCw className="w-5 h-5 animate-spin" /> : <HardDrive className="w-5 h-5" />}
              {loading && mode === 'local' ? 'Cargando...' : 'Cargar en localStorage'}
            </button>
          </div>

          <button
            onClick={handleClear}
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-medium rounded-2xl transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Limpiar localStorage
          </button>

          {/* LocalStorage results */}
          {localResult && (
            <div className="p-5 bg-green-50 rounded-2xl border border-green-100">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h2 className="font-bold text-green-800">Datos cargados en localStorage</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(localResult).map(([key, count]) => (
                  <div key={key} className="bg-white rounded-xl px-4 py-3 border border-green-100">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">{key.replace(/_/g, ' ')}</div>
                    <div className="text-lg font-bold text-gray-900">{count}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-3">
                <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white text-sm font-medium rounded-xl transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  Ir al Dashboard
                </Link>
                <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl transition-colors">
                  <RefreshCw className="w-4 h-4" />
                  Refrescar
                </button>
              </div>
            </div>
          )}

          {/* Supabase results */}
          {supaResult && (
            <div className="p-5 bg-green-50 rounded-2xl border border-green-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-green-600" />
                  <h2 className="font-bold text-green-800">Resultado de carga en Supabase</h2>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-green-700 font-medium">{okCount} OK</span>
                  {errCount > 0 && <span className="text-red-600 font-medium">{errCount} errores</span>}
                </div>
              </div>

              <button
                onClick={() => setShowDetails((s) => !s)}
                className="flex items-center gap-1 text-sm text-green-700 font-medium mb-2 hover:underline"
              >
                {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {showDetails ? 'Ocultar detalle' : 'Ver detalle por tabla'}
              </button>

              {showDetails && (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {supaResult.map((r) => (
                    <div key={r.table} className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm border ${r.status === 'ok' ? 'bg-white border-green-100' : r.status === 'error' ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${r.status === 'ok' ? 'bg-green-500' : r.status === 'error' ? 'bg-red-500' : 'bg-gray-400'}`} />
                        <span className="font-medium text-gray-700 truncate">{r.table}</span>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <span className={`font-semibold ${r.status === 'ok' ? 'text-green-700' : r.status === 'error' ? 'text-red-600' : 'text-gray-500'}`}>
                          {r.status === 'ok' ? `${r.count} filas` : r.status === 'error' ? 'Error' : 'Vacío'}
                        </span>
                        {r.message && <p className="text-xs text-gray-500">{r.message}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 flex gap-3">
                <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white text-sm font-medium rounded-xl transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  Ir al Dashboard
                </Link>
                <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl transition-colors">
                  <RefreshCw className="w-4 h-4" />
                  Refrescar
                </button>
              </div>
            </div>
          )}

          {cleared && (
            <div className="p-5 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-red-600" />
              <div>
                <h2 className="font-bold text-red-800">Datos eliminados</h2>
                <p className="text-sm text-red-700">Todos los datos de prueba fueron removidos del localStorage.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
