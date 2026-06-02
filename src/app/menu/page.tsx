'use client';

import { useState, useEffect } from 'react';
import { useProductosStore, useCategoriasStore } from '@/lib/supabase';

interface CartItem {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

export default function MenuOnlinePage() {
  const { productos, fetchProductos } = useProductosStore();
  const { categorias, fetchCategorias } = useCategoriasStore();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [categoriaFilter, setCategoriaFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [orderData, setOrderData] = useState({ nombre: '', telefono: '', direccion: '', notas: '' });
  const [orderSent, setOrderSent] = useState(false);

  useEffect(() => { fetchProductos(); fetchCategorias(); /* eslint-disable-next-line */ }, []);

  const productosWeb = productos.filter((p: any) => p.disponible_online !== false && p.activo !== false);

  const filtered = productosWeb.filter((p: any) => {
    const matchCat = !categoriaFilter || p.id_categoria === categoriaFilter;
    const matchSearch = !searchTerm || (p.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (p: any) => {
    const exists = cart.find(i => i.id === p.id);
    if (exists) {
      setCart(cart.map(i => i.id === p.id ? { ...i, cantidad: i.cantidad + 1 } : i));
    } else {
      setCart([...cart, { id: p.id, nombre: p.nombre, precio: p.precio_venta || 0, cantidad: 1 }]);
    }
  };

  const updateQty = (id: string, delta: number) => {
    setCart(cart.map(i => {
      if (i.id !== id) return i;
      const newQty = Math.max(1, i.cantidad + delta);
      return { ...i, cantidad: newQty };
    }));
  };

  const removeFromCart = (id: string) => setCart(cart.filter(i => i.id !== id));

  const cartTotal = cart.reduce((sum, i) => sum + i.precio * i.cantidad, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.cantidad, 0);

  const handleOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const pedido = {
      id: crypto.randomUUID(),
      ...orderData,
      items: cart,
      total: cartTotal,
      fecha: new Date().toISOString(),
      estado: 'pendiente'
    };
    const stored = JSON.parse(localStorage.getItem('pedidos_online') || '[]');
    localStorage.setItem('pedidos_online', JSON.stringify([pedido, ...stored]));
    setOrderSent(true);
    setCart([]);
    setShowOrderForm(false);
    setShowCart(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-purple-700 text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">🛍️ Nuestro Catálogo</h1>
            <p className="text-xs text-purple-200">Pedidos online directos</p>
          </div>
          <button onClick={() => setShowCart(true)} className="relative bg-white text-purple-700 px-4 py-2 rounded-full font-medium shadow">
            🛒 {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>}
          </button>
        </div>
      </header>

      {/* Filtros */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex gap-3 mb-4">
          <input type="text" placeholder="Buscar producto..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-1 px-4 py-2 border rounded-lg" />
          <select value={categoriaFilter} onChange={e => setCategoriaFilter(e.target.value)} className="px-4 py-2 border rounded-lg bg-white">
            <option value="">Todas las categorías</option>
            {categorias.map((c: any) => (<option key={c.id} value={c.id}>{c.nombre}</option>))}
          </select>
        </div>

        {orderSent && (
          <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg text-center">
            ✅ ¡Pedido enviado! Nos contactaremos por WhatsApp para confirmar.
          </div>
        )}

        {/* Productos */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((p: any) => (
            <div key={p.id} className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="h-32 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-4xl">
                📦
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <h3 className="font-medium text-sm line-clamp-2">{p.nombre}</h3>
                <p className="text-xs text-gray-500 mt-1">{p.descripcion_corta || p.descripcion?.slice(0, 60) || ''}</p>
                <div className="mt-auto pt-2 flex items-center justify-between">
                  <span className="font-bold text-purple-700">${parseFloat(p.precio_venta || 0).toFixed(2)}</span>
                  <button onClick={() => addToCart(p)} className="bg-purple-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-purple-700">+</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">📭</div>
            <p>No hay productos disponibles online.</p>
          </div>
        )}
      </div>

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCart(false)}></div>
          <div className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-bold">🛒 Tu Pedido</h2>
              <button onClick={() => setShowCart(false)} className="text-gray-500 text-xl">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <p className="text-center text-gray-400 py-8">El carrito está vacío.</p>
              ) : cart.map(item => (
                <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{item.nombre}</p>
                    <p className="text-xs text-gray-500">${item.precio.toFixed(2)} c/u</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded-full bg-gray-200 text-gray-700">-</button>
                    <span className="font-medium w-4 text-center">{item.cantidad}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded-full bg-gray-200 text-gray-700">+</button>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-500 ml-2">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium">Total:</span>
                <span className="text-xl font-bold text-purple-700">${cartTotal.toFixed(2)}</span>
              </div>
              <button onClick={() => { setShowCart(false); setShowOrderForm(true); }} disabled={cart.length === 0} className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50">
                Hacer Pedido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Form */}
      {showOrderForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowOrderForm(false)}></div>
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">📋 Datos del Pedido</h2>
            <form onSubmit={handleOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre y Apellido *</label>
                <input type="text" required value={orderData.nombre} onChange={e => setOrderData({...orderData, nombre: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Teléfono / WhatsApp *</label>
                <input type="tel" required value={orderData.telefono} onChange={e => setOrderData({...orderData, telefono: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="Ej: 0981 123456" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Dirección de entrega</label>
                <input type="text" value={orderData.direccion} onChange={e => setOrderData({...orderData, direccion: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notas adicionales</label>
                <textarea value={orderData.notas} onChange={e => setOrderData({...orderData, notas: e.target.value})} className="w-full px-3 py-2 border rounded-lg" rows={2} placeholder="Horario de entrega, referencias..." />
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-sm font-medium text-purple-800">Total a pagar: ${cartTotal.toFixed(2)}</p>
                <p className="text-xs text-purple-600 mt-1">Le contactaremos por WhatsApp para confirmar el pedido y coordinar la entrega.</p>
              </div>
              <div className="flex space-x-3">
                <button type="button" onClick={() => setShowOrderForm(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">✅ Enviar Pedido</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
