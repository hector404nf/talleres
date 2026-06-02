-- =============================================
-- SISTEMA DE GESTIÓN PARA TALLERES - SUPABASE
-- =============================================
-- Este script crea todas las tablas necesarias
-- para el sistema de gestión de talleres
-- =============================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. CONFIGURACIÓN DEL NEGOCIO
-- =============================================
CREATE TABLE configuracion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razon_social TEXT,
  nombre_fantasia TEXT,
  cuit TEXT,
  ingresa_brutos TEXT,
  posicion_iva TEXT,
  domicilio TEXT,
  localidad TEXT,
  provincia TEXT,
  codigo_postal TEXT,
  telefono TEXT,
  email TEXT,
  logo_url TEXT,
  pie_factura TEXT,
  stock_minimo_default INTEGER DEFAULT 5,
  margen_ganancia_default NUMERIC DEFAULT 30.00,
  permite_stock_negativo BOOLEAN DEFAULT false,
  controla_stock BOOLEAN DEFAULT true,
  requiere_aprobacion_credito BOOLEAN DEFAULT true,
  dias_vencimiento_default INTEGER DEFAULT 30,
  punto_venta_default INTEGER DEFAULT 1,
  moneda TEXT DEFAULT 'ARS',
  decimales_precio INTEGER DEFAULT 2,
  decimales_unidad INTEGER DEFAULT 3,
  usa_menu_online BOOLEAN DEFAULT true,
  permite_pedidos_online BOOLEAN DEFAULT true,
  usa_servicios BOOLEAN DEFAULT true,
  usa_presupuestos BOOLEAN DEFAULT true,
  usa_pedidos BOOLEAN DEFAULT true,
  usa_caja BOOLEAN DEFAULT true,
  usa_reportes BOOLEAN DEFAULT true,
  usa_alertas BOOLEAN DEFAULT true,
  usa_cumpleanos BOOLEAN DEFAULT true,
  usa_puntos_fidelidad BOOLEAN DEFAULT true,
  puntos_por_compra NUMERIC DEFAULT 1.0,
  valor_punto NUMERIC DEFAULT 1.0,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 2. GESTIÓN DE PERSONAS - CLIENTES
-- =============================================
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_persona TEXT CHECK (tipo_persona IN ('fisica', 'juridica')),
  nombre TEXT,
  apellido TEXT,
  razon_social TEXT,
  nombre_fantasia TEXT,
  cuil_cuit TEXT UNIQUE,
  condicion_iva TEXT DEFAULT 'responsable_inscripto',
  email TEXT,
  email_secundario TEXT,
  telefono TEXT,
  celular TEXT,
  whatsapp TEXT,
  direccion TEXT,
  localidad TEXT,
  provincia TEXT,
  codigo_postal TEXT,
  pais TEXT DEFAULT 'Argentina',
  fecha_nacimiento DATE,
  genero TEXT,
  activo BOOLEAN DEFAULT true,
  fecha_alta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_baja TIMESTAMP,
  id_usuario_alta UUID,
  id_usuario_modificacion UUID,
  
  -- CONFIGURACIÓN DE CLIENTE RECURRENTE
  es_recurrente BOOLEAN DEFAULT false,
  tipo_recurrente TEXT CHECK (tipo_recurrente IN ('automatico', 'manual')),
  frecuencia_compra_dias INTEGER,
  frecuencia_compra_compras INTEGER,
  frecuencia_compra_monto NUMERIC,
  ventana_dias_alerta INTEGER DEFAULT 7,
  
  -- LÍMITES Y CRÉDITOS
  cupo_credito NUMERIC DEFAULT 0,
  saldo_pendiente NUMERIC DEFAULT 0,
  limite_credito_negro NUMERIC DEFAULT 0,
  saldo_credito_negro NUMERIC DEFAULT 0,
  
  -- ESTADÍSTICAS AUTO-CALCULADAS
  total_compras NUMERIC DEFAULT 0,
  cantidad_compras INTEGER DEFAULT 0,
  ultima_compra TIMESTAMP,
  primera_compra TIMESTAMP,
  ticket_promedio NUMERIC DEFAULT 0,
  dias_desde_ultima_compra INTEGER,
  
  -- PUNTOS Y FIDELIDAD
  puntos_acumulados INTEGER DEFAULT 0,
  puntos_disponibles INTEGER DEFAULT 0,
  puntos_vencidos INTEGER DEFAULT 0,
  
  -- CLASIFICACIÓN
  categoria_cliente TEXT CHECK (categoria_cliente IN ('A', 'B', 'C', 'D', 'E')),
  etiqueta_personalizada TEXT,
  
  -- NOTIFICACIONES
  acepta_email BOOLEAN DEFAULT true,
  acepta_sms BOOLEAN DEFAULT false,
  acepta_whatsapp BOOLEAN DEFAULT true,
  acepta_promociones BOOLEAN DEFAULT true,
  acepta_cumpleanos BOOLEAN DEFAULT true,
  
  -- BLOQUEOS Y ALERTAS
  bloqueado BOOLEAN DEFAULT false,
  motivo_bloqueo TEXT,
  en_lista_negra_set BOOLEAN DEFAULT false,
  observaciones TEXT,
  
  CONSTRAINT chk_configuracion_recurrente CHECK (
    (tipo_recurrente IS NULL AND NOT es_recurrente) OR
    (tipo_recurrente IS NOT NULL AND es_recurrente)
  )
);

-- =============================================
-- 3. CONFIGURACIÓN DE REGLAS DE RECURRENCIA
-- =============================================
CREATE TABLE configuracion_recurrente (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  
  -- TIPO DE ACTIVACIÓN
  tipo_activacion TEXT NOT NULL CHECK (tipo_activacion IN (
    'cantidad_compras',
    'monto_acumulado',
    'frecuencia_dias',
    'combinado'
  )),
  
  -- PARÁMETROS DE CANTIDAD DE COMPRAS
  cantidad_compras_min INTEGER,
  cantidad_compras_max INTEGER,
  
  -- PARÁMETROS DE MONTO
  monto_acumulado_min NUMERIC,
  monto_acumulado_max NUMERIC,
  periodo_dias_monto INTEGER,
  
  -- PARÁMETROS DE FRECUENCIA
  frecuencia_dias_min INTEGER,
  frecuencia_dias_max INTEGER,
  compras_en_frecuencia INTEGER,
  
  -- BENEFICIOS AUTOMÁTICOS
  descuento_automatico NUMERIC DEFAULT 0,
  porcentaje_descuento NUMERIC DEFAULT 0,
  monto_fijo_descuento NUMERIC DEFAULT 0,
  
  -- PRODUCTOS SUGERIDOS
  usar_sugerencias BOOLEAN DEFAULT true,
  productos_sugeridos UUID[],
  categorias_sugeridas UUID[],
  
  -- MENSAJES PERSONALIZADOS
  mensaje_bienvenida TEXT,
  mensaje_oferta TEXT,
  mensaje_descuento TEXT,
  mensaje_personalizado TEXT,
  
  -- NOTIFICACIONES
  notificar_vendedor BOOLEAN DEFAULT true,
  notificar_cliente BOOLEAN DEFAULT false,
  notificar_email BOOLEAN DEFAULT true,
  notificar_whatsapp BOOLEAN DEFAULT false,
  
  -- VIGENCIA
  fecha_desde DATE,
  fecha_hasta DATE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 4. HISTORIAL DE COMPRAS PARA CÁLCULO DE RECURRENCIA
-- =============================================
CREATE TABLE historial_compras_cliente (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_cliente UUID REFERENCES clientes(id),
  id_venta UUID,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total NUMERIC NOT NULL,
  descuento_aplicado NUMERIC DEFAULT 0,
  forma_pago TEXT,
  estado TEXT DEFAULT 'completada',
  
  -- CÁLCULOS PARA RECURRENCIA
  dias_desde_anterior INTEGER,
  es_compra_recurrente BOOLEAN DEFAULT false,
  regla_aplicada UUID,
  
  -- SUGERENCIAS GENERADAS
  sugerencia_generada BOOLEAN DEFAULT false,
  sugerencia_texto TEXT,
  descuento_sugerido NUMERIC,
  
  -- SEGUIMIENTO
  vista_por_vendedor BOOLEAN DEFAULT false,
  accion_tomada TEXT,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 5. SUGERENCIAS Y ALERTAS DE VENTA
-- =============================================
CREATE TABLE sugerencias_venta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_cliente UUID REFERENCES clientes(id),
  id_vendedor UUID,
  tipo_sugerencia TEXT NOT NULL CHECK (tipo_sugerencia IN (
    'cliente_recurrente',
    'cumpleanos',
    'baja_compra',
    'alto_valor',
    'producto_recurrente',
    'vencimiento_credito',
    'campaña_personalizada'
  )),
  prioridad TEXT CHECK (prioridad IN ('baja', 'media', 'alta', 'urgente')),
  estado TEXT CHECK (estado IN ('pendiente', 'vista', 'aplicada', 'descartada')),
  
  -- DATOS DE LA SUGERENCIA
  titulo TEXT NOT NULL,
  mensaje TEXT,
  datos_adicionales JSONB,
  
  -- ACCIÓN SUGERIDA
  accion_sugerida TEXT,
  descuento_sugerido NUMERIC,
  productos_sugeridos UUID[],
  
  -- SEGUIMIENTO
  fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_vista TIMESTAMP,
  fecha_aplicacion TIMESTAMP,
  id_venta_aplicada UUID,
  observaciones TEXT,
  
  -- MÉTRICAS
  conversion BOOLEAN DEFAULT false,
  monto_venta NUMERIC
);

-- =============================================
-- 6. PROVEEDORES
-- =============================================
CREATE TABLE proveedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razon_social TEXT NOT NULL,
  nombre_fantasia TEXT,
  cuit TEXT UNIQUE,
  condicion_iva TEXT,
  email TEXT,
  telefono TEXT,
  celular_contacto TEXT,
  direccion TEXT,
  localidad TEXT,
  provincia TEXT,
  codigo_postal TEXT,
  contacto TEXT,
  email_contacto TEXT,
  activo BOOLEAN DEFAULT true,
  fecha_alta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  dias_plazo_default INTEGER DEFAULT 30,
  cupo_credito NUMERIC DEFAULT 0,
  saldo_pendiente NUMERIC DEFAULT 0,
  calificacion INTEGER CHECK (calificacion BETWEEN 1 AND 5),
  observaciones TEXT
);

-- =============================================
-- 7. USUARIOS Y PERMISOS
-- =============================================
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  rol TEXT CHECK (rol IN ('admin', 'vendedor', 'encargado', 'tecnico', 'consultor')),
  nombre_completo TEXT,
  activo BOOLEAN DEFAULT true,
  fecha_alta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_ultimo_acceso TIMESTAMP,
  ip_ultimo_acceso TEXT,
  intentos_fallidos INTEGER DEFAULT 0,
  bloqueado BOOLEAN DEFAULT false,
  fecha_bloqueo TIMESTAMP,
  cambia_clave_al_salir BOOLEAN DEFAULT false,
  
  -- PERMISOS ESPECÍFICOS
  permiso_ventas BOOLEAN DEFAULT true,
  permiso_compras BOOLEAN DEFAULT false,
  permiso_inventario BOOLEAN DEFAULT false,
  permiso_reportes BOOLEAN DEFAULT false,
  permiso_configuracion BOOLEAN DEFAULT false,
  permiso_caja BOOLEAN DEFAULT false,
  permiso_anular BOOLEAN DEFAULT false,
  permiso_credito BOOLEAN DEFAULT false,
  limite_descuento NUMERIC DEFAULT 10,
  limite_credito NUMERIC DEFAULT 0,
  puede_ver_precios_costo BOOLEAN DEFAULT false,
  puede_modificar_precios BOOLEAN DEFAULT false,
  puede_ver_ganancias BOOLEAN DEFAULT false,
  puede_acceder_menu_online BOOLEAN DEFAULT true,
  
  -- SUCURSAL/DEPOSITO ASIGNADO
  id_sucursal UUID,
  id_deposito UUID,
  
  -- COMISIONES
  porcentaje_comision NUMERIC DEFAULT 0,
  comision_sobre TEXT CHECK (comision_sobre IN ('venta_neta', 'ganancia', 'fijo')),
  monto_comision_fijo NUMERIC DEFAULT 0
);

-- =============================================
-- 8. CATEGORÍAS
-- =============================================
CREATE TABLE categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  id_categoria_padre UUID REFERENCES categorias(id),
  orden INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  imagen_url TEXT,
  es_destacada BOOLEAN DEFAULT false,
  es_publicable_web BOOLEAN DEFAULT true
);

-- =============================================
-- 9. UNIDADES
-- =============================================
CREATE TABLE unidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  simbolo TEXT,
  decimales INTEGER DEFAULT 2,
  factor_conversion NUMERIC DEFAULT 1.0,
  unidad_base UUID,
  activo BOOLEAN DEFAULT true
);

-- =============================================
-- 10. MARCAS
-- =============================================
CREATE TABLE marcas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  logo_url TEXT,
  activo BOOLEAN DEFAULT true,
  es_destacada BOOLEAN DEFAULT false,
  orden INTEGER DEFAULT 0
);

-- =============================================
-- 11. PRODUCTOS
-- =============================================
CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT UNIQUE,
  codigo_barra TEXT,
  codigo_barra_secundario TEXT,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  descripcion_corta TEXT,
  id_categoria UUID REFERENCES categorias(id),
  id_marca UUID REFERENCES marcas(id),
  id_unidad UUID REFERENCES unidades(id),
  
  -- PRECIOS
  precio_costo NUMERIC DEFAULT 0,
  precio_costo_ultima NUMERIC DEFAULT 0,
  precio_venta NUMERIC DEFAULT 0,
  precio_mayorista NUMERIC DEFAULT 0,
  precio_promocion NUMERIC DEFAULT 0,
  precio_lista_2 NUMERIC,
  precio_lista_3 NUMERIC,
  precio_minimo_venta NUMERIC,
  iva_porcentaje NUMERIC DEFAULT 21,
  impuestos_internos NUMERIC DEFAULT 0,
  
  -- STOCK
  stock_actual NUMERIC DEFAULT 0,
  stock_minimo INTEGER DEFAULT 5,
  stock_maximo INTEGER,
  stock_comprometido NUMERIC DEFAULT 0,
  stock_en_pedido NUMERIC DEFAULT 0,
  punto_reposicion INTEGER,
  
  -- CARACTERÍSTICAS
  peso NUMERIC,
  volumen NUMERIC,
  largo NUMERIC,
  ancho NUMERIC,
  alto NUMERIC,
  
  -- ESTADO
  activo BOOLEAN DEFAULT true,
  es_insumo BOOLEAN DEFAULT false,
  es_servicio BOOLEAN DEFAULT false,
  es_interno BOOLEAN DEFAULT false,
  es_kit BOOLEAN DEFAULT false,
  es_compuesto BOOLEAN DEFAULT false,
  requiere_envase BOOLEAN DEFAULT false,
  controla_stock BOOLEAN DEFAULT true,
  
  -- ONLINE
  es_publicable_web BOOLEAN DEFAULT true,
  destacado_web BOOLEAN DEFAULT false,
  disponible_online BOOLEAN DEFAULT true,
  
  -- IMÁGENES Y ARCHIVOS
  imagen_url TEXT,
  imagen_secundaria TEXT[],
  ficha_tecnica_url TEXT,
  
  -- PROVEEDOR
  id_proveedor UUID REFERENCES proveedores(id),
  codigo_proveedor TEXT,
  tiempo_reposicion INTEGER DEFAULT 7,
  
  -- FECHAS
  fecha_alta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_ultima_compra TIMESTAMP,
  fecha_ultima_venta TIMESTAMP,
  
  -- ESTADÍSTICAS
  ventas_total INTEGER DEFAULT 0,
  compras_total INTEGER DEFAULT 0,
  ganancia_promedio NUMERIC DEFAULT 0,
  
  -- OBSERVACIONES
  observaciones TEXT,
  ubicacion_deposito TEXT
);

-- =============================================
-- 12. MOVIMIENTOS DE STOCK
-- =============================================
CREATE TYPE tipo_movimiento_stock AS ENUM (
  'ingreso_compra',
  'egreso_venta',
  'devolucion_cliente',
  'devolucion_proveedor',
  'ajuste_ingreso',
  'ajuste_egreso',
  'merma',
  'robo',
  'traslado',
  'produccion',
  'desarme',
  'pedido_online',
  'servicio_tecnico'
);

CREATE TABLE movimientos_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_producto UUID REFERENCES productos(id),
  tipo_movimiento tipo_movimiento_stock NOT NULL,
  cantidad NUMERIC NOT NULL,
  costo_unitario NUMERIC,
  costo_total NUMERIC,
  id_usuario UUID REFERENCES usuarios(id),
  id_documento UUID,
  documento_tipo TEXT,
  documento_numero TEXT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  observaciones TEXT,
  id_sucursal_origen UUID,
  id_sucursal_destino UUID,
  id_deposito_origen UUID,
  id_deposito_destino UUID,
  saldo_anterior NUMERIC,
  saldo_actual NUMERIC,
  id_movimiento_relacion UUID
);

-- =============================================
-- 13. PRESUPUESTOS
-- =============================================
CREATE TABLE presupuestos (
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
  costo_total NUMERIC DEFAULT 0,
  descuento NUMERIC DEFAULT 0,
  recargo NUMERIC DEFAULT 0,
  subtotal NUMERIC DEFAULT 0,
  neto_gravado NUMERIC DEFAULT 0,
  iva NUMERIC DEFAULT 0,
  observaciones TEXT,
  observaciones_internas TEXT,
  id_presupuesto_origen UUID,
  id_venta UUID,
  forma_pago TEXT,
  condicion_venta TEXT,
  tiempo_entrega INTEGER,
  id_lista_precios INTEGER,
  tipo_cambio NUMERIC DEFAULT 1,
  moneda TEXT DEFAULT 'ARS',
  comision_vendedor NUMERIC DEFAULT 0,
  id_sucursal UUID,
  id_deposito UUID,
  ip_registro TEXT,
  id_usuario_modificacion UUID,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  impreso_count INTEGER DEFAULT 0,
  enviado_por_email BOOLEAN DEFAULT false,
  fecha_envio_email TIMESTAMP,
  aceptado_por_cliente BOOLEAN DEFAULT false,
  fecha_aceptacion TIMESTAMP,
  rechazo_motivo TEXT,
  
  UNIQUE (tipo_comprobante, punto_venta, numero)
);

-- =============================================
-- 14. PEDIDOS
-- =============================================
CREATE TABLE pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_comprobante TEXT DEFAULT 'pedido',
  punto_venta INTEGER DEFAULT 1,
  numero INTEGER NOT NULL,
  id_cliente UUID REFERENCES clientes(id),
  id_vendedor UUID REFERENCES usuarios(id),
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_entrega TIMESTAMP,
  fecha_entrega_real TIMESTAMP,
  estado TEXT CHECK (estado IN (
    'pendiente', 
    'aprobado', 
    'en_preparacion', 
    'listo', 
    'entregado_parcial', 
    'entregado', 
    'anulado',
    'cancelado'
  )),
  total NUMERIC DEFAULT 0,
  costo_total NUMERIC DEFAULT 0,
  descuento NUMERIC DEFAULT 0,
  recargo NUMERIC DEFAULT 0,
  subtotal NUMERIC DEFAULT 0,
  neto_gravado NUMERIC DEFAULT 0,
  iva NUMERIC DEFAULT 0,
  observaciones TEXT,
  observaciones_internas TEXT,
  senia NUMERIC DEFAULT 0,
  saldo_pendiente NUMERIC DEFAULT 0,
  es_credito BOOLEAN DEFAULT false,
  forma_pago TEXT,
  condicion_venta TEXT,
  id_presupuesto UUID REFERENCES presupuestos(id),
  id_venta UUID,
  id_lista_precios INTEGER,
  tipo_cambio NUMERIC DEFAULT 1,
  moneda TEXT DEFAULT 'ARS',
  comision_vendedor NUMERIC DEFAULT 0,
  id_sucursal UUID,
  id_deposito UUID,
  direccion_entrega TEXT,
  localidad_entrega TEXT,
  provincia_entrega TEXT,
  telefono_entrega TEXT,
  referencia_entrega TEXT,
  requiere_envio BOOLEAN DEFAULT false,
  costo_envio NUMERIC DEFAULT 0,
  tipo_envio TEXT,
  id_reparto UUID,
  fecha_cotizacion TIMESTAMP,
  validez_cotizacion INTEGER DEFAULT 7,
  ip_registro TEXT,
  id_usuario_modificacion UUID,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  impreso_count INTEGER DEFAULT 0,
  enviado_por_email BOOLEAN DEFAULT false,
  fecha_envio_email TIMESTAMP,
  recordatorio_enviado BOOLEAN DEFAULT false,
  fecha_recordatorio TIMESTAMP,
  codigo_seguimiento TEXT,
  url_seguimiento TEXT,
  
  UNIQUE (tipo_comprobante, punto_venta, numero)
);

-- =============================================
-- 15. VENTAS
-- =============================================
CREATE TABLE ventas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_comprobante TEXT NOT NULL,
  punto_venta INTEGER DEFAULT 1,
  numero INTEGER NOT NULL,
  id_cliente UUID REFERENCES clientes(id),
  id_vendedor UUID REFERENCES usuarios(id),
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_vencimiento TIMESTAMP,
  estado TEXT CHECK (estado IN (
    'pendiente', 
    'finalizada', 
    'anulada', 
    'cancelada',
    'en_proceso'
  )),
  
  -- TOTALES
  total NUMERIC DEFAULT 0,
  costo_total NUMERIC DEFAULT 0,
  ganancia NUMERIC DEFAULT 0,
  descuento NUMERIC DEFAULT 0,
  recargo NUMERIC DEFAULT 0,
  subtotal NUMERIC DEFAULT 0,
  neto_gravado NUMERIC DEFAULT 0,
  iva NUMERIC DEFAULT 0,
  percepcion_iibb NUMERIC DEFAULT 0,
  percepcion_ganancias NUMERIC DEFAULT 0,
  impuestos_internos NUMERIC DEFAULT 0,
  
  -- CONDICIONES DE PAGO
  forma_pago TEXT,
  condicion_venta TEXT CHECK (condicion_venta IN ('contado', 'credito', 'mixto')),
  es_credito BOOLEAN DEFAULT false,
  es_credito_negro BOOLEAN DEFAULT false,
  tipo_credito_negro TEXT,
  id_plan_credito UUID,
  cantidad_cuotas INTEGER DEFAULT 1,
  
  -- SALDOS
  importe_percibido NUMERIC DEFAULT 0,
  saldo_pendiente NUMERIC DEFAULT 0,
  saldo_en_cuotas NUMERIC DEFAULT 0,
  
  -- DOCUMENTOS RELACIONADOS
  id_presupuesto UUID REFERENCES presupuestos(id),
  id_pedido UUID REFERENCES pedidos(id),
  id_orden_servicio UUID,
  
  -- LISTA DE PRECIOS Y CAMBIO
  id_lista_precios INTEGER,
  tipo_cambio NUMERIC DEFAULT 1,
  moneda TEXT DEFAULT 'ARS',
  
  -- COMISIONES
  comision_vendedor NUMERIC DEFAULT 0,
  porcentaje_comision NUMERIC DEFAULT 0,
  
  -- SUCURSAL
  id_sucursal UUID,
  id_deposito UUID,
  
  -- CAJA
  id_caja UUID,
  id_arqueo UUID,
  
  -- AFIP / FACTURACIÓN
  cae TEXT,
  cae_vencimiento TIMESTAMP,
  codigo_afip TEXT,
  numero_control TEXT,
  resultado_afip TEXT,
  motivo_error_afip TEXT,
  procesado_afip BOOLEAN DEFAULT false,
  fecha_proceso_afip TIMESTAMP,
  
  -- AUDITORÍA
  ip_registro TEXT,
  id_usuario_modificacion UUID,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  anulada_por UUID,
  fecha_anulacion TIMESTAMP,
  motivo_anulacion TEXT,
  permite_anulacion BOOLEAN DEFAULT true,
  impreso_count INTEGER DEFAULT 0,
  ultima_impresion TIMESTAMP,
  enviado_por_email BOOLEAN DEFAULT false,
  fecha_envio_email TIMESTAMP,
  email_enviado_a TEXT,
  ticket_fiscal_numero TEXT,
  hash_comprobante TEXT,
  qr_factura TEXT,
  
  UNIQUE (tipo_comprobante, punto_venta, numero)
);

-- =============================================
-- 16. DETALLE DE VENTAS / PRESUPUESTOS / PEDIDOS
-- =============================================
CREATE TABLE detalle_ventas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_venta UUID REFERENCES ventas(id),
  id_presupuesto UUID REFERENCES presupuestos(id),
  id_pedido UUID REFERENCES pedidos(id),
  id_producto UUID REFERENCES productos(id),
  numero_item INTEGER NOT NULL,
  cantidad NUMERIC NOT NULL,
  cantidad_despachada NUMERIC,
  precio NUMERIC NOT NULL,
  precio_lista NUMERIC,
  descuento NUMERIC DEFAULT 0,
  recargo NUMERIC DEFAULT 0,
  porcentaje_descuento NUMERIC DEFAULT 0,
  porcentaje_recargo NUMERIC DEFAULT 0,
  neto NUMERIC DEFAULT 0,
  iva NUMERIC DEFAULT 0,
  iva_porcentaje NUMERIC DEFAULT 21,
  impuestos_internos NUMERIC DEFAULT 0,
  percepciones NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  costo_unitario NUMERIC,
  costo_total NUMERIC,
  ganancia NUMERIC,
  observaciones TEXT,
  codigo_producto TEXT,
  nombre_producto TEXT,
  unidad_medida TEXT,
  bonificacion NUMERIC DEFAULT 0,
  es_bonificacion BOOLEAN DEFAULT false,
  id_producto_oferta UUID,
  id_lote UUID,
  fecha_vencimiento DATE,
  numero_serie TEXT,
  id_centro_costo UUID,
  imputacion_impositiva TEXT,
  pedido_entrega TEXT,
  estado TEXT DEFAULT 'pendiente',
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 17. SERVICIOS Y SUBSERVICIOS
-- =============================================
CREATE TABLE servicios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio_base NUMERIC DEFAULT 0,
  duracion_estimada INTEGER,
  unidad_duracion TEXT CHECK (unidad_duracion IN ('minutos', 'horas', 'dias')),
  activo BOOLEAN DEFAULT true,
  id_categoria UUID,
  imagen_url TEXT,
  es_destacado BOOLEAN DEFAULT false,
  orden INTEGER DEFAULT 0,
  codigo TEXT UNIQUE,
  requiere_orden BOOLEAN DEFAULT true,
  permite_presupuesto BOOLEAN DEFAULT true,
  garantia_dias INTEGER DEFAULT 30,
  observaciones TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subservicios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_servicio_padre UUID REFERENCES servicios(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio NUMERIC DEFAULT 0,
  duracion INTEGER,
  unidad_duracion TEXT CHECK (unidad_duracion IN ('minutos', 'horas', 'dias')),
  activo BOOLEAN DEFAULT true,
  orden INTEGER DEFAULT 0,
  codigo TEXT,
  requiere_repuesto BOOLEAN DEFAULT false,
  id_producto_relacionado UUID REFERENCES productos(id),
  cantidad_por_defecto NUMERIC DEFAULT 1,
  es_opcional BOOLEAN DEFAULT true,
  es_recomendado BOOLEAN DEFAULT false,
  mano_obra_porcentaje NUMERIC DEFAULT 0,
  observaciones TEXT
);

-- =============================================
-- 18. ÓRDENES DE SERVICIO
-- =============================================
CREATE TABLE ordenes_servicio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero INTEGER NOT NULL UNIQUE,
  id_cliente UUID REFERENCES clientes(id),
  id_producto UUID REFERENCES productos(id),
  id_servicio UUID REFERENCES servicios(id),
  id_usuario UUID REFERENCES usuarios(id),
  id_vendedor UUID REFERENCES usuarios(id),
  id_tecnico UUID REFERENCES usuarios(id),
  
  -- ESTADO Y FECHAS
  estado TEXT CHECK (estado IN (
    'ingresado',
    'en_revision',
    'presupuestado',
    'aprobado',
    'en_reparacion',
    'esperando_repuesto',
    'esperando_aprobacion',
    'listo',
    'entregado',
    'garantia',
    'cancelado'
  )),
  fecha_ingreso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_egreso TIMESTAMP,
  fecha_entrega_estimada TIMESTAMP,
  fecha_promesa TIMESTAMP,
  
  -- PRODUCTO
  producto_marca TEXT,
  producto_modelo TEXT,
  producto_numero_serie TEXT,
  producto_color TEXT,
  producto_accesorios TEXT,
  producto_falla TEXT,
  producto_observaciones TEXT,
  
  -- DIAGNÓSTICO Y TRABAJO
  diagnostico TEXT,
  trabajo_realizado TEXT,
  repuestos_utilizados JSONB,
  horas_trabajo NUMERIC,
  costo_mano_obra NUMERIC DEFAULT 0,
  
  -- TOTALES
  total NUMERIC DEFAULT 0,
  costo_total NUMERIC DEFAULT 0,
  saldo_pendiente NUMERIC DEFAULT 0,
  
  -- PRESUPUESTO
  presupuesto_numero TEXT,
  presupuesto_aprobado BOOLEAN DEFAULT false,
  fecha_aprobacion TIMESTAMP,
  forma_aprobacion TEXT,
  
  -- GARANTÍA
  tiene_garantia BOOLEAN DEFAULT false,
  dias_garantia INTEGER DEFAULT 30,
  fin_garantia TIMESTAMP,
  motivo_garantia TEXT,
  
  -- CLIENTE
  contacto_cliente TEXT,
  telefono_contacto TEXT,
  email_contacto TEXT,
  preferencia_contacto TEXT,
  
  -- OBSERVACIONES
  observaciones TEXT,
  observaciones_internas TEXT,
  
  -- IMPRESIÓN
  impreso_count INTEGER DEFAULT 0,
  ultima_impresion TIMESTAMP,
  enviado_por_email BOOLEAN DEFAULT false,
  
  -- ENCUESTA
  encuesta_enviada BOOLEAN DEFAULT false,
  encuesta_calificacion INTEGER,
  encuesta_comentarios TEXT,
  
  id_sucursal UUID,
  id_deposito UUID,
  ip_registro TEXT,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 19. TAREAS DE SERVICIO
-- =============================================
CREATE TABLE tareas_servicio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_orden UUID REFERENCES ordenes_servicio(id) ON DELETE CASCADE,
  id_subservicio UUID REFERENCES subservicios(id),
  id_producto UUID REFERENCES productos(id),
  descripcion TEXT NOT NULL,
  cantidad NUMERIC DEFAULT 1,
  precio_unitario NUMERIC DEFAULT 0,
  costo_unitario NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  tipo_tarea TEXT CHECK (tipo_tarea IN ('mano_obra', 'repuesto', 'adicional')),
  id_tecnico UUID REFERENCES usuarios(id),
  tiempo_dedicado INTEGER,
  unidad_tiempo TEXT CHECK (unidad_tiempo IN ('minutos', 'horas')),
  observaciones TEXT,
  fecha_ejecucion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 20. FORMAS DE PAGO
-- =============================================
CREATE TABLE formas_pago (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  tipo TEXT CHECK (tipo IN (
    'efectivo',
    'tarjeta_debito',
    'tarjeta_credito',
    'transferencia',
    'cheque',
    'credito_sucursal',
    'otro'
  )),
  activo BOOLEAN DEFAULT true,
  requiere_aprobacion BOOLEAN DEFAULT false,
  id_cuenta_contable UUID,
  comision_porcentaje NUMERIC DEFAULT 0,
  comision_monto_fijo NUMERIC DEFAULT 0,
  requiere_monto_minimo BOOLEAN DEFAULT false,
  monto_minimo NUMERIC DEFAULT 0,
  requiere_monto_maximo BOOLEAN DEFAULT false,
  monto_maximo NUMERIC DEFAULT 0,
  dias_credito INTEGER DEFAULT 0,
  cantidad_cuotas_max INTEGER DEFAULT 1,
  recargo_porcentaje NUMERIC DEFAULT 0,
  sin_interes_hasta NUMERIC DEFAULT 0,
  observaciones TEXT
);

-- =============================================
-- 21. PLANES DE CRÉDITO Y CUOTAS
-- =============================================
CREATE TABLE planes_credito (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  cantidad_cuotas INTEGER NOT NULL,
  interes_porcentual NUMERIC DEFAULT 0,
  cargo_fijo NUMERIC DEFAULT 0,
  interes_mora NUMERIC DEFAULT 0,
  monto_minimo NUMERIC DEFAULT 0,
  monto_maximo NUMERIC DEFAULT 0,
  dias_mora INTEGER DEFAULT 1,
  requiere_aprobacion BOOLEAN DEFAULT true,
  activo BOOLEAN DEFAULT true,
  fecha_desde DATE,
  fecha_hasta DATE,
  dias_desde_compra INTEGER DEFAULT 30,
  frecuencia_cuotas TEXT CHECK (frecuencia_cuotas IN ('diaria', 'semanal', 'quincenal', 'mensual', 'bimestral', 'trimestral')),
  dia_corte INTEGER DEFAULT 1,
  observaciones TEXT
);

CREATE TABLE cuotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_comprobante UUID NOT NULL,
  tipo_comprobante TEXT NOT NULL,
  id_cliente UUID REFERENCES clientes(id),
  id_plan UUID REFERENCES planes_credito(id),
  numero_cuota INTEGER NOT NULL,
  cantidad_cuotas INTEGER NOT NULL,
  fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_vencimiento TIMESTAMP NOT NULL,
  fecha_pago TIMESTAMP,
  importe NUMERIC NOT NULL,
  importe_original NUMERIC NOT NULL,
  importe_pagado NUMERIC DEFAULT 0,
  interes NUMERIC DEFAULT 0,
  recargo NUMERIC DEFAULT 0,
  saldo NUMERIC DEFAULT 0,
  estado TEXT CHECK (estado IN (
    'pendiente',
    'parcial',
    'pagado',
    'vencido',
    'anulado',
    'castigado'
  )),
  forma_pago TEXT,
  id_cobro UUID,
  observaciones TEXT,
  recordatorio_enviado BOOLEAN DEFAULT false,
  fecha_recordatorio TIMESTAMP,
  gestion_cobranza TEXT,
  fecha_gestion TIMESTAMP,
  id_usuario_gestion UUID,
  castigo_motivo TEXT,
  fecha_castigo TIMESTAMP,
  id_venta UUID,
  id_sucursal UUID
);

-- =============================================
-- 22. CAJAS Y MOVIMIENTOS
-- =============================================
CREATE TABLE cajas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  saldo_inicial NUMERIC DEFAULT 0,
  saldo_actual NUMERIC DEFAULT 0,
  id_usuario_responsable UUID REFERENCES usuarios(id),
  id_sucursal UUID,
  activa BOOLEAN DEFAULT true,
  fecha_apertura TIMESTAMP,
  fecha_cierre TIMESTAMP,
  observaciones TEXT
);

CREATE TYPE tipo_movimiento_caja AS ENUM (
  'ingreso_venta',
  'ingreso_cobro',
  'ingreso_otros',
  'egreso_gasto',
  'egreso_pago',
  'egreso_retiro',
  'egreso_sangrado',
  'transferencia_entrada',
  'transferencia_salida',
  'ajuste_ingreso',
  'ajuste_egreso'
);

CREATE TABLE movimientos_caja (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_caja UUID REFERENCES cajas(id),
  tipo_movimiento tipo_movimiento_caja NOT NULL,
  importe NUMERIC NOT NULL