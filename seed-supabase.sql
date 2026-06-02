-- =============================================
-- SEED DATA - TALLERES PRO
-- Ejecutar en SQL Editor de Supabase
-- =============================================

-- LIMPIAR DATOS EXISTENTES (opcional, descomentar si querés empezar de cero)
-- DELETE FROM tareas_servicio;
-- DELETE FROM ordenes_servicio;
-- DELETE FROM detalle_ventas;
-- DELETE FROM ventas;
-- DELETE FROM pedidos;
-- DELETE FROM presupuestos;
-- DELETE FROM movimientos_stock;
-- DELETE FROM productos;
-- DELETE FROM proveedores;
-- DELETE FROM clientes;
-- DELETE FROM usuarios;
-- DELETE FROM planes_credito;
-- DELETE FROM formas_pago;
-- DELETE FROM categorias;
-- DELETE FROM marcas;
-- DELETE FROM depositos;
-- DELETE FROM configuracion;

-- =============================================
-- 1. CONFIGURACIÓN
-- =============================================
INSERT INTO configuracion (razon_social, nombre_fantasia, cuit, domicilio, localidad, provincia, telefono, email, moneda, stock_minimo_default, margen_ganancia_default)
VALUES ('Talleres Pro S.A.', 'Talleres Pro', '30-71234567-8', 'Av. del Libertador 4567', 'CABA', 'Buenos Aires', '011-4321-5678', 'contacto@tallerespro.com', 'ARS', 5, 30)
ON CONFLICT DO NOTHING;

-- =============================================
-- 2. USUARIOS
-- =============================================
INSERT INTO usuarios (id, username, email, password_hash, rol, nombre_completo, activo, permiso_ventas, permiso_compras, permiso_inventario, permiso_reportes, permiso_configuracion, permiso_caja, permiso_anular, permiso_credito, limite_descuento)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin', 'admin@tallerespro.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin', 'Administrador General', true, true, true, true, true, true, true, true, true, 100),
  ('22222222-2222-2222-2222-222222222222', 'jlopez', 'jlopez@tallerespro.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'vendedor', 'Juan López', true, true, false, true, false, false, true, false, false, 15),
  ('33333333-3333-3333-3333-333333333333', 'mrodriguez', 'mrodriguez@tallerespro.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'encargado', 'María Rodríguez', true, true, true, true, true, false, true, true, true, 30),
  ('44444444-4444-4444-4444-444444444444', 'pgarcia', 'pgarcia@tallerespro.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'tecnico', 'Pablo García', true, false, false, true, false, false, false, false, false, 0)
ON CONFLICT (username) DO NOTHING;

-- =============================================
-- 3. CATEGORÍAS
-- =============================================
INSERT INTO categorias (id, nombre, descripcion, activo, es_publicable_web) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'Lubricantes', 'Aceites y lubricantes para motor', true, true),
  ('c2222222-2222-2222-2222-222222222222', 'Frenos', 'Pastillas, discos y líquido de frenos', true, true),
  ('c3333333-3333-3333-3333-333333333333', 'Filtros', 'Filtros de aire, aceite y combustible', true, true),
  ('c4444444-4444-4444-4444-444444444444', 'Baterías', 'Baterías para autos y motos', true, true),
  ('c5555555-5555-5555-5555-555555555555', 'Neumáticos', 'Cubiertas para todo tipo de vehículo', true, true),
  ('c6666666-6666-6666-6666-666666666666', 'Iluminación', 'Lámparas y faros', true, true),
  ('c7777777-7777-7777-7777-777777777777', 'Herramientas', 'Herramientas manuales y eléctricas', true, true),
  ('c8888888-8888-8888-8888-888888888888', 'Suspensión', 'Amortiguadores y repuestos de suspensión', true, true),
  ('c9999999-9999-9999-9999-999999999999', 'Transmisión', 'Correas, cadenas y embragues', true, true),
  ('c0000000-0000-0000-0000-000000000000', 'Eléctrica', 'Alternadores, arranques y cables', true, true)
ON CONFLICT DO NOTHING;

-- =============================================
-- 4. MARCAS
-- =============================================
INSERT INTO marcas (id, nombre, activo) VALUES
  ('m1111111-1111-1111-1111-111111111111', 'Bosch', true),
  ('m2222222-2222-2222-2222-222222222222', 'Castrol', true),
  ('m3333333-3333-3333-3333-333333333333', 'Michelin', true),
  ('m4444444-4444-4444-4444-444444444444', 'Valeo', true),
  ('m5555555-5555-5555-5555-555555555555', 'Mann-Filter', true),
  ('m6666666-6666-6666-6666-666666666666', 'Monroe', true),
  ('m7777777-7777-7777-7777-777777777777', 'SKF', true),
  ('m8888888-8888-8888-8888-888888888888', 'ACDelco', true),
  ('m9999999-9999-9999-9999-999999999999', 'Total', true),
  ('m0000000-0000-0000-0000-000000000000', 'Philips', true)
ON CONFLICT DO NOTHING;

-- =============================================
-- 5. DEPÓSITOS
-- =============================================
INSERT INTO depositos (id, nombre, direccion, localidad, telefono, encargado, es_principal, activo) VALUES
  ('d1111111-1111-1111-1111-111111111111', 'Depósito Central', 'Av. Rivadavia 1234', 'CABA', '011-4567-8900', 'Carlos Gómez', true, true),
  ('d2222222-2222-2222-2222-222222222222', 'Sucursal Norte', 'Panamericana Km 35', 'Tigre', '011-4567-8901', 'Laura Pérez', false, true),
  ('d3333333-3333-3333-3333-333333333333', 'Sucursal Oeste', 'Ruta 3 Km 25', 'Morón', '011-4567-8902', 'Martín Díaz', false, true)
ON CONFLICT DO NOTHING;

-- =============================================
-- 6. PROVEEDORES
-- =============================================
INSERT INTO proveedores (id, razon_social, cuit, email, telefono, direccion, localidad, activo, dias_plazo_default, saldo_pendiente, observaciones) VALUES
  ('p1111111-1111-1111-1111-111111111111', 'Distribuidora Bosch Argentina S.A.', '30-12345678-9', 'ventas@bosch-ar.com', '011-4000-1111', 'Av. Córdoba 5678', 'CABA', true, 30, 125000, 'Proveedor principal de herramientas'),
  ('p2222222-2222-2222-2222-222222222222', 'Lubricantes del Sur S.R.L.', '30-98765432-1', 'info@ldslub.com', '011-4000-2222', 'Ruta 205 Km 45', 'Cañuelas', true, 15, 45000, 'Buenos precios en aceites'),
  ('p3333333-3333-3333-3333-333333333333', 'Neumáticos Michelin Argentina', '30-55556666-7', 'pedidos@michelin-ar.com', '011-4000-3333', 'Av. General Paz 8900', 'Villa Lynch', true, 45, 200000, 'Distribuidor oficial'),
  ('p4444444-4444-4444-4444-444444444444', 'Filtros Mann S.A.', '30-44447777-8', 'ventas@mann-ar.com', '011-4000-4444', 'Av. Juan B. Justo 3456', 'CABA', true, 30, 30000, ''),
  ('p5555555-5555-5555-5555-555555555555', 'Repuestos Valeo Argentina', '30-33338888-9', 'contacto@valeo-ar.com', '011-4000-5555', 'Av. del Trabajo 1200', 'Villa Soldati', true, 30, 80000, '')
ON CONFLICT DO NOTHING;

-- =============================================
-- 7. CLIENTES
-- =============================================
INSERT INTO clientes (id, tipo_persona, nombre, apellido, razon_social, cuil_cuit, email, telefono, celular, direccion, localidad, provincia, activo, es_recurrente, tipo_recurrente, frecuencia_compra_dias, frecuencia_compra_compras, frecuencia_compra_monto, cupo_credito, saldo_pendiente, limite_credito_negro, saldo_credito_negro, categoria_cliente, acepta_email, acepta_whatsapp, acepta_promociones, bloqueado, observaciones, puntos_acumulados, puntos_disponibles) VALUES
  ('cl111111-1111-1111-1111-111111111111', 'fisica', 'Carlos', 'González', '', '20-30123456-7', 'cgonzalez@email.com', '011-4789-1234', '011-15-6789-1234', 'Av. Santa Fe 2345', 'CABA', 'Buenos Aires', true, true, 'automatico', 30, 8, 75000, 50000, 12500, 0, 0, 'A', true, true, true, false, 'Cliente habitual, paga puntual', 1250, 800),
  ('cl222222-2222-2222-2222-222222222222', 'fisica', 'María', 'Fernández', '', '27-38987654-3', 'mfernandez@email.com', '011-4789-5678', '011-15-6789-5678', 'Calle Juramento 1234', 'Belgrano', 'Buenos Aires', true, true, 'manual', 90, 3, 45000, 20000, 0, 0, 0, 'B', true, true, true, false, 'Prefiere contacto por WhatsApp', 450, 200),
  ('cl333333-3333-3333-3333-333333333333', 'juridica', '', '', 'Transportes Rápidos S.A.', '30-71234567-8', 'admin@transportesrapidossa.com', '011-4000-9999', '011-15-6789-9999', 'Av. del Libertador 8900', 'CABA', 'Buenos Aires', true, true, 'automatico', 7, 15, 250000, 300000, 75000, 50000, 12000, 'A', true, true, false, false, 'Flota de 25 camiones', 0, 0),
  ('cl444444-4444-4444-4444-444444444444', 'fisica', 'Roberto', 'Silva', '', '20-25111222-3', 'rsilva@email.com', '011-4789-3333', '011-15-6789-3333', 'Av. Cabildo 4567', 'Núñez', 'Buenos Aires', true, false, 'manual', 0, 0, 0, 0, 0, 0, 0, 'C', true, true, true, false, '', 80, 80),
  ('cl555555-5555-5555-5555-555555555555', 'fisica', 'Lucía', 'Martínez', '', '27-34111222-5', 'lmartinez@email.com', '011-4789-4444', '011-15-6789-4444', 'Thames 1234', 'Palermo', 'Buenos Aires', true, true, 'automatico', 30, 5, 60000, 30000, 15000, 0, 0, 'B', true, true, true, false, '', 600, 350),
  ('cl666666-6666-6666-6666-666666666666', 'juridica', '', '', 'Constructora del Sol S.A.', '30-66778899-0', 'compras@constructsol.com', '011-4000-7777', '011-15-6789-7777', 'Av. Lugones 3400', 'CABA', 'Buenos Aires', true, true, 'manual', 30, 6, 180000, 200000, 45000, 0, 0, 'A', true, false, false, false, 'Paga a 30 días', 0, 0)
ON CONFLICT (cuil_cuit) DO NOTHING;

-- =============================================
-- 8. PRODUCTOS
-- =============================================
INSERT INTO productos (id, codigo, nombre, descripcion, id_categoria, id_marca, precio_costo, precio_venta, precio_mayorista, iva_porcentaje, stock_actual, stock_minimo, activo, es_insumo, controla_stock, es_publicable_web, id_proveedor, observaciones) VALUES
  ('pr111111-1111-1111-1111-111111111111', 'ACE-001', 'Aceite de Motor 15W-40 Mineral 4L', 'Aceite mineral para motores nafteros y diésel', 'c2222222-2222-2222-2222-222222222222', 'm2222222-2222-2222-2222-222222222222', 28500, 42000, 38000, 21, 120, 20, true, true, true, true, 'p2222222-2222-2222-2222-222222222222', 'Producto estrella'),
  ('pr222222-2222-2222-2222-222222222222', 'FIL-001', 'Filtro de Aceite Mann W712/80', 'Filtro de aceite compatible con VW, Seat, Skoda', 'c3333333-3333-3333-3333-333333333333', 'm5555555-5555-5555-5555-555555555555', 4500, 8900, 7500, 21, 45, 10, true, true, true, true, 'p4444444-4444-4444-4444-444444444444', ''),
  ('pr333333-3333-3333-3333-333333333333', 'FRE-001', 'Pastillas de Freno Bosch BP978', 'Pastillas de freno delanteras para Ford Focus', 'c2222222-2222-2222-2222-222222222222', 'm1111111-1111-1111-1111-111111111111', 18000, 32000, 28000, 21, 30, 8, true, true, true, true, 'p1111111-1111-1111-1111-111111111111', ''),
  ('pr444444-4444-4444-4444-444444444444', 'BAT-001', 'Batería Bosch S4 12V 60Ah', 'Batería de auto 12V 60Ah libre mantenimiento', 'c4444444-4444-4444-4444-444444444444', 'm1111111-1111-1111-1111-111111111111', 65000, 105000, 95000, 21, 18, 5, true, true, true, true, 'p1111111-1111-1111-1111-111111111111', ''),
  ('pr555555-5555-5555-5555-555555555555', 'NEU-001', 'Neumático Michelin Primacy 4 205/55 R16', 'Neumático de turismo 205/55 R16 91V', 'c5555555-5555-5555-5555-555555555555', 'm3333333-3333-3333-3333-333333333333', 95000, 145000, 135000, 21, 24, 8, true, true, true, true, 'p3333333-3333-3333-3333-333333333333', ''),
  ('pr666666-6666-6666-6666-666666666666', 'ILU-001', 'Lámpara H7 Philips X-tremeVision', 'Lámpara halógena H7 12V 55W +130% de luz', 'c6666666-6666-6666-6666-666666666666', 'm0000000-0000-0000-0000-000000000000', 8500, 15500, 13500, 21, 60, 15, true, true, true, true, 'p1111111-1111-1111-1111-111111111111', ''),
  ('pr777777-7777-7777-7777-777777777777', 'HER-001', 'Juego de Llaves combinadas 12 piezas', 'Juego de llaves combinadas métricas 8-19mm', 'c7777777-7777-7777-7777-777777777777', 'm1111111-1111-1111-1111-111111111111', 22000, 38500, 34000, 21, 12, 5, true, true, true, true, 'p1111111-1111-1111-1111-111111111111', ''),
  ('pr888888-8888-8888-8888-888888888888', 'SUS-001', 'Amortiguador delantero Monroe OESpectrum', 'Amortiguador delantero para Chevrolet Corsa', 'c8888888-8888-8888-8888-888888888888', 'm6666666-6666-6666-6666-666666666666', 28000, 48000, 43000, 21, 16, 4, true, true, true, true, 'p1111111-1111-1111-1111-111111111111', ''),
  ('pr999999-9999-9999-9999-999999999999', 'TRA-001', 'Kit de Distribución SKF VKMA 01250', 'Kit de distribución con correa y tensores', 'c9999999-9999-9999-9999-999999999999', 'm7777777-7777-7777-7777-777777777777', 45000, 78000, 70000, 21, 8, 3, true, true, true, true, 'p5555555-5555-5555-5555-555555555555', ''),
  ('pr000000-0000-0000-0000-000000000000', 'ELE-001', 'Alternador Valeo 12V 90A', 'Alternador 12V 90A para Renault Clio/Mégane', 'c0000000-0000-0000-0000-000000000000', 'm4444444-4444-4444-4444-444444444444', 55000, 92000, 85000, 21, 6, 3, true, true, true, true, 'p5555555-5555-5555-5555-555555555555', '')
ON CONFLICT (codigo) DO NOTHING;

-- =============================================
-- 9. VENTAS (con detalle)
-- =============================================
INSERT INTO ventas (id, tipo_comprobante, punto_venta, numero, id_cliente, id_vendedor, fecha, estado, total, subtotal, descuento, condicion_venta, es_credito, saldo_pendiente) VALUES
  ('v1111111-1111-1111-1111-111111111111', 'FA', 1, 10001, 'cl111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '2 days', 'finalizada', 42000, 42000, 0, 'contado', false, 0),
  ('v2222222-2222-2222-2222-222222222222', 'FA', 1, 10002, 'cl222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '5 days', 'finalizada', 8900, 8900, 0, 'contado', false, 0),
  ('v3333333-3333-3333-3333-333333333333', 'FA', 1, 10003, 'cl333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '8 days', 'finalizada', 87000, 92000, 5000, 'credito', true, 87000),
  ('v4444444-4444-4444-4444-444444444444', 'FA', 1, 10004, 'cl111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '12 days', 'finalizada', 168000, 168000, 0, 'contado', false, 0),
  ('v5555555-5555-5555-5555-555555555555', 'FA', 1, 10005, 'cl555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '15 days', 'finalizada', 125500, 125500, 0, 'contado', false, 0),
  ('v6666666-6666-6666-6666-666666666666', 'FA', 1, 10006, 'cl444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '20 days', 'finalizada', 64000, 64000, 0, 'contado', false, 0),
  ('v7777777-7777-7777-7777-777777777777', 'FA', 1, 10007, 'cl666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '25 days', 'finalizada', 187000, 192000, 5000, 'credito', true, 187000),
  ('v8888888-8888-8888-8888-888888888888', 'FA', 1, 10008, 'cl111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '30 days', 'finalizada', 55000, 55000, 0, 'contado', false, 0),
  ('v9999999-9999-9999-9999-999999999999', 'FA', 1, 10009, 'cl333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '35 days', 'finalizada', 234000, 240000, 6000, 'credito', true, 234000),
  ('v0000000-0000-0000-0000-000000000000', 'FA', 1, 10010, 'cl555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '40 days', 'finalizada', 98000, 98000, 0, 'contado', false, 0)
ON CONFLICT (tipo_comprobante, punto_venta, numero) DO NOTHING;

INSERT INTO detalle_ventas (id_venta, id_producto, numero_item, cantidad, precio, descuento, total) VALUES
  ('v1111111-1111-1111-1111-111111111111', 'pr111111-1111-1111-1111-111111111111', 1, 1, 42000, 0, 42000),
  ('v2222222-2222-2222-2222-222222222222', 'pr222222-2222-2222-2222-222222222222', 1, 1, 8900, 0, 8900),
  ('v3333333-3333-3333-3333-333333333333', 'pr444444-4444-4444-4444-444444444444', 1, 1, 105000, 0, 105000),
  ('v3333333-3333-3333-3333-333333333333', 'pr666666-6666-6666-6666-666666666666', 2, 2, 15500, 0, 31000),
  ('v3333333-3333-3333-3333-333333333333', 'pr222222-2222-2222-2222-222222222222', 3, 1, 8900, 0, 8900),
  ('v4444444-4444-4444-4444-444444444444', 'pr555555-5555-5555-5555-555555555555', 1, 2, 145000, 0, 290000),
  ('v4444444-4444-4444-4444-444444444444', 'pr333333-3333-3333-3333-333333333333', 2, 1, 32000, 0, 32000),
  ('v5555555-5555-5555-5555-555555555555', 'pr777777-7777-7777-7777-777777777777', 1, 1, 38500, 0, 38500),
  ('v5555555-5555-5555-5555-555555555555', 'pr888888-8888-8888-8888-888888888888', 2, 2, 48000, 0, 96000),
  ('v6666666-6666-6666-6666-666666666666', 'pr333333-3333-3333-3333-333333333333', 1, 2, 32000, 0, 64000),
  ('v7777777-7777-7777-7777-777777777777', 'pr999999-9999-9999-9999-999999999999', 1, 1, 78000, 0, 78000),
  ('v7777777-7777-7777-7777-777777777777', 'pr555555-5555-5555-5555-555555555555', 2, 1, 145000, 0, 145000),
  ('v8888888-8888-8888-8888-888888888888', 'pr111111-1111-1111-1111-111111111111', 1, 1, 42000, 0, 42000),
  ('v8888888-8888-8888-8888-888888888888', 'pr222222-2222-2222-2222-222222222222', 2, 1, 8900, 0, 8900),
  ('v9999999-9999-9999-9999-999999999999', 'pr444444-4444-4444-4444-444444444444', 1, 2, 105000, 0, 210000),
  ('v9999999-9999-9999-9999-999999999999', 'pr666666-6666-6666-6666-666666666666', 2, 2, 15500, 0, 31000),
  ('v0000000-0000-0000-0000-000000000000', 'pr111111-1111-1111-1111-111111111111', 1, 2, 42000, 0, 84000),
  ('v0000000-0000-0000-0000-000000000000', 'pr333333-3333-3333-3333-333333333333', 2, 1, 32000, 0, 32000);

-- =============================================
-- 10. ÓRDENES DE SERVICIO
-- =============================================
INSERT INTO ordenes_servicio (id, numero, id_cliente, id_tecnico, estado, fecha_ingreso, diagnostico, trabajo_realizado, total, observaciones) VALUES
  ('o1111111-1111-1111-1111-111111111111', 1001, 'cl111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'ingresado', NOW() - INTERVAL '3 days', 'Batería descargada', '', 105000, 'Revisar alternador'),
  ('o2222222-2222-2222-2222-222222222222', 1002, 'cl222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'en_reparacion', NOW() - INTERVAL '8 days', 'Pastillas desgastadas', 'Reemplazo de pastillas y discos', 48000, 'Cliente urgente'),
  ('o3333333-3333-3333-3333-333333333333', 1003, 'cl333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'listo', NOW() - INTERVAL '12 days', 'Falla en distribución', 'Cambio de kit de distribución', 126000, 'Flota - prioridad alta'),
  ('o4444444-4444-4444-4444-444444444444', 1004, 'cl444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'entregado', NOW() - INTERVAL '20 days', 'Lámpara quemada', 'Reemplazo de lámparas H7', 31000, 'Entregado el cliente'),
  ('o5555555-5555-5555-5555-555555555555', 1005, 'cl555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', 'presupuestado', NOW() - INTERVAL '1 day', 'Suspensión delantera rota', '', 96000, 'Esperando aprobación'),
  ('o6666666-6666-6666-6666-666666666666', 1006, 'cl666666-6666-6666-6666-666666666666', '44444444-4444-4444-4444-444444444444', 'en_reparacion', NOW() - INTERVAL '5 days', 'Alternador fallando', 'Reemplazo de alternador', 92000, 'Pieza en camino'),
  ('o7777777-7777-7777-7777-777777777777', 1007, 'cl111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'cancelado', NOW() - INTERVAL '15 days', 'Motor no arranca', '', 0, 'Cliente desistió'),
  ('o8888888-8888-8888-8888-888888888888', 1008, 'cl333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'listo', NOW() - INTERVAL '10 days', 'Service general', 'Cambio de aceite, filtros y revisión', 58000, 'Listo para retirar')
ON CONFLICT (numero) DO NOTHING;

-- =============================================
-- 11. CAJAS
-- =============================================
INSERT INTO cajas (id, nombre, saldo_inicial, saldo_actual, id_usuario_responsable, activa, fecha_apertura, fecha_cierre) VALUES
  ('ca111111-1111-1111-1111-111111111111', 'Caja Principal', 100000, 112500, '22222222-2222-2222-2222-222222222222', false, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '10 hours'),
  ('ca222222-2222-2222-2222-222222222222', 'Caja Sucursal Norte', 75000, 72000, '22222222-2222-2222-2222-222222222222', false, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '9 hours'),
  ('ca333333-3333-3333-3333-333333333333', 'Caja Sucursal Oeste', 50000, 54000, '22222222-2222-2222-2222-222222222222', true, NOW() - INTERVAL '5 hours', NULL)
ON CONFLICT DO NOTHING;

-- =============================================
-- 12. PLANES DE CRÉDITO
-- =============================================
INSERT INTO planes_credito (id, nombre, cantidad_cuotas, interes_porcentual, monto_minimo, monto_maximo, activo) VALUES
  ('pl111111-1111-1111-1111-111111111111', '3 Cuotas sin interés', 3, 0, 0, 100000, true),
  ('pl222222-2222-2222-2222-222222222222', '6 Cuotas 15%', 6, 15, 50000, 300000, true),
  ('pl333333-3333-3333-3333-333333333333', '12 Cuotas 25%', 12, 25, 100000, 600000, true),
  ('pl444444-4444-4444-4444-444444444444', '18 Cuotas 35%', 18, 35, 200000, 1000000, true)
ON CONFLICT DO NOTHING;

-- =============================================
-- 13. PRESUPUESTOS
-- =============================================
INSERT INTO presupuestos (id, numero, id_cliente, id_vendedor, fecha, fecha_vencimiento, estado, total, descuento, observaciones) VALUES
  ('pre11111-1111-1111-1111-111111111111', 3001, 'cl111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '5 days', NOW() + INTERVAL '10 days', 'pendiente', 42000, 0, ''),
  ('pre22222-2222-2222-2222-222222222222', 3002, 'cl333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '10 days', NOW() + INTERVAL '5 days', 'aprobado', 187000, 5000, 'Aprobado por telefono'),
  ('pre33333-3333-3333-3333-333333333333', 3003, 'cl555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '15 days', NOW() - INTERVAL '5 days', 'vencido', 64000, 0, ''),
  ('pre44444-4444-4444-4444-444444444444', 3004, 'cl222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '2 days', NOW() + INTERVAL '15 days', 'pendiente', 15500, 0, ''),
  ('pre55555-5555-5555-5555-555555555555', 3005, 'cl666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '8 days', NOW() + INTERVAL '7 days', 'pendiente', 126000, 0, '')
ON CONFLICT (tipo_comprobante, punto_venta, numero) DO NOTHING;

-- =============================================
-- 14. PEDIDOS
-- =============================================
INSERT INTO pedidos (id, numero, id_cliente, id_vendedor, fecha, fecha_entrega, estado, total, observaciones) VALUES
  ('pe111111-1111-1111-1111-111111111111', 4001, 'cl111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '3 days', NOW() + INTERVAL '2 days', 'en_preparacion', 42000, ''),
  ('pe222222-2222-2222-2222-222222222222', 4002, 'cl333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '7 days', NOW() - INTERVAL '1 day', 'entregado', 145000, ''),
  ('pe333333-3333-3333-3333-333333333333', 4003, 'cl555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '1 day', NOW() + INTERVAL '5 days', 'pendiente', 78000, ''),
  ('pe444444-4444-4444-4444-444444444444', 4004, 'cl444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '12 days', NOW() - INTERVAL '5 days', 'entregado', 32000, ''),
  ('pe555555-5555-5555-5555-555555555555', 4005, 'cl666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '5 days', NOW() + INTERVAL '3 days', 'listo', 105000, '')
ON CONFLICT (tipo_comprobante, punto_venta, numero) DO NOTHING;

-- =============================================
-- 15. MOVIMIENTOS DE STOCK
-- =============================================
INSERT INTO movimientos_stock (id_producto, tipo_movimiento, cantidad, costo_unitario, id_usuario, fecha, observaciones, saldo_anterior, saldo_actual) VALUES
  ('pr111111-1111-1111-1111-111111111111', 'ingreso_compra', 50, 28500, '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '30 days', 'Compra a Castrol', 70, 120),
  ('pr222222-2222-2222-2222-222222222222', 'ingreso_compra', 20, 4500, '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '25 days', 'Compra a Mann', 25, 45),
  ('pr333333-3333-3333-3333-333333333333', 'egreso_venta', 5, 18000, '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '20 days', 'Venta diaria', 35, 30),
  ('pr444444-4444-4444-4444-444444444444', 'ingreso_compra', 10, 65000, '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '15 days', 'Compra a Bosch', 8, 18),
  ('pr555555-5555-5555-5555-555555555555', 'egreso_venta', 6, 95000, '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '10 days', 'Venta flota', 30, 24),
  ('pr666666-6666-6666-6666-666666666666', 'ingreso_compra', 30, 8500, '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '8 days', 'Reposición', 30, 60),
  ('pr777777-7777-7777-7777-777777777777', 'ajuste_egreso', 1, 22000, '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '5 days', 'Muestra', 13, 12),
  ('pr888888-8888-8888-8888-888888888888', 'ingreso_compra', 8, 28000, '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '3 days', 'Reposición', 8, 16),
  ('pr999999-9999-9999-9999-999999999999', 'traslado', 2, 45000, '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '1 day', 'A sucursal norte', 10, 8),
  ('pr000000-0000-0000-0000-000000000000', 'servicio_tecnico', 1, 55000, '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '2 days', 'Orden #1006', 7, 6);

-- =============================================
-- 16. NOTIFICACIONES
-- =============================================
INSERT INTO notificaciones (id_usuario, tipo, titulo, mensaje, leido, fecha_creacion, prioridad) VALUES
  ('11111111-1111-1111-1111-111111111111', 'sistema', 'Nueva venta registrada', 'Se registró una venta por $42.000', false, NOW() - INTERVAL '2 hours', 'media'),
  ('11111111-1111-1111-1111-111111111111', 'stock', 'Stock bajo detectado', 'El producto Aceite 15W-40 está cerca del mínimo', false, NOW() - INTERVAL '5 hours', 'alta'),
  ('11111111-1111-1111-1111-111111111111', 'servicio', 'Orden actualizada', 'La orden #1002 cambió a estado "En reparación"', true, NOW() - INTERVAL '1 day', 'media'),
  ('11111111-1111-1111-1111-111111111111', 'caja', 'Caja cerrada', 'La Caja Principal fue cerrada con diferencia positiva', true, NOW() - INTERVAL '2 days', 'baja'),
  ('11111111-1111-1111-1111-111111111111', 'venta', 'Nuevo presupuesto', 'Se creó el presupuesto #3002 para Transportes Rápidos', false, NOW() - INTERVAL '3 days', 'media');

-- =============================================
-- 17. CONFIGURACIÓN DE ALERTAS
-- =============================================
INSERT INTO configuracion_alertas (codigo_alerta, nombre, activo, tipo, prioridad, condicion_tipo, mensaje_titulo, mensaje_cuerpo) VALUES
  ('STOCK_MIN', 'Alerta de Stock Mínimo', true, 'stock', 'alta', 'stock_actual <= stock_minimo', 'Stock bajo', 'El producto {producto} tiene stock por debajo del mínimo'),
  ('CREDITO_VENC', 'Crédito Vencido', true, 'cobro', 'urgente', 'saldo_pendiente > 0 AND dias_vencido > 30', 'Crédito vencido', 'El cliente {cliente} tiene deuda vencida'),
  ('ORDEN_LISTA', 'Orden Lista para Entregar', true, 'servicio', 'media', 'estado = listo', 'Orden lista', 'La orden #{numero} está lista para retirar');

-- =============================================
-- FIN DEL SCRIPT
-- =============================================
