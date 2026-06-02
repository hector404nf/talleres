# Plan de Desarrollo - Complemento de Funcionalidades

## 📚 Módulo de Clientes Recurrentes - Detallado

### Tipos de Recurrencia

#### 1. **Por Cantidad de Compras**
- **Descripción**: Cliente alcanza X cantidad de compras
- **Configuración**:
  - Mínimo de compras: 5, 10, 15, etc.
  - Ventana de tiempo: últimos 30, 60, 90 días
  - Beneficio: descuento automático, producto gratis, puntos extra

#### 2. **Por Monto Acumulado**
- **Descripción**: Cliente supera cierto monto en compras
- **Configuración**:
  - Monto mínimo acumulado: $50.000, $100.000, etc.
  - Período: últimos 30 días, 60 días, 90 días
  - Beneficio: porcentaje de descuento, envío gratis, acceso a promociones

#### 3. **Por Frecuencia de Compra**
- **Descripción**: Cliente compra cada cierto tiempo
- **Configuración**:
  - Frecuencia: cada 7, 15, 30 días
  - Tolerancia: ± 3 días
  - Beneficio: recordatorio automático, oferta personalizada

#### 4. **Por Producto/Servicio Recurrente**
- **Descripción**: Cliente compra repetidamente el mismo producto
- **Configuración**:
  - Producto/servicio específico
  - Frecuencia esperada
  - Beneficio: recordatorio de reposición, descuento por volumen

### Sistema de Alertas Inteligentes

#### Alertas en Tiempo Real
```typescript
interface AlertaCliente {
  tipo: 'recurrente' | 'vip' | 'baja' | 'cumpleanos' | 'frecuencia';
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  cliente: Cliente;
  mensaje: string;
  accionSugerida: AccionSugerida;
  descuentoSugerido?: number;
  productosSugeridos?: Producto[];
}
```

#### Configuración de Alertas por Evento

| Evento | Condición | Acción | Notificación |
|--------|-----------|--------|--------------|
| Cliente recurrente detectado | ≥5 compras o ≥$100.000 | Mostrar modal | Vendedor |
| Cumpleaños | Fecha = hoy | Mensaje automático | Email/WhatsApp |
| Sin compra en 30 días | Última compra > 30 días | Campaña reactivación | Email |
| Alto valor | Compra > $50.000 | Agradecimiento + oferta | Email |
| Baja de frecuencia | Frecuencia habitual ↓ 50% | Llamada seguimiento | Vendedor |

### Beneficios Configurables

#### Descuentos Automáticos
```typescript
interface BeneficioConfig {
  tipo: 'porcentaje' | 'monto_fijo' | 'puntos' | 'producto';
  valor: number;
  condicion: {
    minimoCompra?: number;
    productosIncluidos?: string[];
    productosExcluidos?: string[];
    categoriasIncluidas?: string[];
  };
  vigencia: {
    desde: Date;
    hasta: Date;
    diasDesdeUltimaCompra?: number;
  };
}
```

#### Tipos de Beneficios
1. **Descuento en porcentaje**: 5%, 10%, 15%, 20%
2. **Descuento fijo**: $1000, $5000, etc.
3. **Puntos dobles/triples**: 2x, 3x puntos
4. **Producto gratis**: Con compra mínima
5. **Envío gratis**: Sin monto mínimo
6. **Acceso anticipado**: A promociones
7. **Asesor personalizado**: Atención优先

### Mensajes Personalizables

#### Plantillas de Mensajes
```typescript
const plantillasMensaje = {
  bienvenida: "¡Hola {nombre}! Gracias por ser un cliente tan especial. Hoy tenés un {descuento}% de descuento.",
  cumpleaños: "¡Feliz cumpleaños {nombre}! 🎂 Celebralo con un {descuento}% de descuento válido por 7 días.",
  recurrente: "¡Sos un cliente VIP! {mensaje_personalizado}",
  baja_frecuencia: "Te extrañamos {nombre}. Volvé con un {descuento}% de descuento.",
  alto_valor: "¡Gracias por tu compra de ${monto}! Tenés un beneficio especial: {beneficio}."
};
```

### Sugerencias de Productos

#### Algoritmo de Sugerencia
1. **Basado en historial**: Productos comprados anteriormente
2. **Basado en categoría**: Misma categoría que compras frecuentes
3. **Basado en complementariedad**: Productos relacionados
4. **Basado en temporada**: Productos de estación/temporada
5. **Basado en stock**: Productos con alto stock para rotar

#### Ejemplo de Sugerencia
```json
{
  "cliente": "Juan Pérez",
  "esRecurrente": true,
  "tipoRecurrencia": "cantidad_compras",
  "comprasTotales": 7,
  "montoTotal": 156000,
  "sugerencia": {
    "titulo": "Cliente Recurrente - Nivel Oro",
    "mensaje": "Juan es cliente recurrente (7 compras). Ofrecer 10% descuento.",
    "descuentoSugerido": 10,
    "productosSugeridos": [
      {"id": "uuid-1", "nombre": "Producto A", "razon": "Comprado 5 veces"},
      {"id": "uuid-2", "nombre": "Producto B", "razon": "Categoría frecuente"}
    ],
    "accionSugerida": "Mostrar modal de descuento"
  }
}
```

---

## 🎯 Funcionalidades por Módulo - Detallado

### 1. Módulo de Ventas

#### 1.1 Venta Mostrador (Rápida)
- [ ] Búsqueda rápida por código/código de barra
- [ ] Búsqueda por nombre (autocomplete)
- [ ] Búsqueda por categoría
- [ ] Scanner de código de barras
- [ ] Carga rápida de cantidad
- [ ] Cálculo automático de vueltos
- [ ] Múltiples formas de pago
- [ ] Impresión rápida de ticket
- [ ] Corte de caja rápido
- [ ] Arqueo ciego
- [ ] Descuento rápido (con clave)
- [ ] Bonificaciones
- [ ] Lista de precios por tipo de cliente

#### 1.2 Venta Normal
- [ ] Carrito de compras
- [ ] Búsqueda avanzada de productos
- [ ] Filtros por categoría, marca, precio
- [ ] Stock en tiempo real
- [ ] Fotos de productos
- [ ] Historial del cliente
- [ ] Límite de crédito disponible
- [ ] Múltiples formas de pago combinadas
- [ ] Planes de cuotas
- [ ] Descuentos por producto y total
- [ ] Recargos (tarjetas, otros)
- [ ] Observaciones por producto
- [ ] Vendedor asignado
- [ ] Comisiones automáticas
- [ ] Derivar a presupuesto
- [ ] Derivar a pedido

#### 1.3 Tipos de Venta
- **Contado**: Pago inmediato
  - Efectivo
  - Tarjeta de débito
  - Transferencia
  - QR (Mercado Pago, etc.)
  
- **Crédito tradicional**: 
  - Planes de cuotas predefinidos
  - Interés configurable
  - Cuota inicial
  - Fecha de corte
  - Días de gracia
  
- **Crédito negro (SET)**:
  - Tipos configurables:
    1. Préstamo de dinero
    2. Préstamo con interés
    3. Seña/anticipo
    4. Tarjeta de crédito (simulación)
    5. Intercambio
    6. Personalizado
  - No descuenta stock (configurable)
  - No genera libro de ventas
  - Comprobante interno
  - Seguimiento de saldos
  - Alertas de vencimiento

#### 1.4 Presupuestos
- [ ] Generar desde cero
- [ ] Convertir desde venta
- [ ] Modificar presupuesto existente
- [ ] Imprimir PDF
- [ ] Enviar por email
- [ ] Seguimiento de estados
- [ ] Fecha de vencimiento
- [ ] Recordatorio de vencimiento
- [ ] Conversión a venta
- [ ] Historial de modificaciones
- [ ] Múltiples versiones
- [ ] Aprobación del cliente
- [ ] Tiempo de validez

#### 1.5 Pedidos
- [ ] Pedido con seña
- [ ] Porcentaje de seña configurable
- [ ] Fecha de entrega estimada
- [ ] Seguimiento de estados
- [ ] Parcialidad de entregas
- [ ] Listado de pendientes
- [ ] Recordatorio de entrega
- [ ] Conversión a venta
- [ ] Devolución de señas
- [ ] Pedido online integrado

#### 1.6 Formas de Pago
- [ ] Efectivo
- [ ] Tarjeta de débito
- [ ] Tarjeta de crédito
  - Mismo precio
  - Recargo porcentual
  - Cuotas sin interés
  - Cuotas con interés
- [ ] Transferencia bancaria
- [ ] Cheques
  - Propios
  - De terceros
  - Diferidos
- [ ] Crédito en sucursal
- [ ] Mixto (múltiples formas)
- [ ] Criptomonedas (opcional)

### 2. Módulo de Inventario

#### 2.1 Productos
- [ ] Alta con asistente
- [ ] Carga masiva desde Excel
- [ ] Código de barras automático
- [ ] Código de barra secundario
- [ ] Múltiples imágenes
- [ ] Categorías y subcategorías
- [ ] Marcas
- [ ] Unidades de medida
  - Unidad
  - Docena
  - Pack
  - Kg
  - Litro
  - Metro
  - Personalizadas
- [ ] Conversiones entre unidades
- [ ] Precios múltiples (lista 1, 2, 3)
- [ ] Precio costo histórico
- [ ] Margen de ganancia
- [ ] Stock mínimo/máximo
- [ ] Punto de reposición
- [ ] Proveedor principal
- [ ] Tiempo de reposición
- [ ] Ubicación en depósito
- [ ] Productos compuestos (kits)
- [ ] Productos compuestos (fórmulas)
- [ ] Impuestos (IVA, percepciones)
- [ ] Productos internos (no vendibles)
- [ ] Productos insumos
- [ ] Productos servicios
- [ ] Control de stock individual
- [ ] Permite stock negativo
- [ ] Publicación en web

#### 2.2 Movimientos de Stock
- [ ] Ingreso por compra
- [ ] Egreso por venta
- [ ] Devolución de cliente
- [ ] Devolución a proveedor
- [ ] Ajuste de ingreso
- [ ] Ajuste de egreso
- [ ] Merma
- [ ] Robo
- [ ] Traslado entre depósitos
- [ ] Producción
- [ ] Desarme
- [ ] Servicio técnico
- [ ] Pedido online
- [ ] Motivo obligatorio
- [ ] Usuario responsable
- [ ] Fecha y hora
- [ ] Saldo anterior/nuevo
- [ ] Costo unitario
- [ ] Costo total
- [ ] Documento relacionado
- [ ] Observaciones
- [ ] Imagen del comprobante

#### 2.3 Stock
- [ ] Stock actual por depósito
- [ ] Stock comprometido
- [ ] Stock en pedido
- [ ] Stock disponible
- [ ] Stock mínimo por producto
- [ ] Alerta de stock bajo
- [ ] Lista de reposición
- [ ] Valorización de stock
- [ ] Rotación de stock
- [ ] Productos sin movimiento
- [ ] Productos más vendidos
- [ ] Estacionalidad

### 3. Módulo de Servicios

#### 3.1 Servicios
- [ ] Servicios principales
- [ ] Subservicios jerárquicos (niveles ilimitados)
- [ ] Precio base
- [ ] Duración estimada
- [ ] Mano de obra incluida
- [ ] Repuestos incluidos
- [ ] Garantía del servicio
- [ ] Imágenes del servicio
- [ ] Descripción detallada
- [ ] Pasos del servicio
- [ ] Tiempo estimado
- [ ] Complejidad
- [ ] Herramientas necesarias
- [ ] Repuestos habituales
- [ ] Técnico especializado
- [ ] Público en web

#### 3.2 Órdenes de Servicio
- [ ] Número correlativo
- [ ] Datos del cliente
- [ ] Datos del producto
  - Marca
  - Modelo
  - Número de serie
  - Color
  - Accesorios
  - Falla reportada
  - Observaciones
- [ ] Diagnóstico
- [ ] Presupuesto asociado
- [ ] Aprobación del cliente
  - Firma digital
  - Firma en pantalla
  - Email
  - WhatsApp
- [ ] Trabajo realizado
- [ ] Repuestos utilizados
- [ ] Mano de obra
- [ ] Tiempo dedicado
- [ ] Técnico interviniente
- [ ] Estados personalizables
- [ ] Historial de estados
- [ ] Tiempos por estado
- [ ] Fotografías del antes/después
- [ ] Presupuesto para aprobación
- [ ] Autorización de presupuesto
- [ ] Orden de compra asociada
- [ ] Garantía del servicio
- [ ] Encuesta de satisfacción
- [ ] Recordatorio de mantenimiento

#### 3.3 Seguimiento
- [ ] Timeline del servicio
- [ ] Tiempos reales vs estimados
- [ ] Costos reales vs presupuestado
- [ ] Rentabilidad del servicio
- [ ] Eficiencia del técnico
- [ ] Repuestos más usados
- [ ] Fallas más comunes
- [ ] Tiempo promedio de reparación
- [ ] Tasa de retorno por garantía

### 4. Módulo de Clientes

#### 4.1 Datos del Cliente
- **Personas Físicas**:
  - [ ] Nombre y apellido
  - [ ] Fecha de nacimiento
  - [ ] DNI/CUIL
  - [ ] CUIT (monotributistas/autónomos)
  - [ ] Estado civil
  - [ ] Género
  - [ ] Profesión
  - [ ] Lugar de trabajo
  - [ ] Antigüedad laboral
  - [ ] Ingresos mensuales
  
- **Personas Jurídicas**:
  - [ ] Razón social
  - [ ] Nombre de fantasía
  - [ ] CUIT
  - [ ] Condición IVA
  - [ ] Datos de contacto
  - [ ] Persona de contacto
  - [ ] Cargo
  - [ ] Email de contacto
  - [ ] Teléfonos

- **Contacto**:
  - [ ] Email principal
  - [ ] Email secundario
  - [ ] Teléfono fijo
  - [ ] Celular
  - [ ] WhatsApp
  - [ ] Dirección completa
  - [ ] Localidad
  - [ ] Provincia
  - [ ] Código postal
  - [ ] País
  - [ ] Latitud/longitud
  - [ ] Referencia

#### 4.2 Gestión de Clientes
- [ ] Alta, baja, modificación
- [ ] Búsqueda avanzada
- [ ] Filtros múltiples
- [ ] Historial de compras
- [ ] Historial de pagos
- [ ] Saldos pendientes
- [ ] Límite de crédito
- [ ] Cupo disponible
- [ ] Lista negra SET
- [ ] Bloqueos
- [ ] Observaciones
- [ ] Archivos adjuntos
- [ ] Documentos relacionados
- [ ] Comunicaciones
- [ ] Recordatorios
- [ ] Tareas pendientes
- [ ] Segmentación
- [ ] Etiquetado
- [ ] Calificación

#### 4.3 Crédito
- [ ] Cupo de crédito
- [ ] Saldo pendiente
- [ ] Límite de crédito negro
- [ ] Saldo en crédito negro
- [ ] Historial crediticio
- [ ] Calificación de riesgo
- [ ] Planes de pago
- [ ] Cuotas vencidas
- [ ] Gestión de cobranza
- [ ] Acuerdos de pago
- [ ] Refinanciaciones
- [ ] Castigos
- [ ] Juicios

#### 4.4 Fidelización
- [ ] Puntos acumulados
- [ ] Puntos disponibles
- [ ] Puntos vencidos
- [ ] Historial de puntos
- [ ] Canje de puntos
- [ ] Niveles de cliente
- [ ] Beneficios por nivel
- [ ] Promociones personalizadas
- [ ] Descuentos por volumen
- [ ] Descuentos por fidelidad
- [ ] Cumpleaños
- [ ] Aniversarios
- [ ] Fechas especiales

### 5. Módulo de Proveedores

- [ ] ABM completo
- [ ] Listas de precios por proveedor
- [ ] Compras
- [ ] Órdenes de compra
- [ ] Recepción de productos
- [ ] Control de calidad
- [ ] Devoluciones a proveedores
- [ ] Deudas y pagos
- [ ] Crédito del proveedor
- [ ] Historial de compras
- [ ] Evaluación de proveedores
- [ ] Tiempos de entrega
- [ ] Calidad de productos
- [ ] Incidencias
- [ ] Contactos múltiples
- [ ] Múltiples sucursales
- [ ] Acuerdos comerciales
- [ ] Descuentos por volumen
- [ ] Bonificaciones
- [ ] Estadísticas de compras

### 6. Facturación e Impresión

#### 6.1 Tickets
- [ ] Tickets térmicos 58mm
- [ ] Tickets térmicos 80mm
- [ ] Ticket A4
- [ ] Ticket A5
- [ ] Diseño personalizable
- [ ] Logo del negocio
- [ ] Datos fiscales
- [ ] Detalle de productos
- [ ] Formas de pago
- [ ] Vuelto
- [ ] Mensaje de agradecimiento
- [ ] Código QR
- [ ] Código de barras
- [ ] Doble faz
- [ ] Copias (original, copia)
- [ ] Reimpresión
- [ ] Contador de impresiones
- [ ] Previsualización
- [ ] Exportar a PDF
- [ ] Enviar por email
- [ ] Enviar por WhatsApp

#### 6.2 Facturación Electrónica (AFIP)
- [ ] Factura A
- [ ] Factura B
- [ ] Factura C
- [ ] Factura M
- [ ] Ticket factura
- [ ] Nota de crédito
- [ ] Nota de débito
- [ ] Remito
- [ ] Presupuesto
- [ ] CAE
- [ ] Vencimiento de CAE
- [ ] Libros digitales
- [ ] Integración con AFIP
- [ ] Validación de comprobantes
- [ ] Consulta de estado
- [ ] Anulación de comprobantes
- [ ] Consulta de puntos de venta
- [ ] Consulta de tipos de comprobante
- [ ] Tablas de AFIP actualizadas

#### 6.3 Otros Comprobantes
- [ ] Presupuesto
- [ ] Pedido
- [ ] Remito
- [ ] Orden de servicio
- [ ] Ticket de servicio
- [ ] Vale de caja
- [ ] Recibo
- [ ] Nota de cargo
- [ ] Nota de abono
- [ ] Carta documento interna
- [ ] Acuse de recibo

### 7. Módulo Online

#### 7.1 Menú Online
- [ ] Catálogo de productos
- [ ] Filtros por categoría
- [ ] Filtros por precio
- [ ] Búsqueda
- [ ] Fotos de productos
- [ ] Descripción detallada
- [ ] Stock en tiempo real
- [ ] Precios actualizados
- [ ] Ofertas destacadas
- [ ] Productos nuevos
- [ ] Más vendidos
- [ ] Combinaciones
- [ ] Adicionales
- [ ] Carrito de compras
- [ ] Pedido mínimo
- [ ] Costo de envío
- [ ] Envío gratis por monto
- [ ] Retiro en local
- [ ] Delivery
- [ ] Zonas de reparto
- [ ] Horarios de atención
- [ ] Feriados
- [ ] Tiempos de entrega
- [ ] Seguimiento de pedido
- [ ] Historial de pedidos
- [ ] Pedidos frecuentes
- [ ] Favoritos
- [ ] Lista de compras
- [ ] Recordatorios
- [ ] Notificaciones push
- [ ] Valoración de productos
- [ ] Comentarios
- [ ] Compartir en redes
- [ ] Cupones de descuento
- [ ] Códigos promocionales
- [ ] Programa de fidelidad
- [ ] Puntos por compra
- [ ] Niveles de cliente
- [ ] Beneficios por nivel
- [ ] Invitar amigos
- [ ] Bono por referido
- [ ] Encuestas
- [ ] Atención al cliente
- [ ] Chat online
- [ ] WhatsApp directo
- [ ] Preguntas frecuentes
- [ ] Términos y condiciones
- [ ] Política de privacidad
- [ ] Libro de reclamaciones

#### 7.2 Pedidos Online
- [ ] Alta de pedido
- [ ] Confirmación automática
- [ ] Asignación de repartidor
- [ ] Seguimiento en tiempo real
- [ ] Notificaciones al cliente
- [ ] Notificaciones al local
- [ ] Historial de pedidos
- [ ] Estadísticas de pedidos
- [ ] Tiempos de entrega
- [ ] Calificación del servicio
- [ ] Reclamos
- [ ] Devoluciones
- [ ] Cambios
- [ ] Reposición
- [ ] Facturación
- [ ] Comprobantes
- [ ] Historial de facturación

### 8. Reportes

#### 8.1 Ventas
- [ ] Ventas por período
- [ ] Ventas por vendedor
- [ ] Ventas por cliente
- [ ] Ventas por producto
- [ ] Ventas por categoría
- [ ] Ventas por marca
- [ ] Ventas por forma de pago
- [ ] Ventas por tipo de comprobante
- [ ] Ventas por sucursal
- [ ] Ventas por depósito
- [ ] Ventas por zona
- [ ] Ventas por franja horaria
- [ ] Ticket promedio
- [ ] Cantidad de ventas
- [ ] Importe total
- [ ] Ganancia total
- [ ] Margen promedio
- [ ] Descuentos otorgados
- [ ] Recargos aplicados
- [ ] Devoluciones
- [ ] Anulaciones
- [ ] Comparativo períodos
- [ ] Tendencia
- [ ] Proyecciones
- [ ] Estacionalidad
- [ ] Productos estrella
- [ ] Productos perdedores
- [ ] Productos sin salida
- [ ] Cross-selling
- [ ] Up-selling

#### 8.2 Stock
- [ ] Stock actual
- [ ] Stock valorizado
- [ ] Stock mínimo
- [ ] Stock máximo
- [ ] Reposición sugerida
- [ ] Productos sin movimiento
- [ ] Productos más vendidos
- [ ] Rotación de stock
- [ ] Quiebres de stock
- [ ] Excesos de stock
- [ ] Stock comprometido
- [ ] Stock en pedido
- [ ] Stock disponible
- [ ] Diferencias de inventario
- [ ] Ajustes realizados
- [ ] Mermas
- [ ] Vencimientos
- [ ] Productos próximos a vencer
- [ ] Productos vencidos
- [ ] Inventario físico
- [ ] Inventario valorizado
- [ ] Costo de reposición
- [ ] Precio de reposición
- [ ] Variación de costos
- [ ] Variación de precios

#### 8.3 Clientes
- [ ] Cantidad de clientes
- [ ] Altas de clientes
- [ ] Bajas de clientes
- [ ] Clientes activos
- [ ] Clientes inactivos
- [ ] Clientes por categoría
- [ ] Clientes por segmento
- [ ] Clientes por localidad
- [ ] Clientes por provincia
- [ ] Top clientes por compra
- [ ] Top clientes por frecuencia
- [ ] Ticket promedio por cliente
- [ ] Frecuencia de compra
- [ ] Antigüedad del cliente
- [ ] Ciclo de vida del cliente
- [ ] Tasa de retención
- [ ] Tasa de abandono
- [ ] Clientes recuperados
- [ ] Clientes perdidos
- [ ] Valor de vida del cliente
- [ ] Costo de adquisición
- [ ] Rentabilidad por cliente
- [ ] Saldos pendientes
- [ ] Antigüedad de deuda
- [ ] Gestión de cobranza
- [ ] Efectividad de cobranza

#### 8.4 Proveedores
- [ ] Compras por proveedor
- [ ] Compras por producto
- [ ] Compras por período
- [ ] Deuda con proveedores
- [ ] Antigüedad de deuda
- [ ] Descuentos obtenidos
- [ ] Bonificaciones
- [ ] Devoluciones a proveedores
- [ ] Tiempos de entrega
- [ ] Calidad de productos
- [ ] Incidencias
- [ ] Evaluación de proveedores
- [ ] Ranking de proveedores
- [ ] Proveedores activos
- [ ] Proveedores inactivos
- [ ] Nuevos proveedores
- [ ] Proveedores dados de baja
- [ ] Comparación de precios
- [ ] Evolución de precios
- [ ] Dependencia de proveedores
- [ ] Proveedor alternativo
- [ ] Stock en tránsito
- [ ] Pedidos pendientes
- [ ] Órdenes de compra
- [ ] Recepciones
- [ ] Control de calidad

#### 8.5 Servicios
- [ ] Servicios realizados
- [ ] Servicios por técnico
- [ ] Servicios por tipo
- [ ] Servicios por estado
- [ ] Tiempo promedio de reparación
- [ ] Tasa de éxito
- [ ] Tasa de retorno
- [ ] Garantías
- [ ] Ingresos por servicios
- [ ] Rentabilidad por servicio
- [ ] Repuestos más usados
- [ ] Fallas más comunes
- [ ] Tiempo de espera
- [ ] Satisfacción del cliente
- [ ] Ingresos por técnico
- [ ] Eficiencia de técnicos
- [ ] Productividad
- [ ] Servicios pendientes
- [ ] Servicios en garantía
- [ ] Servicios cancelados
- [ ] Presupuesto vs real
- [ ] Margen por servicio
- [ ] Servicios repetidos
- [ ] Servicios por origen
- [ ] Servicios por marca
- [ ] Servicios por modelo
- [ ] Servicios por antigüedad
- [ ] Servicios por valor
- [ ] Servicios por complejidad

#### 8.6 Caja
- [ ] Ingresos
- [ ] Egresos
- [ ] Saldo inicial
- [ ] Saldo final
- [ ] Saldo por forma de pago
- [ ] Arqueos de caja
- [ ] Diferencias de caja
- [ ] Fondos fijos
- [ ] Movimientos de caja
- [ ] Transferencias
- [ ] Vales de caja
- [ ] Gastos
- [ ] Pagos a proveedores
- [ ] Cobros de clientes
- [ ] Retiros
- [ ] Ingresos
- [ ] Gastos varios
- [ ] Gastos fijos
- [ ] Gastos variables
- [ ] Punto de equilibrio
- [ ] Flujo de caja
- [ ] Proyección de caja
- [ ] Necesidad de financiamiento
- [ ] Excedentes de caja
- [ ] Inversiones
- [ ] Préstamos
- [ ] Cuotas de préstamos
- [ ] Intereses
- [ ] Amortizaciones

#### 8.7 Créditos
- [ ] Créditos por cobrar
- [ ] Créditos vencidos
- [ ] Antigüedad de deuda
- [ ] Gestión de cobranza
- [ ] Efectividad de cobranza
- [ ] Castigos
- [ ] Recuperaciones
- [ ] Planes de pago
- [ ] Cuotas vencidas
- [ ] Cuotas por vencer
- [ ] Intereses de mora
- [ ] Recargos
- [ ] Descuentos por pronto pago
- [ ] Refinanciaciones
- [ ] Acuerdos de pago
- [ ] Juicios
- [ ] Embargos
- [ ] Garantías
- [ ] Avalistas
- [ ] Código de crédito
- [ ] Líneas de crédito
- [ ] Cupos utilizados
- [ ] Cupos disponibles
- [ ] Límites de crédito
- [ ] Excesos de crédito
- [ ] Morosidad
- [ ] Índice de morosidad
- [ ] Evolución de la morosidad
- [ ] Provisión por incobrables
- [ ] Recuperación de incobrables

#### 8.8 Créditos Negros
- [ ] Créditos negros por tipo
- [ ] Créditos negros por cliente
- [ ] Créditos negros por período
- [ ] Créditos negros por vendedor
- [ ] Créditos negros por sucursal
- [ ] Créditos negros por monto
- [ ] Créditos negros por vencimiento
- [ ] Créditos negros por estado
- [ ] Créditos negros por origen
- [ ] Créditos negros por destino
- [ ] Créditos negros por concepto
- [ ] Créditos negros por garantía
- [ ] Créditos negros por aval
- [ ] Créditos negros por seguro
- [ ] Créditos negros por póliza
- [ ] Créditos negros por cobertura
- [ ] Créditos negros por prima
- [ ] Créditos negros por comisión
- [ ] Créditos negros por corretaje
- [ ] Créditos negros por honorario
- [ ] Créditos negros por impuesto
- [ ] Créditos negros por tasa
- [ ] Créditos negros por arancel
- [ ] Créditos negros por contribución
- [ ] Créditos negros por aporte
- [ ] Créditos negros por cotización
- [ ] Créditos negros por cuota
- [ ] Créditos negros por canon
- [ ] Créditos negros por regalía
- [ ] Créditos negros por derecho
- [ ] Créditos negros por licencia
- [ ] Créditos negros por permiso
- [ ] Créditos negros por autorización
- [ ] Créditos negros por habilitación
- [ ] Créditos negros por habilitación
- [ ] Créditos negros por certificación
- [ ] Créditos negros por acreditación
- [ ] Créditos negros por validación
- [ ] Créditos negros por verificación
- [ ] Créditos negros por auditoría
- [ ] Créditos negros por inspección
- [ ] Créditos negros por revisión
- [ ] Créditos negros por control
- [ ] Créditos negros por fiscalización
- [ ] Créditos negros por supervisión
- [ ] Créditos negros por vigilancia
- [ ] Créditos negros por monitoreo
- [ ] Créditos negros por seguimiento
- [ ] Créditos negros por evaluación
- [ ] Créditos negros por medición
- [ ] Créditos negros por cuantificación
- [ ] Créditos negros por ponderación
- [ ] Créditos negros por estimación
- [ ] Créditos negros por cálculo
- [ ] Créditos negros por cómputo
- [ ] Créditos negros por recuento
- [ ] Créditos negros por balance
- [ ] Créditos negros por balanceo
- [ ] Créditos negros por nivelación
- [ ] Créditos negros por compensación
- [ ] Créditos negros por regularización
- [ ] Créditos negros por normalización
- [ ] Créditos negros por estandarización
- [ ] Créditos negros por homologación
- [ ] Créditos negros por unificación
- [ ] Créditos negros por consolidación
- [ ] Créditos negros por integración
- [ ] Créditos negros por síntesis
- [ ] Créditos negros por resumen
- [ ] Créditos negros por extracto
- [ ] Créditos negros por detalle
- [ ] Créditos negros por pormenor
- [ ] Créditos negros por menor
- [ ] Créditos negros por mayor
- [ ] Créditos negros por total
- [ ] Créditos negros por parcial
- [ ] Créditos negros por subtotal
- [ ] Créditos negros por global
- [ ] Créditos negros por general
- [ ] Créditos negros por específico
- [ ] Créditos negros por particular
- [ ] Créditos negros por especial
- [ ] Créditos negros por extraordinario
- [ ] Créditos negros por común
- [ ] Créditos negros por corriente
- [ ] Créditos negros por habitual
- [ ] Créditos negros por frecuente
- [ ] Créditos negros por ocasional
- [ ] Créditos negros por esporádico
- [ ] Créditos negros por eventual
- [ ] Créditos negros por accidental
- [ ] Créditos negros por fortuito
- [ ] Créditos negros por imprevisto
- [ ] Créditos negros por inesperado
- [ ] Créditos negros por sorpresivo
- [ ] Créditos negros por repentino
- [ ] Créditos negros por súbito
- [ ] Créditos negros por brusco
- [ ] Créditos negros por abrupto
- [ ] Créditos negros por intempestivo
- [ ] Créditos negros por inopinado
- [ ] Créditos negros por imprevisto
- [ ] Créditos negros por casual
- [ ] Créditos negros por aleatorio
- [ ] Créditos negros por incierto
- [ ] Créditos negros por dudoso
- [ ] Créditos negros por problemático
- [ ] Créditos negros por conflictivo
- [ ] Créditos negros por complicado
- [ ] Créditos negros por difícil
- [ ] Créditos negros por arduo
- [ ] Créditos negros por duro
- [ ] Créditos negros por trabajoso
- [ ] Créditos negros por laborioso
- [ ] Créditos negros por penoso
- [ ] Créditos negros por fatigoso
- [ ] Créditos negros por agotador
- [ ] Créditos negros por extenuante
- [ ] Créditos negros por pesado
- [ ] Créditos negros por cargante
- [ ] Créditos negros por molesto
- [ ] Créditos negros por incómodo
- [ ] Créditos negros por desagradable
- [ ] Créditos negros por ingrato
- [ ] Créditos negros por adverso
- [ ] Créditos negros por contrario
- [ ] Créditos negros por opuesto
- [ ] Créditos negros por inverso
- [ ] Créditos negros por reverso
- [ ] Créditos negros por anverso
- [ ] Créditos negros por reverso
- [ ] Créditos negros por envés
- [ ] Créditos negros por haz
- [ ] Créditos negros por derecho
- [ ] Créditos negros por revés
- [ ] Créditos negros por vuelta
- [ ] Créditos negros por ciclo
- [ ] Créditos negros por bucle
- [ ] Créditos negros por círculo
- [ ] Créditos negros por circunferencia
- [ ] Créditos negros por perímetro
- [ ] Créditos negros por contorno
- [ ] Créditos negros por borde
- [ ] Créditos negros por orilla
- [ ] Créditos negros por margen
- [ ] Créditos negros por límite
- [ ] Créditos negros por frontera