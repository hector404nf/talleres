-- =============================================
-- SISTEMA DE GESTIÓN PARA TALLERES - SUPABASE
-- Ejecutar esto en SQL Editor de Supabase
-- =============================================

-- 1. CONFIGURACIÓN DEL NEGOCIO
CREATE TABLE IF NOT EXISTS configuracion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razon_social TEXT,
  nombre_fantasia TEXT,
  cuit TEXT,
  domicilio TEXT,
  localidad TEXT,
  provincia TEXT,
  telefono TEXT,
  email TEXT,
  logo_url TEXT,
  stock_minimo_default INTEGER DEFAULT 5,
  margen_ganancia_default NUMERIC DEFAULT 30.00,
  permite_stock_negativo BOOLEAN DEFAULT false,
  controla_stock BOOLEAN DEFAULT true,
  requiere_aprobacion_credito BOOLEAN DEFAULT true,
  punto_venta_default INTEGER DEFAULT 1,
  moneda TEXT DEFAULT 'ARS',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. CLIENTES (con soporte para recurrentes)
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_persona TEXT CHECK (tipo_persona IN ('fisica', 'juridica')),
  nombre TEXT,
  apellido TEXT,
  razon_social TEXT,
  cuil_cuit TEXT UNIQUE,
  email TEXT,
  telefono TEXT,
  celular TEXT,
  direccion TEXT,
  localidad TEXT,
  provincia TEXT,
  activo BOOLEAN DEFAULT true,
  fecha_alta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- CLIENTE RECURRENTE
  es_recurrente BOOLEAN DEFAULT false,
  tipo_recurrente TEXT CHECK (tipo_recurrente IN ('automatico', 'manual')),
  frecuencia_compra_dias INTEGER,
  frecuencia_compra_compras INTEGER,
  frecuencia_compra_monto NUMERIC,
  
  -- CRÉDITOS
  cupo_credito NUMERIC DEFAULT 0,
  saldo_pendiente NUMERIC DEFAULT 0,
  limite_credito_negro NUMERIC DEFAULT 0,
  saldo_credito_negro NUMERIC DEFAULT 0,
  
  -- ESTADÍSTICAS
  total_compras NUMERIC DEFAULT 0,
  cantidad_compras INTEGER DEFAULT 0,
  ultima_compra TIMESTAMP,
  ticket_promedio NUMERIC DEFAULT 0,
  
  -- PUNTOS
  puntos_acumulados INTEGER DEFAULT 0,
  puntos_disponibles INTEGER DEFAULT 0,
  
  -- CLASIFICACIÓN
  categoria_cliente TEXT CHECK (categoria_cliente IN ('A', 'B', 'C', 'D', 'E')),
  
  -- NOTIFICACIONES
  acepta_email BOOLEAN DEFAULT true,
  acepta_whatsapp BOOLEAN DEFAULT true,
  acepta_promociones BOOLEAN DEFAULT true,
  
  bloqueado BOOLEAN DEFAULT false,
  observaciones TEXT
);

-- 3. CONFIGURACIÓN DE REGLAS DE RECURRENCIA
CREATE TABLE IF NOT EXISTS configuracion_recurrente (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  
  tipo_activacion TEXT NOT NULL CHECK (tipo_activacion IN (
    'cantidad_compras', 'monto_acumulado', 'frecuencia_dias', 'combinado'
  )),
  
  cantidad_compras_min INTEGER,
  cantidad_compras_max INTEGER,
  
  monto_acumulado_min NUMERIC,
  monto_acumulado_max NUMERIC,
  periodo_dias_monto INTEGER,
  
  frecuencia_dias_min INTEGER,
  frecuencia_dias_max INTEGER,
  
  -- BENEFICIOS
  descuento_automatico NUMERIC DEFAULT 0,
  porcentaje_descuento NUMERIC DEFAULT 0,
  monto_fijo_descuento NUMERIC DEFAULT 0,
  
  usar_sugerencias BOOLEAN DEFAULT true,
  
  mensaje_bienvenida TEXT,
  mensaje_oferta TEXT,
  mensaje_descuento TEXT,
  
  notificar_vendedor BOOLEAN DEFAULT true,
  notificar_cliente BOOLEAN DEFAULT false,
  
  fecha_desde DATE,
  fecha_hasta DATE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. HISTORIAL DE COMPRAS
CREATE TABLE IF NOT EXISTS historial_compras_cliente (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_cliente UUID REFERENCES clientes(id),
  id_venta UUID,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total NUMERIC NOT NULL,
  descuento_aplicado NUMERIC DEFAULT 0,
  forma_pago TEXT,
  dias_desde_anterior INTEGER,
  es_compra_recurrente BOOLEAN DEFAULT false,
  regla_aplicada UUID,
  sugerencia_generada BOOLEAN DEFAULT false,
  descuento_sugerido NUMERIC,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. SUGERENCIAS DE VENTA
CREATE TABLE IF NOT EXISTS sugerencias_venta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_cliente UUID REFERENCES clientes(id),
  id_vendedor UUID,
  tipo_sugerencia TEXT NOT NULL CHECK (tipo_sugerencia IN (
    'cliente_recurrente', 'cumpleanos', 'baja_compra', 'alto_valor', 
    'producto_recurrente', 'vencimiento_credito'
  )),
  prioridad TEXT CHECK (prioridad IN ('baja', 'media', 'alta', 'urgente')),
  estado TEXT CHECK (estado IN ('pendiente', 'vista', 'aplicada', 'descartada')),
  
  titulo TEXT NOT NULL,
  mensaje TEXT,
  datos_adicionales JSONB,
  
  accion_sugerida TEXT,
  descuento_sugerido NUMERIC,
  productos_sugeridos UUID[],
  
  fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_vista TIMESTAMP,
  fecha_aplicacion TIMESTAMP,
  conversion BOOLEAN DEFAULT false,
  monto_venta NUMERIC
);

-- 6. PROVEEDORES
CREATE TABLE IF NOT EXISTS proveedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razon_social TEXT NOT NULL,
  cuit TEXT UNIQUE,
  email TEXT,
  telefono TEXT,
  direccion TEXT,
  localidad TEXT,
  activo BOOLEAN DEFAULT true,
  fecha_alta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  dias_plazo_default INTEGER DEFAULT 30,
  saldo_pendiente NUMERIC DEFAULT 0,
  observaciones TEXT
);

-- 7. USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  rol TEXT CHECK (rol IN ('admin', 'vendedor', 'encargado', 'tecnico')),
  nombre_completo TEXT,
  activo BOOLEAN DEFAULT true,
  
  permiso_ventas BOOLEAN DEFAULT true,
  permiso_compras BOOLEAN DEFAULT false,
  permiso_inventario BOOLEAN DEFAULT false,
  permiso_reportes BOOLEAN DEFAULT false,
  permiso_configuracion BOOLEAN DEFAULT false,
  permiso_caja BOOLEAN DEFAULT false,
  permiso_anular BOOLEAN DEFAULT false,
  permiso_credito BOOLEAN DEFAULT false,
  limite_descuento NUMERIC DEFAULT 10,
  
  fecha_alta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_ultimo_acceso TIMESTAMP
);

-- 8. CATEGORÍAS
CREATE TABLE IF NOT EXISTS categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  id_categoria_padre UUID REFERENCES categorias(id),
  orden INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  es_publicable_web BOOLEAN DEFAULT true
);

-- 9. MARCAS
CREATE TABLE IF NOT EXISTS marcas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  activo BOOLEAN DEFAULT true
);

-- 10. PRODUCTOS
CREATE TABLE IF NOT EXISTS productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT UNIQUE,
  codigo_barra TEXT,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  id_categoria UUID REFERENCES categorias(id),
  id_marca UUID REFERENCES marcas(id),
  
  precio_costo NUMERIC DEFAULT 0,
  precio_venta NUMERIC DEFAULT 0,
  precio_mayorista NUMERIC DEFAULT 0,
  iva_porcentaje NUMERIC DEFAULT 21,
  
  stock_actual NUMERIC DEFAULT 0,
  stock_minimo INTEGER DEFAULT 5,
  stock_maximo INTEGER,
  
  activo BOOLEAN DEFAULT true,
  es_insumo BOOLEAN DEFAULT false,
  es_servicio BOOLEAN DEFAULT false,
  controla_stock BOOLEAN DEFAULT true,
  es_publicable_web BOOLEAN DEFAULT true,
  
  id_proveedor UUID REFERENCES proveedores(id),
  
  fecha_alta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ventas_total INTEGER DEFAULT 0,
  observaciones TEXT
);

-- 11. MOVIMIENTOS DE STOCK
DO $$ BEGIN
  CREATE TYPE tipo_movimiento_stock AS ENUM (
    'ingreso_compra', 'egreso_venta', 'devolucion_cliente',
    'devolucion_proveedor', 'ajuste_ingreso', 'ajuste_egreso',
    'merma', 'robo', 'traslado', 'servicio_tecnico'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS movimientos_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_producto UUID REFERENCES productos(id),
  tipo_movimiento tipo_movimiento_stock NOT NULL,
  cantidad NUMERIC NOT NULL,
  costo_unitario NUMERIC,
  id_usuario UUID REFERENCES usuarios(id),
  id_documento UUID,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  observaciones TEXT,
  saldo_anterior NUMERIC,
  saldo_actual NUMERIC
);

-- 12. PRESUPUESTOS
CREATE TABLE IF NOT EXISTS presupuestos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_comprobante TEXT DEFAULT 'presupuesto',
  punto_venta INTEGER DEFAULT 1,
  numero INTEGER NOT NULL,
  id_cliente UUID REFERENCES clientes(id),
  id_vendedor UUID REFERENCES usuarios(id),
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_vencimiento TIMESTAMP,
  estado TEXT CHECK (estado IN ('pendiente', 'aprobado', 'rechazado', 'vencido', 'anulado', 'convertido_venta')),
  total NUMERIC DEFAULT 0,
  descuento NUMERIC DEFAULT 0,
  observaciones TEXT,
  UNIQUE (tipo_comprobante, punto_venta, numero)
);

-- 13. PEDIDOS
CREATE TABLE IF NOT EXISTS pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_comprobante TEXT DEFAULT 'pedido',
  punto_venta INTEGER DEFAULT 1,
  numero INTEGER NOT NULL,
  id_cliente UUID REFERENCES clientes(id),
  id_vendedor UUID REFERENCES usuarios(id),
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_entrega TIMESTAMP,
  estado TEXT CHECK (estado IN ('pendiente', 'aprobado', 'en_preparacion', 'listo', 'entregado', 'anulado')),
  total NUMERIC DEFAULT 0,
  senia NUMERIC DEFAULT 0,
  saldo_pendiente NUMERIC DEFAULT 0,
  observaciones TEXT,
  UNIQUE (tipo_comprobante, punto_venta, numero)
);

-- 14. VENTAS
CREATE TABLE IF NOT EXISTS ventas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_comprobante TEXT NOT NULL,
  punto_venta INTEGER DEFAULT 1,
  numero INTEGER NOT NULL,
  id_cliente UUID REFERENCES clientes(id),
  id_vendedor UUID REFERENCES usuarios(id),
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  estado TEXT CHECK (estado IN ('pendiente', 'finalizada', 'anulada', 'cancelada')),
  
  total NUMERIC DEFAULT 0,
  costo_total NUMERIC DEFAULT 0,
  ganancia NUMERIC DEFAULT 0,
  descuento NUMERIC DEFAULT 0,
  subtotal NUMERIC DEFAULT 0,
  
  condicion_venta TEXT CHECK (condicion_venta IN ('contado', 'credito', 'mixto')),
  es_credito BOOLEAN DEFAULT false,
  es_credito_negro BOOLEAN DEFAULT false,
  tipo_credito_negro TEXT,
  
  saldo_pendiente NUMERIC DEFAULT 0,
  
  id_presupuesto UUID REFERENCES presupuestos(id),
  id_pedido UUID REFERENCES pedidos(id),
  
  cae TEXT,
  procesado_afip BOOLEAN DEFAULT false,
  
  UNIQUE (tipo_comprobante, punto_venta, numero)
);

-- 15. DETALLE DE VENTAS
CREATE TABLE IF NOT EXISTS detalle_ventas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_venta UUID REFERENCES ventas(id),
  id_presupuesto UUID REFERENCES presupuestos(id),
  id_pedido UUID REFERENCES pedidos(id),
  id_producto UUID REFERENCES productos(id),
  numero_item INTEGER NOT NULL,
  cantidad NUMERIC NOT NULL,
  precio NUMERIC NOT NULL,
  descuento NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  costo_unitario NUMERIC,
  observaciones TEXT
);

-- 16. SERVICIOS
CREATE TABLE IF NOT EXISTS servicios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio_base NUMERIC DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  orden INTEGER DEFAULT 0,
  codigo TEXT UNIQUE,
  garantia_dias INTEGER DEFAULT 30,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subservicios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_servicio_padre UUID REFERENCES servicios(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio NUMERIC DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  orden INTEGER DEFAULT 0,
  es_opcional BOOLEAN DEFAULT true,
  observaciones TEXT
);

-- 17. ÓRDENES DE SERVICIO
CREATE TABLE IF NOT EXISTS ordenes_servicio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero INTEGER NOT NULL UNIQUE,
  id_cliente UUID REFERENCES clientes(id),
  id_producto UUID REFERENCES productos(id),
  id_servicio UUID REFERENCES servicios(id),
  id_tecnico UUID REFERENCES usuarios(id),
  
  estado TEXT CHECK (estado IN (
    'ingresado', 'en_revision', 'presupuestado', 'aprobado',
    'en_reparacion', 'listo', 'entregado', 'garantia', 'cancelado'
  )),
  fecha_ingreso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_egreso TIMESTAMP,
  
  diagnostico TEXT,
  trabajo_realizado TEXT,
  total NUMERIC DEFAULT 0,
  saldo_pendiente NUMERIC DEFAULT 0,
  
  observaciones TEXT,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 18. TAREAS DE SERVICIO
CREATE TABLE IF NOT EXISTS tareas_servicio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_orden UUID REFERENCES ordenes_servicio(id) ON DELETE CASCADE,
  id_subservicio UUID REFERENCES subservicios(id),
  descripcion TEXT NOT NULL,
  cantidad NUMERIC DEFAULT 1,
  precio_unitario NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  tipo_tarea TEXT CHECK (tipo_tarea IN ('mano_obra', 'repuesto', 'adicional')),
  id_tecnico UUID REFERENCES usuarios(id),
  fecha_ejecucion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 19. FORMAS DE PAGO
CREATE TABLE IF NOT EXISTS formas_pago (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  tipo TEXT CHECK (tipo IN ('efectivo', 'tarjeta_debito', 'tarjeta_credito', 'transferencia', 'cheque', 'credito_sucursal')),
  activo BOOLEAN DEFAULT true,
  comision_porcentaje NUMERIC DEFAULT 0,
  recargo_porcentaje NUMERIC DEFAULT 0
);

-- 20. PLANES DE CRÉDITO
CREATE TABLE IF NOT EXISTS planes_credito (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  cantidad_cuotas INTEGER NOT NULL,
  interes_porcentual NUMERIC DEFAULT 0,
  monto_minimo NUMERIC DEFAULT 0,
  monto_maximo NUMERIC DEFAULT 0,
  activo BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS cuotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_comprobante UUID NOT NULL,
  id_cliente UUID REFERENCES clientes(id),
  id_plan UUID REFERENCES planes_credito(id),
  numero_cuota INTEGER NOT NULL,
  importe NUMERIC NOT NULL,
  importe_pagado NUMERIC DEFAULT 0,
  saldo NUMERIC DEFAULT 0,
  fecha_vencimiento TIMESTAMP NOT NULL,
  estado TEXT CHECK (estado IN ('pendiente', 'parcial', 'pagado', 'vencido'))
);

-- 21. CAJAS
CREATE TABLE IF NOT EXISTS cajas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  saldo_inicial NUMERIC DEFAULT 0,
  saldo_actual NUMERIC DEFAULT 0,
  id_usuario_responsable UUID REFERENCES usuarios(id),
  activa BOOLEAN DEFAULT true,
  fecha_apertura TIMESTAMP,
  fecha_cierre TIMESTAMP
);

DO $$ BEGIN
  CREATE TYPE tipo_movimiento_caja AS ENUM (
    'ingreso_venta', 'ingreso_cobro', 'ingreso_otros',
    'egreso_gasto', 'egreso_pago', 'egreso_retiro',
    'ajuste_ingreso', 'ajuste_egreso'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS movimientos_caja (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_caja UUID REFERENCES cajas(id),
  tipo_movimiento tipo_movimiento_caja NOT NULL,
  importe NUMERIC NOT NULL,
  concepto TEXT NOT NULL,
  id_usuario UUID REFERENCES usuarios(id),
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  estado TEXT CHECK (estado IN ('pendiente', 'confirmado', 'anulado'))
);

-- 22. AUDITORÍA
CREATE TABLE IF NOT EXISTS auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario UUID REFERENCES usuarios(id),
  accion TEXT NOT NULL,
  tabla TEXT,
  id_registro UUID,
  datos_viejos JSONB,
  datos_nuevos JSONB,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 23. NOTIFICACIONES
CREATE TABLE IF NOT EXISTS notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario UUID REFERENCES usuarios(id),
  id_cliente UUID REFERENCES clientes(id),
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  leido BOOLEAN DEFAULT false,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  prioridad TEXT CHECK (prioridad IN ('baja', 'media', 'alta', 'urgente'))
);

-- 24. CONFIGURACIÓN DE ALERTAS
CREATE TABLE IF NOT EXISTS configuracion_alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_alerta TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  activo BOOLEAN DEFAULT true,
  tipo TEXT CHECK (tipo IN ('stock', 'venta', 'cobro', 'cliente', 'servicio', 'caja')),
  prioridad TEXT CHECK (prioridad IN ('baja', 'media', 'alta', 'urgente')),
  condicion_tipo TEXT,
  mensaje_titulo TEXT,
  mensaje_cuerpo TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 25. MENÚ ONLINE
CREATE TABLE IF NOT EXISTS menu_online_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activo BOOLEAN DEFAULT true,
  titulo TEXT,
  mostrar_precios BOOLEAN DEFAULT true,
  permitir_pedidos BOOLEAN DEFAULT true,
  pedido_minimo NUMERIC DEFAULT 0
);

CREATE TABLE IF NOT EXISTS productos_destacados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_producto UUID REFERENCES productos(id),
  orden INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true
);

-- ÍNDICES PARA MEJORAR RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_clientes_activo ON clientes(activo);
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);
CREATE INDEX IF NOT EXISTS idx_clientes_cuil ON clientes(cuil_cuit);
CREATE INDEX IF NOT EXISTS idx_clientes_recurrente ON clientes(es_recurrente);
CREATE INDEX IF NOT EXISTS idx_ventas_cliente ON ventas(id_cliente);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(id_categoria);
CREATE INDEX IF NOT EXISTS idx_cuotas_estado ON cuotas(estado);
CREATE INDEX IF NOT EXISTS idx_sugerencias_cliente ON sugerencias_venta(id_cliente);

-- DATOS INICIALES
INSERT INTO configuracion (razon_social, nombre_fantasia, moneda) 
VALUES ('Mi Taller', 'Taller Principal', 'ARS')
ON CONFLICT DO NOTHING;

INSERT INTO formas_pago (nombre, tipo, activo) VALUES
('Efectivo', 'efectivo', true),
('Tarjeta de Débito', 'tarjeta_debito', true),
('Tarjeta de Crédito', 'tarjeta_credito', true),
('Transferencia', 'transferencia', true),
('Cheque', 'cheque', true),
('Crédito en Sucursal', 'credito_sucursal', true)
ON CONFLICT DO NOTHING;

INSERT INTO usuarios (username, email, password_hash, rol, nombre_completo, permiso_ventas, permiso_compras, permiso_inventario, permiso_reportes, permiso_configuracion, permiso_caja, permiso_anular, permiso_credito)
VALUES ('admin', 'admin@taller.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mqrq3uQjKpJxX1L7UqJ3eQ8X1L7UqJ3', 'admin', 'Administrador', true, true, true, true, true, true, true, true)
ON CONFLICT DO NOTHING;

-- VISTAS ÚTILES
CREATE OR REPLACE VIEW vista_stock_minimo AS
SELECT p.id, p.codigo, p.nombre, p.stock_actual, p.stock_minimo, 
       (p.stock_minimo - p.stock_actual) AS cantidad_sugerida
FROM productos p
WHERE p.activo = true AND p.stock_actual <= p.stock_minimo;

CREATE OR REPLACE VIEW vista_cuotas_vencidas AS
SELECT c.id, c.numero_cuota, c.importe, c.saldo, c.fecha_vencimiento, 
       cli.nombre, cli.apellido, cli.telefono
FROM cuotas c
JOIN clientes cli ON c.id_cliente = cli.id
WHERE c.estado IN ('pendiente', 'vencido') AND c.fecha_vencimiento < CURRENT_TIMESTAMP;
