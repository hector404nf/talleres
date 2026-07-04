'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import Offcanvas from '@/components/Offcanvas';
import SelectSearch from '@/components/SelectSearch';
import { useVentasStore, useClientesStore, useProductosStore } from '@/lib/supabase';
import TicketPrint from '@/components/TicketPrint';
import { exportComprobantePDF } from '@/lib/pdf-export';
import { formatPriceConfig, getConfig } from '@/lib/format';
import {
  Search, ShoppingCart, Plus, Minus, Trash2, Printer, FileText,
  CreditCard, Banknote, ArrowRight, X, Calendar, User, Package,
  ChevronRight, CheckCircle2, AlertCircle
} from 'lucide-react';

const FORMAS_PAGO: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  efectivo: { label: 'Efectivo', icon: Banknote, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  tarjeta_debito: { label: 'Débito', icon: CreditCard, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  tarjeta_credito: { label: 'Crédito', icon: CreditCard, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  transferencia: { label: 'Transferencia', icon: CreditCard, color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300' },
  cheque: { label: 'Cheque', icon: FileText, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
};

export default function VentasPage() {
  const { ventas, fetchVentas, createVenta } = useVentasStore();
  const { clientes, fetchClientes } = useClientesStore();
  const { productos, fetchProductos } = useProductosStore();
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  const [selectedCliente, setSelectedCliente] = useState('');
  const [searchProduct, setSearchProduct] = useState('');
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(0);
  const [descuentoMonto, setDescuentoMonto] = useState(0);
  const [pagos, setPagos] = useState<{forma_pago: string; monto: number}[]>([{forma_pago: 'efectivo', monto: 0}]);
  const [recibidoEfectivo, setRecibidoEfectivo] = useState(0);
  const [activePagoTab, setActivePagoTab] = useState('efectivo');

  useEffect(() => {
    fetchVentas();
    fetchClientes();
    fetchProductos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredProducts = useMemo(() => productos.filter((p: any) =>
    (p.nombre?.toLowerCase() || '').includes(searchProduct.toLowerCase()) ||
    (p.codigo || '').includes(searchProduct) ||
    (p.codigo_barra || '').includes(searchProduct)
  ), [productos, searchProduct]);

  const addToCart = (producto: any) => {
    const existing = cart.find(item => item.id === producto.id);
    if (existing) {
      setCart(cart.map(item => item.id === producto.id
        ? {...item, cantidad: item.cantidad + 1, total: (item.cantidad + 1) * item.precio}
        : item
      ));
    } else {
      setCart([...cart, {
        id: producto.id,
        nombre: producto.nombre,
        cantidad: 1,
        precio: producto.precio_venta,
        total: producto.precio_venta
      }]);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id !== id) return item;
      const newQty = Math.max(1, item.cantidad + delta);
      return {...item, cantidad: newQty, total: newQty * item.precio};
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const descuentoCalculado = descuentoMonto > 0
    ? descuentoMonto
    : subtotal * (descuentoPorcentaje / 100);
  const totalVenta = Math.max(0, subtotal - descuentoCalculado);
  const totalPagos = pagos.reduce((sum, p) => sum + (p.monto || 0), 0);
  const vuelto = Math.max(0, totalPagos - totalVenta);

  const addPago = () => {
    setPagos([...pagos, { forma_pago: 'tarjeta_debito', monto: 0 }]);
  };

  const updatePago = (index: number, field: string, value: any) => {
    const nuevos = [...pagos];
    nuevos[index] = { ...nuevos[index], [field]: value };
    setPagos(nuevos);
  };

  const removePago = (index: number) => {
    if (pagos.length <= 1) return;
    setPagos(pagos.filter((_, i) => i !== index));
  };

  const resetVenta = () => {
    setCart([]);
    setSelectedCliente('');
    setDescuentoPorcentaje(0);
    setDescuentoMonto(0);
    setPagos([{ forma_pago: 'efectivo', monto: 0 }]);
    setRecibidoEfectivo(0);
    setActivePagoTab('efectivo');
  };

  const handleVenta = async () => {
    if (cart.length === 0) {
      toast.error('Agregá productos al carrito');
      return;
    }
    if (!selectedCliente) {
      toast.error('Seleccioná un cliente');
      return;
    }

    const cliente: any = (clientes as any[]).find((c: any) => c.id === selectedCliente);
    if (cliente?.bloqueado) {
      toast.error(`Cliente bloqueado: ${cliente.motivo_bloqueo || 'Sin motivo especificado'}`, { duration: 8000 });
      return;
    }
    const nuevaVenta = {
      id: crypto.randomUUID(),
      id_cliente: selectedCliente,
      cliente_nombre: cliente
        ? (cliente.tipo_persona === 'fisica'
            ? `${cliente.apellido}, ${cliente.nombre}`
            : cliente.razon_social)
        : 'Desconocido',
      fecha: new Date().toISOString(),
      items: cart,
      subtotal,
      descuento: descuentoCalculado,
      total: totalVenta,
      forma_pago: pagos.length === 1 ? pagos[0].forma_pago : 'mixto',
      pagos,
      estado: 'finalizada'
    };

    const result = await createVenta(nuevaVenta);
    if (result.success) {
      const config = getConfig();
      const puntosPorPeso = parseFloat(config.puntos_por_peso) || 0;
      if (puntosPorPeso > 0 && cliente) {
        const puntosGanados = Math.floor(totalVenta * puntosPorPeso);
        const { updateCliente } = useClientesStore.getState();
        await updateCliente(cliente.id, {
          puntos_acumulados: (cliente.puntos_acumulados || 0) + puntosGanados,
          puntos_disponibles: (cliente.puntos_disponibles || 0) + puntosGanados,
          total_compras: (cliente.total_compras || 0) + totalVenta,
          cantidad_compras: (cliente.cantidad_compras || 0) + 1,
          ultima_compra: new Date().toISOString(),
        });
        toast.success(`Venta registrada. ${puntosGanados} puntos agregados al cliente.`);
      } else {
        toast.success('Venta registrada exitosamente');
      }
      resetVenta();
      setShowOffcanvas(false);
    } else {
      toast.error('Error al registrar la venta');
    }
  };

  const clienteOptions = [
    { value: '', label: 'Seleccionar cliente...' },
    ...clientes.map((c: any) => ({
      value: c.id,
      label: c.tipo_persona === 'fisica'
        ? `${c.apellido || ''}, ${c.nombre || ''}`.trim()
        : c.razon_social || 'Sin nombre',
      searchText: `${c.cuil_cuit || ''} ${c.telefono || ''} ${c.email || ''}`,
    }))
  ];

  const stats = [
    { label: 'Total Ventas', value: ventas.length },
    { label: 'Monto Total', value: formatPriceConfig(ventas.reduce((sum: number, v: any) => sum + (v.total || 0), 0)) },
    { label: 'Hoy', value: ventas.filter((v: any) => new Date(v.fecha).toDateString() === new Date().toDateString()).length },
    { label: 'Promedio', value: formatPriceConfig(ventas.length > 0 ? (ventas.reduce((sum: number, v: any) => sum + (v.total || 0), 0) / ventas.length) : 0) },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Ventas</h2>
        <button
          onClick={() => setShowOffcanvas(true)}
          className="bg-brand-primary text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm font-medium shadow-lg shadow-brand-primary/20"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Venta</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 dark:bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Venta</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Pago</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {ventas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <ShoppingCart className="w-7 h-7 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-gray-900 dark:text-white font-medium mb-1">No hay ventas registradas</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Hacé clic en "Nueva Venta" para registrar una</p>
                  </td>
                </tr>
              ) : ventas.map((v: any) => {
                const pagoCfg = FORMAS_PAGO[v.forma_pago] || FORMAS_PAGO.efectivo;
                const PagoIcon = pagoCfg.icon;
                return (
                  <tr key={v.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">{new Date(v.fecha).toLocaleDateString('es-AR')}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(v.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-white">{v.cliente_nombre}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-white">{(v.items || []).length} productos</span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px] mt-0.5">
                        {(v.items || []).map((i: any) => i.nombre).join(', ')}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-base font-bold text-gray-900 dark:text-white">{formatPriceConfig(v.total || 0)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${pagoCfg.color}`}>
                        <PagoIcon className="w-3.5 h-3.5" />
                        {pagoCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <TicketPrint
                          data={{
                            titulo: 'TICKET DE VENTA',
                            numero: v.numero?.toString() || '',
                            fecha: v.fecha,
                            cliente: v.cliente_nombre,
                            items: (v.items || []).map((i: any) => ({ nombre: i.nombre, cantidad: i.cantidad, precio: i.precio, total: i.total })),
                            subtotal: v.subtotal,
                            descuento: v.descuento,
                            total: v.total,
                            pagos: v.pagos || [{ forma_pago: v.forma_pago, monto: v.total }],
                          }}
                          buttonLabel=""
                          buttonClassName="p-2 text-gray-500 dark:text-gray-400 hover:text-brand-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                        />
                        <button
                          onClick={() => exportComprobantePDF({
                            tipo: 'Ticket de Venta',
                            numero: v.numero?.toString() || v.id?.slice(0, 8),
                            fecha: v.fecha,
                            cliente: v.cliente_nombre,
                            items: (v.items || []).map((i: any) => ({ nombre: i.nombre, cantidad: i.cantidad, precio: i.precio, total: i.total })),
                            total: v.total || 0,
                            pagos: v.pagos || [{ metodo: v.forma_pago, monto: v.total }],
                          })}
                          className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                          title="Exportar PDF"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Offcanvas - Nueva Venta POS */}
      <Offcanvas
        isOpen={showOffcanvas}
        onClose={() => setShowOffcanvas(false)}
        title="Nueva Venta"
        size="full"
        noPadding
      >
        <div className="h-full flex flex-col lg:flex-row">
          {/* Catálogo */}
          <div className="flex-1 flex flex-col min-h-0 lg:border-r border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950">
            {/* Buscador */}
            <div className="p-4 lg:p-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="relative max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar producto por nombre, código o código de barras..."
                  value={searchProduct}
                  onChange={e => setSearchProduct(e.target.value)}
                  className="w-full bg-gray-100 dark:bg-gray-800 border-0 rounded-2xl pl-12 pr-4 py-4 text-base text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-brand-primary/30 outline-none transition-all"
                  autoFocus
                />
              </div>
            </div>

            {/* Grid de productos */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-5">
              {filteredProducts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                  <Package className="w-16 h-16 mb-4 opacity-40" />
                  <p className="text-sm font-medium">No hay productos disponibles</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
                  {filteredProducts.map((p: any) => {
                    const bajoStock = (p.stock_actual || 0) <= (p.stock_minimo || 0);
                    const inCart = cart.find(item => item.id === p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => !bajoStock && addToCart(p)}
                        disabled={bajoStock}
                        className={`text-left group relative flex flex-col bg-white dark:bg-gray-900 border rounded-2xl overflow-hidden transition-all ${
                          bajoStock
                            ? 'border-gray-100 dark:border-gray-800 opacity-50 cursor-not-allowed'
                            : 'border-gray-100 dark:border-gray-800 hover:border-brand-primary/40 hover:shadow-lg hover:shadow-brand-primary/5 cursor-pointer'
                        }`}
                      >
                        <div className="aspect-[4/3] bg-gray-50 dark:bg-gray-800 flex items-center justify-center relative overflow-hidden">
                          {p.imagen_url ? (
                            <img
                              src={p.imagen_url}
                              alt={p.nombre}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <Package className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                          )}
                          {bajoStock && (
                            <span className="absolute top-2 right-2 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                              Sin stock
                            </span>
                          )}
                          {inCart && !bajoStock && (
                            <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-brand-primary text-white text-sm font-bold flex items-center justify-center shadow-lg">
                              {inCart.cantidad}
                            </span>
                          )}
                        </div>
                        <div className="p-3 flex-1 flex flex-col">
                          <h4 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 leading-snug">{p.nombre}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{p.codigo || 'Sin código'}</p>
                          <div className="mt-auto pt-3 flex items-center justify-between">
                            <span className="text-lg font-bold text-brand-primary">{formatPriceConfig(p.precio_venta)}</span>
                            {!bajoStock && (
                              <span className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Plus className="w-5 h-5" />
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Ticket / Carrito */}
          <div className="w-full lg:w-[460px] xl:w-[520px] flex flex-col min-h-0 bg-white dark:bg-gray-900">
            {/* Header del ticket */}
            <div className="p-4 lg:p-5 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-brand-primary" />
                  <h3 className="font-bold text-gray-900 dark:text-white">Ticket</h3>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={resetVenta}
                    className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Limpiar
                  </button>
                )}
              </div>

              <SelectSearch
                label=""
                value={selectedCliente}
                onChange={(value) => setSelectedCliente(value)}
                options={clienteOptions}
                placeholder="Seleccionar cliente..."
              />
            </div>

            {/* Items del carrito */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                  <ShoppingCart className="w-16 h-16 mb-4 opacity-30" />
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Carrito vacío</p>
                  <p className="text-xs mt-1">Tocá un producto para agregarlo</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.id} className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-100 dark:border-gray-800">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">{item.nombre}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formatPriceConfig(item.precio)} c/u</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-8 h-8 flex items-center justify-center rounded-md bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold text-gray-900 dark:text-white">{item.cantidad}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-md bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">{formatPriceConfig(item.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Panel de pago */}
            {cart.length > 0 && (
              <div className="p-4 lg:p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-4">
                {/* Descuento */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Descuento %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={descuentoPorcentaje}
                      onChange={e => { setDescuentoPorcentaje(parseFloat(e.target.value) || 0); setDescuentoMonto(0); }}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Descuento $</label>
                    <input
                      type="number"
                      min="0"
                      value={descuentoMonto}
                      onChange={e => { setDescuentoMonto(parseFloat(e.target.value) || 0); setDescuentoPorcentaje(0); }}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Total */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatPriceConfig(subtotal)}</span>
                  </div>
                  {descuentoCalculado > 0 && (
                    <div className="flex justify-between text-sm text-red-500 mb-1">
                      <span>Descuento</span>
                      <span className="font-medium">-{formatPriceConfig(descuentoCalculado)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-end pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total a pagar</span>
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">{formatPriceConfig(totalVenta)}</span>
                  </div>
                </div>

                {/* Tabs de pago */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">Forma de pago</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(FORMAS_PAGO).map(([key, cfg]) => {
                      const Icon = cfg.icon;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setActivePagoTab(key);
                            setPagos([{ forma_pago: key, monto: key === 'efectivo' ? recibidoEfectivo : totalVenta }]);
                            if (key === 'efectivo') setRecibidoEfectivo(totalVenta);
                          }}
                          className={`flex flex-col items-center gap-1 p-2.5 rounded-xl text-xs font-medium transition-all border ${
                            activePagoTab === key
                              ? 'bg-brand-primary text-white border-brand-primary shadow-md shadow-brand-primary/20'
                              : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-brand-primary/30'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Pago mixto */}
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      if (pagos.length === 1) {
                        addPago();
                      }
                    }}
                    className="text-xs font-medium text-brand-primary hover:underline"
                  >
                    + Pago mixto
                  </button>
                  {pagos.length > 1 && (
                    <div className="space-y-2 mt-2">
                      {pagos.map((pago, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <select
                            value={pago.forma_pago}
                            onChange={e => updatePago(index, 'forma_pago', e.target.value)}
                            className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                          >
                            {Object.entries(FORMAS_PAGO).map(([key, cfg]) => (
                              <option key={key} value={key}>{cfg.label}</option>
                            ))}
                          </select>
                          <input
                            type="number"
                            step="0.01"
                            value={pago.monto}
                            onChange={e => updatePago(index, 'monto', parseFloat(e.target.value) || 0)}
                            className="w-28 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => removePago(index)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recibido en efectivo */}
                {activePagoTab === 'efectivo' && pagos.length === 1 && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Recibido</label>
                    <input
                      type="number"
                      step="0.01"
                      value={recibidoEfectivo}
                      onChange={e => {
                        const recibido = parseFloat(e.target.value) || 0;
                        setRecibidoEfectivo(recibido);
                        setPagos([{ forma_pago: 'efectivo', monto: recibido }]);
                      }}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                    />
                    {recibidoEfectivo > 0 && (
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-gray-500 dark:text-gray-400">Vuelto</span>
                        <span className={`font-bold ${vuelto > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {formatPriceConfig(vuelto)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Estado del pago */}
                <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
                  totalPagos >= totalVenta
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                    : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {totalPagos >= totalVenta ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span className="font-medium">
                    {totalPagos >= totalVenta
                      ? `Pago completo ${vuelto > 0 ? `(vuelto ${formatPriceConfig(vuelto)})` : ''}`
                      : `Faltan ${formatPriceConfig(totalVenta - totalPagos)}`}
                  </span>
                </div>

                {/* Botón finalizar */}
                <button
                  onClick={handleVenta}
                  disabled={totalPagos < totalVenta || !selectedCliente}
                  className="w-full bg-brand-primary text-white py-4 rounded-2xl hover:opacity-90 transition-opacity font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-2"
                >
                  <span>Finalizar Venta</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </Offcanvas>
    </div>
  );
}
