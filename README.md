# 📋 Sistema de Gestión para Talleres - Planificación Completa

## 🎯 Visión General

Sistema web integral para gestión de talleres con las siguientes características principales:
- **Inventario**: Control de stock, productos, categorías, marcas
- **Ventas**: Contado, crédito, crédito negro (SET), presupuestos, pedidos
- **Servicios**: Órdenes de servicio, subservicios jerárquicos, seguimiento
- **Clientes**: Gestión completa, recurrentes, fidelización
- **Proveedores**: Compras, deudas, evaluaciones
- **Online**: Menú online, tienda virtual, pedidos web
- **Reportes**: Estadísticas completas, métricas, dashboards
- **Facturación**: Tickets, facturas, integración AFIP

---

## 📁 Estructura de Archivos

```
talleres/
├── README.md                  # Este archivo - Vista general
├── planing.md                 # Estructura de BD completa + tablas
├── planing-complemento.md     # Detalle de funcionalidades
├── app/                       # Next.js App Router
├── components/                # Componentes React
├── lib/                       # Utilidades y configuración
├── hooks/                     # Custom hooks
├── stores/                    # Zustand stores
├── types/                     # Tipos TypeScript
└── public/                    # Assets
```

---

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 15+** - Framework React con App Router
- **React 19+** - Librería de UI
- **TypeScript 5+** - Tipado estático
- **Tailwind CSS 4+** - Estilos
- **Shadcn/ui** - Componentes UI
- **TanStack Query** - Data fetching
- **Zustand** - Estado global
- **React Hook Form + Zod** - Formularios

### Backend & BD
- **Supabase** - PostgreSQL + Auth + Realtime
- **Supabase Functions** - Edge functions (Deno)
- **Supabase Storage** - Archivos

### Deployment
- **Vercel** - Hosting frontend y edge

---

## 📊 Módulos del Sistema

### 1. **Módulo de Ventas** 
- Venta mostrador (rápida)
- Venta normal completa
- Venta al contado / crédito / crédito negro
- Presupuestos
- Pedidos con seña
- Múltiples formas de pago
- Planes de cuotas
- Impresión de tickets

### 2. **Módulo de Inventario**
- ABM de productos
- Categorías y subcategorías
- Marcas
- Unidades de medida
- Control de stock
- Movimientos de stock
- Alertas de reposición
- Múltiples depósitos

### 3. **Módulo de Servicios**
- Servicios principales
- Subservicios jerárquicos
- Órdenes de servicio
- Seguimiento de estados
- Imputación de tareas
- Repuestos utilizados
- Garantías

### 4. **Módulo de Clientes**
- **Gestión completa**: ABM, datos, documentos
- **Clientes recurrentes**: Configuración automática/manual
  - Por cantidad de compras
  - Por monto acumulado
  - Por frecuencia de días
  - Por producto recurrente
- **Alertas inteligentes**: Notificaciones en tiempo real
- **Beneficios configurables**: Descuentos, puntos, promociones
- **Sugerencias de productos**: Algoritmo basado en historial
- **Fidelización**: Puntos, niveles, beneficios
- **Créditos**: Cupos, límites, cobranza

### 5. **Módulo de Proveedores**
- ABM completo
- Compras y órdenes
- Deudas y pagos
- Evaluación de proveedores
- Listas de precios

### 6. **Módulo Online**
- Menú online público
- Catálogo de productos
- Carrito de compras
- Pedidos online
- Seguimiento
- Notificaciones

### 7. **Reportes**
- Ventas (período, vendedor, cliente, producto)
- Stock (valorizado, rotación, reposición)
- Clientes (segmentación, fidelidad, morosidad)
- Proveedores (compras, evaluación)
- Servicios (técnicos, rentabilidad)
- Caja (ingresos, egresos, flujo)
- Créditos (vencidos, gestión, castigos)
- Créditos negros por tipo

### 8. **Facturación**
- Tickets térmicos (58mm, 80mm, A4)
- Facturación electrónica (AFIP)
- Presupuestos imprimibles
- Remitos
- Tickets de servicio

---

## 🚀 Plan de Implementación por Fases

### **Fase 1 - Core** (3-4 semanas)
- [ ] Configuración inicial del proyecto
- [ ] Setup de Supabase (tablas base)
- [ ] Autenticación y roles
- [ ] ABM Clientes y Proveedores
- [ ] ABM Productos y categorías
- [ ] Control de stock básico
- [ ] Venta mostrador simple

### **Fase 2 - Ventas y Facturación** (3-4 semanas)
- [ ] Venta normal completa
- [ ] Tipos de pago (contado/crédito)
- [ ] Planes de cuotas
- [ ] Créditos negros (SET)
- [ ] Impresión de tickets
- [ ] Presupuestos
- [ ] Pedidos con seña

### **Fase 3 - Servicios** (2-3 semanas)
- [ ] Servicios y subservicios
- [ ] Órdenes de servicio
- [ ] Estados y seguimiento
- [ ] Imputación de tareas

### **Fase 4 - Clientes Recurrentes** (2-3 semanas)
- [ ] Configuración de reglas de recurrencia
- [ ] Sistema de alertas
- [ ] Sugerencias de venta
- [ ] Beneficios automáticos
- [ ] Mensajes personalizables
- [ ] Seguimiento y métricas

### **Fase 5 - Online y Reportes** (3-4 semanas)
- [ ] Menú online público
- [ ] Dashboard y métricas
- [ ] Reportes principales
- [ ] Facturación electrónica (AFIP)

### **Fase 6 - Avanzado** (2-3 semanas)
- [ ] Multiusuario avanzado
- [ ] Auditoría completa
- [ ] Backup automático
- [ ] Optimizaciones
- [ ] Testing

**Tiempo total estimado**: 15-21 semanas (4-5 meses)

---

## 💾 Base de Datos

La estructura completa está en `planing.md` e incluye:

### Tablas Principales
- `configuracion` - Parámetros del negocio
- `clientes` - Gestión completa de clientes
- `proveedores` - ABM proveedores
- `usuarios` - Usuarios y permisos
- `productos` - Inventario
- `categorias`, `marcas`, `unidades` - Clasificadores
- `movimientos_stock` - Trazabilidad
- `presupuestos`, `pedidos`, `ventas` - Documentación comercial
- `detalle_ventas` - Items de comprobantes
- `servicios`, `subservicios` - Servicios jerárquicos
- `ordenes_servicio` - Órdenes de taller
- `tareas_servicio` - Tareas imputadas
- `formas_pago`, `planes_credito`, `cuotas` - Finanzas
- `cajas`, `movimientos_caja` - Caja
- `auditoria` - Logs del sistema
- `notificaciones`, `cola_notificaciones` - Alertas
- `configuracion_alertas` - Alertas configurables
- `sugerencias_venta` - Sugerencias por IA/reglas
- `historial_compras_cliente` - Historial para recurrencia
- `configuracion_recurrente` - Reglas de recurrencia
- `campanias`, `campanias_clientes` - Marketing
- `listas_precio` - Estrategia de precios
- `sucursales`, `depositos`, `stock_por_deposito` - Multi-local
- `menu_online_config`, `productos_destacados`, `ofertas_especiales` - Web
- `metricas_diarias` - KPIs

### Funciones y Triggers
- `actualizar_estadisticas_cliente()` - Auto-actualiza métricas
- `verificar_recurrencia_cliente()` - Detecta clientes recurrentes
- `generar_sugerencia_venta()` - Crea sugerencias
- `calcular_dias_ultima_compra()` - Calcula antigüedad
- `clasificar_cliente()` - Categoriza A/B/C/D/E

---

## 🔐 Sistema de Créditos Negros (SET)

Funcionalidad especial para manejar operaciones que no figuran como ventas reales:

### Tipos Configurables
1. **Préstamo de dinero** - Sin intereses
2. **Préstamo con interés** - Con % configurable
3. **Seña/anticipo** - Sin especificar productos
4. **Tarjeta de crédito** - Simulación de consumo
5. **Intercambio** - Trueque por productos/servicios
6. **Personalizado** - El usuario define el concepto

### Características
- No descuenta stock (configurable)
- No genera libro de ventas
- Comprobante interno sin validez fiscal
- Seguimiento de saldos
- Alertas de vencimiento
- Historial por cliente

⚠️ **Importante**: Esta funcionalidad es sensible. El usuario final debe consultar con un contador matriculado sobre las implicaciones impositivas.

---

## 🎯 Sistema de Clientes Recurrentes

### Tipos de Activación

#### 1. Por Cantidad de Compras
- Mínimo de compras: 5, 10, 15, etc.
- Ventana de tiempo: últimos 30, 60, 90 días
- Beneficio: descuento automático, producto gratis, puntos extra

#### 2. Por Monto Acumulado
- Monto mínimo: $50.000, $100.000, etc.
- Período: últimos 30, 60, 90 días
- Beneficio: porcentaje de descuento, envío gratis

#### 3. Por Frecuencia de Compra
- Frecuencia: cada 7, 15, 30 días
- Tolerancia: ± 3 días
- Beneficio: recordatorio, oferta personalizada

#### 4. Por Producto Recurrente
- Producto específico
- Frecuencia esperada
- Beneficio: recordatorio de reposición

### Alertas Inteligentes

| Evento | Condición | Acción | Notificación |
|--------|-----------|--------|--------------|
| Cliente recurrente | ≥5 compras | Modal descuento | Vendedor |
| Cumpleaños | Fecha = hoy | Mensaje automático | Email/WhatsApp |
| Sin compra en 30 días | Última > 30 días | Campaña | Email |
| Alto valor | Compra > $50.000 | Agradecimiento | Email |

### Beneficios Configurables
- Descuentos en porcentaje (5%, 10%, 15%, 20%)
- Descuentos fijos ($1000, $5000)
- Puntos dobles/triples
- Producto gratis con compra mínima
- Envío gratis
- Acceso anticipado a promociones

---

## 📦 Dependencias Principales

```json
{
  "dependencies": {
    "next": "15.x",
    "react": "19.x",
    "typescript": "5.x",
    "@supabase/supabase-js": "latest",
    "@tanstack/react-query": "latest",
    "zustand": "latest",
    "react-hook-form": "latest",
    "zod": "latest",
    "tailwindcss": "4.x",
    "lucide-react": "latest",
    "date-fns": "latest",
    "react-to-print": "latest"
  }
}
```

---

## 🔑 Scripts Sugeridos

```bash
# Desarrollo
npm run dev           # Servidor desarrollo
npm run build         # Build producción
npm run start         # Inicio producción
npm run lint          # ESLint
npm run typecheck     # TypeScript check

# Base de datos
npm run db:push       # Push schema a Supabase
npm run db:pull       # Pull schema desde Supabase
npm run db:studio     # Supabase Studio
npm run db:seed       # Datos de prueba
```

---

## 📊 Métricas y KPIs

El sistema incluye tablero con:
- Ventas diarias/mensuales/anuales
- Ticket promedio
- Cantidad de ventas
- Productos más vendidos
- Clientes nuevos vs recurrentes
- Stock valorizado
- Flujo de caja
- Morosidad
- Rentabilidad por producto/servicio
- Eficiencia de técnicos
- Tiempo promedio de reparación

---

## 🔐 Seguridad

- ✅ Row Level Security (RLS) en todas las tablas
- ✅ Autenticación con Supabase Auth
- ✅ Roles y permisos granulares
- ✅ Auditoría de todas las operaciones
- ✅ Encriptación de datos sensibles
- ✅ Backups automáticos diarios
- ✅ HTTPS obligatorio
- ✅ Rate limiting en API

---

## 📱 Consideraciones de Diseño

- Mobile-first responsive
- Modo oscuro/claro
- Accesibilidad (WCAG)
- Loading states
- Error handling amigable
- Optimización de imágenes
- Lazy loading

---

## 📈 Escalabilidad Futura

- [ ] Multi-sucursal
- [ ] App móvil nativa (React Native)
- [ ] Integración con marketplace
- [ ] WhatsApp Business API
- [ ] Email marketing
- [ ] Punto de venta offline
- [ ] API pública para terceros
- [ ] Multi-idioma
- [ ] Multi-monedas

---

## 💡 Próximos Pasos

1. **Definir alcance inicial (MVP)** - ¿Qué funcionalidades son prioritarias?
2. **Configurar repositorio y entorno** - Git, variables de entorno
3. **Crear proyecto en Supabase** - Tablas iniciales
4. **Diseñar wireframes** - Pantallas principales
5. **Comenzar con Fase 1** - Core del sistema

---

## 📞 Archivos del Proyecto

| Archivo | Descripción |
|---------|-------------|
| `README.md` | Este archivo - Vista general del proyecto |
| `planing.md` | Estructura completa de base de datos SQL |
| `planing-complemento.md` | Detalle de funcionalidades de clientes recurrentes y módulos |

---

## 🎯 Estado del Proyecto

- [x] Planificación completada
- [x] Estructura de BD definida
- [x] Funcionalidades detalladas
- [ ] Setup inicial del proyecto
- [ ] Implementación Fase 1
- [ ] Implementación Fase 2
- [ ] Implementación Fase 3
- [ ] Implementación Fase 4
- [ ] Implementación Fase 5
- [ ] Implementación Fase 6

---

**¿Listo para comenzar?** 🚀

El siguiente paso es definir si querés:
1. Empezar con el setup inicial del proyecto
2. Ajustar alguna funcionalidad específica
3. Profundizar en algún módulo en particular
4. Comenzar directamente con la implementación
