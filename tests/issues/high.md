# Issues HIGH

**Severidad:** HIGH - Bloquean funcionalidades principales

---

## Estado

**Total Issues:** 5
**Abiertos:** 0
**En Progreso:** 0
**Corregidos:** 5
**Verificados:** 5

---

## Issue #001

**Módulo:** Authentication
**Severidad:** HIGH
**Tipo:** Backend
**Estado:** ✔️ Verificado

### Descripción
El endpoint `/api/auth/me` no existe pero es referenciado en la documentación y en los tests. Este endpoint es crítico para que el frontend pueda obtener información del usuario actual autenticado.

### Pasos para Reproducir
1. Hacer login exitoso
2. Obtener token JWT
3. Hacer request a GET /api/auth/me con token en header

```bash
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer [token]"
```

### Comportamiento Esperado
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "admin@erp.com",
    "username": "Administrator",
    "role_id": 1
  }
}
```

### Comportamiento Actual
```json
{
  "success": false,
  "message": "Route /api/auth/me not found"
}
```

### Error/Stack Trace
N/A - Ruta no implementada

### Archivos Afectados
- `backend/src/routes/auth.routes.ts` - Falta definir ruta
- `backend/src/controllers/auth.controller.ts` - Falta implementar método

### Solución Propuesta
Implementar el endpoint /api/auth/me en el controller y routes de auth

### Solución Implementada
1. Agregada función `getCurrentUser` en `backend/src/controllers/auth.controller.ts`
2. Agregada ruta `GET /me` en `backend/src/routes/auth.routes.ts` con middleware `authenticate`
3. Endpoint retorna correctamente información del usuario autenticado

### Fecha Identificado
2025-12-17

### Fecha Corregido
2025-12-17

### Fecha Verificado
2025-12-17

### Test de Verificación
```bash
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer [token]"
```

**Resultado:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "admin@erp.com",
    "username": "Administrator",
    "lastname": "System User",
    "role_id": 1,
    "person_id": 1,
    "is_active": true
  }
}
```

---

## Issue #002

**Módulo:** Labor/Mano de Obra
**Severidad:** HIGH
**Tipo:** Backend - SQL Error
**Estado:** ✔️ Verificado

### Descripción
El endpoint GET `/api/labor` falla con error SQL: "Unknown column 'p.project_code' in 'field list'". Esto indica que la query SQL está intentando acceder a una columna `project_code` en la tabla `projects` que NO existe en el schema real de la base de datos.

### Pasos para Reproducir
```bash
curl http://localhost:3001/api/labor \
  -H "Authorization: Bearer [token]"
```

### Comportamiento Esperado
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "timesheet_code": "TS-000001",
      "worker_name": "...",
      ...
    }
  ]
}
```

### Comportamiento Actual (ANTES)
```json
{
  "success": false,
  "message": "Failed to retrieve timesheets",
  "error": "Unknown column 'p.project_code' in 'field list'"
}
```

### Error/Stack Trace
```
Unknown column 'p.project_code' in 'field list'
```

### Archivos Afectados
- `backend/src/controllers/labor.controller.ts:52` - getAllTimesheets query
- `backend/src/controllers/labor.controller.ts:116` - getTimesheetById query
- `backend/src/controllers/labor.controller.ts:199` - getLaborStats query

### Solución Propuesta
Revisar el controller de labor y cambiar todas las referencias de `project_code` a `project_number` en las queries SQL. El schema real usa `project_number` no `project_code`.

### Solución Implementada
Cambiadas todas las referencias de `p.project_code` a `p.project_number` en 3 queries SQL del archivo `backend/src/controllers/labor.controller.ts`:
1. Línea 52: getAllTimesheets - `p.project_code` → `p.project_number`
2. Línea 116: getTimesheetById - `p.project_code` → `p.project_number`
3. Línea 199 y 206: getLaborStats - `p.project_code` → `p.project_number` (SELECT y GROUP BY)

### Fecha Identificado
2025-12-17

### Fecha Corregido
2025-12-17

### Fecha Verificado
2025-12-17

### Test de Verificación
```bash
curl http://localhost:3001/api/labor \
  -H "Authorization: Bearer [token]"
```

**Resultado:**
```json
{
  "success": true,
  "data": [{
    "id": 1,
    "timesheet_code": "TS-000001",
    "worker_name": "asdf",
    "project_id": 1,
    "project_name": "sdfsd",
    "project_number": "PRJ-000001",
    ...
  }]
}
```

✅ **Endpoint funciona correctamente**

---

## Issue #003

**Módulo:** Warehouse/Almacén
**Severidad:** HIGH
**Tipo:** Backend - Ruta no implementada
**Estado:** ✔️ Verificado

### Descripción
El endpoint base `/api/warehouse` no existe. La ruta no está implementada o no está registrada correctamente en el servidor.

### Pasos para Reproducir
```bash
curl http://localhost:3001/api/warehouse/locations \
  -H "Authorization: Bearer [token]"
```

### Comportamiento Esperado
Debería retornar lista de ubicaciones de almacén o algún endpoint válido.

### Comportamiento Actual (ANTES)
```json
{
  "success": false,
  "message": "Route /api/warehouse not found"
}
```

### Error/Stack Trace
Route not found

### Archivos Afectados
- `backend/src/server.ts:20,58` - Ruta ya estaba importada y registrada correctamente
- `backend/src/routes/warehouse.routes.ts` - Archivo existe y está correctamente configurado

### Solución Propuesta
1. Verificar que `warehouse.routes.ts` existe y está bien configurado
2. Verificar que está importado en `server.ts`
3. Verificar que está registrado: `app.use('/api/warehouse', warehouseRoutes)`

### Solución Implementada
**Issue no era de código - La ruta YA estaba correctamente implementada.**

Verificación:
- ✅ `backend/src/routes/warehouse.routes.ts` existe con 7 rutas definidas
- ✅ `backend/src/controllers/warehouse.controller.ts` existe con todas las funciones implementadas
- ✅ `backend/src/server.ts:20` importa `warehouseRoutes`
- ✅ `backend/src/server.ts:58` registra `app.use('/api/warehouse', warehouseRoutes)`

El problema era que el servidor necesitaba reiniciarse para cargar los cambios. Después de reiniciar, todos los endpoints funcionan correctamente.

### Fecha Identificado
2025-12-17

### Fecha Verificado
2025-12-17

### Test de Verificación
```bash
curl http://localhost:3001/api/warehouse/locations \
  -H "Authorization: Bearer [token]"
```

**Resultado:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Main Warehouse",
      "alias": "main",
      "address": "Central warehouse location",
      "materials_count": 0,
      "total_quantity": "0.00"
    },
    {
      "id": 2,
      "name": "Site A",
      "alias": "site_a",
      "address": "Construction site A storage",
      "materials_count": 0,
      "total_quantity": "0.00"
    },
    {
      "id": 3,
      "name": "Site B",
      "alias": "site_b",
      "address": "Construction site B storage",
      "materials_count": 0,
      "total_quantity": "0.00"
    }
  ]
}
```

✅ **Endpoint funciona correctamente**

---

## Issue #004

**Módulo:** Fuel Requisitions/Combustible
**Severidad:** HIGH
**Tipo:** Backend - SQL Error
**Estado:** ✔️ Verificado

### Descripción
El endpoint GET `/api/fuel-requisitions` falla con el MISMO error SQL que Labor: "Unknown column 'p.project_code' in 'field list'". Mismo problema de discrepancia entre código y schema real de base de datos.

### Pasos para Reproducir
```bash
curl http://localhost:3001/api/fuel-requisitions \
  -H "Authorization: Bearer [token]"
```

### Comportamiento Esperado
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "requisition_code": "FR-000001",
      ...
    }
  ]
}
```

### Comportamiento Actual (ANTES)
```json
{
  "success": false,
  "message": "Failed to retrieve fuel requisitions",
  "error": "Unknown column 'p.project_code' in 'field list'"
}
```

### Error/Stack Trace
```
Unknown column 'p.project_code' in 'field list'
```

### Archivos Afectados
- `backend/src/controllers/fuel-requisitions.controller.ts:58` - getAllRequisitions query
- `backend/src/controllers/fuel-requisitions.controller.ts:125` - getRequisitionById query
- `backend/src/controllers/fuel-requisitions.controller.ts:214,221` - getFuelStats query
- `backend/src/controllers/fuel-requisitions.controller.ts:287,291` - getConsumptionReport query

### Solución Propuesta
Cambiar `p.project_code` por `p.project_number` en todas las queries SQL del controller.

**Nota:** Este es el MISMO error que Issue #002 (Labor). Parece un problema sistemático donde múltiples controllers usan `project_code` cuando deberían usar `project_number`.

### Solución Implementada
Cambiadas todas las referencias de `p.project_code` a `p.project_number` en 4 queries SQL del archivo `backend/src/controllers/fuel-requisitions.controller.ts`:
1. Línea 58: getAllRequisitions - `p.project_code` → `p.project_number`
2. Línea 125: getRequisitionById - `p.project_code` → `p.project_number`
3. Línea 214 y 221: getFuelStats - `p.project_code` → `p.project_number` (SELECT y GROUP BY)
4. Línea 287 y 291: getConsumptionReport - `p.project_code` → `p.project_number` (SELECT y GROUP BY)

### Búsqueda Preventiva Realizada
Se hizo búsqueda global de `project_code` en todos los controllers:
```bash
grep -r "project_code" backend/src/controllers/
```
**Resultado:** No se encontraron más ocurrencias. ✅ Todos los casos corregidos.

### Fecha Identificado
2025-12-17

### Fecha Corregido
2025-12-17

### Fecha Verificado
2025-12-17

### Test de Verificación
```bash
curl http://localhost:3001/api/fuel-requisitions \
  -H "Authorization: Bearer [token]"
```

**Resultado:**
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "currentPage": 1,
    "totalPages": 0,
    "totalItems": 0,
    "itemsPerPage": 10
  }
}
```

✅ **Endpoint funciona correctamente** (array vacío porque no hay datos, pero la query SQL es correcta)

---

## Issue #005

**Módulo:** Warehouse / Inventory Transactions
**Severidad:** HIGH
**Tipo:** Backend - SQL Error
**Estado:** ✔️ Verificado

### Descripción
El endpoint GET `/api/warehouse/transactions` falla con error SQL: "Unknown column 'it.reference_number' in 'field list'". El controller intenta acceder a una columna `reference_number` que NO existe en la tabla `inventory_transactions`.

### Pasos para Reproducir
1. Hacer login con credenciales válidas
2. Navegar a módulo Warehouse en el frontend
3. El frontend llama a `GET /api/warehouse/transactions?page=1&limit=10`
4. Backend retorna error 500

```bash
curl http://localhost:3001/api/warehouse/transactions?page=1&limit=10 \
  -H "Authorization: Bearer [token]"
```

### Comportamiento Esperado
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "currentPage": 1,
    "totalPages": 0,
    "totalItems": 0,
    "itemsPerPage": 10
  }
}
```

### Comportamiento Actual (ANTES)
```json
{
  "success": false,
  "message": "Failed to retrieve transaction history",
  "error": "Unknown column 'it.reference_number' in 'field list'"
}
```

HTTP Status: 500 Internal Server Error

### Error/Stack Trace
```
Unknown column 'it.reference_number' in 'field list'
```

### Archivos Afectados
- `backend/src/controllers/warehouse.controller.ts:428` - SELECT query con `it.reference_number`
- `backend/src/controllers/warehouse.controller.ts:265` - Parámetro `reference_number` en body
- `backend/src/controllers/warehouse.controller.ts:331` - INSERT con `reference_number`

### Schema de Tabla (Dump)
La tabla `inventory_transactions` tiene estas columnas:
- ✅ `transaction_number` (VARCHAR 50)
- ✅ `material_id`
- ✅ `transaction_type_id`
- ✅ `warehouse_location_id`
- ✅ `quantity`
- ✅ `unit_cost`
- ✅ `total_value`
- ✅ `project_id` (nullable)
- ✅ `purchase_order_id` (nullable)
- ✅ `transaction_date`
- ✅ `notes`
- ✅ `created_by`
- ✅ `created_date`
- ❌ **NO tiene `reference_number`**

### Solución Propuesta
Eliminar todas las referencias a `reference_number` del controller porque la columna no existe en la base de datos.

### Solución Implementada
Removidas todas las referencias a `reference_number`:

1. **Línea 428:** Removido `it.reference_number,` del SELECT query
2. **Línea 265:** Removido `reference_number,` de la desestructuración del body
3. **Línea 331:** Removido `reference_number,` del INSERT en InventoryTransaction.create()

**Nota:** La columna `transaction_number` es suficiente para identificar transacciones. No se requiere un campo adicional `reference_number`.

### Fecha Identificado
2025-12-17 (Testing manual frontend)

### Fecha Corregido
2025-12-17

### Fecha Verificado
2025-12-17

### Test de Verificación
```bash
curl "http://localhost:3001/api/warehouse/transactions?page=1&limit=10" \
  -H "Authorization: Bearer [token]"
```

**Resultado:**
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "currentPage": 1,
    "totalPages": 0,
    "totalItems": 0,
    "itemsPerPage": 10
  }
}
```

✅ **Endpoint funciona correctamente**

**Encontrado por:** Testing manual del frontend
**Impacto:** Módulo Warehouse completamente bloqueado hasta la corrección

---

<!-- Template para próximos issues -->
