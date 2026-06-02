# 🚀 Instrucciones para comenzar

## 1. Configurar Supabase

### Paso 1: Crear proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Guarda las credenciales que te darán

### Paso 2: Configurar variables de entorno
1. Copia el archivo `.env.local.example` a `.env.local`:
```bash
cp .env.local.example .env.local
```

2. Edita `.env.local` y agrega tus credenciales de Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

### Paso 3: Ejecutar script SQL en Supabase
1. Ve al SQL Editor en el dashboard de Supabase
2. Copia el contenido del archivo `supabase-schema.sql`
3. Ejecuta el script completo
4. Verifica que se hayan creado todas las tablas

## 2. Instalar dependencias

Si no lo has hecho aún:
```bash
npm install
```

## 3. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 4. Estructura del proyecto

```
talleres/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── globals.css      # Estilos globales
│   │   ├── layout.tsx       # Layout principal
│   │   └── page.tsx         # Página de inicio
│   ├── lib/                 # Utilidades y configuración
│   │   └── supabase.ts      # Cliente de Supabase
│   ├── components/          # Componentes React
│   ├── hooks/               # Custom hooks
│   ├── stores/              # Zustand stores
│   └── types/               # Tipos TypeScript
├── public/                  # Assets estáticos
├── supabase-schema.sql      # Script SQL para Supabase
├── .env.local.example       # Ejemplo de variables de entorno
├── next.config.ts           # Configuración de Next.js
├── tailwind.config.ts       # Configuración de Tailwind
└── package.json             # Dependencias
```

## 5. Próximos pasos

### Fase 1 - Configuración inicial (COMPLETADO ✅)
- [x] Estructura del proyecto
- [x] Configuración de Next.js + TypeScript
- [x] Configuración de Tailwind CSS
- [x] Configuración de Supabase
- [x] Script SQL para tablas

### Fase 2 - Autenticación (PENDIENTE)
- [ ] Crear formulario de login
- [ ] Crear formulario de registro
- [ ] Implementar autenticación con Supabase Auth
- [ ] Proteger rutas con middleware
- [ ] Roles y permisos

### Fase 3 - ABM de Clientes (PENDIENTE)
- [ ] Listado de clientes
- [ ] Formulario de alta
- [ ] Formulario de edición
- [ ] Baja de clientes
- [ ] Búsqueda y filtros
- [ ] Historial de compras

### Fase 4 - Sistema de Recurrentes (PENDIENTE)
- [ ] Configuración de reglas de recurrencia
- [ ] Detección automática de clientes recurrentes
- [ ] Sistema de alertas
- [ ] Sugerencias de venta
- [ ] Beneficios automáticos

### Fase 5 - Inventario (PENDIENTE)
- [ ] ABM de productos
- [ ] Control de stock
- [ ] Movimientos de stock
- [ ] Categorías y marcas
- [ ] Múltiples depósitos

### Fase 6 - Ventas (PENDIENTE)
- [ ] Venta mostrador
- [ ] Venta normal
- [ ] Tipos de pago
- [ ] Créditos y cuotas
- [ ] Créditos negros (SET)
- [ ] Presupuestos
- [ ] Pedidos

### Fase 7 - Servicios (PENDIENTE)
- [ ] ABM de servicios
- [ ] Subservicios jerárquicos
- [ ] Órdenes de servicio
- [ ] Seguimiento de estados
- [ ] Imputación de tareas

### Fase 8 - Reportes (PENDIENTE)
- [ ] Dashboard principal
- [ ] Reporte de ventas
- [ ] Reporte de stock
- [ ] Reporte de clientes
- [ ] Métricas y KPIs

## 6. Comandos útiles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Producción
npm run build        # Build de producción
npm run start        # Inicia en producción

# Lint
npm run lint         # Ejecuta ESLint
```

## 7. Recursos adicionales

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Tailwind CSS](https://tailwindcss.com/docs)
- [Documentación de React](https://react.dev)

## 8. Soporte

Si tenés algún problema:
1. Revisá que las variables de entorno estén bien configuradas
2. Verificá que el script SQL se haya ejecutado correctamente
3. Revisá la consola del navegador y la terminal
4. Consultá los archivos de log en `.next/`

---

**¡Listo para comenzar! 🎉**

El proyecto está configurado y listo para empezar a desarrollar. Seguí las instrucciones arriba para configurar Supabase y comenzá con la Fase 2.
