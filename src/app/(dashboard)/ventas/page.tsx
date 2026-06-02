'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Offcanvas from '@/components/Offcanvas';
import SelectSearch from '@/components/SelectSearch';
import { useVentasStore, useClientesStore, useProductosStore } from '@/lib/supabase';
import TicketPrint from '@/components/TicketPrint';
import { exportComprobantePDF } from '@/lib/pdf-export';
import { formatPriceConfig, getConfig } from '@/lib/format';

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

  useEffect(() => {
    fetchVentas();
    fetchClientes();
    fetchProductos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredProducts = productos.filter((p: any) =>
    (p.nombre?.toLowerCase() || '').includes(searchProduct.toLowerCase()) ||
    (p.codigo || '').includes(searchProduct) ||
    (p.codigo_barra || '').includes(searchProduct)
  );

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
    setPagos([...pagos, { forma_pago: 'efectivo', monto: 0 }]);
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
      // Sumar puntos de fidelidad
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

  return (
    <div>
      <div className="flex justify-end mb-6">\n        <button 
          onClick={() => setShowOffcanvas(true)} 
          className="bg-blue-600 text-white px-4 py-2 rounded-2xl hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Nueva Venta</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Total Ventas</p>
          <p className="text-2xl font-bold">{ventas.length}</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Monto Total</p>
          <p className="text-2xl font-bold">{formatPriceConfig(ventas.reduce((sum: number, v: any) => sum + (v.total || 0), 0))}</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Hoy</p>
          <p className="text-2xl font-bold">
            {ventas.filter((v: any) => new Date(v.fecha).toDateString() === new Date().toDateString()).length}
          </p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Promedio</p>
          <p className="text-2xl font-bold">
            {formatPriceConfig(ventas.length > 0 ? (ventas.reduce((sum: number, v: any) => sum + (v.total || 0), 0) / ventas.length) : 0)}
          </p>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-400 uppercase text-xs">Fecha</th>
                <th className="px-4 py-3 text-left text-gray-400 uppercase text-xs">Cliente</th>
                <th className="px-4 py-3 text-left text-gray-400 uppercase text-xs">Items</th>
                <th className="px-4 py-3 text-left text-gray-400 uppercase text-xs">Total</th>
                <th className="px-4 py-3 text-left text-gray-400 uppercase text-xs">Pago</th>
                <th className="px-4 py-3 text-center text-gray-400 uppercase text-xs">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ventas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-4xl mb-2">💰</div>
                    <p className="text-gray-500 mb-1">No hay ventas registradas</p>
                    <p className="text-sm text-gray-400">Hacé clic en &quot;Nueva Venta&quot; para registrar una</p>
                  </td>
                </tr>
              ) : ventas.map((v: any) => (
                <tr key={v.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium">{new Date(v.fecha).toLocaleDateString('es-AR')}</div>
                    <div className="text-xs text-gray-500">{new Date(v.fecha).toLocaleTimeString('es-AR')}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{v.cliente_nombre}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">{(v.items || []).length} productos</div>
                    <div className="text-xs text-gray-500">
                      {(v.items || []).slice(0, 2).map((i: any) => i.nombre).join(', ')}
                      {(v.items || []).length > 2 && '...'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-gray-900">{formatPriceConfig(v.total || 0)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      v.forma_pago === 'efectivo' ? 'bg-green-100 text-green-800' :
                      v.forma_pago === 'tarjeta_credito' ? 'bg-purple-100 text-purple-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {v.forma_pago === 'efectivo' ? '💵 Efectivo' :
                       v.forma_pago === 'tarjeta_debito' ? '💳 Débito' :
                       v.forma_pago === 'tarjeta_credito' ? '💳 Crédito' :
                       v.forma_pago === 'transferencia' ? '🏦 Transferencia' :
                       v.forma_pago === 'cheque' ? '📄 Cheque' :
                       v.forma_pago}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-1">
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
                        buttonLabel="🖨️"
                        buttonClassName="p-2 text-gray-700 hover:bg-gray-50 rounded-2xl text-sm"
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
                        className="p-2 text-red-600 hover:bg-red-50 rounded-2xl text-sm"
                        title="Exportar PDF"
                      >
                        📄
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Offcanvas - Nueva Venta */}
      <Offcanvas
        isOpen={showOffcanvas}
        onClose={() => setShowOffcanvas(false)}
        title="🛒 Nueva Venta"
        size="xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* Productos */}
          <div className="flex flex-col h-full">
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={searchProduct}
                  onChange={e => setSearchProduct(e.target.value)}
                  className="w-full bg-white border-none rounded-2xl shadow-sm px-4 py-3 pl-10 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 max-h-[calc(100vh-250px)]">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📦</div>
                  <p>No hay productos disponibles</p>
                </div>
              ) : filteredProducts.map((p: any) => (
                <div key={p.id} className="flex justify-between items-center p-3 bg-white rounded-2xl shadow-sm hover:bg-gray-50/50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{p.nombre}</div>
                    <div className="text-sm text-gray-500">
                      {formatPriceConfig(p.precio_venta)} | Stock: {p.stock_actual}
                    </div>
                  </div>
                  <button 
                    onClick={() => addToCart(p)} 
                    className="ml-2 bg-blue-600 text-white px-3 py-1.5 rounded-2xl hover:bg-blue-700 transition-colors text-sm flex-shrink-0"
                  >
                    ➕ Agregar
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Carrito */}
          <div className="flex flex-col h-full">
            <h3 className="font-semibold mb-3 text-lg">🛒 Carrito</h3>
            
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <div className="text-5xl mb-2">🛒</div>
                <p>Carrito vacío</p>
                <p className="text-sm">Agregá productos desde la lista</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto space-y-2 mb-4 max-h-[calc(100vh-400px)]">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-2xl shadow-sm">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{item.nombre}</div>
                        <div className="text-sm text-gray-600">{formatPriceConfig(item.precio)} c/u</div>
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">➖</button>
                        <span className="w-8 text-center font-medium">{item.cantidad}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">➕</button>
                        <span className="w-20 text-right font-medium">{formatPriceConfig(item.total)}</span>
                        <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 ml-2">❌</button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  {/* Resumen */}
                  <div className="bg-white rounded-2xl shadow-sm p-3 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{formatPriceConfig(subtotal)}</span>
                    </div>
                    {descuentoCalculado > 0 && (
                      <div className="flex justify-between text-sm text-red-600">
                        <span>Descuento {descuentoPorcentaje > 0 ? `(${descuentoPorcentaje}%)` : ''}</span>
                        <span className="font-medium">-{formatPriceConfig(descuentoCalculado)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold border-t border-gray-50 pt-1">
                      <span>Total a pagar</span>
                      <span>{formatPriceConfig(totalVenta)}</span>
                    </div>
                  </div>

                  {/* Descuento */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Descuento %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={descuentoPorcentaje}
                        onChange={e => { setDescuentoPorcentaje(parseFloat(e.target.value) || 0); setDescuentoMonto(0); }}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Descuento $</label>
                      <input
                        type="number"
                        min="0"
                        value={descuentoMonto}
                        onChange={e => { setDescuentoMonto(parseFloat(e.target.value) || 0); setDescuentoPorcentaje(0); }}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Pagos */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">Formas de Pago</label>
                      <button
                        type="button"
                        onClick={addPago}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-2xl hover:bg-blue-200 transition-colors"
                      >
                        ➕ Agregar pago
                      </button>
                    </div>
                    <div className="space-y-2">
                      {pagos.map((pago, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <select
                            value={pago.forma_pago}
                            onChange={e => updatePago(index, 'forma_pago', e.target.value)}
                            className="flex-1 px-2 py-2 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          >
                            <option value="efectivo">💵 Efectivo</option>
                            <option value="tarjeta_debito">💳 Débito</option>
                            <option value="tarjeta_credito">💳 Crédito</option>
                            <option value="transferencia">🏦 Transferencia</option>
                            <option value="cheque">📄 Cheque</option>
                          </select>
                          <input
                            type="number"
                            step="0.01"
                            value={pago.monto}
                            onChange={e => updatePago(index, 'monto', parseFloat(e.target.value) || 0)}
                            placeholder="Monto"
                            className="w-24 px-2 py-2 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                          {pagos.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePago(index)}
                              className="text-red-500 hover:text-red-700 text-sm px-1"
                            >
                              ❌
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs mt-1 px-1">
                      <span className={totalPagos < totalVenta ? 'text-red-600' : 'text-gray-500'}>
                        Pagado: {formatPriceConfig(totalPagos)}
                      </span>
                      {totalPagos > totalVenta && (
                        <span className="text-green-600 font-medium">Vuelto: {formatPriceConfig(vuelto)}</span>
                      )}
                      {totalPagos < totalVenta && (
                        <span className="text-red-600 font-medium">Falta: {formatPriceConfig(totalVenta - totalPagos)}</span>
                      )}
                    </div>
                  </div>

                  {/* Vuelto rápido (si hay efectivo) */}
                  {pagos.some(p => p.forma_pago === 'efectivo') && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">💵 Recibido en efectivo</label>
                      <input
                        type="number"
                        step="0.01"
                        value={recibidoEfectivo}
                        onChange={e => {
                          const recibido = parseFloat(e.target.value) || 0;
                          setRecibidoEfectivo(recibido);
                          const efectivoIndex = pagos.findIndex(p => p.forma_pago === 'efectivo');
                          if (efectivoIndex >= 0) {
                            updatePago(efectivoIndex, 'monto', recibido);
                          }
                        }}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-green-500 outline-none"
                        placeholder="Monto recibido..."
                      />
                      {recibidoEfectivo > 0 && (
                        <div className="text-right text-sm mt-1">
                          {recibidoEfectivo >= totalVenta ? (
                            <span className="text-green-600 font-bold">💰 Vuelto: {formatPriceConfig(recibidoEfectivo - totalVenta)}</span>
                          ) : (
                            <span className="text-red-600 font-bold">Falta: {formatPriceConfig(totalVenta - recibidoEfectivo)}</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <SelectSearch
                    label="Cliente *"
                    value={selectedCliente}
                    onChange={(value) => setSelectedCliente(value)}
                    options={clienteOptions}
                  />
                  
                  <button 
                    onClick={handleVenta} 
                    disabled={totalPagos < totalVenta}
                    className="w-full bg-green-600 text-white py-3 rounded-2xl hover:bg-green-700 transition-colors font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ✅ Finalizar Venta {totalPagos < totalVenta && `(Falta ${formatPriceConfig(totalVenta - totalPagos)})`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </Offcanvas>
    </div>
  );
}
