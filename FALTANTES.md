# FALTANTES DEL SISTEMA - Backlog Detallado

Basado en `planing.md` (schema + arquitectura) y `planing-complemento.md` (funcionalidades por módulo).

---

## Resumen Ejecutivo

| Estado | Módulos completos | Módulos parciales | Módulos faltantes |
|--------|------------------|-------------------|-------------------|
| **Hecho** | Dashboard, Clientes, Productos, Ventas, Servicios (OT), Proveedores, Categorías, Marcas, Unidades, Presupuestos, Pedidos, Caja, Movimientos Stock, Facturación (base), Compras, Campañas, Alertas, Usuarios, Depósitos, Planes Crédito, Auditoría, Menú Online, Configuración, Login, Layout con sidebar |
| **Parcial** | Reportes (básico), Facturación (sin SOAP real) |
| **Faltante** | Reportes avanzados con gráficos, integración real SET (SOAP + certificado), push notifications nativas |

---

## Hecho (Implementado y Funcionando)

### Dashboard
- [x] KPIs en tiempo real (clientes, productos, ventas hoy, órdenes)
- [x] Resumen financiero (monto total, ventas hoy, ticket promedio, órdenes pendientes)
- [x] Widget productos con stock bajo + toast de alerta
- [x] Widget cumpleaños de clientes (toasts automáticos)
- [x] Accesos rápidos a módulos principales
- [x] Widget de actividad reciente (auditoría)

### Clientes
- [x] ABM completo con offcanvas y 6 tabs
- [x] Historial de compras (tab historial)
- [x] Puntos de fidelidad (acumulación automática en ventas)
- [x] Lista negra SET / Bloqueos con validación en ventas
- [x] Cumpleaños (badge + toast)
- [x] Campos avanzados: email secundario, whatsapp, condición IVA, país, categoría A-E, etiqueta, saldos, preferencias (email/SMS/WhatsApp/promociones)

### Productos
- [x] ABM completo con offcanvas y 4 tabs
- [x] SelectSearch para proveedor, categoría, marca
- [x] Campos avanzados: descripción corta, precios promo/lista2/lista3/mínimo, impuestos internos, stock comprometido/en pedido/punto reposición, peso, volumen, es kit, es compuesto, requiere envase, destacado web, disponible online, código proveedor, ubicación depósito

### Ventas
- [x] POS offcanvas con descuento %/$
- [x] Múltiples formas de pago
- [x] Cálculo de vueltos automático
- [x] Validación de cliente bloqueado
- [x] Acumulación automática de puntos de fidelidad
- [x] Impresión de ticket 80mm

### Servicios (Órdenes de Trabajo)
- [x] 11 estados con transiciones
- [x] Números secuenciales de OT
- [x] Tabs: general, equipo, diagnóstico, presupuesto, repuestos, fotos, entrega, historial
- [x] Repuestos utilizados con desconte automático de stock
- [x] Timeline de cambios de estado
- [x] Fotos antes/después (base64/localStorage)
- [x] Encuesta de satisfacción (calificación 1-5 + comentarios)
- [x] Garantía configurable
- [x] Impresión de ticket 80mm

### Proveedores
- [x] ABM completo con offcanvas
- [x] Calificación por estrellas (1-5)
- [x] Estadísticas de compras
- [x] SelectSearch para provincia y condición IVA

### Presupuestos
- [x] Crear → aprobar → rechazar → convertir a venta
- [x] Estados y filtros
- [x] CDC link

### Pedidos
- [x] Seña tracking
- [x] Flujo de entrega
- [x] Conversión a venta
- [x] Estados y filtros

### Stock / Movimientos
- [x] Ingreso/egreso/ajuste/merma/robo/traslado
- [x] Saldo anterior/nuevo
- [x] Motivo obligatorio

### Caja
- [x] Apertura/cierre
- [x] Movimientos ingreso/egreso
- [x] Tracking de saldo
- [x] Arqueo físico con diferencias y observaciones

### Facturación (Paraguay SIFEN)
- [x] 5 tipos de comprobantes
- [x] Generador de CDC
- [x] KuDE preview/print
- [x] Estados de SET
- [x] Nota: integración real SOAP requiere certificado digital

### Compras
- [x] Órdenes a proveedores
- [x] Recepción parcial/total
- [x] Estados: pendiente, parcial, completo, anulado

### Campañas
- [x] Marketing campaigns (descuento, puntos, cumpleaños, WhatsApp, email)
- [x] Vigencia y segmentación

### Alertas Configurables
- [x] Tipos: stock, venta, cobro, cliente, servicio, caja
- [x] Prioridades y toggle activo/inactivo

### Usuarios
- [x] ABM con roles (admin, vendedor, encargado, técnico)
- [x] Matriz de permisos
- [x] Límite de descuento por usuario

### Depósitos
- [x] Gestión de depósitos (principal/secundario)
- [x] Encargado asignado

### Planes de Crédito
- [x] Configuración de cuotas
- [x] Tasa de interés, recargo, día de vencimiento

### Auditoría
- [x] Trail de cambios en localStorage (últimos 500)
- [x] Diff viewer modal
- [x] Estadísticas por tipo de acción
- [x] Integración automática en stores principales

### Menú Online
- [x] Catálogo público sin login
- [x] Carrito y formulario de pedido
- [x] Filtros por categoría

### Reportes
- [x] Filtros por fecha/cliente/forma de pago
- [x] Top 5 clientes/productos
- [x] Gráficos de barras por método de pago
- [x] Tabla de detalle

### Configuración
- [x] Tabs: empresa, ventas, sistema
- [x] Configuración de puntos de fidelidad
- [x] Danger zone

### Layout / UX
- [x] Sidebar persistente con 22 ítems de navegación
- [x] Buscador global en header (clientes, productos, páginas)
- [x] Campana de notificaciones persistentes
- [x] Active route highlighting
- [x] Offcanvas panels (no modales centrados)
- [x] SelectSearch (Select2-style)
- [x] TicketPrint 80mm (react-to-print)
- [x] Toast notifications (sonner)

---

## Parcialmente Hecho (Requiere refinamiento o integración externa)

### Facturación Electrónica Paraguay (SIFEN/SET)
- [x] Estructura base completa (CDC, KuDE, tipos, estados)
- [ ] Integración WebService SOAP real
- [ ] Firma digital con certificado SET
- [ ] Envío masivo de lotes
- [ ] Consulta de estado por CDC

### Reportes Avanzados
- [x] Reportes básicos operativos
- [ ] Reportes con gráficos avanzados (recharts)
- [ ] Exportación a Excel/PDF
- [ ] Proyecciones y tendencias

---

## Faltante (Backlog Remanente)

### Alta Prioridad
- [ ] **Descontar stock automático al agregar repuesto en servicio** → ✅ HECHO
- [ ] **Arqueo físico con diferencias de caja** → ✅ HECHO

### Media Prioridad
- [ ] **Fotos antes/después en servicios** → ✅ HECHO
- [ ] **Encuesta de satisfacción en servicios** → ✅ HECHO
- [ ] **Exportar comprobantes a PDF** (ventas, presupuestos, facturas)
- [ ] **Saldo por forma de pago en caja** (efectivo, débito, crédito, etc.)
- [ ] **Tiempos reales vs estimados en servicios**

### Baja Prioridad
- [ ] **Selector de tema claro/oscuro**
- [ ] **Notificaciones push nativas** (service worker)
- [ ] **Página /notificaciones push**
- [ ] **Integración con WhatsApp Business API**
- [ ] **Integración con email (SendGrid/Resend)**
- [ ] **Multi-sucursal avanzado** (transferencias entre sucursales)
- [ ] **Kit de productos** (productos compuestos)
- [ ] **Lista de precios múltiples** (mayorista, minorista, etc.)
- [ ] **Ofertas especiales y productos destacados**
- [ ] **Métricas diarias automáticas**

---

## Tablas SQL vs Frontend

| Tabla | Estado |
|-------|--------|
| `clientes` | ✅ Completo (25+ campos expuestos) |
| `productos` | ✅ Completo (20+ campos expuestos) |
| `ventas` | ✅ Funcional (array JSON items, múltiples pagos) |
| `ordenes_servicio` | ✅ Completo (repuestos, timeline, fotos, encuesta) |
| `proveedores` | ✅ Completo |
| `categorias` | ✅ Completo |
| `marcas` | ✅ Completo |
| `unidades` | ✅ Completo |
| `presupuestos` | ✅ Completo |
| `pedidos` | ✅ Completo |
| `compras` | ✅ Completo |
| `cajas` | ✅ Completo (arqueo físico) |
| `movimientos_caja` | ✅ Integrado en /caja |
| `movimientos_stock` | ✅ Completo |
| `facturacion` | ✅ Base lista (falta SOAP real) |
| `usuarios` | ✅ Completo |
| `campanias` | ✅ Completo |
| `alertas` | ✅ Completo |
| `depositos` | ✅ Completo |
| `planes_credito` | ✅ Completo |
| `auditoria` | ✅ Trail en localStorage |
| `menu_online_config` | ✅ /menu público |
| `configuracion` | ✅ Completo |
| `subservicios` | ❌ Sin página separada |
| `tareas_servicio` | ❌ Sin página (repuestos integrados en OT) |
| `detalle_ventas` | ✅ Array JSON dentro de ventas |
| `formas_pago` | ✅ Hardcodeado en venta |
| `cuotas` | ❌ Sin página (planes define cuotas) |
| `listas_precio` | ❌ Sin página |
| `listas_precio_detalle` | ❌ Sin página |
| `sucursales` | ❌ Sin página |
| `stock_por_deposito` | ❌ Sin página (stock está en productos) |
| `productos_destacados` | ❌ Sin página |
| `ofertas_especiales` | ❌ Sin página |
| `metricas_diarias` | ❌ Sin página |
| `notificaciones` | ✅ LocalStorage + campana UI |
| `cola_notificaciones` | ❌ Sin página |
| `historial_compras_cliente` | ✅ Historial en ficha de cliente |
| `sugerencias_venta` | ❌ Sin página |
| `configuracion_recurrente` | ❌ Sin página |
| `campanias_clientes` | ❌ Sin página |

---

## Métricas de Avance

| Métrica | Valor |
|---------|-------|
| Tablas SQL creadas en Supabase | 29 |
| Páginas frontend creadas | 28 |
| Páginas frontend faltantes | ~0-1 (notificaciones push nativas) |
| Campos de schema implementados en forms | ~85% |
| Campos de schema faltantes en forms | ~15% |
| Build estático | ✅ 28 páginas, sin errores |

---

## Roadmap Completado

### Sprint 1: Fundamentos ✅
1. Página Proveedores (ABM completo)
2. Página Categorías + Marcas + Unidades (ABM rápido)
3. Vueltos + descuento + múltiples pagos en Ventas
4. Alerta de stock bajo en Dashboard

### Sprint 2: Operativa ✅
5. Presupuestos (crear → aprobar → convertir a venta)
6. Pedidos (seña → entrega → conversión)
7. Movimientos de stock (ajustes con motivo)
8. Caja diaria (apertura, cierre, arqueo)

### Sprint 3: Cliente y Servicios ✅
9. Historial de compras del cliente
10. Puntos de fidelidad
11. Repuestos en órdenes de servicio + descuento automático de stock
12. Timeline de servicios
13. Fotos antes/después en servicios
14. Encuesta de satisfacción

### Sprint 4: Alertas y Facturación Paraguay ✅
15. Cumpleaños de clientes (badge + toast)
16. Lista negra SET / Bloqueos de clientes
17. Facturación Electrónica Paraguay (SIFEN/SET) - estructura base

### Sprint 5: Compras, Marketing y Sistema ✅
18. Compras a proveedores (pedido, parcial, total, anulado)
19. Campañas de marketing
20. Alertas configurables
21. Menú online público
22. Impresión de tickets 80mm
23. Gestión de usuarios con roles y permisos
24. Depósitos y planes de crédito
25. Auditoría de cambios

### Sprint 6: UX y Polish ✅
26. Buscador global en header
27. Campana de notificaciones persistentes
28. Auditoría automática en stores
29. Widget actividad reciente en dashboard
30. Arqueo físico con diferencias de caja

---

*Documento actualizado al estado actual del código fuente.*
*Última actualización: 2026-05-12*
