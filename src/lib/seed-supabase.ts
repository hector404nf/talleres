import { supabase } from './supabase';
import {
  categoriasSeed,
  marcasSeed,
  unidadesSeed,
  depositosSeed,
  formasPagoSeed,
  configuracionSeed,
  usuariosSeed,
  proveedoresSeed,
  clientesSeed,
  planesCreditoSeed,
  generarProductos,
  generarVentas,
  generarOrdenes,
  generarCompras,
  generarPresupuestos,
  generarPedidos,
  generarMovimientos,
  generarCajas,
  generarCampanias,
  generarAlertas,
  generarFacturas,
} from './seed-data';

// Browser-compatible SHA256 (same as supabase.ts)
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export type SeedResult = {
  table: string;
  status: 'ok' | 'error' | 'skipped';
  count: number;
  message: string;
};

export async function seedSupabase(): Promise<SeedResult[]> {
  const results: SeedResult[] = [];

  const track = (table: string, count: number, error?: any) => {
    if (error) {
      const msg = error.code === '23505'
        ? 'Datos ya existen (duplicado)'
        : `${error.message}${error.code ? ` (${error.code})` : ''}`;
      results.push({ table, status: 'error', count: 0, message: msg });
    } else {
      results.push({ table, status: 'ok', count, message: `${count} filas insertadas` });
    }
  };

  const insertMany = async (table: string, rows: any[]) => {
    if (!rows || rows.length === 0) {
      results.push({ table, status: 'skipped', count: 0, message: 'Sin datos' });
      return;
    }
    const { error } = await supabase.from(table).insert(rows);
    track(table, rows.length, error);
  };

  const upsertOne = async (table: string, row: any) => {
    const { error } = await supabase.from(table).upsert(row);
    track(table, 1, error);
  };

  // Hash de contraseñas para usuarios
  const hashedAdmin = await sha256('admin123');
  const hashedUser = await sha256('user123');
  const usersWithPassword = usuariosSeed.map((u, i) => ({
    ...u,
    password_hash: i === 0 ? hashedAdmin : hashedUser,
    activo: true,
    fecha_alta: new Date().toISOString(),
  }));

  // 1. Tablas base (sin FK)
  await upsertOne('configuracion', configuracionSeed);
  await insertMany('formas_pago', formasPagoSeed);
  await insertMany('categorias', categoriasSeed);
  await insertMany('marcas', marcasSeed);
  await insertMany('unidades', unidadesSeed);
  await insertMany('depositos', depositosSeed);
  await insertMany('usuarios', usersWithPassword);

  // 2. Entidades con FK a tablas base
  await insertMany('proveedores', proveedoresSeed);
  await insertMany('clientes', clientesSeed);
  await insertMany('planes_credito', planesCreditoSeed);

  // 3. Productos (dependen de categorias, marcas, unidades, proveedores)
  const productos = generarProductos(categoriasSeed, marcasSeed, proveedoresSeed, unidadesSeed);
  await insertMany('productos', productos);

  // 4. Transaccionales (dependen de clientes, proveedores, productos)
  const ventas = generarVentas(clientesSeed, productos);
  await insertMany('ventas', ventas);

  const ordenes = generarOrdenes(clientesSeed, productos);
  await insertMany('ordenes_servicio', ordenes);

  const compras = generarCompras(proveedoresSeed, productos);
  await insertMany('compras', compras);

  const presupuestos = generarPresupuestos(clientesSeed, productos);
  await insertMany('presupuestos', presupuestos);

  const pedidos = generarPedidos(clientesSeed, productos);
  await insertMany('pedidos', pedidos);

  const movimientos = generarMovimientos(productos, depositosSeed);
  await insertMany('movimientos_stock', movimientos);

  const cajas = generarCajas();
  await insertMany('cajas', cajas);

  const campanias = generarCampanias();
  await insertMany('campanias', campanias);

  const alertas = generarAlertas(productos);
  await insertMany('configuracion_alertas', alertas);

  const facturas = generarFacturas(clientesSeed, ventas);
  await insertMany('facturas_electronicas', facturas);

  return results;
}
