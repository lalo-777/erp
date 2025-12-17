# Purchase Orders Module - Database Migration Notes

## Resumen de Cambios

Se ajustó el módulo de Purchase Orders para usar la estructura de base de datos existente en lugar de crear tablas duplicadas.

## Estructura de Base de Datos Existente

### Tabla: `purchase_orders`
```sql
- id (INT UNSIGNED, PK, AUTO_INCREMENT)
- po_number (VARCHAR(50), UNIQUE) -- Número de orden
- supplier_id (INT UNSIGNED) -- FK a tabla suppliers
- project_id (INT UNSIGNED, nullable) -- FK a tabla projects
- po_status_id (TINYINT UNSIGNED) -- FK a cat_purchase_order_statuses
- order_date (DATE)
- expected_delivery_date (DATE, nullable)
- actual_delivery_date (DATE, nullable)
- subtotal (DECIMAL(13,2))
- tax_amount (DECIMAL(13,2))
- total_amount (DECIMAL(13,2))
- notes (TEXT, nullable)
- created_by (SMALLINT UNSIGNED)
- modified_by (SMALLINT UNSIGNED)
- created_date (DATETIME)
- modified_date (DATETIME)
- is_active (BOOLEAN) -- NUEVO CAMPO AGREGADO
```

### Tabla: `purchase_order_items`
```sql
- id (INT UNSIGNED, PK, AUTO_INCREMENT)
- purchase_order_id (INT UNSIGNED) -- FK a purchase_orders
- material_id (INT UNSIGNED) -- FK a materials
- quantity (DECIMAL(10,2))
- unit_price (DECIMAL(13,2))
- amount (DECIMAL(13,2)) -- Subtotal del item (quantity * unit_price)
- received_quantity (DECIMAL(10,2)) -- NUEVO CAMPO AGREGADO
- created_date (DATETIME) -- NUEVO CAMPO AGREGADO
```

### Tabla: `suppliers`
```sql
- id (INT UNSIGNED, PK, AUTO_INCREMENT)
- supplier_name (VARCHAR(255))
- supplier_category_id (TINYINT UNSIGNED)
- contact_name (VARCHAR(255), nullable)
- phone (VARCHAR(15), nullable)
- email (VARCHAR(255), nullable)
- address (TEXT, nullable)
- payment_terms (VARCHAR(100), nullable)
- created_by (SMALLINT UNSIGNED)
- modified_by (SMALLINT UNSIGNED)
- created_date (DATETIME)
- modified_date (DATETIME)
- is_active (BOOLEAN)
```

## Campos Nuevos Agregados

El script `purchase_orders.sql` solo agrega los campos faltantes:

1. **purchase_orders.is_active**: Para soft delete
2. **purchase_order_items.received_quantity**: Para tracking de cantidades recibidas
3. **purchase_order_items.created_date**: Para auditoría

## Estados de Purchase Orders

La tabla `cat_purchase_order_statuses` incluye:

| ID | Name | Alias |
|----|------|-------|
| 1 | Draft | draft |
| 2 | Pending Approval | pending |
| 3 | Approved | approved |
| 4 | Partially Received | partial |
| 5 | Received | received |
| 6 | Cancelled | cancelled |

## Flujo de Trabajo

```
Draft (1)
  ↓
Pending Approval (2)
  ↓
Approved (3)
  ↓
Partially Received (4)
  ↓
Received (5)

(En cualquier momento antes de Received)
  ↓
Cancelled (6)
```

## Cambios Realizados en el Código

### Backend Models
- ✅ `PurchaseOrder.ts` - Usa campos de la tabla existente
- ✅ `PurchaseOrderItem.ts` - Usa campos de la tabla existente
- ✅ `Supplier.ts` - Nuevo modelo creado

### Backend Controllers
- ✅ `purchase-orders.controller.ts` - Actualizado para usar nombres de campos correctos
  - Usa `po_number` en lugar de `purchase_order_number`
  - Usa `po_status_id` en lugar de `status_id`
  - Usa `amount` en lugar de `subtotal` en items
  - Join con tabla `suppliers` usando `supplier_id`

### Frontend Models
- ✅ `purchase-order.model.ts` - Interfaces actualizadas con nombres correctos
- ✅ Funciones helper mantienen misma funcionalidad

### Frontend Components
- ✅ Dashboard - Usa `po_number` en lugar de `purchase_order_number`
- ✅ Detail - Usa campos correctos en toda la página
- ✅ Service - Retorna `po_number` en respuesta de creación

## Instrucciones de Migración

1. **Ejecutar el script SQL** (si es necesario):
   ```bash
   mysql -u usuario -p nombre_bd < backend/sql/purchase_orders.sql
   ```

2. **Verificar que los modelos de Sequelize estén sincronizados** con la estructura real de la base de datos.

3. **No es necesario** crear las tablas `purchase_orders`, `purchase_order_items` o `suppliers` ya que existen en el schema original.

## Notas Importantes

- ⚠️ La tabla `suppliers` es independiente y puede ser gestionada por su propio módulo
- ⚠️ El campo `project_id` en purchase_orders es opcional
- ⚠️ El campo `supplier_id` es requerido y debe existir en la tabla `suppliers`
- ⚠️ Los campos `amount` en items se calculan automáticamente: `quantity * unit_price`
- ⚠️ El campo `is_active` permite soft delete sin afectar integridad referencial

## Testing

Después de migrar, verificar:

1. ✅ Creación de purchase orders con items
2. ✅ Actualización de purchase orders (solo en estado Draft/Pending)
3. ✅ Cambio de estado (Draft → Pending → Approved)
4. ✅ Recepción de materiales con actualización de stock
5. ✅ Recepción parcial de materiales
6. ✅ Estadísticas del dashboard
7. ✅ Soft delete de purchase orders

## Fecha de Actualización

2025-12-16
