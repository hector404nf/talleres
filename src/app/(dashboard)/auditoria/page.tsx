'use client';

import { useState, useEffect } from 'react';
import { useAuditoriaStore } from '@/lib/supabase';

const TABLAS: Record<string, string> = {
  clientes: 'Clientes',
  productos: 'Productos',
  ventas: 'Ventas',
  ordenes_servicio: 'Servicios',
  proveedores: 'Proveedores',
  compras: 'Compras',
  presupuestos: 'Presupuestos',
  pedidos: 'Pedidos',
  cajas: 'Caja',
  usuarios: 'Usuarios',
};

export default function AuditoriaPage() {
  const { registros, fetchAuditoria } = useAuditoriaStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [tablaFilter, setTablaFilter] = useState('');
  const [selectedRegistro, setSelectedRegistro] = useState<any>(null);

  useEffect(() => { fetchAuditoria(); /* eslint-disable-next-line */ }, []);

  const filtered = registros.filter((r: any) => {
    const matchTabla = !tablaFilter || r.tabla === tablaFilter;
    const matchSearch = !searchTerm || (r.accion?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || (r.usuario?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchTabla && matchSearch;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <p className="text-sm text-gray-500">Trail de cambios recientes (últimos 500 registros)</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Total Registros</p>
          <p className="text-2xl font-bold">{registros.length}</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Creaciones</p>
          <p className="text-2xl font-bold">{registros.filter((r: any) => r.accion === 'crear').length}</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Actualizaciones</p>
          <p className="text-2xl font-bold">{registros.filter((r: any) => r.accion === 'actualizar').length}</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Eliminaciones</p>
          <p className="text-2xl font-bold">{registros.filter((r: any) => r.accion === 'eliminar').length}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <input type="text" placeholder="Buscar por acción o usuario..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" />
          <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
        </div>
        <select value={tablaFilter} onChange={e => setTablaFilter(e.target.value)} className="px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500">
          <option value="">Todas las tablas</option>
          {Object.entries(TABLAS).map(([key, label]) => (<option key={key} value={key}>{label}</option>))}
        </select>
      </div>

      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Fecha</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Usuario</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Acción</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Tabla</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Detalle</th></tr></thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center"><div className="text-4xl mb-2">📋</div><p className="text-gray-500">No hay registros de auditoría</p><p className="text-xs text-gray-400 mt-1">Los cambios realizados en el sistema se registrarán automáticamente aquí.</p></td></tr>
              ) : filtered.map((r: any) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedRegistro(r)}>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">{new Date(r.fecha).toLocaleString('es-AR')}</td>
                  <td className="px-4 py-3 text-sm font-medium">{r.usuario}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${r.accion === 'crear' ? 'bg-green-100 text-green-800' : r.accion === 'actualizar' ? 'bg-blue-100 text-blue-800' : r.accion === 'eliminar' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{r.accion}</span></td>
                  <td className="px-4 py-3 text-sm">{TABLAS[r.tabla] || r.tabla}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{r.datos_nuevos?.nombre || r.datos_nuevos?.razon_social || r.datos_nuevos?.numero || r.id_registro?.slice(0, 8)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRegistro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedRegistro(null)}></div>
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Detalle del Cambio</h3>
              <button onClick={() => setSelectedRegistro(null)} className="text-gray-500 text-xl">✕</button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2"><span className="text-gray-500">Usuario:</span><span className="font-medium">{selectedRegistro.usuario}</span></div>
              <div className="grid grid-cols-2 gap-2"><span className="text-gray-500">Fecha:</span><span>{new Date(selectedRegistro.fecha).toLocaleString('es-AR')}</span></div>
              <div className="grid grid-cols-2 gap-2"><span className="text-gray-500">Acción:</span><span className="font-medium capitalize">{selectedRegistro.accion}</span></div>
              <div className="grid grid-cols-2 gap-2"><span className="text-gray-500">Tabla:</span><span>{TABLAS[selectedRegistro.tabla] || selectedRegistro.tabla}</span></div>
              <div className="grid grid-cols-2 gap-2"><span className="text-gray-500">ID Registro:</span><span className="font-mono text-xs">{selectedRegistro.id_registro}</span></div>
              {selectedRegistro.datos_viejos && (
                <div>
                  <p className="text-gray-500 mb-1">Datos anteriores:</p>
                  <pre className="bg-red-50 p-3 rounded text-xs overflow-x-auto">{JSON.stringify(selectedRegistro.datos_viejos, null, 2)}</pre>
                </div>
              )}
              {selectedRegistro.datos_nuevos && (
                <div>
                  <p className="text-gray-500 mb-1">Datos nuevos:</p>
                  <pre className="bg-green-50 p-3 rounded text-xs overflow-x-auto">{JSON.stringify(selectedRegistro.datos_nuevos, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
