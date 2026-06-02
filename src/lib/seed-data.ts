// ==================== SEED DATA ====================
// Datos de prueba completos para "Talleres Pro"
// Ejecutar desde la página /seed o llamando a seedAllData() desde la consola del navegador.

function uuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function fecha(diasAtras = 0) {
  const d = new Date();
  d.setDate(d.getDate() - diasAtras);
  return d.toISOString();
}

function fechaSolo(diasAtras = 0) {
  const d = new Date();
  d.setDate(d.getDate() - diasAtras);
  return d.toISOString().split('T')[0];
}

function rand(arr: any[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ---------- ENTIDADES BASE ----------

export const categoriasSeed = [
  { id: uuid(), nombre: 'Lubricantes', descripcion: 'Aceites y lubricantes para motor', activo: true },
  { id: uuid(), nombre: 'Frenos', descripcion: 'Pastillas, discos y líquido de frenos', activo: true },
  { id: uuid(), nombre: 'Filtros', descripcion: 'Filtros de aire, aceite y combustible', activo: true },
  { id: uuid(), nombre: 'Baterías', descripcion: 'Baterías para autos y motos', activo: true },
  { id: uuid(), nombre: 'Neumáticos', descripcion: 'Cubiertas para todo tipo de vehículo', activo: true },
  { id: uuid(), nombre: 'Iluminación', descripcion: 'Lámparas y faros', activo: true },
  { id: uuid(), nombre: 'Herramientas', descripcion: 'Herramientas manuales y eléctricas', activo: true },
  { id: uuid(), nombre: 'Suspensión', descripcion: 'Amortiguadores y repuestos de suspensión', activo: true },
  { id: uuid(), nombre: 'Transmisión', descripcion: 'Correas, cadenas y embragues', activo: true },
  { id: uuid(), nombre: 'Eléctrica', descripcion: 'Alternadores, arranques y cables', activo: true },
];

export const marcasSeed = [
  { id: uuid(), nombre: 'Bosch', activo: true },
  { id: uuid(), nombre: 'Castrol', activo: true },
  { id: uuid(), nombre: 'Michelin', activo: true },
  { id: uuid(), nombre: 'Valeo', activo: true },
  { id: uuid(), nombre: 'Mann-Filter', activo: true },
  { id: uuid(), nombre: 'Monroe', activo: true },
  { id: uuid(), nombre: 'SKF', activo: true },
  { id: uuid(), nombre: 'ACDelco', activo: true },
  { id: uuid(), nombre: 'Total', activo: true },
  { id: uuid(), nombre: 'Philips', activo: true },
];

export const unidadesSeed = [
  { id: uuid(), nombre: 'Unidad', abreviatura: 'u', activo: true },
  { id: uuid(), nombre: 'Litro', abreviatura: 'L', activo: true },
  { id: uuid(), nombre: 'Kilogramo', abreviatura: 'kg', activo: true },
  { id: uuid(), nombre: 'Metro', abreviatura: 'm', activo: true },
  { id: uuid(), nombre: 'Juego', abreviatura: 'jgo', activo: true },
  { id: uuid(), nombre: 'Par', abreviatura: 'par', activo: true },
];

export const depositosSeed = [
  { id: uuid(), nombre: 'Depósito Central', direccion: 'Av. Rivadavia 1234', localidad: 'CABA', telefono: '011-4567-8900', encargado: 'Carlos Gómez', es_principal: true, activo: true },
  { id: uuid(), nombre: 'Sucursal Norte', direccion: 'Panamericana Km 35', localidad: 'Tigre', telefono: '011-4567-8901', encargado: 'Laura Pérez', es_principal: false, activo: true },
  { id: uuid(), nombre: 'Sucursal Oeste', direccion: 'Ruta 3 Km 25', localidad: 'Morón', telefono: '011-4567-8902', encargado: 'Martín Díaz', es_principal: false, activo: true },
];

export const formasPagoSeed = [
  { id: uuid(), nombre: 'Efectivo', activo: true },
  { id: uuid(), nombre: 'Tarjeta de Débito', activo: true },
  { id: uuid(), nombre: 'Tarjeta de Crédito', activo: true },
  { id: uuid(), nombre: 'Transferencia', activo: true },
  { id: uuid(), nombre: 'Cheque', activo: true },
  { id: uuid(), nombre: 'Crédito en Sucursal', activo: true },
];

export const configuracionSeed = {
  razon_social: 'Talleres Pro S.A.',
  nombre_fantasia: 'Talleres Pro',
  moneda: 'ARS',
  direccion: 'Av. del Libertador 4567',
  telefono: '011-4321-5678',
  email: 'contacto@tallerespro.com',
  cuit: '30-71234567-8',
  condicion_iva: 'Responsable Inscripto',
  iva_porcentaje_default: 21,
  logo_url: '',
};

export const usuariosSeed = [
  { id: uuid(), username: 'admin', email: 'admin@tallerespro.com', nombre_completo: 'Administrador General', rol: 'admin', activo: true, permiso_ventas: true, permiso_compras: true, permiso_inventario: true, permiso_reportes: true, permiso_configuracion: true, permiso_caja: true, permiso_anular: true, permiso_credito: true, limite_descuento: 100 },
  { id: uuid(), username: 'jlopez', email: 'jlopez@tallerespro.com', nombre_completo: 'Juan López', rol: 'vendedor', activo: true, permiso_ventas: true, permiso_compras: false, permiso_inventario: true, permiso_reportes: false, permiso_configuracion: false, permiso_caja: true, permiso_anular: false, permiso_credito: false, limite_descuento: 15 },
  { id: uuid(), username: 'mrodriguez', email: 'mrodriguez@tallerespro.com', nombre_completo: 'María Rodríguez', rol: 'encargado', activo: true, permiso_ventas: true, permiso_compras: true, permiso_inventario: true, permiso_reportes: true, permiso_configuracion: false, permiso_caja: true, permiso_anular: true, permiso_credito: true, limite_descuento: 30 },
  { id: uuid(), username: 'pgarcia', email: 'pgarcia@tallerespro.com', nombre_completo: 'Pablo García', rol: 'tecnico', activo: true, permiso_ventas: false, permiso_compras: false, permiso_inventario: true, permiso_reportes: false, permiso_configuracion: false, permiso_caja: false, permiso_anular: false, permiso_credito: false, limite_descuento: 0 },
];

// ---------- PROVEEDORES ----------

export const proveedoresSeed = [
  { id: uuid(), razon_social: 'Distribuidora Bosch Argentina S.A.', nombre_fantasia: 'Bosh Arg', cuit: '30-12345678-9', condicion_iva: 'Responsable Inscripto', email: 'ventas@bosch-ar.com', telefono: '011-4000-1111', celular_contacto: '011-5555-1111', direccion: 'Av. Córdoba 5678', localidad: 'CABA', provincia: 'Buenos Aires', codigo_postal: '1054', contacto: 'Roberto Bosch', email_contacto: 'rbosch@bosch-ar.com', dias_plazo_default: 30, cupo_credito: 500000, saldo_pendiente: 125000, calificacion: 5, observaciones: 'Proveedor principal de herramientas', fecha_alta: fecha(120), activo: true },
  { id: uuid(), razon_social: 'Lubricantes del Sur S.R.L.', nombre_fantasia: 'LDS Lubricantes', cuit: '30-98765432-1', condicion_iva: 'Responsable Inscripto', email: 'info@ldslub.com', telefono: '011-4000-2222', celular_contacto: '011-5555-2222', direccion: 'Ruta 205 Km 45', localidad: 'Cañuelas', provincia: 'Buenos Aires', codigo_postal: '1814', contacto: 'Ana Lubricante', email_contacto: 'ana@ldslub.com', dias_plazo_default: 15, cupo_credito: 300000, saldo_pendiente: 45000, calificacion: 4, observaciones: 'Buenos precios en aceites', fecha_alta: fecha(90), activo: true },
  { id: uuid(), razon_social: 'Neumáticos Michelin Argentina', nombre_fantasia: 'Michelin Arg', cuit: '30-55556666-7', condicion_iva: 'Responsable Inscripto', email: 'pedidos@michelin-ar.com', telefono: '011-4000-3333', celular_contacto: '011-5555-3333', direccion: 'Av. General Paz 8900', localidad: 'Villa Lynch', provincia: 'Buenos Aires', codigo_postal: '1672', contacto: 'Luis Neumático', email_contacto: 'luis@michelin-ar.com', dias_plazo_default: 45, cupo_credito: 800000, saldo_pendiente: 200000, calificacion: 5, observaciones: 'Distribuidor oficial', fecha_alta: fecha(200), activo: true },
  { id: uuid(), razon_social: 'Filtros Mann S.A.', nombre_fantasia: 'Mann-Filter Arg', cuit: '30-44447777-8', condicion_iva: 'Responsable Inscripto', email: 'ventas@mann-ar.com', telefono: '011-4000-4444', celular_contacto: '011-5555-4444', direccion: 'Av. Juan B. Justo 3456', localidad: 'CABA', provincia: 'Buenos Aires', codigo_postal: '1416', contacto: 'Carla Filtro', email_contacto: 'carla@mann-ar.com', dias_plazo_default: 30, cupo_credito: 250000, saldo_pendiente: 30000, calificacion: 4, observaciones: '', fecha_alta: fecha(60), activo: true },
  { id: uuid(), razon_social: 'Repuestos Valeo Argentina', nombre_fantasia: 'Valeo Arg', cuit: '30-33338888-9', condicion_iva: 'Responsable Inscripto', email: 'contacto@valeo-ar.com', telefono: '011-4000-5555', celular_contacto: '011-5555-5555', direccion: 'Av. del Trabajo 1200', localidad: 'Villa Soldati', provincia: 'Buenos Aires', codigo_postal: '1437', contacto: 'Diego Valeo', email_contacto: 'diego@valeo-ar.com', dias_plazo_default: 30, cupo_credito: 400000, saldo_pendiente: 80000, calificacion: 4, observaciones: '', fecha_alta: fecha(150), activo: true },
];

// ---------- CLIENTES ----------

export const clientesSeed = [
  { id: uuid(), tipo_persona: 'fisica', nombre: 'Carlos', apellido: 'González', razon_social: '', cuil_cuit: '20-30123456-7', email: 'cgonzalez@email.com', email_secundario: '', telefono: '011-4789-1234', celular: '011-15-6789-1234', whatsapp: '011-15-6789-1234', direccion: 'Av. Santa Fe 2345', localidad: 'CABA', provincia: 'Buenos Aires', pais: 'Argentina', codigo_postal: '1122', fecha_nacimiento: '1985-06-15', genero: 'masculino', profesion: 'Ingeniero', condicion_iva: 'Consumidor Final', es_recurrente: true, tipo_recurrente: 'mensual', frecuencia_compra_dias: 30, frecuencia_compra_compras: 8, frecuencia_compra_monto: 75000, cupo_credito: 50000, saldo_pendiente: 12500, limite_credito_negro: 0, saldo_credito_negro: 0, categoria_cliente: 'VIP', etiqueta_personalizada: '', acepta_email: true, acepta_sms: true, acepta_whatsapp: true, acepta_promociones: true, acepta_cumpleanos: true, observaciones: 'Cliente habitual, paga puntual', fecha_alta: fecha(300), puntos_acumulados: 1250, puntos_disponibles: 800, bloqueado: false, motivo_bloqueo: '', en_lista_negra_set: false, activo: true },
  { id: uuid(), tipo_persona: 'fisica', nombre: 'María', apellido: 'Fernández', razon_social: '', cuil_cuit: '27-38987654-3', email: 'mfernandez@email.com', email_secundario: '', telefono: '011-4789-5678', celular: '011-15-6789-5678', whatsapp: '011-15-6789-5678', direccion: 'Calle Juramento 1234', localidad: 'Belgrano', provincia: 'Buenos Aires', pais: 'Argentina', codigo_postal: '1428', fecha_nacimiento: '1990-03-22', genero: 'femenino', profesion: 'Diseñadora', condicion_iva: 'Consumidor Final', es_recurrente: true, tipo_recurrente: 'trimestral', frecuencia_compra_dias: 90, frecuencia_compra_compras: 3, frecuencia_compra_monto: 45000, cupo_credito: 20000, saldo_pendiente: 0, limite_credito_negro: 0, saldo_credito_negro: 0, categoria_cliente: 'Regular', etiqueta_personalizada: '', acepta_email: true, acepta_sms: true, acepta_whatsapp: true, acepta_promociones: true, acepta_cumpleanos: true, observaciones: 'Prefiere contacto por WhatsApp', fecha_alta: fecha(250), puntos_acumulados: 450, puntos_disponibles: 200, bloqueado: false, motivo_bloqueo: '', en_lista_negra_set: false, activo: true },
  { id: uuid(), tipo_persona: 'juridica', nombre: '', apellido: '', razon_social: 'Transportes Rápidos S.A.', cuil_cuit: '30-71234567-8', email: 'admin@transportesrapidossa.com', email_secundario: 'facturas@transportesrapidossa.com', telefono: '011-4000-9999', celular: '011-15-6789-9999', whatsapp: '011-15-6789-9999', direccion: 'Av. del Libertador 8900', localidad: 'CABA', provincia: 'Buenos Aires', pais: 'Argentina', codigo_postal: '1425', fecha_nacimiento: '', genero: '', profesion: '', condicion_iva: 'Responsable Inscripto', es_recurrente: true, tipo_recurrente: 'semanal', frecuencia_compra_dias: 7, frecuencia_compra_compras: 15, frecuencia_compra_monto: 250000, cupo_credito: 300000, saldo_pendiente: 75000, limite_credito_negro: 50000, saldo_credito_negro: 12000, categoria_cliente: 'Mayorista', etiqueta_personalizada: 'FLOTA', acepta_email: true, acepta_sms: false, acepta_whatsapp: true, acepta_promociones: false, acepta_cumpleanos: false, observaciones: 'Flota de 25 camiones. Solicita factura A siempre.', fecha_alta: fecha(400), puntos_acumulados: 0, puntos_disponibles: 0, bloqueado: false, motivo_bloqueo: '', en_lista_negra_set: false, activo: true },
  { id: uuid(), tipo_persona: 'fisica', nombre: 'Roberto', apellido: 'Silva', razon_social: '', cuil_cuit: '20-25111222-3', email: 'rsilva@email.com', email_secundario: '', telefono: '011-4789-3333', celular: '011-15-6789-3333', whatsapp: '011-15-6789-3333', direccion: 'Av. Cabildo 4567', localidad: 'Núñez', provincia: 'Buenos Aires', pais: 'Argentina', codigo_postal: '1428', fecha_nacimiento: '1978-11-05', genero: 'masculino', profesion: 'Mecánico', condicion_iva: 'Consumidor Final', es_recurrente: false, tipo_recurrente: '', frecuencia_compra_dias: 0, frecuencia_compra_compras: 0, frecuencia_compra_monto: 0, cupo_credito: 0, saldo_pendiente: 0, limite_credito_negro: 0, saldo_credito_negro: 0, categoria_cliente: 'Ocasional', etiqueta_personalizada: '', acepta_email: true, acepta_sms: false, acepta_whatsapp: true, acepta_promociones: true, acepta_cumpleanos: false, observaciones: '', fecha_alta: fecha(100), puntos_acumulados: 80, puntos_disponibles: 80, bloqueado: false, motivo_bloqueo: '', en_lista_negra_set: false, activo: true },
  { id: uuid(), tipo_persona: 'fisica', nombre: 'Lucía', apellido: 'Martínez', razon_social: '', cuil_cuit: '27-34111222-5', email: 'lmartinez@email.com', email_secundario: '', telefono: '011-4789-4444', celular: '011-15-6789-4444', whatsapp: '011-15-6789-4444', direccion: 'Thames 1234', localidad: 'Palermo', provincia: 'Buenos Aires', pais: 'Argentina', codigo_postal: '1414', fecha_nacimiento: '1995-08-30', genero: 'femenino', profesion: 'Abogada', condicion_iva: 'Consumidor Final', es_recurrente: true, tipo_recurrente: 'mensual', frecuencia_compra_dias: 30, frecuencia_compra_compras: 5, frecuencia_compra_monto: 60000, cupo_credito: 30000, saldo_pendiente: 15000, limite_credito_negro: 0, saldo_credito_negro: 0, categoria_cliente: 'Regular', etiqueta_personalizada: '', acepta_email: true, acepta_sms: true, acepta_whatsapp: true, acepta_promociones: true, acepta_cumpleanos: true, observaciones: '', fecha_alta: fecha(180), puntos_acumulados: 600, puntos_disponibles: 350, bloqueado: false, motivo_bloqueo: '', en_lista_negra_set: false, activo: true },
  { id: uuid(), tipo_persona: 'juridica', nombre: '', apellido: '', razon_social: 'Constructora del Sol S.A.', cuil_cuit: '30-66778899-0', email: 'compras@constructsol.com', email_secundario: '', telefono: '011-4000-7777', celular: '011-15-6789-7777', whatsapp: '011-15-6789-7777', direccion: 'Av. Lugones 3400', localidad: 'CABA', provincia: 'Buenos Aires', pais: 'Argentina', codigo_postal: '1425', fecha_nacimiento: '', genero: '', profesion: '', condicion_iva: 'Responsable Inscripto', es_recurrente: true, tipo_recurrente: 'mensual', frecuencia_compra_dias: 30, frecuencia_compra_compras: 6, frecuencia_compra_monto: 180000, cupo_credito: 200000, saldo_pendiente: 45000, limite_credito_negro: 0, saldo_credito_negro: 0, categoria_cliente: 'Corporativo', etiqueta_personalizada: '', acepta_email: true, acepta_sms: false, acepta_whatsapp: false, acepta_promociones: false, acepta_cumpleanos: false, observaciones: 'Paga a 30 días', fecha_alta: fecha(350), puntos_acumulados: 0, puntos_disponibles: 0, bloqueado: false, motivo_bloqueo: '', en_lista_negra_set: false, activo: true },
];

// ---------- PRODUCTOS ----------

export function generarProductos(categorias: any[], marcas: any[], proveedores: any[], unidades: any[]) {
  const productos = [
    { codigo: 'ACE-001', nombre: 'Aceite de Motor 15W-40 Mineral 4L', descripcion: 'Aceite mineral para motores nafteros y diésel. 4 litros.', descripcion_corta: 'Aceite 15W-40 4L', id_categoria: categorias[1]?.id, id_marca: marcas[1]?.id, id_proveedor: proveedores[1]?.id, id_unidad: unidades[1]?.id, precio_costo: 28500, precio_venta: 42000, precio_mayorista: 38000, precio_promocion: 39900, precio_lista_2: 40000, precio_lista_3: 39000, precio_minimo_venta: 35000, iva_porcentaje: 21, impuestos_internos: 0, stock_actual: 120, stock_minimo: 20, stock_maximo: 200, stock_comprometido: 15, stock_en_pedido: 0, punto_reposicion: 30, peso: 3.8, volumen: 0.005, es_insumo: true, es_servicio: false, es_kit: false, es_compuesto: false, requiere_envase: false, controla_stock: true, es_publicable_web: true, destacado_web: true, disponible_online: true, codigo_proveedor: 'CAST-15W40-4L', tiempo_reposicion: 7, ubicacion_deposito: 'Estante A-12', observaciones: 'Producto estrella', fecha_alta: fecha(200), activo: true },
    { codigo: 'FIL-001', nombre: 'Filtro de Aceite Mann W712/80', descripcion: 'Filtro de aceite compatible con VW, Seat, Skoda.', descripcion_corta: 'Filtro aceite W712/80', id_categoria: categorias[2]?.id, id_marca: marcas[4]?.id, id_proveedor: proveedores[3]?.id, id_unidad: unidades[0]?.id, precio_costo: 4500, precio_venta: 8900, precio_mayorista: 7500, precio_promocion: 0, precio_lista_2: 8200, precio_lista_3: 8000, precio_minimo_venta: 7000, iva_porcentaje: 21, impuestos_internos: 0, stock_actual: 45, stock_minimo: 10, stock_maximo: 100, stock_comprometido: 5, stock_en_pedido: 0, punto_reposicion: 15, peso: 0.3, volumen: 0.001, es_insumo: true, es_servicio: false, es_kit: false, es_compuesto: false, requiere_envase: false, controla_stock: true, es_publicable_web: true, destacado_web: false, disponible_online: true, codigo_proveedor: 'MANN-W71280', tiempo_reposicion: 5, ubicacion_deposito: 'Estante B-03', observaciones: '', fecha_alta: fecha(180), activo: true },
    { codigo: 'FRE-001', nombre: 'Pastillas de Freno Bosch BP978', descripcion: 'Pastillas de freno delanteras para Ford Focus, Mondeo.', descripcion_corta: 'Pastillas freno BP978', id_categoria: categorias[1]?.id, id_marca: marcas[0]?.id, id_proveedor: proveedores[0]?.id, id_unidad: unidades[5]?.id, precio_costo: 18000, precio_venta: 32000, precio_mayorista: 28000, precio_promocion: 29900, precio_lista_2: 30000, precio_lista_3: 29000, precio_minimo_venta: 25000, iva_porcentaje: 21, impuestos_internos: 0, stock_actual: 30, stock_minimo: 8, stock_maximo: 60, stock_comprometido: 4, stock_en_pedido: 0, punto_reposicion: 12, peso: 1.2, volumen: 0.002, es_insumo: true, es_servicio: false, es_kit: false, es_compuesto: false, requiere_envase: false, controla_stock: true, es_publicable_web: true, destacado_web: true, disponible_online: true, codigo_proveedor: 'BOS-BP978', tiempo_reposicion: 10, ubicacion_deposito: 'Estante C-05', observaciones: '', fecha_alta: fecha(150), activo: true },
    { codigo: 'BAT-001', nombre: 'Batería Bosch S4 12V 60Ah', descripcion: 'Batería de auto 12V 60Ah derecha. Libre mantenimiento.', descripcion_corta: 'Batería S4 60Ah', id_categoria: categorias[3]?.id, id_marca: marcas[0]?.id, id_proveedor: proveedores[0]?.id, id_unidad: unidades[0]?.id, precio_costo: 65000, precio_venta: 105000, precio_mayorista: 95000, precio_promocion: 99000, precio_lista_2: 100000, precio_lista_3: 98000, precio_minimo_venta: 90000, iva_porcentaje: 21, impuestos_internos: 0, stock_actual: 18, stock_minimo: 5, stock_maximo: 30, stock_comprometido: 2, stock_en_pedido: 0, punto_reposicion: 8, peso: 15, volumen: 0.02, es_insumo: true, es_servicio: false, es_kit: false, es_compuesto: false, requiere_envase: false, controla_stock: true, es_publicable_web: true, destacado_web: true, disponible_online: true, codigo_proveedor: 'BOS-S460', tiempo_reposicion: 14, ubicacion_deposito: 'Sector Baterías', observaciones: '', fecha_alta: fecha(220), activo: true },
    { codigo: 'NEU-001', nombre: 'Neumático Michelin Primacy 4 205/55 R16', descripcion: 'Neumático de turismo 205/55 R16 91V.', descripcion_corta: 'Neumático 205/55 R16', id_categoria: categorias[4]?.id, id_marca: marcas[2]?.id, id_proveedor: proveedores[2]?.id, id_unidad: unidades[0]?.id, precio_costo: 95000, precio_venta: 145000, precio_mayorista: 135000, precio_promocion: 139900, precio_lista_2: 140000, precio_lista_3: 138000, precio_minimo_venta: 130000, iva_porcentaje: 21, impuestos_internos: 0, stock_actual: 24, stock_minimo: 8, stock_maximo: 40, stock_comprometido: 4, stock_en_pedido: 8, punto_reposicion: 12, peso: 9, volumen: 0.08, es_insumo: true, es_servicio: false, es_kit: false, es_compuesto: false, requiere_envase: false, controla_stock: true, es_publicable_web: true, destacado_web: true, disponible_online: true, codigo_proveedor: 'MIC-2055516P4', tiempo_reposicion: 14, ubicacion_deposito: 'Rack Neumáticos', observaciones: '', fecha_alta: fecha(250), activo: true },
    { codigo: 'ILU-001', nombre: 'Lámpara H7 Philips X-tremeVision 12V 55W', descripcion: 'Lámpara halógena H7 12V 55W +130% de luz.', descripcion_corta: 'Lámpara H7 Philips', id_categoria: categorias[5]?.id, id_marca: marcas[9]?.id, id_proveedor: proveedores[0]?.id, id_unidad: unidades[5]?.id, precio_costo: 8500, precio_venta: 15500, precio_mayorista: 13500, precio_promocion: 0, precio_lista_2: 14500, precio_lista_3: 14000, precio_minimo_venta: 12000, iva_porcentaje: 21, impuestos_internos: 0, stock_actual: 60, stock_minimo: 15, stock_maximo: 120, stock_comprometido: 8, stock_en_pedido: 0, punto_reposicion: 20, peso: 0.1, volumen: 0.0005, es_insumo: true, es_servicio: false, es_kit: false, es_compuesto: false, requiere_envase: false, controla_stock: true, es_publicable_web: true, destacado_web: false, disponible_online: true, codigo_proveedor: 'PHI-H7XT', tiempo_reposicion: 5, ubicacion_deposito: 'Estante D-01', observaciones: '', fecha_alta: fecha(120), activo: true },
    { codigo: 'HER-001', nombre: 'Juego de Llaves combinadas 12 piezas', descripcion: 'Juego de llaves combinadas métricas 8-19mm.', descripcion_corta: 'Llaves combinadas 12pzs', id_categoria: categorias[6]?.id, id_marca: marcas[0]?.id, id_proveedor: proveedores[0]?.id, id_unidad: unidades[4]?.id, precio_costo: 22000, precio_venta: 38500, precio_mayorista: 34000, precio_promocion: 0, precio_lista_2: 36000, precio_lista_3: 35000, precio_minimo_venta: 32000, iva_porcentaje: 21, impuestos_internos: 0, stock_actual: 12, stock_minimo: 5, stock_maximo: 25, stock_comprometido: 1, stock_en_pedido: 0, punto_reposicion: 7, peso: 1.5, volumen: 0.003, es_insumo: true, es_servicio: false, es_kit: false, es_compuesto: false, requiere_envase: false, controla_stock: true, es_publicable_web: true, destacado_web: false, disponible_online: true, codigo_proveedor: 'BOS-LLV12', tiempo_reposicion: 10, ubicacion_deposito: 'Estante E-08', observaciones: '', fecha_alta: fecha(90), activo: true },
    { codigo: 'SUS-001', nombre: 'Amortiguador delantero Monroe OESpectrum', descripcion: 'Amortiguador delantero para Chevrolet Corsa.', descripcion_corta: 'Amort. Corsa del. Monroe', id_categoria: categorias[7]?.id, id_marca: marcas[5]?.id, id_proveedor: proveedores[0]?.id, id_unidad: unidades[5]?.id, precio_costo: 28000, precio_venta: 48000, precio_mayorista: 43000, precio_promocion: 0, precio_lista_2: 45000, precio_lista_3: 44000, precio_minimo_venta: 40000, iva_porcentaje: 21, impuestos_internos: 0, stock_actual: 16, stock_minimo: 4, stock_maximo: 30, stock_comprometido: 2, stock_en_pedido: 0, punto_reposicion: 6, peso: 3.5, volumen: 0.01, es_insumo: true, es_servicio: false, es_kit: false, es_compuesto: false, requiere_envase: false, controla_stock: true, es_publicable_web: true, destacado_web: false, disponible_online: true, codigo_proveedor: 'MON-COR-DEL', tiempo_reposicion: 12, ubicacion_deposito: 'Estante F-02', observaciones: '', fecha_alta: fecha(180), activo: true },
    { codigo: 'TRA-001', nombre: 'Kit de Distribución SKF VKMA 01250', descripcion: 'Kit de distribución con correa y tensores.', descripcion_corta: 'Kit distribución VKMA01250', id_categoria: categorias[8]?.id, id_marca: marcas[6]?.id, id_proveedor: proveedores[4]?.id, id_unidad: unidades[4]?.id, precio_costo: 45000, precio_venta: 78000, precio_mayorista: 70000, precio_promocion: 74900, precio_lista_2: 75000, precio_lista_3: 72000, precio_minimo_venta: 68000, iva_porcentaje: 21, impuestos_internos: 0, stock_actual: 8, stock_minimo: 3, stock_maximo: 15, stock_comprometido: 1, stock_en_pedido: 0, punto_reposicion: 5, peso: 2.2, volumen: 0.004, es_insumo: true, es_servicio: false, es_kit: true, es_compuesto: false, requiere_envase: false, controla_stock: true, es_publicable_web: true, destacado_web: true, disponible_online: true, codigo_proveedor: 'SKF-VKMA01250', tiempo_reposicion: 21, ubicacion_deposito: 'Estante G-04', observaciones: '', fecha_alta: fecha(200), activo: true },
    { codigo: 'ELE-001', nombre: 'Alternador Valeo 12V 90A', descripcion: 'Alternador 12V 90A para Renault Clio/Mégane.', descripcion_corta: 'Alternador Clio 12V 90A', id_categoria: categorias[9]?.id, id_marca: marcas[3]?.id, id_proveedor: proveedores[4]?.id, id_unidad: unidades[0]?.id, precio_costo: 55000, precio_venta: 92000, precio_mayorista: 85000, precio_promocion: 0, precio_lista_2: 88000, precio_lista_3: 86000, precio_minimo_venta: 80000, iva_porcentaje: 21, impuestos_internos: 0, stock_actual: 6, stock_minimo: 3, stock_maximo: 12, stock_comprometido: 0, stock_en_pedido: 0, punto_reposicion: 4, peso: 4.5, volumen: 0.01, es_insumo: true, es_servicio: false, es_kit: false, es_compuesto: false, requiere_envase: false, controla_stock: true, es_publicable_web: true, destacado_web: false, disponible_online: true, codigo_proveedor: 'VAL-ALT-90A', tiempo_reposicion: 21, ubicacion_deposito: 'Estante H-01', observaciones: '', fecha_alta: fecha(150), activo: true },
    { codigo: 'ACE-002', nombre: 'Aceite de Motor 5W-40 Sintético 1L', descripcion: 'Aceite sintético 5W-40. 1 litro.', descripcion_corta: 'Aceite 5W-40 1L', id_categoria: categorias[1]?.id, id_marca: marcas[7]?.id, id_proveedor: proveedores[1]?.id, id_unidad: unidades[1]?.id, precio_costo: 9500, precio_venta: 15500, precio_mayorista: 13500, precio_promocion: 0, precio_lista_2: 14500, precio_lista_3: 14000, precio_minimo_venta: 12500, iva_porcentaje: 21, impuestos_internos: 0, stock_actual: 80, stock_minimo: 20, stock_maximo: 150, stock_comprometido: 10, stock_en_pedido: 0, punto_reposicion: 30, peso: 1, volumen: 0.0015, es_insumo: true, es_servicio: false, es_kit: false, es_compuesto: false, requiere_envase: false, controla_stock: true, es_publicable_web: true, destacado_web: false, disponible_online: true, codigo_proveedor: 'ACD-5W40-1L', tiempo_reposicion: 7, ubicacion_deposito: 'Estante A-13', observaciones: '', fecha_alta: fecha(100), activo: true },
    { codigo: 'NEU-002', nombre: 'Neumático Michelin Agilis 215/75 R16C', descripcion: 'Neumático de carga 215/75 R16C 113/111R.', descripcion_corta: 'Neumático 215/75 R16C', id_categoria: categorias[4]?.id, id_marca: marcas[2]?.id, id_proveedor: proveedores[2]?.id, id_unidad: unidades[0]?.id, precio_costo: 110000, precio_venta: 168000, precio_mayorista: 155000, precio_promocion: 0, precio_lista_2: 160000, precio_lista_3: 158000, precio_minimo_venta: 150000, iva_porcentaje: 21, impuestos_internos: 0, stock_actual: 10, stock_minimo: 4, stock_maximo: 20, stock_comprometido: 2, stock_en_pedido: 4, punto_reposicion: 6, peso: 11, volumen: 0.1, es_insumo: true, es_servicio: false, es_kit: false, es_compuesto: false, requiere_envase: false, controla_stock: true, es_publicable_web: true, destacado_web: false, disponible_online: true, codigo_proveedor: 'MIC-21575AG', tiempo_reposicion: 21, ubicacion_deposito: 'Rack Neumáticos', observaciones: '', fecha_alta: fecha(80), activo: true },
  ];

  // Asignar IDs únicos y barajar algunos ids de categoría/marca si faltan
  return productos.map((p) => ({ ...p, id: uuid() }));
}

// ---------- PLANES DE CRÉDITO ----------

export const planesCreditoSeed = [
  { id: uuid(), nombre: '3 Cuotas sin interés', descripcion: '3 pagos mensuales iguales sin interés', cantidad_cuotas: 3, tasa_interes: 0, recargo: 0, dia_vencimiento: 10, activo: true },
  { id: uuid(), nombre: '6 Cuotas 15%', descripcion: '6 pagos mensuales con 15% de interés', cantidad_cuotas: 6, tasa_interes: 15, recargo: 5, dia_vencimiento: 15, activo: true },
  { id: uuid(), nombre: '12 Cuotas 25%', descripcion: '12 pagos mensuales con 25% de interés', cantidad_cuotas: 12, tasa_interes: 25, recargo: 8, dia_vencimiento: 10, activo: true },
  { id: uuid(), nombre: '18 Cuotas 35%', descripcion: '18 pagos mensuales con 35% de interés', cantidad_cuotas: 18, tasa_interes: 35, recargo: 12, dia_vencimiento: 5, activo: true },
];

// ---------- VENTAS ----------

export function generarVentas(clientes: any[], productos: any[]) {
  const ventas = [];
  for (let i = 0; i < 25; i++) {
    const cliente = rand(clientes);
    const cantItems = randInt(1, 4);
    const items = [];
    let subtotal = 0;
    for (let j = 0; j < cantItems; j++) {
      const prod = rand(productos);
      const cant = randInt(1, 3);
      const total = cant * prod.precio_venta;
      subtotal += total;
      items.push({ id: prod.id, nombre: prod.nombre, cantidad: cant, precio: prod.precio_venta, total });
    }
    const descuento = rand([0, 0, 0, 5000, 10000, 15000]);
    const total = Math.max(0, subtotal - descuento);
    const formaPago = rand(['Efectivo', 'Tarjeta de Débito', 'Tarjeta de Crédito', 'Transferencia']);
    ventas.push({
      id: uuid(),
      id_cliente: cliente.id,
      cliente_nombre: cliente.tipo_persona === 'fisica' ? `${cliente.nombre} ${cliente.apellido}` : cliente.razon_social,
      fecha: fecha(randInt(0, 60)),
      items,
      subtotal,
      descuento,
      total,
      forma_pago: formaPago,
      pagos: [{ forma_pago: formaPago, monto: total }],
      estado: 'finalizada',
    });
  }
  return ventas;
}

// ---------- ÓRDENES DE SERVICIO ----------

export function generarOrdenes(clientes: any[], productos: any[]) {
  const estados = ['ingresado', 'diagnosticado', 'presupuestado', 'aprobado', 'en_reparacion', 'reparado', 'entregado', 'cancelado'];
  const tecnicos = ['Pablo García', 'Martín Díaz', 'Lucas Hernández', 'Juan López'];
  const marcasProducto = ['Samsung', 'Apple', 'LG', 'Sony', 'HP', 'Dell', 'Toyota', 'Ford', 'Volkswagen', 'Chevrolet'];
  const modelosProducto = ['Model X', 'Pro 15', 'G7', 'Bravia 55', 'Pavilion', 'Inspiron', 'Hilux', 'Ranger', 'Golf', 'Cruze'];
  const fallas = ['No enciende', 'Pantalla rota', 'Batería no carga', 'Ruido extraño', 'Fuga de aceite', 'Sobrecalentamiento', 'Problema de transmisión', 'Frenos desgastados'];
  const ordenes = [];

  for (let i = 0; i < 20; i++) {
    const cliente = rand(clientes);
    const estado = rand(estados);
    const tecnico = rand(tecnicos);
    const diasIngreso = randInt(0, 90);
    const fechaIngreso = fecha(diasIngreso);
    const fechaEntregaEst = new Date(fechaIngreso);
    fechaEntregaEst.setDate(fechaEntregaEst.getDate() + randInt(3, 15));

    const repuestos = [];
    const cantRep = randInt(0, 3);
    let totalRepuestos = 0;
    for (let r = 0; r < cantRep; r++) {
      const prod = rand(productos);
      const cant = randInt(1, 2);
      const total = cant * prod.precio_venta;
      totalRepuestos += total;
      repuestos.push({ id_producto: prod.id, nombre: prod.nombre, cantidad: cant, precio: prod.precio_venta, total });
    }

    const manoObra = rand([15000, 25000, 35000, 45000, 60000, 0, 0]);
    const total = totalRepuestos + manoObra;

    ordenes.push({
      id: uuid(),
      numero: 1000 + i + 1,
      id_cliente: cliente.id,
      cliente_nombre: cliente.tipo_persona === 'fisica' ? `${cliente.nombre} ${cliente.apellido}` : cliente.razon_social,
      producto_marca: rand(marcasProducto),
      producto_modelo: rand(modelosProducto),
      producto_numero_serie: `SN${randInt(100000, 999999)}`,
      producto_color: rand(['Negro', 'Blanco', 'Gris', 'Rojo', 'Azul', 'Plateado']),
      producto_accesorios: rand(['Cargador', 'Funda', 'Cable', 'Maletín', 'Ninguno']),
      producto_falla: rand(fallas),
      producto_observaciones: 'Traído por el cliente personalmente',
      estado,
      tecnico,
      diagnostico: estado !== 'ingresado' ? `Diagnóstico preliminar: ${rand(fallas)}` : '',
      trabajo_realizado: ['reparado', 'entregado'].includes(estado) ? `Reemplazo de ${rand(['componente', 'pieza', 'módulo'])}. Prueba OK.` : '',
      costo_mano_obra: manoObra,
      total,
      presupuesto_aprobado: ['aprobado', 'en_reparacion', 'reparado', 'entregado'].includes(estado),
      tiene_garantia: Math.random() > 0.7,
      dias_garantia: 30,
      observaciones: '',
      fecha_ingreso: fechaIngreso,
      fecha_entrega_estimada: fechaEntregaEst.toISOString(),
      repuestos,
      historial_estados: [
        { estado: 'ingresado', fecha: fechaIngreso, observaciones: 'Ingreso al taller' },
        ...(estado !== 'ingresado' ? [{ estado: 'diagnosticado', fecha: fecha(diasIngreso - randInt(1, 2)), observaciones: 'Se realizó diagnóstico' }] : []),
        ...(estado !== 'ingresado' && estado !== 'diagnosticado' ? [{ estado: 'presupuestado', fecha: fecha(diasIngreso - randInt(2, 4)), observaciones: 'Presupuesto enviado' }] : []),
      ],
      fotos_antes: [],
      fotos_despues: [],
      encuesta_calificacion: estado === 'entregado' ? randInt(3, 5) : 0,
      encuesta_comentarios: '',
    });
  }
  return ordenes;
}

// ---------- COMPRAS ----------

export function generarCompras(proveedores: any[], productos: any[]) {
  const compras = [];
  for (let i = 0; i < 15; i++) {
    const prov = rand(proveedores);
    const cantItems = randInt(2, 5);
    const items = [];
    let total = 0;
    for (let j = 0; j < cantItems; j++) {
      const prod = rand(productos);
      const cant = randInt(5, 30);
      const precio = prod.precio_costo;
      const itemTotal = cant * precio;
      total += itemTotal;
      items.push({ id_producto: prod.id, nombre: prod.nombre, cantidad: cant, precio_unitario: precio, total: itemTotal });
    }
    const costoEnvio = rand([0, 0, 2500, 5000, 7500]);
    compras.push({
      id: uuid(),
      numero: 2000 + i + 1,
      id_proveedor: prov.id,
      fecha: fecha(randInt(5, 80)),
      fecha_entrega: fecha(randInt(0, 5)),
      observaciones: `Pedido habitual de ${prov.razon_social}`,
      estado: rand(['pendiente', 'recibido', 'recibido', 'recibido']),
      items,
      total: total + costoEnvio,
      costo_envio: costoEnvio,
      activo: true,
    });
  }
  return compras;
}

// ---------- PRESUPUESTOS ----------

export function generarPresupuestos(clientes: any[], productos: any[]) {
  const presupuestos = [];
  for (let i = 0; i < 12; i++) {
    const cliente = rand(clientes);
    const cantItems = randInt(1, 4);
    const items = [];
    let subtotal = 0;
    for (let j = 0; j < cantItems; j++) {
      const prod = rand(productos);
      const cant = randInt(1, 3);
      const total = cant * prod.precio_venta;
      subtotal += total;
      items.push({ id_producto: prod.id, nombre: prod.nombre, cantidad: cant, precio: prod.precio_venta, total });
    }
    const descuento = rand([0, 0, 0, 5000, 10000]);
    const total = Math.max(0, subtotal - descuento);
    const fechaVenc = new Date();
    fechaVenc.setDate(fechaVenc.getDate() + randInt(7, 30));
    presupuestos.push({
      id: uuid(),
      numero: 3000 + i + 1,
      id_cliente: cliente.id,
      fecha: fecha(randInt(0, 45)),
      fecha_vencimiento: fechaVenc.toISOString(),
      observaciones: '',
      descuento,
      estado: rand(['pendiente', 'pendiente', 'aprobado', 'rechazado', 'vencido']),
      items,
      total,
    });
  }
  return presupuestos;
}

// ---------- PEDIDOS ----------

export function generarPedidos(clientes: any[], productos: any[]) {
  const pedidos = [];
  for (let i = 0; i < 10; i++) {
    const cliente = rand(clientes);
    const cantItems = randInt(1, 3);
    const items = [];
    let total = 0;
    for (let j = 0; j < cantItems; j++) {
      const prod = rand(productos);
      const cant = randInt(1, 5);
      const itemTotal = cant * prod.precio_venta;
      total += itemTotal;
      items.push({ id_producto: prod.id, nombre: prod.nombre, cantidad: cant, precio: prod.precio_venta, total: itemTotal });
    }
    pedidos.push({
      id: uuid(),
      numero: 4000 + i + 1,
      id_cliente: cliente.id,
      cliente_nombre: cliente.tipo_persona === 'fisica' ? `${cliente.nombre} ${cliente.apellido}` : cliente.razon_social,
      fecha: fecha(randInt(0, 30)),
      fecha_entrega: fecha(randInt(1, 10)),
      observaciones: '',
      estado: rand(['pendiente', 'pendiente', 'en_preparacion', 'listo', 'entregado']),
      items,
      total,
    });
  }
  return pedidos;
}

// ---------- MOVIMIENTOS DE STOCK ----------

export function generarMovimientos(productos: any[], depositos: any[]) {
  const tipos = ['entrada', 'salida', 'ajuste', 'transferencia'];
  const motivos = ['Compra proveedor', 'Venta', 'Ajuste inventario', 'Devolución cliente', 'Transferencia sucursal', 'Daño', 'Muestra'];
  const movimientos = [];
  for (let i = 0; i < 30; i++) {
    const prod = rand(productos);
    const tipo = rand(tipos);
    const cantidad = randInt(1, 20);
    movimientos.push({
      id: uuid(),
      id_producto: prod.id,
      producto_nombre: prod.nombre,
      id_deposito: rand(depositos)?.id,
      tipo,
      cantidad: tipo === 'salida' || tipo === 'ajuste' ? -cantidad : cantidad,
      motivo: rand(motivos),
      fecha: fecha(randInt(0, 60)),
      observaciones: '',
    });
  }
  return movimientos;
}

// ---------- CAJAS ----------

export function generarCajas() {
  const cajas = [];
  for (let i = 0; i < 5; i++) {
    const saldoInicial = rand([50000, 75000, 100000, 125000]);
    const dias = randInt(1, 45);
    const apertura = fecha(dias);
    const cierre = new Date(apertura);
    cierre.setHours(cierre.getHours() + randInt(8, 14));
    const diferencia = randInt(-5000, 15000);
    cajas.push({
      id: uuid(),
      nombre: i === 0 ? 'Caja Principal' : `Caja Sucursal ${i}`,
      saldo_inicial: saldoInicial,
      saldo_final: saldoInicial + diferencia,
      diferencia,
      estado: i === 0 ? 'cerrada' : rand(['abierta', 'cerrada', 'cerrada']),
      fecha_apertura: apertura,
      fecha_cierre: i === 0 ? cierre.toISOString() : null,
      observaciones: '',
    });
  }
  return cajas;
}

// ---------- CAMPAÑAS ----------

export function generarCampanias() {
  const tipos = ['descuento', 'descuento', 'combo', 'envio_gratis', 'puntos_dobles'];
  const campanias = [];
  for (let i = 0; i < 6; i++) {
    const desde = new Date();
    desde.setDate(desde.getDate() - randInt(10, 30));
    const hasta = new Date(desde);
    hasta.setDate(hasta.getDate() + randInt(15, 60));
    campanias.push({
      id: uuid(),
      nombre: ['Verano 2025', 'Día del Mecánico', 'Vuelta al Taller', 'Hot Sale', 'Cyber Monday', 'Fin de Año'][i],
      tipo: tipos[i] || 'descuento',
      descripcion: `Campaña promocional ${i + 1}`,
      beneficio: `${randInt(10, 30)}% de descuento`,
      fecha_desde: desde.toISOString(),
      fecha_hasta: hasta.toISOString(),
      estado: hasta > new Date() ? 'activa' : 'finalizada',
      condicion: rand(['Compra mínima $50000', 'Todos los productos', 'Solo lubricantes', 'Clientes VIP']),
      activo: true,
      fecha_creacion: fecha(randInt(30, 90)),
    });
  }
  return campanias;
}

// ---------- ALERTAS ----------

export function generarAlertas(productos: any[]) {
  const tipos = ['stock_bajo', 'vencimiento', 'cobranza', 'cumpleanos', 'meta_ventas'];
  const alertas = [];
  for (let i = 0; i < 8; i++) {
    const tipo = tipos[i % tipos.length];
    const prod = tipo === 'stock_bajo' ? productos.find((p: any) => p.stock_actual <= p.stock_minimo + 5) || rand(productos) : undefined;
    alertas.push({
      id: uuid(),
      tipo,
      titulo: tipo === 'stock_bajo' ? `Stock bajo: ${prod?.nombre}` : `Alerta ${tipo} #${i + 1}`,
      descripcion: `Descripción de alerta ${tipo}`,
      entidad_tipo: tipo === 'stock_bajo' ? 'producto' : 'sistema',
      entidad_id: prod?.id || '',
      fecha_creacion: fecha(randInt(0, 15)),
      activa: true,
    });
  }
  return alertas;
}

// ---------- FACTURAS ELECTRÓNICAS ----------

export function generarFacturas(clientes: any[], ventas: any[]) {
  const facturas = [];
  const tiposDoc = ['factura', 'nota_credito', 'nota_debito'];
  for (let i = 0; i < 18; i++) {
    const venta = ventas[i % ventas.length];
    const cliente = clientes.find((c: any) => c.id === venta.id_cliente) || rand(clientes);
    facturas.push({
      id: uuid(),
      numero: `001-0000${1000 + i + 1}`,
      tipo: rand(tiposDoc),
      id_cliente: cliente.id,
      cliente_nombre: venta.cliente_nombre,
      fecha: venta.fecha,
      total: venta.total,
      estado: rand(['aprobada', 'aprobada', 'aprobada', 'pendiente']),
    });
  }
  return facturas;
}

// ---------- NOTIFICACIONES ----------

export function generarNotificaciones() {
  const notifs = [];
  const templates = [
    { titulo: 'Nueva venta registrada', mensaje: 'Se registró una venta por $125.000' },
    { titulo: 'Stock bajo detectado', mensaje: 'El producto Aceite 15W-40 está por debajo del mínimo' },
    { titulo: 'Orden de servicio actualizada', mensaje: 'La orden #1005 cambió a estado "Reparado"' },
    { titulo: 'Caja cerrada', mensaje: 'La Caja Principal fue cerrada con diferencia de $2.300' },
    { titulo: 'Nuevo presupuesto', mensaje: 'Se creó el presupuesto #3002 para Transportes Rápidos' },
  ];
  for (let i = 0; i < 10; i++) {
    const t = templates[i % templates.length];
    notifs.push({
      id: uuid(),
      titulo: t.titulo,
      mensaje: t.mensaje,
      fecha: fecha(randInt(0, 7)),
      leida: i > 3,
    });
  }
  return notifs;
}

// ---------- FUNCIONES DE GUARDADO ----------

export function seedAllData() {
  // 1. Base
  localStorage.setItem('categorias', JSON.stringify(categoriasSeed));
  localStorage.setItem('marcas', JSON.stringify(marcasSeed));
  localStorage.setItem('unidades', JSON.stringify(unidadesSeed));
  localStorage.setItem('depositos', JSON.stringify(depositosSeed));
  localStorage.setItem('configuracion', JSON.stringify(configuracionSeed));
  localStorage.setItem('usuarios', JSON.stringify(usuariosSeed));
  localStorage.setItem('formas_pago', JSON.stringify(formasPagoSeed));

  // 2. Dependientes de base
  localStorage.setItem('proveedores', JSON.stringify(proveedoresSeed));
  localStorage.setItem('clientes', JSON.stringify(clientesSeed));

  const productos = generarProductos(categoriasSeed, marcasSeed, proveedoresSeed, unidadesSeed);
  localStorage.setItem('productos', JSON.stringify(productos));

  localStorage.setItem('planes_credito', JSON.stringify(planesCreditoSeed));

  // 3. Transaccionales
  const ventas = generarVentas(clientesSeed, productos);
  localStorage.setItem('ventas', JSON.stringify(ventas));

  const ordenes = generarOrdenes(clientesSeed, productos);
  localStorage.setItem('ordenes_servicio', JSON.stringify(ordenes));

  const compras = generarCompras(proveedoresSeed, productos);
  localStorage.setItem('compras', JSON.stringify(compras));

  const presupuestos = generarPresupuestos(clientesSeed, productos);
  localStorage.setItem('presupuestos', JSON.stringify(presupuestos));

  const pedidos = generarPedidos(clientesSeed, productos);
  localStorage.setItem('pedidos', JSON.stringify(pedidos));

  const movimientos = generarMovimientos(productos, depositosSeed);
  localStorage.setItem('movimientos_stock', JSON.stringify(movimientos));

  const cajas = generarCajas();
  localStorage.setItem('cajas', JSON.stringify(cajas));

  const campanias = generarCampanias();
  localStorage.setItem('campanias', JSON.stringify(campanias));

  const alertas = generarAlertas(productos);
  localStorage.setItem('alertas', JSON.stringify(alertas));

  const facturas = generarFacturas(clientesSeed, ventas);
  localStorage.setItem('facturas_electronicas', JSON.stringify(facturas));

  const notifs = generarNotificaciones();
  localStorage.setItem('notificaciones', JSON.stringify(notifs));

  // Auth demo
  const demoUser = { id: 'demo-admin', username: 'admin', nombre_completo: 'Administrador', rol: 'admin' };
  localStorage.setItem('user', JSON.stringify(demoUser));
  localStorage.setItem('isAuthenticated', 'true');

  return {
    categorias: categoriasSeed.length,
    marcas: marcasSeed.length,
    unidades: unidadesSeed.length,
    depositos: depositosSeed.length,
    usuarios: usuariosSeed.length,
    proveedores: proveedoresSeed.length,
    clientes: clientesSeed.length,
    productos: productos.length,
    planes_credito: planesCreditoSeed.length,
    ventas: ventas.length,
    ordenes_servicio: ordenes.length,
    compras: compras.length,
    presupuestos: presupuestos.length,
    pedidos: pedidos.length,
    movimientos_stock: movimientos.length,
    cajas: cajas.length,
    campanias: campanias.length,
    alertas: alertas.length,
    facturas_electronicas: facturas.length,
    notificaciones: notifs.length,
  };
}

export function clearAllData() {
  const keys = [
    'categorias', 'marcas', 'unidades', 'depositos', 'configuracion', 'usuarios',
    'proveedores', 'clientes', 'productos', 'planes_credito', 'ventas',
    'ordenes_servicio', 'compras', 'presupuestos', 'pedidos', 'movimientos_stock',
    'cajas', 'campanias', 'alertas', 'facturas_electronicas', 'notificaciones',
    'auditoria', 'user', 'isAuthenticated', 'formas_pago',
  ];
  keys.forEach((k) => localStorage.removeItem(k));
}
