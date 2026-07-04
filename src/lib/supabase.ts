import { createClient } from '@supabase/supabase-js';
import { create } from 'zustand';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan las variables de entorno NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY. Revisá tu archivo .env.local'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadProductoImagen(file: File, productoId: string): Promise<string | null> {
  const ext = file.name.split('.').pop();
  const path = `${productoId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from('producto-imagenes').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) {
    console.error('Error uploading image:', error.message);
    return null;
  }
  const { data } = supabase.storage.from('producto-imagenes').getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteProductoImagen(url: string): Promise<boolean> {
  const match = url.match(/producto-imagenes\/(.+)$/);
  if (!match) return false;
  const path = match[1];
  const { error } = await supabase.storage.from('producto-imagenes').remove([path]);
  return !error;
}

// ==================== AUDITORIA HELPER ====================
function registrarAuditoria(accion: string, tabla: string, id_registro: string, datos_nuevos: any, datos_viejos?: any) {
  try {
    const registro = {
      id: crypto.randomUUID(),
      accion,
      tabla,
      id_registro,
      datos_viejos: datos_viejos || null,
      datos_nuevos: datos_nuevos || null,
      fecha: new Date().toISOString(),
      usuario: (() => { try { return JSON.parse(localStorage.getItem('user') || '{}').username || 'sistema'; } catch { return 'sistema'; } })()
    };
    const stored = JSON.parse(localStorage.getItem('auditoria') || '[]');
    const nuevos = [registro, ...stored].slice(0, 500);
    localStorage.setItem('auditoria', JSON.stringify(nuevos));
    // Notificación
    try {
      const notif = {
        id: crypto.randomUUID(),
        titulo: `${accion.charAt(0).toUpperCase() + accion.slice(1)} en ${tabla}`,
        mensaje: `Registro ${id_registro.slice(0, 8)}... modificado por ${registro.usuario}`,
        fecha: registro.fecha,
        leida: false,
      };
      const notifs = JSON.parse(localStorage.getItem('notificaciones') || '[]');
      localStorage.setItem('notificaciones', JSON.stringify([notif, ...notifs].slice(0, 100)));
    } catch { /* silent */ }
  } catch { /* silent */ }
}

// Browser-compatible SHA256
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Store de autenticación
export const useAuthStore = create((set: any, get: any) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (username: string, password: string) => {
    try {
      const hashedPassword = await sha256(password);

      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('username', username)
        .eq('password_hash', hashedPassword)
        .eq('activo', true)
        .single();

      if (error || !data) {
        return { success: false, error: 'Credenciales inválidas' };
      }

      localStorage.setItem('user', JSON.stringify(data));
      set({ user: data, isAuthenticated: true });

      await supabase
        .from('usuarios')
        .update({ fecha_ultimo_acceso: new Date().toISOString() })
        .eq('id', data.id);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  logout: () => {
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      set({ user: JSON.parse(storedUser), isAuthenticated: true, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  }
}));

// ==================== CLIENTES ====================
export const useClientesStore = create((set: any, get: any) => ({
  clientes: [],
  isLoading: false,

  fetchClientes: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('activo', true)
        .order('fecha_alta', { ascending: false });

      if (!error && data && data.length > 0) {
        set({ clientes: data, isLoading: false });
        localStorage.setItem('clientes', JSON.stringify(data));
        return;
      }
    } catch (e) {}
    // Fallback a localStorage
    const stored = localStorage.getItem('clientes');
    if (stored) {
      set({ clientes: JSON.parse(stored), isLoading: false });
    } else {
      set({ clientes: [], isLoading: false });
    }
  },

  createCliente: async (clienteData: any) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert([clienteData])
        .select()
        .single();

      if (!error && data) {
        set((state: any) => ({ clientes: [data, ...state.clientes] }));
        localStorage.setItem('clientes', JSON.stringify([data, ...get().clientes]));
        registrarAuditoria('crear', 'clientes', data.id, data);
        return { success: true, data };
      }
    } catch (e) {}
    // Fallback localStorage
    const newCliente = clienteData;
    set((state: any) => ({ clientes: [newCliente, ...state.clientes] }));
    localStorage.setItem('clientes', JSON.stringify([newCliente, ...get().clientes]));
    registrarAuditoria('crear', 'clientes', newCliente.id, newCliente);
    return { success: true, data: newCliente };
  },

  updateCliente: async (id: string, clienteData: any) => {
    const oldCliente = get().clientes.find((c: any) => c.id === id);
    try {
      const { data, error } = await supabase
        .from('clientes')
        .update(clienteData)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        set((state: any) => ({
          clientes: state.clientes.map((c: any) => (c.id === id ? data : c))
        }));
        localStorage.setItem('clientes', JSON.stringify(get().clientes));
        registrarAuditoria('actualizar', 'clientes', id, data, oldCliente);
        return { success: true, data };
      }
    } catch (e) {}
    // Fallback localStorage
    set((state: any) => ({
      clientes: state.clientes.map((c: any) => (c.id === id ? { ...c, ...clienteData } : c))
    }));
    localStorage.setItem('clientes', JSON.stringify(get().clientes));
    registrarAuditoria('actualizar', 'clientes', id, { ...clienteData, id }, oldCliente);
    return { success: true, data: { ...clienteData, id } };
  },

  deleteCliente: async (id: string) => {
    const oldCliente = get().clientes.find((c: any) => c.id === id);
    try {
      const { error } = await supabase
        .from('clientes')
        .update({ activo: false })
        .eq('id', id);

      if (!error) {
        set((state: any) => ({
          clientes: state.clientes.filter((c: any) => c.id !== id)
        }));
        localStorage.setItem('clientes', JSON.stringify(get().clientes));
        registrarAuditoria('eliminar', 'clientes', id, null, oldCliente);
        return { success: true };
      }
    } catch (e) {}
    // Fallback localStorage
    set((state: any) => ({
      clientes: state.clientes.filter((c: any) => c.id !== id)
    }));
    localStorage.setItem('clientes', JSON.stringify(get().clientes));
    registrarAuditoria('eliminar', 'clientes', id, null, oldCliente);
    return { success: true };
  }
}));

// ==================== PRODUCTOS ====================
export const useProductosStore = create((set: any, get: any) => ({
  productos: [],
  isLoading: false,

  fetchProductos: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('activo', true)
        .order('nombre');

      if (!error && data && data.length > 0) {
        set({ productos: data, isLoading: false });
        localStorage.setItem('productos', JSON.stringify(data));
        return;
      }
    } catch (e) {}
    const stored = localStorage.getItem('productos');
    if (stored) {
      set({ productos: JSON.parse(stored), isLoading: false });
    } else {
      set({ productos: [], isLoading: false });
    }
  },

  createProducto: async (productoData: any) => {
    try {
      const { data, error } = await supabase
        .from('productos')
        .insert([productoData])
        .select()
        .single();

      if (!error && data) {
        set((state: any) => ({ productos: [data, ...state.productos] }));
        localStorage.setItem('productos', JSON.stringify([data, ...get().productos]));
        registrarAuditoria('crear', 'productos', data.id, data);
        return { success: true, data };
      }
    } catch (e) {}
    const newProd = productoData;
    set((state: any) => ({ productos: [newProd, ...state.productos] }));
    localStorage.setItem('productos', JSON.stringify([newProd, ...get().productos]));
    registrarAuditoria('crear', 'productos', newProd.id, newProd);
    return { success: true, data: newProd };
  },

  updateProducto: async (id: string, productoData: any) => {
    const oldProd = get().productos.find((p: any) => p.id === id);
    try {
      const { data, error } = await supabase
        .from('productos')
        .update(productoData)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        set((state: any) => ({
          productos: state.productos.map((p: any) => (p.id === id ? data : p))
        }));
        localStorage.setItem('productos', JSON.stringify(get().productos));
        registrarAuditoria('actualizar', 'productos', id, data, oldProd);
        return { success: true, data };
      }
    } catch (e) {}
    set((state: any) => ({
      productos: state.productos.map((p: any) => (p.id === id ? { ...p, ...productoData } : p))
    }));
    localStorage.setItem('productos', JSON.stringify(get().productos));
    registrarAuditoria('actualizar', 'productos', id, { ...productoData, id }, oldProd);
    return { success: true, data: { ...productoData, id } };
  },

  deleteProducto: async (id: string) => {
    const oldProd = get().productos.find((p: any) => p.id === id);
    try {
      const { error } = await supabase.from('productos').update({ activo: false }).eq('id', id);
      if (!error) {
        set((state: any) => ({ productos: state.productos.filter((p: any) => p.id !== id) }));
        localStorage.setItem('productos', JSON.stringify(get().productos));
        registrarAuditoria('eliminar', 'productos', id, null, oldProd);
        return { success: true };
      }
    } catch (e) {}
    set((state: any) => ({ productos: state.productos.filter((p: any) => p.id !== id) }));
    localStorage.setItem('productos', JSON.stringify(get().productos));
    registrarAuditoria('eliminar', 'productos', id, null, oldProd);
    return { success: true };
  }
}));

// ==================== VENTAS ====================
export const useVentasStore = create((set: any, get: any) => ({
  ventas: [],
  isLoading: false,

  fetchVentas: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('ventas')
        .select('*')
        .order('fecha', { ascending: false });

      if (!error && data && data.length > 0) {
        set({ ventas: data, isLoading: false });
        localStorage.setItem('ventas', JSON.stringify(data));
        return;
      }
    } catch (e) {}
    const stored = localStorage.getItem('ventas');
    if (stored) {
      set({ ventas: JSON.parse(stored), isLoading: false });
    } else {
      set({ ventas: [], isLoading: false });
    }
  },

  createVenta: async (ventaData: any) => {
    try {
      const { data, error } = await supabase
        .from('ventas')
        .insert([ventaData])
        .select()
        .single();

      if (!error && data) {
        set((state: any) => ({ ventas: [data, ...state.ventas] }));
        localStorage.setItem('ventas', JSON.stringify([data, ...get().ventas]));
        registrarAuditoria('crear', 'ventas', data.id, data);
        return { success: true, data };
      }
    } catch (e) {}
    const newVenta = ventaData;
    set((state: any) => ({ ventas: [newVenta, ...state.ventas] }));
    localStorage.setItem('ventas', JSON.stringify([newVenta, ...get().ventas]));
    registrarAuditoria('crear', 'ventas', newVenta.id, newVenta);
    return { success: true, data: newVenta };
  }
}));

// ==================== ORDENES SERVICIO ====================
export const useOrdenesStore = create((set: any, get: any) => ({
  ordenes: [],
  isLoading: false,

  fetchOrdenes: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('ordenes_servicio')
        .select('*')
        .order('fecha_ingreso', { ascending: false });

      if (!error && data && data.length > 0) {
        set({ ordenes: data, isLoading: false });
        localStorage.setItem('ordenes_servicio', JSON.stringify(data));
        return;
      }
    } catch (e) {}
    const stored = localStorage.getItem('ordenes_servicio');
    if (stored) {
      set({ ordenes: JSON.parse(stored), isLoading: false });
    } else {
      set({ ordenes: [], isLoading: false });
    }
  },

  createOrden: async (ordenData: any) => {
    try {
      const { data, error } = await supabase
        .from('ordenes_servicio')
        .insert([ordenData])
        .select()
        .single();

      if (!error && data) {
        set((state: any) => ({ ordenes: [data, ...state.ordenes] }));
        localStorage.setItem('ordenes_servicio', JSON.stringify([data, ...get().ordenes]));
        registrarAuditoria('crear', 'ordenes_servicio', data.id, data);
        return { success: true, data };
      }
    } catch (e) {}
    const newOrden = ordenData;
    set((state: any) => ({ ordenes: [newOrden, ...state.ordenes] }));
    localStorage.setItem('ordenes_servicio', JSON.stringify([newOrden, ...get().ordenes]));
    registrarAuditoria('crear', 'ordenes_servicio', newOrden.id, newOrden);
    return { success: true, data: newOrden };
  },

  updateOrden: async (id: string, ordenData: any) => {
    const oldOrden = get().ordenes.find((o: any) => o.id === id);
    try {
      const { data, error } = await supabase
        .from('ordenes_servicio')
        .update(ordenData)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        set((state: any) => ({
          ordenes: state.ordenes.map((o: any) => (o.id === id ? data : o))
        }));
        localStorage.setItem('ordenes_servicio', JSON.stringify(get().ordenes));
        registrarAuditoria('actualizar', 'ordenes_servicio', id, data, oldOrden);
        return { success: true, data };
      }
    } catch (e) {}
    set((state: any) => ({
      ordenes: state.ordenes.map((o: any) => (o.id === id ? { ...o, ...ordenData } : o))
    }));
    localStorage.setItem('ordenes_servicio', JSON.stringify(get().ordenes));
    registrarAuditoria('actualizar', 'ordenes_servicio', id, { ...ordenData, id }, oldOrden);
    return { success: true, data: { ...ordenData, id } };
  },

  deleteOrden: async (id: string) => {
    const oldOrden = get().ordenes.find((o: any) => o.id === id);
    try {
      const { error } = await supabase.from('ordenes_servicio').delete().eq('id', id);
      if (!error) {
        set((state: any) => ({ ordenes: state.ordenes.filter((o: any) => o.id !== id) }));
        localStorage.setItem('ordenes_servicio', JSON.stringify(get().ordenes));
        registrarAuditoria('eliminar', 'ordenes_servicio', id, null, oldOrden);
        return { success: true };
      }
    } catch (e) {}
    set((state: any) => ({ ordenes: state.ordenes.filter((o: any) => o.id !== id) }));
    localStorage.setItem('ordenes_servicio', JSON.stringify(get().ordenes));
    registrarAuditoria('eliminar', 'ordenes_servicio', id, null, oldOrden);
    return { success: true };
  }
}));

// ==================== PROVEEDORES ====================
export const useProveedoresStore = create((set: any, get: any) => ({
  proveedores: [],
  isLoading: false,

  fetchProveedores: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('proveedores')
        .select('*')
        .eq('activo', true)
        .order('razon_social');

      if (!error && data && data.length > 0) {
        set({ proveedores: data, isLoading: false });
        localStorage.setItem('proveedores', JSON.stringify(data));
        return;
      }
    } catch (e) {}
    const stored = localStorage.getItem('proveedores');
    if (stored) {
      set({ proveedores: JSON.parse(stored), isLoading: false });
    } else {
      set({ proveedores: [], isLoading: false });
    }
  },

  createProveedor: async (proveedorData: any) => {
    try {
      const { data, error } = await supabase
        .from('proveedores')
        .insert([proveedorData])
        .select()
        .single();

      if (!error && data) {
        set((state: any) => ({ proveedores: [data, ...state.proveedores] }));
        localStorage.setItem('proveedores', JSON.stringify([data, ...get().proveedores]));
        registrarAuditoria('crear', 'proveedores', data.id, data);
        return { success: true, data };
      }
    } catch (e) {}
    const newProv = proveedorData;
    set((state: any) => ({ proveedores: [newProv, ...state.proveedores] }));
    localStorage.setItem('proveedores', JSON.stringify([newProv, ...get().proveedores]));
    registrarAuditoria('crear', 'proveedores', newProv.id, newProv);
    return { success: true, data: newProv };
  },

  updateProveedor: async (id: string, proveedorData: any) => {
    const oldProv = get().proveedores.find((p: any) => p.id === id);
    try {
      const { data, error } = await supabase
        .from('proveedores')
        .update(proveedorData)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        set((state: any) => ({
          proveedores: state.proveedores.map((p: any) => (p.id === id ? data : p))
        }));
        localStorage.setItem('proveedores', JSON.stringify(get().proveedores));
        registrarAuditoria('actualizar', 'proveedores', id, data, oldProv);
        return { success: true, data };
      }
    } catch (e) {}
    set((state: any) => ({
      proveedores: state.proveedores.map((p: any) => (p.id === id ? { ...p, ...proveedorData } : p))
    }));
    localStorage.setItem('proveedores', JSON.stringify(get().proveedores));
    registrarAuditoria('actualizar', 'proveedores', id, { ...proveedorData, id }, oldProv);
    return { success: true, data: { ...proveedorData, id } };
  },

  deleteProveedor: async (id: string) => {
    const oldProv = get().proveedores.find((p: any) => p.id === id);
    try {
      const { error } = await supabase.from('proveedores').update({ activo: false }).eq('id', id);
      if (!error) {
        set((state: any) => ({ proveedores: state.proveedores.filter((p: any) => p.id !== id) }));
        localStorage.setItem('proveedores', JSON.stringify(get().proveedores));
        registrarAuditoria('eliminar', 'proveedores', id, null, oldProv);
        return { success: true };
      }
    } catch (e) {}
    set((state: any) => ({ proveedores: state.proveedores.filter((p: any) => p.id !== id) }));
    localStorage.setItem('proveedores', JSON.stringify(get().proveedores));
    registrarAuditoria('eliminar', 'proveedores', id, null, oldProv);
    return { success: true };
  }
}));

// ==================== CATEGORIAS ====================
export const useCategoriasStore = create((set: any, get: any) => ({
  categorias: [],
  isLoading: false,

  fetchCategorias: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .eq('activo', true)
        .order('nombre');

      if (!error && data && data.length > 0) {
        set({ categorias: data, isLoading: false });
        localStorage.setItem('categorias', JSON.stringify(data));
        return;
      }
    } catch (e) {}
    const stored = localStorage.getItem('categorias');
    if (stored) {
      set({ categorias: JSON.parse(stored), isLoading: false });
    } else {
      set({ categorias: [], isLoading: false });
    }
  },

  createCategoria: async (categoriaData: any) => {
    try {
      const { data, error } = await supabase.from('categorias').insert([categoriaData]).select().single();
      if (!error && data) {
        set((state: any) => ({ categorias: [data, ...state.categorias] }));
        localStorage.setItem('categorias', JSON.stringify([data, ...get().categorias]));
        return { success: true, data };
      }
    } catch (e) {}
    const newCat = categoriaData;
    set((state: any) => ({ categorias: [newCat, ...state.categorias] }));
    localStorage.setItem('categorias', JSON.stringify([newCat, ...get().categorias]));
    return { success: true, data: newCat };
  },

  updateCategoria: async (id: string, categoriaData: any) => {
    try {
      const { data, error } = await supabase.from('categorias').update(categoriaData).eq('id', id).select().single();
      if (!error && data) {
        set((state: any) => ({ categorias: state.categorias.map((c: any) => (c.id === id ? data : c)) }));
        localStorage.setItem('categorias', JSON.stringify(get().categorias));
        return { success: true, data };
      }
    } catch (e) {}
    set((state: any) => ({ categorias: state.categorias.map((c: any) => (c.id === id ? { ...c, ...categoriaData } : c)) }));
    localStorage.setItem('categorias', JSON.stringify(get().categorias));
    return { success: true, data: { ...categoriaData, id } };
  },

  deleteCategoria: async (id: string) => {
    try {
      const { error } = await supabase.from('categorias').update({ activo: false }).eq('id', id);
      if (!error) {
        set((state: any) => ({ categorias: state.categorias.filter((c: any) => c.id !== id) }));
        localStorage.setItem('categorias', JSON.stringify(get().categorias));
        return { success: true };
      }
    } catch (e) {}
    set((state: any) => ({ categorias: state.categorias.filter((c: any) => c.id !== id) }));
    localStorage.setItem('categorias', JSON.stringify(get().categorias));
    return { success: true };
  }
}));

// ==================== MARCAS ====================
export const useMarcasStore = create((set: any, get: any) => ({
  marcas: [],
  isLoading: false,

  fetchMarcas: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('marcas')
        .select('*')
        .eq('activo', true)
        .order('nombre');

      if (!error && data && data.length > 0) {
        set({ marcas: data, isLoading: false });
        localStorage.setItem('marcas', JSON.stringify(data));
        return;
      }
    } catch (e) {}
    const stored = localStorage.getItem('marcas');
    if (stored) {
      set({ marcas: JSON.parse(stored), isLoading: false });
    } else {
      set({ marcas: [], isLoading: false });
    }
  },

  createMarca: async (marcaData: any) => {
    try {
      const { data, error } = await supabase.from('marcas').insert([marcaData]).select().single();
      if (!error && data) {
        set((state: any) => ({ marcas: [data, ...state.marcas] }));
        localStorage.setItem('marcas', JSON.stringify([data, ...get().marcas]));
        return { success: true, data };
      }
    } catch (e) {}
    const newMarca = marcaData;
    set((state: any) => ({ marcas: [newMarca, ...state.marcas] }));
    localStorage.setItem('marcas', JSON.stringify([newMarca, ...get().marcas]));
    return { success: true, data: newMarca };
  },

  updateMarca: async (id: string, marcaData: any) => {
    try {
      const { data, error } = await supabase.from('marcas').update(marcaData).eq('id', id).select().single();
      if (!error && data) {
        set((state: any) => ({ marcas: state.marcas.map((m: any) => (m.id === id ? data : m)) }));
        localStorage.setItem('marcas', JSON.stringify(get().marcas));
        return { success: true, data };
      }
    } catch (e) {}
    set((state: any) => ({ marcas: state.marcas.map((m: any) => (m.id === id ? { ...m, ...marcaData } : m)) }));
    localStorage.setItem('marcas', JSON.stringify(get().marcas));
    return { success: true, data: { ...marcaData, id } };
  },

  deleteMarca: async (id: string) => {
    try {
      const { error } = await supabase.from('marcas').update({ activo: false }).eq('id', id);
      if (!error) {
        set((state: any) => ({ marcas: state.marcas.filter((m: any) => m.id !== id) }));
        localStorage.setItem('marcas', JSON.stringify(get().marcas));
        return { success: true };
      }
    } catch (e) {}
    set((state: any) => ({ marcas: state.marcas.filter((m: any) => m.id !== id) }));
    localStorage.setItem('marcas', JSON.stringify(get().marcas));
    return { success: true };
  }
}));

// ==================== PRESUPUESTOS ====================
export const usePresupuestosStore = create((set: any, get: any) => ({
  presupuestos: [],
  isLoading: false,

  fetchPresupuestos: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('presupuestos')
        .select('*')
        .order('fecha', { ascending: false });

      if (!error && data && data.length > 0) {
        set({ presupuestos: data, isLoading: false });
        localStorage.setItem('presupuestos', JSON.stringify(data));
        return;
      }
    } catch (e) {}
    const stored = localStorage.getItem('presupuestos');
    if (stored) {
      set({ presupuestos: JSON.parse(stored), isLoading: false });
    } else {
      set({ presupuestos: [], isLoading: false });
    }
  },

  createPresupuesto: async (presupuestoData: any) => {
    try {
      const { data, error } = await supabase.from('presupuestos').insert([presupuestoData]).select().single();
      if (!error && data) {
        set((state: any) => ({ presupuestos: [data, ...state.presupuestos] }));
        localStorage.setItem('presupuestos', JSON.stringify([data, ...get().presupuestos]));
        registrarAuditoria('crear', 'presupuestos', data.id, data);
        return { success: true, data };
      }
    } catch (e) {}
    const newP = presupuestoData;
    set((state: any) => ({ presupuestos: [newP, ...state.presupuestos] }));
    localStorage.setItem('presupuestos', JSON.stringify([newP, ...get().presupuestos]));
    registrarAuditoria('crear', 'presupuestos', newP.id, newP);
    return { success: true, data: newP };
  },

  updatePresupuesto: async (id: string, presupuestoData: any) => {
    const oldP = get().presupuestos.find((p: any) => p.id === id);
    try {
      const { data, error } = await supabase.from('presupuestos').update(presupuestoData).eq('id', id).select().single();
      if (!error && data) {
        set((state: any) => ({ presupuestos: state.presupuestos.map((p: any) => (p.id === id ? data : p)) }));
        localStorage.setItem('presupuestos', JSON.stringify(get().presupuestos));
        registrarAuditoria('actualizar', 'presupuestos', id, data, oldP);
        return { success: true, data };
      }
    } catch (e) {}
    set((state: any) => ({ presupuestos: state.presupuestos.map((p: any) => (p.id === id ? { ...p, ...presupuestoData } : p)) }));
    localStorage.setItem('presupuestos', JSON.stringify(get().presupuestos));
    registrarAuditoria('actualizar', 'presupuestos', id, { ...presupuestoData, id }, oldP);
    return { success: true, data: { ...presupuestoData, id } };
  },

  deletePresupuesto: async (id: string) => {
    const oldP = get().presupuestos.find((p: any) => p.id === id);
    try {
      const { error } = await supabase.from('presupuestos').update({ estado: 'anulado' }).eq('id', id);
      if (!error) {
        set((state: any) => ({ presupuestos: state.presupuestos.filter((p: any) => p.id !== id) }));
        localStorage.setItem('presupuestos', JSON.stringify(get().presupuestos));
        registrarAuditoria('eliminar', 'presupuestos', id, null, oldP);
        return { success: true };
      }
    } catch (e) {}
    set((state: any) => ({ presupuestos: state.presupuestos.filter((p: any) => p.id !== id) }));
    localStorage.setItem('presupuestos', JSON.stringify(get().presupuestos));
    registrarAuditoria('eliminar', 'presupuestos', id, null, oldP);
    return { success: true };
  }
}));

// ==================== PEDIDOS ====================
export const usePedidosStore = create((set: any, get: any) => ({
  pedidos: [],
  isLoading: false,

  fetchPedidos: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('fecha', { ascending: false });

      if (!error && data && data.length > 0) {
        set({ pedidos: data, isLoading: false });
        localStorage.setItem('pedidos', JSON.stringify(data));
        return;
      }
    } catch (e) {}
    const stored = localStorage.getItem('pedidos');
    if (stored) {
      set({ pedidos: JSON.parse(stored), isLoading: false });
    } else {
      set({ pedidos: [], isLoading: false });
    }
  },

  createPedido: async (pedidoData: any) => {
    try {
      const { data, error } = await supabase.from('pedidos').insert([pedidoData]).select().single();
      if (!error && data) {
        set((state: any) => ({ pedidos: [data, ...state.pedidos] }));
        localStorage.setItem('pedidos', JSON.stringify([data, ...get().pedidos]));
        registrarAuditoria('crear', 'pedidos', data.id, data);
        return { success: true, data };
      }
    } catch (e) {}
    const newP = pedidoData;
    set((state: any) => ({ pedidos: [newP, ...state.pedidos] }));
    localStorage.setItem('pedidos', JSON.stringify([newP, ...get().pedidos]));
    registrarAuditoria('crear', 'pedidos', newP.id, newP);
    return { success: true, data: newP };
  },

  updatePedido: async (id: string, pedidoData: any) => {
    const oldP = get().pedidos.find((p: any) => p.id === id);
    try {
      const { data, error } = await supabase.from('pedidos').update(pedidoData).eq('id', id).select().single();
      if (!error && data) {
        set((state: any) => ({ pedidos: state.pedidos.map((p: any) => (p.id === id ? data : p)) }));
        localStorage.setItem('pedidos', JSON.stringify(get().pedidos));
        registrarAuditoria('actualizar', 'pedidos', id, data, oldP);
        return { success: true, data };
      }
    } catch (e) {}
    set((state: any) => ({ pedidos: state.pedidos.map((p: any) => (p.id === id ? { ...p, ...pedidoData } : p)) }));
    localStorage.setItem('pedidos', JSON.stringify(get().pedidos));
    registrarAuditoria('actualizar', 'pedidos', id, { ...pedidoData, id }, oldP);
    return { success: true, data: { ...pedidoData, id } };
  },

  deletePedido: async (id: string) => {
    const oldP = get().pedidos.find((p: any) => p.id === id);
    try {
      const { error } = await supabase.from('pedidos').update({ estado: 'anulado' }).eq('id', id);
      if (!error) {
        set((state: any) => ({ pedidos: state.pedidos.filter((p: any) => p.id !== id) }));
        localStorage.setItem('pedidos', JSON.stringify(get().pedidos));
        registrarAuditoria('eliminar', 'pedidos', id, null, oldP);
        return { success: true };
      }
    } catch (e) {}
    set((state: any) => ({ pedidos: state.pedidos.filter((p: any) => p.id !== id) }));
    localStorage.setItem('pedidos', JSON.stringify(get().pedidos));
    registrarAuditoria('eliminar', 'pedidos', id, null, oldP);
    return { success: true };
  }
}));

// ==================== MOVIMIENTOS STOCK ====================
export const useMovimientosStockStore = create((set: any, get: any) => ({
  movimientos: [],
  isLoading: false,

  fetchMovimientos: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('movimientos_stock')
        .select('*')
        .order('fecha', { ascending: false });

      if (!error && data && data.length > 0) {
        set({ movimientos: data, isLoading: false });
        localStorage.setItem('movimientos_stock', JSON.stringify(data));
        return;
      }
    } catch (e) {}
    const stored = localStorage.getItem('movimientos_stock');
    if (stored) {
      set({ movimientos: JSON.parse(stored), isLoading: false });
    } else {
      set({ movimientos: [], isLoading: false });
    }
  },

  createMovimiento: async (movData: any) => {
    try {
      const { data, error } = await supabase.from('movimientos_stock').insert([movData]).select().single();
      if (!error && data) {
        set((state: any) => ({ movimientos: [data, ...state.movimientos] }));
        localStorage.setItem('movimientos_stock', JSON.stringify([data, ...get().movimientos]));
        registrarAuditoria('crear', 'movimientos_stock', data.id, data);
        return { success: true, data };
      }
    } catch (e) {}
    const newM = movData;
    set((state: any) => ({ movimientos: [newM, ...state.movimientos] }));
    localStorage.setItem('movimientos_stock', JSON.stringify([newM, ...get().movimientos]));
    registrarAuditoria('crear', 'movimientos_stock', newM.id, newM);
    return { success: true, data: newM };
  }
}));

// ==================== CAJAS ====================
export const useCajasStore = create((set: any, get: any) => ({
  cajas: [],
  isLoading: false,

  fetchCajas: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('cajas')
        .select('*')
        .order('fecha_apertura', { ascending: false });

      if (!error && data && data.length > 0) {
        set({ cajas: data, isLoading: false });
        localStorage.setItem('cajas', JSON.stringify(data));
        return;
      }
    } catch (e) {}
    const stored = localStorage.getItem('cajas');
    if (stored) {
      set({ cajas: JSON.parse(stored), isLoading: false });
    } else {
      set({ cajas: [], isLoading: false });
    }
  },

  createCaja: async (cajaData: any) => {
    try {
      const { data, error } = await supabase.from('cajas').insert([cajaData]).select().single();
      if (!error && data) {
        set((state: any) => ({ cajas: [data, ...state.cajas] }));
        localStorage.setItem('cajas', JSON.stringify([data, ...get().cajas]));
        registrarAuditoria('crear', 'cajas', data.id, data);
        return { success: true, data };
      }
    } catch (e) {}
    const newC = cajaData;
    set((state: any) => ({ cajas: [newC, ...state.cajas] }));
    localStorage.setItem('cajas', JSON.stringify([newC, ...get().cajas]));
    registrarAuditoria('crear', 'cajas', newC.id, newC);
    return { success: true, data: newC };
  },

  updateCaja: async (id: string, cajaData: any) => {
    const oldC = get().cajas.find((c: any) => c.id === id);
    try {
      const { data, error } = await supabase.from('cajas').update(cajaData).eq('id', id).select().single();
      if (!error && data) {
        set((state: any) => ({ cajas: state.cajas.map((c: any) => (c.id === id ? data : c)) }));
        localStorage.setItem('cajas', JSON.stringify(get().cajas));
        registrarAuditoria('actualizar', 'cajas', id, data, oldC);
        return { success: true, data };
      }
    } catch (e) {}
    set((state: any) => ({ cajas: state.cajas.map((c: any) => (c.id === id ? { ...c, ...cajaData } : c)) }));
    localStorage.setItem('cajas', JSON.stringify(get().cajas));
    registrarAuditoria('actualizar', 'cajas', id, { ...cajaData, id }, oldC);
    return { success: true, data: { ...cajaData, id } };
  }
}));

// ==================== UNIDADES ====================
export const useUnidadesStore = create((set: any, get: any) => ({
  unidades: [],
  isLoading: false,

  fetchUnidades: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('unidades')
        .select('*')
        .eq('activo', true)
        .order('nombre');

      if (!error && data && data.length > 0) {
        set({ unidades: data, isLoading: false });
        localStorage.setItem('unidades', JSON.stringify(data));
        return;
      }
    } catch (e) {}
    const stored = localStorage.getItem('unidades');
    if (stored) {
      set({ unidades: JSON.parse(stored), isLoading: false });
    } else {
      set({ unidades: [], isLoading: false });
    }
  },

  createUnidad: async (unidadData: any) => {
    try {
      const { data, error } = await supabase.from('unidades').insert([unidadData]).select().single();
      if (!error && data) {
        set((state: any) => ({ unidades: [data, ...state.unidades] }));
        localStorage.setItem('unidades', JSON.stringify([data, ...get().unidades]));
        return { success: true, data };
      }
    } catch (e) {}
    const newU = unidadData;
    set((state: any) => ({ unidades: [newU, ...state.unidades] }));
    localStorage.setItem('unidades', JSON.stringify([newU, ...get().unidades]));
    return { success: true, data: newU };
  },

  updateUnidad: async (id: string, unidadData: any) => {
    try {
      const { data, error } = await supabase.from('unidades').update(unidadData).eq('id', id).select().single();
      if (!error && data) {
        set((state: any) => ({ unidades: state.unidades.map((u: any) => (u.id === id ? data : u)) }));
        localStorage.setItem('unidades', JSON.stringify(get().unidades));
        return { success: true, data };
      }
    } catch (e) {}
    set((state: any) => ({ unidades: state.unidades.map((u: any) => (u.id === id ? { ...u, ...unidadData } : u)) }));
    localStorage.setItem('unidades', JSON.stringify(get().unidades));
    return { success: true, data: { ...unidadData, id } };
  },

  deleteUnidad: async (id: string) => {
    try {
      const { error } = await supabase.from('unidades').update({ activo: false }).eq('id', id);
      if (!error) {
        set((state: any) => ({ unidades: state.unidades.filter((u: any) => u.id !== id) }));
        localStorage.setItem('unidades', JSON.stringify(get().unidades));
        return { success: true };
      }
    } catch (e) {}
    set((state: any) => ({ unidades: state.unidades.filter((u: any) => u.id !== id) }));
    localStorage.setItem('unidades', JSON.stringify(get().unidades));
    return { success: true };
  }
}));

// ==================== FACTURACION ELECTRONICA (PARAGUAY - SIFEN) ====================
export const useFacturacionStore = create((set: any, get: any) => ({
  facturas: [],
  isLoading: false,

  fetchFacturas: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('facturas_electronicas')
        .select('*')
        .order('fecha', { ascending: false });

      if (!error && data && data.length > 0) {
        set({ facturas: data, isLoading: false });
        localStorage.setItem('facturas_electronicas', JSON.stringify(data));
        return;
      }
    } catch (e) {}
    const stored = localStorage.getItem('facturas_electronicas');
    if (stored) {
      set({ facturas: JSON.parse(stored), isLoading: false });
    } else {
      set({ facturas: [], isLoading: false });
    }
  },

  createFactura: async (facturaData: any) => {
    try {
      const { data, error } = await supabase.from('facturas_electronicas').insert([facturaData]).select().single();
      if (!error && data) {
        set((state: any) => ({ facturas: [data, ...state.facturas] }));
        localStorage.setItem('facturas_electronicas', JSON.stringify([data, ...get().facturas]));
        return { success: true, data };
      }
    } catch (e) {}
    const newF = facturaData;
    set((state: any) => ({ facturas: [newF, ...state.facturas] }));
    localStorage.setItem('facturas_electronicas', JSON.stringify([newF, ...get().facturas]));
    return { success: true, data: newF };
  },

  updateFactura: async (id: string, facturaData: any) => {
    try {
      const { data, error } = await supabase.from('facturas_electronicas').update(facturaData).eq('id', id).select().single();
      if (!error && data) {
        set((state: any) => ({ facturas: state.facturas.map((f: any) => (f.id === id ? data : f)) }));
        localStorage.setItem('facturas_electronicas', JSON.stringify(get().facturas));
        return { success: true, data };
      }
    } catch (e) {}
    set((state: any) => ({ facturas: state.facturas.map((f: any) => (f.id === id ? { ...f, ...facturaData } : f)) }));
    localStorage.setItem('facturas_electronicas', JSON.stringify(get().facturas));
    return { success: true, data: { ...facturaData, id } };
  }
}));

// ==================== USUARIOS ====================
export const useUsuariosStore = create((set: any, get: any) => ({
  usuarios: [],
  isLoading: false,

  fetchUsuarios: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('activo', true)
        .order('nombre_completo');

      if (!error && data && data.length > 0) {
        set({ usuarios: data, isLoading: false });
        localStorage.setItem('usuarios', JSON.stringify(data));
        return;
      }
    } catch (e) {}
    const stored = localStorage.getItem('usuarios');
    if (stored) {
      set({ usuarios: JSON.parse(stored), isLoading: false });
    } else {
      set({ usuarios: [], isLoading: false });
    }
  },

  createUsuario: async (usuarioData: any) => {
    try {
      const { data, error } = await supabase.from('usuarios').insert([usuarioData]).select().single();
      if (!error && data) {
        set((state: any) => ({ usuarios: [data, ...state.usuarios] }));
        localStorage.setItem('usuarios', JSON.stringify([data, ...get().usuarios]));
        registrarAuditoria('crear', 'usuarios', data.id, data);
        return { success: true, data };
      }
    } catch (e) {}
    const newU = usuarioData;
    set((state: any) => ({ usuarios: [newU, ...state.usuarios] }));
    localStorage.setItem('usuarios', JSON.stringify([newU, ...get().usuarios]));
    registrarAuditoria('crear', 'usuarios', newU.id, newU);
    return { success: true, data: newU };
  },

  updateUsuario: async (id: string, usuarioData: any) => {
    const oldU = get().usuarios.find((u: any) => u.id === id);
    try {
      const { data, error } = await supabase.from('usuarios').update(usuarioData).eq('id', id).select().single();
      if (!error && data) {
        set((state: any) => ({ usuarios: state.usuarios.map((u: any) => (u.id === id ? data : u)) }));
        localStorage.setItem('usuarios', JSON.stringify(get().usuarios));
        registrarAuditoria('actualizar', 'usuarios', id, data, oldU);
        return { success: true, data };
      }
    } catch (e) {}
    set((state: any) => ({ usuarios: state.usuarios.map((u: any) => (u.id === id ? { ...u, ...usuarioData } : u)) }));
    localStorage.setItem('usuarios', JSON.stringify(get().usuarios));
    registrarAuditoria('actualizar', 'usuarios', id, { ...usuarioData, id }, oldU);
    return { success: true, data: { ...usuarioData, id } };
  },

  deleteUsuario: async (id: string) => {
    const oldU = get().usuarios.find((u: any) => u.id === id);
    try {
      const { error } = await supabase.from('usuarios').update({ activo: false }).eq('id', id);
      if (!error) {
        set((state: any) => ({ usuarios: state.usuarios.filter((u: any) => u.id !== id) }));
        localStorage.setItem('usuarios', JSON.stringify(get().usuarios));
        registrarAuditoria('eliminar', 'usuarios', id, null, oldU);
        return { success: true };
      }
    } catch (e) {}
    set((state: any) => ({ usuarios: state.usuarios.filter((u: any) => u.id !== id) }));
    localStorage.setItem('usuarios', JSON.stringify(get().usuarios));
    registrarAuditoria('eliminar', 'usuarios', id, null, oldU);
    return { success: true };
  }
}));

// ==================== COMPRAS ====================
export const useComprasStore = create((set: any, get: any) => ({
  compras: [],
  isLoading: false,

  fetchCompras: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.from('compras').select('*').order('fecha', { ascending: false });
      if (!error && data && data.length > 0) {
        set({ compras: data, isLoading: false });
        localStorage.setItem('compras', JSON.stringify(data));
        return;
      }
    } catch (e) {}
    const stored = localStorage.getItem('compras');
    if (stored) {
      set({ compras: JSON.parse(stored), isLoading: false });
    } else {
      set({ compras: [], isLoading: false });
    }
  },

  createCompra: async (compraData: any) => {
    try {
      const { data, error } = await supabase.from('compras').insert([compraData]).select().single();
      if (!error && data) {
        set((state: any) => ({ compras: [data, ...state.compras] }));
        localStorage.setItem('compras', JSON.stringify([data, ...get().compras]));
        registrarAuditoria('crear', 'compras', data.id, data);
        return { success: true, data };
      }
    } catch (e) {}
    const newC = compraData;
    set((state: any) => ({ compras: [newC, ...state.compras] }));
    localStorage.setItem('compras', JSON.stringify([newC, ...get().compras]));
    registrarAuditoria('crear', 'compras', newC.id, newC);
    return { success: true, data: newC };
  },

  updateCompra: async (id: string, compraData: any) => {
    const oldC = get().compras.find((c: any) => c.id === id);
    try {
      const { data, error } = await supabase.from('compras').update(compraData).eq('id', id).select().single();
      if (!error && data) {
        set((state: any) => ({ compras: state.compras.map((c: any) => (c.id === id ? data : c)) }));
        localStorage.setItem('compras', JSON.stringify(get().compras));
        registrarAuditoria('actualizar', 'compras', id, data, oldC);
        return { success: true, data };
      }
    } catch (e) {}
    set((state: any) => ({ compras: state.compras.map((c: any) => (c.id === id ? { ...c, ...compraData } : c)) }));
    localStorage.setItem('compras', JSON.stringify(get().compras));
    registrarAuditoria('actualizar', 'compras', id, { ...compraData, id }, oldC);
    return { success: true, data: { ...compraData, id } };
  },

  deleteCompra: async (id: string) => {
    const oldC = get().compras.find((c: any) => c.id === id);
    try {
      const { error } = await supabase.from('compras').update({ activo: false }).eq('id', id);
      if (!error) {
        set((state: any) => ({ compras: state.compras.filter((c: any) => c.id !== id) }));
        localStorage.setItem('compras', JSON.stringify(get().compras));
        registrarAuditoria('eliminar', 'compras', id, null, oldC);
        return { success: true };
      }
    } catch (e) {}
    set((state: any) => ({ compras: state.compras.filter((c: any) => c.id !== id) }));
    localStorage.setItem('compras', JSON.stringify(get().compras));
    registrarAuditoria('eliminar', 'compras', id, null, oldC);
    return { success: true };
  }
}));

// ==================== CAMPAÑAS ====================
export const useCampaniasStore = create((set: any, get: any) => ({
  campanias: [],
  isLoading: false,

  fetchCampanias: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.from('campanias').select('*').order('fecha_creacion', { ascending: false });
      if (!error && data && data.length > 0) {
        set({ campanias: data, isLoading: false });
        localStorage.setItem('campanias', JSON.stringify(data));
        return;
      }
    } catch (e) {}
    const stored = localStorage.getItem('campanias');
    if (stored) {
      set({ campanias: JSON.parse(stored), isLoading: false });
    } else {
      set({ campanias: [], isLoading: false });
    }
  },

  createCampania: async (campaniaData: any) => {
    try {
      const { data, error } = await supabase.from('campanias').insert([campaniaData]).select().single();
      if (!error && data) {
        set((state: any) => ({ campanias: [data, ...state.campanias] }));
        localStorage.setItem('campanias', JSON.stringify([data, ...get().campanias]));
        return { success: true, data };
      }
    } catch (e) {}
    const newC = campaniaData;
    set((state: any) => ({ campanias: [newC, ...state.campanias] }));
    localStorage.setItem('campanias', JSON.stringify([newC, ...get().campanias]));
    return { success: true, data: newC };
  },

  updateCampania: async (id: string, campaniaData: any) => {
    try {
      const { data, error } = await supabase.from('campanias').update(campaniaData).eq('id', id).select().single();
      if (!error && data) {
        set((state: any) => ({ campanias: state.campanias.map((c: any) => (c.id === id ? data : c)) }));
        localStorage.setItem('campanias', JSON.stringify(get().campanias));
        return { success: true, data };
      }
    } catch (e) {}
    set((state: any) => ({ campanias: state.campanias.map((c: any) => (c.id === id ? { ...c, ...campaniaData } : c)) }));
    localStorage.setItem('campanias', JSON.stringify(get().campanias));
    return { success: true, data: { ...campaniaData, id } };
  },

  deleteCampania: async (id: string) => {
    try {
      const { error } = await supabase.from('campanias').update({ activo: false }).eq('id', id);
      if (!error) {
        set((state: any) => ({ campanias: state.campanias.filter((c: any) => c.id !== id) }));
        localStorage.setItem('campanias', JSON.stringify(get().campanias));
        return { success: true };
      }
    } catch (e) {}
    set((state: any) => ({ campanias: state.campanias.filter((c: any) => c.id !== id) }));
    localStorage.setItem('campanias', JSON.stringify(get().campanias));
    return { success: true };
  }
}));

// ==================== ALERTAS ====================
export const useAlertasStore = create((set: any, get: any) => ({
  alertas: [],
  isLoading: false,

  fetchAlertas: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.from('configuracion_alertas').select('*').order('fecha_creacion', { ascending: false });
      if (!error && data && data.length > 0) {
        set({ alertas: data, isLoading: false });
        localStorage.setItem('alertas', JSON.stringify(data));
        return;
      }
    } catch (e) {}
    const stored = localStorage.getItem('alertas');
    if (stored) {
      set({ alertas: JSON.parse(stored), isLoading: false });
    } else {
      set({ alertas: [], isLoading: false });
    }
  },

  createAlerta: async (alertaData: any) => {
    try {
      const { data, error } = await supabase.from('configuracion_alertas').insert([alertaData]).select().single();
      if (!error && data) {
        set((state: any) => ({ alertas: [data, ...state.alertas] }));
        localStorage.setItem('alertas', JSON.stringify([data, ...get().alertas]));
        return { success: true, data };
      }
    } catch (e) {}
    const newA = alertaData;
    set((state: any) => ({ alertas: [newA, ...state.alertas] }));
    localStorage.setItem('alertas', JSON.stringify([newA, ...get().alertas]));
    return { success: true, data: newA };
  },

  updateAlerta: async (id: string, alertaData: any) => {
    try {
      const { data, error } = await supabase.from('configuracion_alertas').update(alertaData).eq('id', id).select().single();
      if (!error && data) {
        set((state: any) => ({ alertas: state.alertas.map((a: any) => (a.id === id ? data : a)) }));
        localStorage.setItem('alertas', JSON.stringify(get().alertas));
        return { success: true, data };
      }
    } catch (e) {}
    set((state: any) => ({ alertas: state.alertas.map((a: any) => (a.id === id ? { ...a, ...alertaData } : a)) }));
    localStorage.setItem('alertas', JSON.stringify(get().alertas));
    return { success: true, data: { ...alertaData, id } };
  },

  deleteAlerta: async (id: string) => {
    try {
      const { error } = await supabase.from('configuracion_alertas').delete().eq('id', id);
      if (!error) {
        set((state: any) => ({ alertas: state.alertas.filter((a: any) => a.id !== id) }));
        localStorage.setItem('alertas', JSON.stringify(get().alertas));
        return { success: true };
      }
    } catch (e) {}
    set((state: any) => ({ alertas: state.alertas.filter((a: any) => a.id !== id) }));
    localStorage.setItem('alertas', JSON.stringify(get().alertas));
    return { success: true };
  }
}));

// ==================== DEPOSITOS ====================
export const useDepositosStore = create((set: any, get: any) => ({
  depositos: [],
  isLoading: false,

  fetchDepositos: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.from('depositos').select('*').eq('activo', true).order('nombre');
      if (!error && data && data.length > 0) {
        set({ depositos: data, isLoading: false });
        localStorage.setItem('depositos', JSON.stringify(data));
        return;
      }
    } catch (e) {}
    const stored = localStorage.getItem('depositos');
    if (stored) {
      set({ depositos: JSON.parse(stored), isLoading: false });
    } else {
      set({ depositos: [], isLoading: false });
    }
  },

  createDeposito: async (depData: any) => {
    try {
      const { data, error } = await supabase.from('depositos').insert([depData]).select().single();
      if (!error && data) {
        set((state: any) => ({ depositos: [data, ...state.depositos] }));
        localStorage.setItem('depositos', JSON.stringify([data, ...get().depositos]));
        return { success: true, data };
      }
    } catch (e) {}
    const newD = depData;
    set((state: any) => ({ depositos: [newD, ...state.depositos] }));
    localStorage.setItem('depositos', JSON.stringify([newD, ...get().depositos]));
    return { success: true, data: newD };
  },

  updateDeposito: async (id: string, depData: any) => {
    try {
      const { data, error } = await supabase.from('depositos').update(depData).eq('id', id).select().single();
      if (!error && data) {
        set((state: any) => ({ depositos: state.depositos.map((d: any) => (d.id === id ? data : d)) }));
        localStorage.setItem('depositos', JSON.stringify(get().depositos));
        return { success: true, data };
      }
    } catch (e) {}
    set((state: any) => ({ depositos: state.depositos.map((d: any) => (d.id === id ? { ...d, ...depData } : d)) }));
    localStorage.setItem('depositos', JSON.stringify(get().depositos));
    return { success: true, data: { ...depData, id } };
  },

  deleteDeposito: async (id: string) => {
    try {
      const { error } = await supabase.from('depositos').update({ activo: false }).eq('id', id);
      if (!error) {
        set((state: any) => ({ depositos: state.depositos.filter((d: any) => d.id !== id) }));
        localStorage.setItem('depositos', JSON.stringify(get().depositos));
        return { success: true };
      }
    } catch (e) {}
    set((state: any) => ({ depositos: state.depositos.filter((d: any) => d.id !== id) }));
    localStorage.setItem('depositos', JSON.stringify(get().depositos));
    return { success: true };
  }
}));

// ==================== PLANES CREDITO ====================
export const usePlanesCreditoStore = create((set: any, get: any) => ({
  planes: [],
  isLoading: false,

  fetchPlanes: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.from('planes_credito').select('*').eq('activo', true).order('nombre');
      if (!error && data && data.length > 0) {
        set({ planes: data, isLoading: false });
        localStorage.setItem('planes_credito', JSON.stringify(data));
        return;
      }
    } catch (e) {}
    const stored = localStorage.getItem('planes_credito');
    if (stored) {
      set({ planes: JSON.parse(stored), isLoading: false });
    } else {
      set({ planes: [], isLoading: false });
    }
  },

  createPlan: async (planData: any) => {
    try {
      const { data, error } = await supabase.from('planes_credito').insert([planData]).select().single();
      if (!error && data) {
        set((state: any) => ({ planes: [data, ...state.planes] }));
        localStorage.setItem('planes_credito', JSON.stringify([data, ...get().planes]));
        return { success: true, data };
      }
    } catch (e) {}
    const newP = planData;
    set((state: any) => ({ planes: [newP, ...state.planes] }));
    localStorage.setItem('planes_credito', JSON.stringify([newP, ...get().planes]));
    return { success: true, data: newP };
  },

  updatePlan: async (id: string, planData: any) => {
    try {
      const { data, error } = await supabase.from('planes_credito').update(planData).eq('id', id).select().single();
      if (!error && data) {
        set((state: any) => ({ planes: state.planes.map((p: any) => (p.id === id ? data : p)) }));
        localStorage.setItem('planes_credito', JSON.stringify(get().planes));
        return { success: true, data };
      }
    } catch (e) {}
    set((state: any) => ({ planes: state.planes.map((p: any) => (p.id === id ? { ...p, ...planData } : p)) }));
    localStorage.setItem('planes_credito', JSON.stringify(get().planes));
    return { success: true, data: { ...planData, id } };
  },

  deletePlan: async (id: string) => {
    try {
      const { error } = await supabase.from('planes_credito').update({ activo: false }).eq('id', id);
      if (!error) {
        set((state: any) => ({ planes: state.planes.filter((p: any) => p.id !== id) }));
        localStorage.setItem('planes_credito', JSON.stringify(get().planes));
        return { success: true };
      }
    } catch (e) {}
    set((state: any) => ({ planes: state.planes.filter((p: any) => p.id !== id) }));
    localStorage.setItem('planes_credito', JSON.stringify(get().planes));
    return { success: true };
  }
}));

// ==================== AUDITORIA (TRAIL LOCAL) ====================
export const useAuditoriaStore = create((set: any, get: any) => ({
  registros: [],

  fetchAuditoria: () => {
    const stored = localStorage.getItem('auditoria');
    if (stored) {
      set({ registros: JSON.parse(stored) });
    } else {
      set({ registros: [] });
    }
  },

  registrar: (accion: string, tabla: string, id_registro: string, datos_nuevos: any, datos_viejos?: any) => {
    const registro = {
      id: crypto.randomUUID(),
      accion,
      tabla,
      id_registro,
      datos_viejos: datos_viejos || null,
      datos_nuevos: datos_nuevos || null,
      fecha: new Date().toISOString(),
      usuario: (() => { try { return JSON.parse(localStorage.getItem('user') || '{}').username || 'sistema'; } catch { return 'sistema'; } })()
    };
    set((state: any) => {
      const nuevos = [registro, ...state.registros].slice(0, 500);
      localStorage.setItem('auditoria', JSON.stringify(nuevos));
      return { registros: nuevos };
    });
  }
}));

// ==================== CONFIGURACIÓN WEB ====================
export const useWebConfigStore = create((set: any, get: any) => ({
  config: null,
  isLoading: false,

  fetchConfig: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.from('configuracion_web').select('*').eq('activo', true).limit(1).single();
      if (!error && data) {
        set({ config: data });
        localStorage.setItem('configuracion_web', JSON.stringify(data));
        return;
      }
    } catch {}
    const stored = localStorage.getItem('configuracion_web');
    if (stored) set({ config: JSON.parse(stored) });
    set({ isLoading: false });
  },

  updateConfig: async (data: any) => {
    try {
      const old = get().config;
      const { error } = await supabase.from('configuracion_web').update({ ...data, fecha_actualizacion: new Date().toISOString() }).eq('id', old?.id || '11111111-ffff-1111-1111-111111111111');
      if (!error) {
        set({ config: { ...old, ...data } });
        localStorage.setItem('configuracion_web', JSON.stringify({ ...old, ...data }));
        registrarAuditoria('actualizar', 'configuracion_web', old?.id || '', data, old);
        return { success: true };
      }
    } catch (e) {}
    const old = get().config;
    set({ config: { ...old, ...data } });
    localStorage.setItem('configuracion_web', JSON.stringify({ ...old, ...data }));
    return { success: true };
  }
}));

// ==================== PROMOCIONES WEB ====================
export const usePromocionesStore = create((set: any, get: any) => ({
  promociones: [],
  isLoading: false,

  fetchPromociones: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.from('promociones_web').select('*').eq('activo', true).order('orden', { ascending: true });
      if (!error && data && data.length > 0) {
        set({ promociones: data });
        localStorage.setItem('promociones_web', JSON.stringify(data));
        return;
      }
    } catch {}
    const stored = localStorage.getItem('promociones_web');
    if (stored) set({ promociones: JSON.parse(stored) });
    set({ isLoading: false });
  },

  createPromocion: async (data: any) => {
    try {
      const { data: nueva, error } = await supabase.from('promociones_web').insert([{ ...data, activo: true }]).select().single();
      if (!error && nueva) {
        set((state: any) => ({ promociones: [...state.promociones, nueva] }));
        localStorage.setItem('promociones_web', JSON.stringify(get().promociones));
        registrarAuditoria('crear', 'promociones_web', nueva.id, nueva);
        return { success: true };
      }
    } catch (e) {}
    const nueva = { ...data, id: crypto.randomUUID(), activo: true };
    set((state: any) => ({ promociones: [...state.promociones, nueva] }));
    localStorage.setItem('promociones_web', JSON.stringify(get().promociones));
    return { success: true };
  },

  updatePromocion: async (id: string, data: any) => {
    try {
      const old = get().promociones.find((p: any) => p.id === id);
      const { error } = await supabase.from('promociones_web').update(data).eq('id', id);
      if (!error) {
        set((state: any) => ({ promociones: state.promociones.map((p: any) => p.id === id ? { ...p, ...data } : p) }));
        localStorage.setItem('promociones_web', JSON.stringify(get().promociones));
        registrarAuditoria('actualizar', 'promociones_web', id, data, old);
        return { success: true };
      }
    } catch (e) {}
    set((state: any) => ({ promociones: state.promociones.map((p: any) => p.id === id ? { ...p, ...data } : p) }));
    localStorage.setItem('promociones_web', JSON.stringify(get().promociones));
    return { success: true };
  },

  deletePromocion: async (id: string) => {
    try {
      const { error } = await supabase.from('promociones_web').update({ activo: false }).eq('id', id);
      if (!error) {
        set((state: any) => ({ promociones: state.promociones.filter((p: any) => p.id !== id) }));
        localStorage.setItem('promociones_web', JSON.stringify(get().promociones));
        return { success: true };
      }
    } catch (e) {}
    set((state: any) => ({ promociones: state.promociones.filter((p: any) => p.id !== id) }));
    localStorage.setItem('promociones_web', JSON.stringify(get().promociones));
    return { success: true };
  }
}));

// ==================== USUARIOS WEB ====================
export const useUsuariosWebStore = create((set: any, get: any) => ({
  usuarios: [],
  isLoading: false,

  fetchUsuariosWeb: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.from('usuarios_web').select('*, clientes(nombre, apellido, razon_social, email, telefono)');
      if (!error && data && data.length > 0) {
        set({ usuarios: data });
        localStorage.setItem('usuarios_web', JSON.stringify(data));
        return;
      }
    } catch {}
    const stored = localStorage.getItem('usuarios_web');
    if (stored) set({ usuarios: JSON.parse(stored) });
    set({ isLoading: false });
  },

  createUsuarioWeb: async (data: any) => {
    try {
      let passwordHash = data.password_hash;
      if (data.password) {
        passwordHash = await sha256(data.password);
      }
      const { data: nuevo, error } = await supabase.from('usuarios_web').insert([{ ...data, password_hash: passwordHash, activo: true }]).select().single();
      if (!error && nuevo) {
        set((state: any) => ({ usuarios: [...state.usuarios, nuevo] }));
        localStorage.setItem('usuarios_web', JSON.stringify(get().usuarios));
        registrarAuditoria('crear', 'usuarios_web', nuevo.id, nuevo);
        return { success: true };
      }
    } catch (e) {}
    const nuevo = { ...data, id: crypto.randomUUID(), activo: true };
    set((state: any) => ({ usuarios: [...state.usuarios, nuevo] }));
    localStorage.setItem('usuarios_web', JSON.stringify(get().usuarios));
    return { success: true };
  },

  updateUsuarioWeb: async (id: string, data: any) => {
    try {
      const old = get().usuarios.find((u: any) => u.id === id);
      const updateData = { ...data };
      if (data.password) {
        updateData.password_hash = await sha256(data.password);
        delete updateData.password;
      }
      const { error } = await supabase.from('usuarios_web').update(updateData).eq('id', id);
      if (!error) {
        set((state: any) => ({ usuarios: state.usuarios.map((u: any) => u.id === id ? { ...u, ...updateData } : u) }));
        localStorage.setItem('usuarios_web', JSON.stringify(get().usuarios));
        registrarAuditoria('actualizar', 'usuarios_web', id, updateData, old);
        return { success: true };
      }
    } catch (e) {}
    set((state: any) => ({ usuarios: state.usuarios.map((u: any) => u.id === id ? { ...u, ...data } : u) }));
    localStorage.setItem('usuarios_web', JSON.stringify(get().usuarios));
    return { success: true };
  },

  deleteUsuarioWeb: async (id: string) => {
    try {
      const { error } = await supabase.from('usuarios_web').update({ activo: false }).eq('id', id);
      if (!error) {
        set((state: any) => ({ usuarios: state.usuarios.filter((u: any) => u.id !== id) }));
        localStorage.setItem('usuarios_web', JSON.stringify(get().usuarios));
        return { success: true };
      }
    } catch (e) {}
    set((state: any) => ({ usuarios: state.usuarios.filter((u: any) => u.id !== id) }));
    localStorage.setItem('usuarios_web', JSON.stringify(get().usuarios));
    return { success: true };
  }
}));

// ==================== PEDIDOS WEB ====================
export const usePedidosWebStore = create((set: any, get: any) => ({
  pedidos: [],
  isLoading: false,

  fetchPedidosWeb: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.from('pedidos').select('*, clientes(nombre, apellido, razon_social, email, telefono), usuarios_web(email, username)').eq('origen', 'web').order('fecha', { ascending: false });
      if (!error && data && data.length > 0) {
        set({ pedidos: data });
        localStorage.setItem('pedidos_web', JSON.stringify(data));
        return;
      }
    } catch {}
    const stored = localStorage.getItem('pedidos_web');
    if (stored) set({ pedidos: JSON.parse(stored) });
    set({ isLoading: false });
  },

  updatePedidoWeb: async (id: string, data: any) => {
    try {
      const { error } = await supabase.from('pedidos').update(data).eq('id', id);
      if (!error) {
        set((state: any) => ({ pedidos: state.pedidos.map((p: any) => p.id === id ? { ...p, ...data } : p) }));
        localStorage.setItem('pedidos_web', JSON.stringify(get().pedidos));
        return { success: true };
      }
    } catch (e) {}
    set((state: any) => ({ pedidos: state.pedidos.map((p: any) => p.id === id ? { ...p, ...data } : p) }));
    localStorage.setItem('pedidos_web', JSON.stringify(get().pedidos));
    return { success: true };
  }
}));

// ==================== CONFIGURACIÓN GENERAL ====================
export const useConfigStore = create((set: any, get: any) => ({
  config: null,
  isLoading: false,

  fetchConfig: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.from('configuracion').select('*').limit(1).single();
      if (!error && data) {
        set({ config: data });
        localStorage.setItem('configuracion', JSON.stringify(data));
        return data;
      }
    } catch {}
    const stored = localStorage.getItem('configuracion');
    if (stored) {
      const parsed = JSON.parse(stored);
      set({ config: parsed });
      set({ isLoading: false });
      return parsed;
    }
    set({ isLoading: false });
    return null;
  },

  updateConfig: async (data: any) => {
    const current = get().config;
    const merged = { ...current, ...data };
    try {
      if (current?.id) {
        const { error } = await supabase.from('configuracion').update({ ...data, fecha_actualizacion: new Date().toISOString() }).eq('id', current.id);
        if (!error) {
          set({ config: merged });
          localStorage.setItem('configuracion', JSON.stringify(merged));
          registrarAuditoria('actualizar', 'configuracion', current.id, data, current);
          return { success: true };
        }
      }
    } catch (e) {}
    set({ config: merged });
    localStorage.setItem('configuracion', JSON.stringify(merged));
    return { success: true };
  },

  getConfigValue: (key: string, defaultValue?: any) => {
    const cfg = get().config || {};
    return cfg[key] ?? defaultValue;
  }
}));
