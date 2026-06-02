'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Offcanvas from '@/components/Offcanvas';
import { useCajasStore } from '@/lib/supabase';
import { formatPriceConfig } from '@/lib/format';

const tiposMovimiento = [
  { value: 'ingreso_venta', label: 'Ingreso por Venta' },
  { value: 'ingreso_cobro', label: 'Ingreso por Cobro' },
  { value: 'ingreso_otros', label: 'Ingreso Otros' },
  { value: 'egreso_gasto', label: 'Egreso por Gasto' },
  { value: 'egreso_pago', label: 'Egreso por Pago' },
  { value: 'egreso_retiro', label: 'Retiro de Caja' },
  { value: 'ajuste_ingreso', label: 'Ajuste Ingreso' },
  { value: 'ajuste_egreso', label: 'Ajuste Egreso' },
];

interface Movimiento {
  id: string;
  tipo_movimiento: string;
  importe: number;
  concepto: string;
  fecha: string;
  forma_pago?: string;
}

export default function CajaPage() {
  const { cajas, isLoading, fetchCajas, createCaja, updateCaja } = useCajasStore();
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [showMovimiento, setShowMovimiento] = useState(false);
  const [selectedCaja, setSelectedCaja] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [cajaForm, setCajaForm] = useState({ nombre: '', saldo_inicial: 0 });
  const [movForm, setMovForm] = useState({ tipo_movimiento: 'ingreso_otros', importe: 0, concepto: '', forma_pago: 'efectivo' });
  const [showArqueo, setShowArqueo] = useState(false);
  const [arqueoForm, setArqueoForm] = useState({ saldo_fisico: 0, observaciones: '' });

  const formasPago = [
    { value: 'efectivo', label: '💵 Efectivo' },
    { value: 'tarjeta_debito', label: '💳 Débito' },
    { value: 'tarjeta_credito', label: '💳 Crédito' },
    { value: 'transferencia', label: '🏦 Transferencia' },
    { value: 'cheque', label: '📄 Cheque' },
    { value: 'otro', label: '⚪ Otro' },
  ];

  useEffect(() => { fetchCajas(); /* eslint-disable-next-line */ }, []);

  const openCaja = () => {
    setCajaForm({ nombre: 'Caja Principal', saldo_inicial: 0 });
    setShowOffcanvas(true);
  };

  const handleOpenCaja = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await createCaja({
        ...cajaForm,
        id: crypto.randomUUID(),
        activa: true,
        fecha_apertura: new Date().toISOString(),
        saldo_actual: cajaForm.saldo_inicial,
        movimientos: [] as Movimiento[]
      });
      if (result.success) { toast.success('Caja abierta'); setShowOffcanvas(false); }
      else toast.error('Error al abrir caja');
    } catch { toast.error('Error inesperado'); }
    finally { setIsSubmitting(false); }
  };

  const openArqueo = (caja: any) => {
    setSelectedCaja(caja);
    setArqueoForm({ saldo_fisico: parseFloat(caja.saldo_actual || 0), observaciones: '' });
    setShowArqueo(true);
  };

  const handleArqueo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaja) return;
    setIsSubmitting(true);
    try {
      const saldoCalculado = parseFloat(selectedCaja.saldo_actual || 0);
      const diferencia = arqueoForm.saldo_fisico - saldoCalculado;
      const result = await updateCaja(selectedCaja.id, {
        activa: false,
        fecha_cierre: new Date().toISOString(),
        saldo_fisico: arqueoForm.saldo_fisico,
        diferencia_arqueo: diferencia,
        observaciones_arqueo: arqueoForm.observaciones,
      });
      if (result.success) {
        toast.success(diferencia === 0 ? 'Caja cerrada. Arqueo cuadrado ✅' : `Caja cerrada. Diferencia: ${formatPriceConfig(diferencia)}`);
        setShowArqueo(false);
      } else toast.error('Error al cerrar');
    } catch { toast.error('Error inesperado'); }
    finally { setIsSubmitting(false); }
  };

  const openMovimiento = (caja: any) => {
    setSelectedCaja(caja);
    setMovForm({ tipo_movimiento: 'ingreso_otros', importe: 0, concepto: '', forma_pago: 'efectivo' });
    setShowMovimiento(true);
  };

  const handleMovimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movForm.concepto.trim()) { toast.error('Ingrese un concepto'); return; }
    setIsSubmitting(true);
    try {
      const mov: Movimiento = { id: crypto.randomUUID(), ...movForm, fecha: new Date().toISOString() };
      const movimientos = [...(selectedCaja.movimientos || []), mov];
      const ingresos = movimientos.filter((m: Movimiento) => m.tipo_movimiento.startsWith('ingreso') || m.tipo_movimiento.startsWith('ajuste_ingreso')).reduce((s: number, m: Movimiento) => s + (parseFloat(m.importe as any) || 0), 0);
      const egresos = movimientos.filter((m: Movimiento) => m.tipo_movimiento.startsWith('egreso') || m.tipo_movimiento.startsWith('ajuste_egreso')).reduce((s: number, m: Movimiento) => s + (parseFloat(m.importe as any) || 0), 0);
      const saldo_actual = (parseFloat(selectedCaja.saldo_inicial) || 0) + ingresos - egresos;
      const result = await updateCaja(selectedCaja.id, { movimientos, saldo_actual });
      if (result.success) { toast.success('Movimiento registrado'); setShowMovimiento(false); }
      else toast.error('Error al registrar');
    } catch { toast.error('Error inesperado'); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div>
      <div className="flex justify-end mb-6">\n        <button onClick={openCaja} className="bg-purple-600 text-white px-4 py-2 rounded-2xl hover:bg-purple-700 transition-colors flex items-center space-x-2">
          <span>🔓</span><span>Abrir Caja</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Cajas Activas</p>
          <p className="text-2xl font-bold">{cajas.filter((c: any) => c.activa).length}</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Total en Caja</p>
          <p className="text-2xl font-bold">{formatPriceConfig(cajas.reduce((sum: number, c: any) => sum + (parseFloat(c.saldo_actual) || 0), 0))}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div><p className="mt-2 text-gray-500">Cargando...</p></div>
      ) : (
        <div className="space-y-6">
          {cajas.length === 0 && (
            <div className="bg-white rounded-3xl shadow-sm p-12 text-center"><div className="text-4xl mb-2">💵</div><p className="text-gray-500">No hay cajas registradas. Abra una nueva caja para comenzar.</p></div>
          )}
          {cajas.map((caja: any) => {
            const movimientos: Movimiento[] = caja.movimientos || [];
            const ingresos = movimientos.filter(m => m.tipo_movimiento.startsWith('ingreso') || m.tipo_movimiento.startsWith('ajuste_ingreso')).reduce((s, m) => s + (parseFloat(m.importe as any) || 0), 0);
            const egresos = movimientos.filter(m => m.tipo_movimiento.startsWith('egreso') || m.tipo_movimiento.startsWith('ajuste_egreso')).reduce((s, m) => s + (parseFloat(m.importe as any) || 0), 0);
            return (
              <div key={caja.id} className="bg-white rounded-3xl shadow-sm overflow-hidden">
                <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold">{caja.nombre}</h3>
                      {caja.activa ? <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full font-medium">Abierta</span> : <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">Cerrada</span>}
                    </div>
                    <p className="text-sm text-gray-500">Apertura: {caja.fecha_apertura ? new Date(caja.fecha_apertura).toLocaleString('es-AR') : '—'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {caja.activa && (
                      <><button onClick={() => openMovimiento(caja)} className="px-3 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 text-sm">➕ Movimiento</button>
                      <button onClick={() => openArqueo(caja)} className="px-3 py-2 bg-red-600 text-white rounded-2xl hover:bg-red-700 text-sm">🔒 Cerrar</button></>
                    )}
                  </div>
                </div>
                <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50">
                  <div><p className="text-xs text-gray-500">Saldo Inicial</p><p className="font-medium">{formatPriceConfig(caja.saldo_inicial || 0)}</p></div>
                  <div><p className="text-xs text-gray-500">Ingresos</p><p className="font-medium text-green-700">+{formatPriceConfig(ingresos)}</p></div>
                  <div><p className="text-xs text-gray-500">Egresos</p><p className="font-medium text-red-700">-{formatPriceConfig(egresos)}</p></div>
                  <div><p className="text-xs text-gray-500">Saldo Actual</p><p className="font-bold text-lg text-purple-700">{formatPriceConfig(caja.saldo_actual || 0)}</p></div>
                </div>
                {(() => {
                  const saldosPorPago: Record<string, number> = {};
                  movimientos.forEach(m => {
                    const fp = m.forma_pago || 'efectivo';
                    const esIngreso = m.tipo_movimiento.startsWith('ingreso') || m.tipo_movimiento.startsWith('ajuste_ingreso');
                    const esEgreso = m.tipo_movimiento.startsWith('egreso') || m.tipo_movimiento.startsWith('ajuste_egreso');
                    if (esIngreso) saldosPorPago[fp] = (saldosPorPago[fp] || 0) + (parseFloat(m.importe as any) || 0);
                    if (esEgreso) saldosPorPago[fp] = (saldosPorPago[fp] || 0) - (parseFloat(m.importe as any) || 0);
                  });
                  const entries = Object.entries(saldosPorPago).filter(([_, val]) => val !== 0);
                  if (entries.length === 0) return null;
                  return (
                    <div className="px-4 py-3 bg-blue-50 border-t">
                      <p className="text-xs font-medium text-blue-800 mb-2">Saldo por forma de pago</p>
                      <div className="flex flex-wrap gap-2">
                        {entries.map(([fp, val]) => {
                          const label = formasPago.find(f => f.value === fp)?.label || fp;
                          return (
                            <span key={fp} className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${val >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {label}: {formatPriceConfig(val)}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
                {!caja.activa && caja.diferencia_arqueo !== undefined && (
                  <div className={`p-3 ${caja.diferencia_arqueo === 0 ? 'bg-green-50' : 'bg-orange-50'} border-t`}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Arqueo físico: <strong>{formatPriceConfig(caja.saldo_fisico || 0)}</strong></span>
                      <span className={caja.diferencia_arqueo === 0 ? 'text-green-700 font-medium' : 'text-orange-700 font-medium'}>
                        {caja.diferencia_arqueo === 0 ? '✅ Cuadrado' : `Diferencia: ${formatPriceConfig(caja.diferencia_arqueo)}`}
                      </span>
                    </div>
                    {caja.observaciones_arqueo && <p className="text-xs text-gray-500 mt-1">{caja.observaciones_arqueo}</p>}
                  </div>
                )}
                {movimientos.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50/50"><tr><th className="px-4 py-2 text-left">Fecha</th><th className="px-4 py-2 text-left">Tipo</th><th className="px-4 py-2 text-left">Concepto</th><th className="px-4 py-2 text-right">Importe</th></tr></thead>
                      <tbody className="divide-y divide-gray-50">
                        {movimientos.slice().reverse().map((m: Movimiento) => (
                          <tr key={m.id}>
                            <td className="px-4 py-2">{new Date(m.fecha).toLocaleString('es-AR')}</td>
                            <td className="px-4 py-2"><span className={`px-2 py-0.5 rounded text-xs font-medium ${m.tipo_movimiento.startsWith('ingreso') || m.tipo_movimiento.startsWith('ajuste_ingreso') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{tiposMovimiento.find(t => t.value === m.tipo_movimiento)?.label || m.tipo_movimiento}</span></td>
                            <td className="px-4 py-2 text-gray-600">{m.concepto}</td>
                            <td className="px-4 py-2 text-right font-medium">{formatPriceConfig(m.importe)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Offcanvas isOpen={showOffcanvas} onClose={() => setShowOffcanvas(false)} title="Abrir Caja" size="sm">
        <form onSubmit={handleOpenCaja} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input type="text" value={cajaForm.nombre} onChange={e => setCajaForm({...cajaForm, nombre: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Saldo Inicial ($)</label>
            <input type="number" min={0} step="0.01" value={cajaForm.saldo_inicial} onChange={e => setCajaForm({...cajaForm, saldo_inicial: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" required />
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button type="button" onClick={() => setShowOffcanvas(false)} className="px-4 py-2 border border-gray-300 rounded-2xl hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 disabled:opacity-50">{isSubmitting ? 'Abriendo...' : '🔓 Abrir Caja'}</button>
          </div>
        </form>
      </Offcanvas>

      <Offcanvas isOpen={showMovimiento} onClose={() => setShowMovimiento(false)} title="Registrar Movimiento" size="sm">
        <form onSubmit={handleMovimiento} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select value={movForm.tipo_movimiento} onChange={e => setMovForm({...movForm, tipo_movimiento: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500">
              {tiposMovimiento.map(t => (<option key={t.value} value={t.value}>{t.label}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pago</label>
            <select value={movForm.forma_pago} onChange={e => setMovForm({...movForm, forma_pago: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500">
              {formasPago.map(f => (<option key={f.value} value={f.value}>{f.label}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Importe ($)</label>
            <input type="number" min={0.01} step="0.01" value={movForm.importe} onChange={e => setMovForm({...movForm, importe: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Concepto</label>
            <input type="text" value={movForm.concepto} onChange={e => setMovForm({...movForm, concepto: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" required placeholder="Ej: Pago proveedor, gasto varios..." />
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button type="button" onClick={() => setShowMovimiento(false)} className="px-4 py-2 border border-gray-300 rounded-2xl hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 disabled:opacity-50">{isSubmitting ? 'Guardando...' : '💾 Guardar'}</button>
          </div>
        </form>
      </Offcanvas>

      <Offcanvas isOpen={showArqueo} onClose={() => setShowArqueo(false)} title="Arqueo y Cierre de Caja" size="sm">
        <form onSubmit={handleArqueo} className="space-y-4">
          {selectedCaja && (
            <div className="p-3 bg-white rounded-2xl shadow-sm text-sm">
              <p className="text-gray-600">Saldo calculado por el sistema:</p>
              <p className="text-xl font-bold text-purple-700">{formatPriceConfig(selectedCaja.saldo_actual || 0)}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Saldo Físico Contado ($)</label>
            <input type="number" step="0.01" value={arqueoForm.saldo_fisico} onChange={e => setArqueoForm({...arqueoForm, saldo_fisico: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" required />
          </div>
          {selectedCaja && (
            <div className={`p-3 rounded-lg text-sm font-medium ${(arqueoForm.saldo_fisico - parseFloat(selectedCaja.saldo_actual || 0)) === 0 ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
              Diferencia: {formatPriceConfig(arqueoForm.saldo_fisico - parseFloat(selectedCaja.saldo_actual || 0))}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones del Arqueo</label>
            <textarea value={arqueoForm.observaciones} onChange={e => setArqueoForm({...arqueoForm, observaciones: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500" rows={3} placeholder="Ej: Faltante por error de cálculo, sobrante..." />
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button type="button" onClick={() => setShowArqueo(false)} className="px-4 py-2 border border-gray-300 rounded-2xl hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-red-600 text-white rounded-2xl hover:bg-red-700 disabled:opacity-50">{isSubmitting ? 'Cerrando...' : '🔒 Cerrar Caja'}</button>
          </div>
        </form>
      </Offcanvas>
    </div>
  );
}
