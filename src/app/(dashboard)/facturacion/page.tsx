'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import Offcanvas from '@/components/Offcanvas';
import SelectSearch from '@/components/SelectSearch';
import { useFacturacionStore, useClientesStore, useVentasStore } from '@/lib/supabase';
import TicketPrint from '@/components/TicketPrint';

// Tipos de comprobantes Paraguay (SIFEN)
const TIPOS_COMPROBANTE = [
  { value: '01', label: 'Factura Electrónica' },
  { value: '02', label: 'Nota de Crédito' },
  { value: '03', label: 'Nota de Débito' },
  { value: '04', label: 'Autofactura' },
  { value: '05', label: 'Nota de Remisión Electrónica' },
];

const ESTADOS_SIFEN: Record<string, { label: string; color: string }> = {
  pendiente: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  enviada: { label: 'Enviada a SET', color: 'bg-blue-100 text-blue-800' },
  aprobada: { label: 'Aprobada', color: 'bg-green-100 text-green-800' },
  rechazada: { label: 'Rechazada', color: 'bg-red-100 text-red-800' },
  anulada: { label: 'Anulada', color: 'bg-gray-200 text-gray-600' },
};

// Generador de CDC (Código de Control del Documento) - formato simplificado SIFEN
function generarCDC(tipo: string, ruc: string, establecimiento: string, punto: string, numero: string): string {
  const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const tipoDoc = tipo.padStart(2, '0');
  const rucPad = (ruc || '0').replace(/-/g, '').padStart(8, '0').slice(-8);
  const est = (establecimiento || '001').padStart(3, '0');
  const pt = (punto || '001').padStart(3, '0');
  const num = (numero || '1').toString().padStart(7, '0');
  const random = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
  const base = `${tipoDoc}${rucPad}${est}${pt}${num}${fecha}${random}`;
  // Generar un hash simple de verificación (en producción sería un algoritmo específico de SET)
  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    const char = base.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hashStr = Math.abs(hash).toString(36).toUpperCase().padStart(4, '0');
  return `${base}${hashStr}`.slice(0, 44);
}

export default function FacturacionPage() {
  const { facturas, isLoading, fetchFacturas, createFactura, updateFactura } = useFacturacionStore();
  const { clientes, fetchClientes } = useClientesStore();
  const { ventas, fetchVentas } = useVentasStore();

  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [showKude, setShowKude] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');

  const [formData, setFormData] = useState<any>({
    id: '', tipo_comprobante: '01', numero: 1, establecimiento: '001', punto_emision: '001',
    id_cliente: '', ruc_cliente: '', razon_social_cliente: '', condicion_venta: 'contado',
    total: 0, iva_10: 0, iva_5: 0, exentas: 0, estado: 'pendiente',
    cdc: '', fecha: new Date().toISOString(), items: []
  });

  useEffect(() => { fetchFacturas(); fetchClientes(); fetchVentas(); /* eslint-disable-next-line */ }, []);

  const nextNumero = useMemo(() => {
    if (!facturas.length) return 1;
    return Math.max(...facturas.map((f: any) => f.numero || 0)) + 1;
  }, [facturas]);

  const openNew = () => {
    setFormData({
      id: crypto.randomUUID(), tipo_comprobante: '01', numero: nextNumero,
      establecimiento: '001', punto_emision: '001', id_cliente: '', ruc_cliente: '',
      razon_social_cliente: '', condicion_venta: 'contado', total: 0,
      iva_10: 0, iva_5: 0, exentas: 0, estado: 'pendiente', cdc: '',
      fecha: new Date().toISOString(), items: []
    });
    setShowOffcanvas(true);
  };

  const openKude = (f: any) => {
    setSelectedFactura(f);
    setShowKude(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id_cliente) { toast.error('Seleccione un cliente'); return; }
    const cdc = generarCDC(formData.tipo_comprobante, formData.ruc_cliente, formData.establecimiento, formData.punto_emision, formData.numero);
    const payload = { ...formData, cdc };
    try {
      const result = await createFactura(payload);
      if (result.success) {
        toast.success(`Factura electrónica creada. CDC: ${cdc}`);
        setShowOffcanvas(false);
      } else {
        toast.error('Error al crear factura');
      }
    } catch { toast.error('Error inesperado'); }
  };

  const cambiarEstado = async (id: string, estado: string) => {
    const result = await updateFactura(id, { estado });
    if (result.success) toast.success(`Factura ${ESTADOS_SIFEN[estado]?.label || estado}`);
  };

  const filtered = facturas.filter((f: any) => {
    const matchEstado = !estadoFilter || f.estado === estadoFilter;
    const matchSearch = !searchTerm || f.cdc?.includes(searchTerm) || f.numero?.toString().includes(searchTerm);
    return matchEstado && matchSearch;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <p className="text-sm text-gray-500">Paraguay - SIFEN / SET</p>
        </div>
        <button onClick={openNew} className="bg-purple-600 text-white px-4 py-2 rounded-2xl hover:bg-purple-700 transition-colors flex items-center space-x-2">
          <span>➕</span><span>Nueva Factura</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {Object.entries(ESTADOS_SIFEN).map(([key, cfg]) => (
          <div key={key} className="bg-white rounded-3xl p-6 shadow-sm">
            <p className="text-sm text-gray-500">{cfg.label}</p>
            <p className="text-2xl font-bold">{facturas.filter((f: any) => f.estado === key).length}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <input type="text" placeholder="Buscar por CDC o número..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" />
          <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
        </div>
        <select value={estadoFilter} onChange={e => setEstadoFilter(e.target.value)} className="px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500">
          <option value="">Todos los estados</option>
          {Object.entries(ESTADOS_SIFEN).map(([key, cfg]) => (<option key={key} value={key}>{cfg.label}</option>))}
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-12"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div><p className="mt-2 text-gray-500">Cargando...</p></div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Nº</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Tipo</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Cliente</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Total</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">CDC</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Estado</th><th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Acciones</th></tr></thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center"><div className="text-4xl mb-2">📄</div><p className="text-gray-500">No hay facturas electrónicas</p></td></tr>
                ) : filtered.map((f: any) => {
                  const cfg = ESTADOS_SIFEN[f.estado] || ESTADOS_SIFEN.pendiente;
                  const tipoLabel = TIPOS_COMPROBANTE.find(t => t.value === f.tipo_comprobante)?.label || f.tipo_comprobante;
                  return (
                    <tr key={f.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium">{f.establecimiento}-{f.punto_emision}-{f.numero?.toString().padStart(7,'0')}</td>
                      <td className="px-4 py-3 text-sm">{tipoLabel}</td>
                      <td className="px-4 py-3 text-sm">{f.razon_social_cliente || '—'}</td>
                      <td className="px-4 py-3 font-medium">${parseFloat(f.total || 0).toFixed(2)}</td>
                      <td className="px-4 py-3"><code className="text-xs bg-gray-100 px-2 py-1 rounded">{f.cdc?.slice(0, 16)}...</code></td>
                      <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${cfg.color}`}>{cfg.label}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center space-x-1 flex-wrap gap-1">
                          <button onClick={() => openKude(f)} className="p-2 text-purple-600 hover:bg-white rounded-2xl shadow-sm" title="Ver KuDE">📄</button>
                          <TicketPrint
                            data={{
                              titulo: 'FACTURA ELECTRONICA',
                              numero: `${f.establecimiento}-${f.punto_emision}-${f.numero?.toString().padStart(7,'0')}`,
                              fecha: f.fecha,
                              cliente: f.razon_social_cliente,
                              items: [{ nombre: f.tipo_comprobante, cantidad: 1, precio: f.total, total: f.total }],
                              total: f.total,
                              observaciones: `CDC: ${f.cdc}`,
                              pie: 'Documento emitido según SIFEN/SET Paraguay',
                            }}
                            buttonLabel="🖨️"
                            buttonClassName="p-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm"
                          />
                          {f.estado === 'pendiente' && (
                            <><button onClick={() => cambiarEstado(f.id, 'enviada')} className="p-2 text-blue-600 hover:bg-white rounded-2xl shadow-sm" title="Marcar como Enviada">📡</button>
                            <button onClick={() => cambiarEstado(f.id, 'aprobada')} className="p-2 text-green-600 hover:bg-white rounded-2xl shadow-sm" title="Aprobar">✅</button></>
                          )}
                          {f.estado === 'rechazada' && (
                            <button onClick={() => cambiarEstado(f.id, 'pendiente')} className="p-2 text-yellow-600 hover:bg-white rounded-2xl shadow-sm" title="Reintentar">🔄</button>
                          )}
                          {(f.estado === 'pendiente' || f.estado === 'rechazada') && (
                            <button onClick={() => cambiarEstado(f.id, 'anulada')} className="p-2 text-gray-600 hover:bg-white rounded-2xl shadow-sm" title="Anular">🚫</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Offcanvas isOpen={showOffcanvas} onClose={() => setShowOffcanvas(false)} title="Nueva Factura Electrónica (SIFEN)" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Establecimiento</label>
              <input type="text" value={formData.establecimiento} onChange={e => setFormData({...formData, establecimiento: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" maxLength={3} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Punto Emisión</label>
              <input type="text" value={formData.punto_emision} onChange={e => setFormData({...formData, punto_emision: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" maxLength={3} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
              <input type="number" value={formData.numero} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Comprobante</label>
              <select value={formData.tipo_comprobante} onChange={e => setFormData({...formData, tipo_comprobante: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500">
                {TIPOS_COMPROBANTE.map(t => (<option key={t.value} value={t.value}>{t.label}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condición</label>
              <select value={formData.condicion_venta} onChange={e => setFormData({...formData, condicion_venta: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500">
                <option value="contado">Contado</option>
                <option value="credito">Crédito</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
            <SelectSearch options={clientes.map((c: any) => ({ value: c.id, label: `${c.nombre} ${c.apellido || ''} ${c.cuil_cuit ? '('+c.cuil_cuit+')' : ''}` }))} value={formData.id_cliente} onChange={v => {
              const cliente: any = clientes.find((c: any) => c.id === v);
              setFormData({...formData, id_cliente: v, ruc_cliente: cliente?.cuil_cuit || '', razon_social_cliente: cliente ? (cliente.tipo_persona === 'fisica' ? `${cliente.apellido || ''}, ${cliente.nombre || ''}` : cliente.razon_social) : ''});
            }} placeholder="Buscar cliente..." />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total ($)</label>
              <input type="number" step="0.01" value={formData.total} onChange={e => setFormData({...formData, total: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IVA 10%</label>
              <input type="number" step="0.01" value={formData.iva_10} onChange={e => setFormData({...formData, iva_10: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IVA 5%</label>
              <input type="number" step="0.01" value={formData.iva_5} onChange={e => setFormData({...formData, iva_5: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button type="button" onClick={() => setShowOffcanvas(false)} className="px-4 py-2 border border-gray-300 rounded-2xl hover:bg-gray-50">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-2xl hover:bg-purple-700">💾 Generar Factura</button>
          </div>
        </form>
      </Offcanvas>

      {/* KuDE Preview */}
      <Offcanvas isOpen={showKude} onClose={() => setShowKude(false)} title="KuDE - Representación Gráfica" size="md">
        {selectedFactura && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
              <div className="text-center space-y-2">
                <h3 className="font-bold text-lg">KUDE</h3>
                <p className="text-sm text-gray-500">Kuérsume de Documento Electrónico</p>
                <p className="text-xs text-gray-400">SIFEN - SET Paraguay</p>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Tipo:</span><span className="font-medium">{TIPOS_COMPROBANTE.find(t => t.value === selectedFactura.tipo_comprobante)?.label}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Número:</span><span className="font-mono">{selectedFactura.establecimiento}-{selectedFactura.punto_emision}-{selectedFactura.numero?.toString().padStart(7,'0')}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Fecha:</span><span>{new Date(selectedFactura.fecha).toLocaleDateString('es-PY')}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Cliente:</span><span className="font-medium">{selectedFactura.razon_social_cliente}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">RUC:</span><span>{selectedFactura.ruc_cliente || '—'}</span></div>
                <div className="border-t pt-2 mt-2 space-y-1">
                  <div className="flex justify-between"><span>Total:</span><span className="font-bold">${parseFloat(selectedFactura.total || 0).toFixed(2)}</span></div>
                  {selectedFactura.iva_10 > 0 && <div className="flex justify-between text-xs"><span>IVA 10%:</span><span>${selectedFactura.iva_10.toFixed(2)}</span></div>}
                  {selectedFactura.iva_5 > 0 && <div className="flex justify-between text-xs"><span>IVA 5%:</span><span>${selectedFactura.iva_5.toFixed(2)}</span></div>}
                </div>
                <div className="pt-2">
                  <p className="text-xs text-gray-500">CDC:</p>
                  <code className="text-xs bg-white px-2 py-1 rounded block break-all">{selectedFactura.cdc}</code>
                </div>
                <div className="pt-2 text-center">
                  <p className="text-xs text-gray-400">Este documento es una representación gráfica del Documento Electrónico.</p>
                </div>
              </div>
            </div>
            <button onClick={() => window.print()} className="w-full px-4 py-2 bg-purple-600 text-white rounded-2xl hover:bg-purple-700">🖨️ Imprimir KuDE</button>
          </div>
        )}
      </Offcanvas>
    </div>
  );
}
