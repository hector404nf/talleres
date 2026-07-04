# 📋 Reporte QA — Sistema Talleres Pro

**Fecha:** 2 de Junio de 2026
**Versión:** 1.0.0
**Stack:** Next.js 15.5.18 / React 19.2.6 / TypeScript 5.3 / Supabase / Tailwind CSS 3.4 / Zustand 4.4 / Node 24.11 / pnpm 10.20

---

## 🟢 Resumen Ejecutivo

| Área | Estado | Nota |
|------|--------|------|
| Build | ✅ PASS | Compila sin errores en ~46s |
| TypeScript | ✅ PASS | `tsc --noEmit` sin errores |
| Lint | ⚠️ WARN | `next lint` deprecated en Next 16, migrar a ESLint CLI |
| Tests | 🔴 FAIL | **No existen tests unitarios ni de integración** |
| Seguridad | 🔴 CRÍTICO | Credenciales hardcodeadas, auth por localStorage |
| Calidad de Código | 🟡 MEDIO | Exceso de `any`, duplicación masiva en stores |
| Performance | 🟡 MEDIO | Sin memoización, re-renders innecesarios |
| Accesibilidad | 🟡 BAJO | Faltan ARIA labels, contraste en algunos estados |
| Dependencias | 🟡 WARN | Paquetes innecesarios instalados |

---

## 🔴 1. SEGURIDAD (CRÍTICO)

### 1.1 Credenciales Hardcodeadas
**Archivo:** `src/lib/supabase.ts`
```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tronngbyuwtyrrkzjctr.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```
- **Riesgo:** La API key de Supabase está expuesta en el código fuente del cliente. Cualquier persona puede inspeccionar el bundle y extraer las credenciales.
- **Impacto:** Acceso directo a la base de datos si no hay RLS configurado.
- **Fix:** Usar exclusivamente variables de entorno y eliminar los fallbacks.

### 1.2 Login con Credenciales Fallback
**Archivos:** `src/app/login/page.tsx`, `src/lib/supabase.ts`
```typescript
if (username === 'admin' && password === 'admin123') { /* login */ }
```
- **Riesgo:** Cualquier persona puede autenticarse como admin usando las credenciales demo.
- **Fix:** Eliminar el fallback de demo en producción. Usar un flag de entorno `NEXT_PUBLIC_ENABLE_DEMO`.

### 1.3 Autenticación por localStorage
**Archivo:** `src/app/(dashboard)/layout.tsx`
```typescript
const auth = localStorage.getItem('isAuthenticated');
```
- **Riesgo:** Un usuario puede abrir la consola del navegador y escribir `localStorage.setItem('isAuthenticated', 'true')` para saltarse el login.
- **Impacto:** Bypass completo de autenticación.
- **Fix:** Usar JWT tokens httpOnly cookies o sessions server-side.

### 1.4 Datos Sensibles en localStorage
- User data, configuración, auditoría, notificaciones: todo en `localStorage`.
- **Riesgo:** Accesible vía XSS o extensiones del navegador.
- **Fix:** Migrar datos sensibles a Supabase con RLS.

### 1.5 No hay Row Level Security (RLS)
- Se usa la `anon key` directamente en el cliente.
- **Riesgo:** Sin RLS, cualquier usuario autenticado podría leer/modificar cualquier dato.
- **Fix:** Configurar RLS en todas las tablas de Supabase.

### 1.6 Autenticación Web sin Hash Proper
**Archivo:** `src/app/[slug]/auth/page.tsx`
```typescript
.eq('password', form.password)
```
- Se compara la contraseña en texto plano con la DB.
- **Fix:** Usar hash SHA-256 (ya está implementado en `useUsuariosWebStore`) de forma consistente.

---

## 🟡 2. CALIDAD DE CÓDIGO

### 2.1 Uso Excesivo de `any`
- **Archivos afectados:** Prácticamente todos los stores y páginas.
- **Ejemplos:**
  ```typescript
  const useClientesStore = create((set: any, get: any) => ({ ... }));
  ventas.filter((v: any) => ...);
  const [user, setUser] = useState<any>(null);
  ```
- **Impacto:** Pierde todos los beneficios de TypeScript. Errores en runtime que el compilador no detecta.
- **Fix:** Definir interfaces para todos los modelos (ya hay algunos como `Cliente` y `Producto` en las páginas, pero no se usan en los stores).

### 2.2 Archivo Monolítico `supabase.ts`
- **Tamaño:** ~1800 líneas de código.
- **Contiene:** Configuración de cliente, 15+ stores Zustand, funciones utilitarias, helpers de auditoría.
- **Fix:** Separar en módulos: `stores/clientes.ts`, `stores/productos.ts`, `lib/auditoria.ts`, `lib/auth.ts`.

### 2.3 Duplicación Masiva de Código
- Todos los stores siguen el **exacto mismo patrón**: fetch → try Supabase → fallback localStorage.
- Se podría abstractar en un factory:
  ```typescript
  function createCrudStore(tableName: string, options?: StoreOptions) { ... }
  ```
- **Ahorro estimado:** ~1200 líneas de código duplicado.

### 2.4 Errores Silenciados
```typescript
catch (e) {}           // 20+ ocurrencias
catch { /* noop */ }   // 5+ ocurrencias
```
- **Riesgo:** Los errores de red o base de datos pasan completamente desapercibidos.
- **Fix:** Al menos hacer `console.error()` o usar un error boundary.

### 2.5 Inputs con Doble Clase CSS
```typescript
className="w-full px-3 py-2 bg-white border-none rounded-2xl shadow-sm px-4 py-3 ..."
```
- `px-3` y `px-4`, `py-2` y `py-3` duplicados en el mismo elemento.
- **Impacto:** Comportamiento impredecible de CSS.

---

## 🟡 3. PERFORMANCE

### 3.1 Sin Memoización
- **Dashboard:** `ventasHoy`, `montoHoy`, `montoTotal`, `productosStockBajo` se recalculan en cada render.
- **Reportes:** `ventasPorCliente`, `ventasPorProducto` usan `useMemo` ✅ (bueno).
- **VentasPage:** `filteredProducts` se recalcula en cada keystroke sin debounce.

### 3.2 Polling Excesivo
```typescript
// NotificacionesBell: cada 5 segundos
const id = setInterval(load, 5000);
```
- **Impacto:** Requests innecesarios cada 5 segundos aunque no haya cambios.
- **Fix:** Usar Supabase Realtime subscriptions o increase el intervalo.

### 3.3 Fetch Independiente sin Batching
```typescript
useEffect(() => {
  fetchClientes();
  fetchProductos();
  fetchVentas();
  fetchOrdenes();
}, []);
```
- 4 requests separados al montar el Dashboard. Se podrían combinar con `Promise.all`.

### 3.4 localStorage como Fallback Masivo
- Cada operación CRUD escribe a localStorage después de Supabase.
- `JSON.stringify` y `JSON.parse` de arrays grandes en cada operación.

---

## 🟡 4. ARQUITECTURA

### 4.1 Todo Client-Side Rendering
- Todas las páginas usan `'use client'`.
- No se aprovechan Server Components de Next.js 15.
- **Impacto:** SEO comprometido, carga inicial más lenta, Mayor bundle size.

### 4.2 Dependencias Innecesarias
| Paquete | Razón |
|---------|-------|
| `pg` | Se usa Supabase client, no PG directo |
| `prop-types` | TypeScript ya maneja tipos en runtime |
| `@types/react` v18 | Incompatible con React 19 instalado |

### 4.3 `next.config.js` No Existe
- Se buscó `next.config.mjs` y no se encontró.
- **Impacto:** No hay configuración de headers de seguridad, CSP, redirects, etc.

### 4.4 Faltan React Error Boundaries
- Ningún `error.tsx` en las rutas de Next.js.
- Un error en un componente tumba toda la página.

---

## 🟡 5. ACCESIBILIDAD

### 5.1 Problemas Detectados
| Problema | Ejemplo |
|----------|---------|
| Botones sin `aria-label` | Botones de acción con solo emoji: `✏️`, `🗑️` |
| Tablas sin `scope` | Headers de tabla no tienen `scope="col"` |
| Solo color para estados | Stock bajo = rojo, stock OK = verde (sin texto/icono alternativo) |
| Inputs sin `aria-describedby` | Campos con errores no describen el error |
| Dropdown sin `role="listbox"` | SelectSearch custom sin ARIA roles |

### 5.2 Contraste
- Algunos textos `text-gray-400` sobre fondo blanco no pasan WCAG AA (ratio < 4.5:1).

---

## 🟢 6. BUILD & COMPILACIÓN

| Prueba | Resultado |
|--------|-----------|
| `tsc --noEmit` | ✅ Sin errores |
| `pnpm build` | ✅ Compila en 46s |
| `next lint` | ⚠️ Deprecated (migrar a ESLint CLI) |
| Paquetes sin instalar | ✅ Ninguno |
| Dependencias huérfanas | ⚠️ `pg`, `prop-types` |

---

## 🟢 7. FUNCIONALIDADES COMPROBADAS

| Módulo | Estado | Notas |
|--------|--------|-------|
| Login | ✅ Funcional | Credenciales demo hardcodeadas |
| Dashboard | ✅ Funcional | Stats, gráfico, actividad reciente |
| Clientes | ✅ Funcional | CRUD completo, filtros, historial |
| Productos | ✅ Funcional | CRUD con imágenes, tabs, stock |
| Ventas | ✅ Funcional | Carrito, pagos mixtos, vuelto, puntos |
| Reportes | ✅ Funcional | Filtros, gráficos, exportación PDF |
| Presupuestos | ✅ Funcional | CRUD con items |
| Proveedores | ✅ Funcional | CRUD completo |
| Categorías/Marcas/Unidades | ✅ Funcional | CRUD básico |
| Caja | ✅ Funcional | Apertura/cierre |
| Facturación | ✅ Funcional | Formulario SIFEN |
| Pedidos Web | ✅ Funcional | Gestión de pedidos online |
| Config Web | ✅ Funcional | Configuración de tienda online |
| Campañas | ✅ Funcional | CRUD de marketing |
| Alertas | ✅ Funcional | Configuración de alertas |
| Auditoría | ✅ Funcional | Trail de cambios local |
| Seed Data | ✅ Funcional | Carga en Supabase y localStorage |
| Ticket Print | ✅ Funcional | Impresión de tickets |
| PDF Export | ✅ Funcional | Exportación de reportes y comprobantes |

---

## 🔴 8. TESTS

### Estado: **NO EXISTEN TESTS**

- No hay archivos `*.test.ts` ni `*.spec.ts` en el proyecto.
- No hay configuración de Jest, Vitest, ni Playwright.
- No hay tests de integración ni E2E.

### Tests Recomendados

| Prioridad | Tipo | Cobertura |
|-----------|------|-----------|
| 🔴 Alta | Unit | Stores de Zustand (CRUD operations) |
| 🔴 Alta | Unit | `format.ts` (formateo de moneda) |
| 🔴 Alta | Unit | `pdf-export.ts` (generación de PDF) |
| 🟡 Media | Integration | Login flow |
| 🟡 Media | Integration | Flujo de venta completo |
| 🟡 Media | E2E | Navegación entre módulos |
| 🟡 Media | E2E | CRUD completo de productos |
| 🟢 Baja | E2E | Checkout web |

---

## 📊 9. MÉTRICAS DE CALIDAD

| Métrica | Valor | Target | Estado |
|---------|-------|--------|--------|
| Archivos TypeScript | ~50 | - | ℹ️ |
| Líneas de código | ~8,000+ | - | ℹ️ |
| Uso de `any` | ~80+ ocurrencias | 0 | 🔴 |
| Tests unitarios | 0 | >50 | 🔴 |
| Cobertura de tests | 0% | >70% | 🔴 |
| Errores silenciados | 25+ | 0 | 🟡 |
| Stores duplicados | 15 | 1 genérico | 🟡 |
| Páginas `'use client'` | 100% | <50% | 🟡 |

---

## ✅ 10. RECOMENDACIONES PRIORIZADAS

### 🔴 Prioridad CRÍTICA (Hacer inmediatamente)
1. **Eliminar credenciales hardcodeadas** → Usar solo `.env.local`
2. **Eliminar fallback de login demo** → Proteger con variable de entorno
3. **Configurar RLS en Supabase** → Sin esto, la DB está abierta
4. **Crear tests básicos** → Al menos para format.ts y stores principales

### 🟡 Prioridad ALTA (Hacer esta semana)
5. **Separar `supabase.ts`** en módulos independientes
6. **Eliminar `any`** → Definir interfaces para todos los modelos
7. **Migrar `next lint`** → Configurar ESLint CLI
8. **Eliminar dependencias innecesarias** (`pg`, `prop-types`)
9. **Agregar error boundaries** (`error.tsx` en rutas principales)

### 🟢 Prioridad MEDIA (Hacer este mes)
10. **Implementar Server Components** en páginas estáticas
11. **Agregar memoización** en Dashboard y cálculos pesados
12. **Mejorar accesibilidad** → ARIA labels, contraste, roles
13. **Crear factory de stores** para eliminar duplicación
14. **Agregar `next.config.js`** con headers de seguridad
15. **Configurar Supabase Realtime** para notificaciones en vez de polling

---

*Reporte generado automáticamente por QA Analysis — Talleres Pro v1.0.0*
