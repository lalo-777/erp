# Setup y Verificación Inicial

## Objetivo
Verificar que el entorno esté configurado correctamente antes de comenzar las pruebas de los módulos.

---

## Pre-requisitos

- [ ] MySQL Server 8.x instalado y corriendo
- [ ] Node.js 20.x instalado
- [ ] npm instalado
- [ ] Git instalado (opcional)

---

## 1. Verificación de Base de Datos

### 1.1 Conectar a MySQL

```bash
mysql -u root -p
```

**Password:** Ver `D:\erp\servidor\backend\.env` (MYSQL_PASSWORD)

**✅ Esperado:** Conexión exitosa
**❌ Error:** Verificar que MySQL esté corriendo

### 1.2 Verificar Base de Datos Existe

```sql
SHOW DATABASES LIKE 'erp_development';
```

**✅ Esperado:** `erp_development` en la lista
**❌ Error:** Crear base de datos o importar dump

### 1.3 Usar Base de Datos

```sql
USE erp_development;
```

### 1.4 Verificar Tablas

```sql
SHOW TABLES;
```

**✅ Esperado:** 60+ tablas listadas
**Tablas principales esperadas:**
- people
- users
- customers
- invoices
- invoice_items
- projects
- materials
- labor_timesheets
- fuel_requisitions
- purchase_orders
- purchase_order_items
- pre_inventory
- inventory_transactions
- warehouse_reorganization
- files
- notes
- Catálogos (cat_*)

### 1.5 Verificar Catálogos Tienen Datos

```sql
SELECT COUNT(*) FROM cat_roles;
SELECT COUNT(*) FROM cat_states;
SELECT COUNT(*) FROM cat_invoice_types;
SELECT COUNT(*) FROM cat_project_statuses;
SELECT COUNT(*) FROM cat_material_categories;
```

**✅ Esperado:** Cada catálogo tiene al menos 1 registro
**❌ Error:** Ejecutar seeds de catálogos

### 1.6 Verificar Usuario de Prueba Existe

```sql
SELECT id, email, first_name, last_name
FROM users
WHERE email = 'admin@balper.com';
```

**✅ Esperado:** Al menos 1 usuario
**❌ Error:** Crear usuario admin

**Si no existe, crear:**
```bash
cd D:\erp\servidor\backend
npm run create-admin
```

### 1.7 Verificar Foreign Keys

```sql
SELECT
    TABLE_NAME,
    CONSTRAINT_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'erp_development'
  AND REFERENCED_TABLE_NAME IS NOT NULL
LIMIT 20;
```

**✅ Esperado:** Lista de foreign keys
**❌ Error:** Dump no se importó correctamente

### 1.8 Verificar Triggers de Auditoría

```sql
SHOW TRIGGERS LIKE 'invoices';
SHOW TRIGGERS LIKE 'projects';
```

**✅ Esperado:** Triggers de auditoría existen (trg_invoices_audit, trg_projects_audit)
**❌ Error:** Dump incompleto

---

## 2. Verificación del Backend

### 2.1 Verificar .env Existe

```bash
cd D:\erp\servidor\backend
ls .env
```

**✅ Esperado:** Archivo .env existe
**❌ Error:** Copiar de .env.example

**Contenido esperado en .env:**
```
PORT=3001
NODE_ENV=development

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=[tu password]
MYSQL_DATABASE=erp_development

JWT_SECRET=[secret key]
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:4200
```

### 2.2 Instalar Dependencias

```bash
cd D:\erp\servidor\backend
npm install
```

**✅ Esperado:** Instalación exitosa sin errores
**❌ Error:** Revisar package.json, node version

### 2.3 Compilar TypeScript

```bash
npm run build
```

**✅ Esperado:** Compilación exitosa, carpeta `dist/` creada
**❌ Error:** Errores de TypeScript, revisar código

### 2.4 Iniciar Servidor Backend

```bash
npm run dev
```

**✅ Esperado:**
```
========================================
ERP Server running on port 3001
Environment: development
CORS Origin: http://localhost:4200
========================================
Available API Modules:
  ✓ Authentication (/api/auth)
  ✓ Dashboard (/api/dashboard)
  ✓ Customers (/api/customers)
  ... (más módulos)
========================================
```

**❌ Error:** Ver logs de error, verificar DB conexión

**Mantener servidor corriendo en esta terminal**

### 2.5 Verificar Health Check (nueva terminal)

```bash
curl http://localhost:3001/health
```

**✅ Esperado:**
```json
{
  "success": true,
  "message": "ERP Server is running",
  "timestamp": "2025-12-17T...",
  "version": "1.0.0"
}
```

**❌ Error:** Servidor no está corriendo o puerto bloqueado

### 2.6 Verificar Rutas Registradas

Abrir navegador: `http://localhost:3001/`

**✅ Esperado:** Mensaje o 404 (normal)
**❌ Error:** Cannot connect

---

## 3. Verificación del Frontend

### 3.1 Instalar Dependencias

```bash
cd D:\erp\servidor\erp
npm install
```

**✅ Esperado:** Instalación exitosa
**❌ Error:** Revisar package.json, Angular CLI version

### 3.2 Verificar Configuración Proxy (si existe)

```bash
ls proxy.conf.json
```

**Si existe, verificar apunta a http://localhost:3001**

### 3.3 Compilar Aplicación

```bash
npm run build
```

**✅ Esperado:** Build exitoso
**❌ Error:** Errores de TypeScript/Angular, revisar código

### 3.4 Iniciar Servidor Dev

```bash
npm start
```

**✅ Esperado:**
```
** Angular Live Development Server is listening on localhost:4200 **
✔ Compiled successfully.
```

**❌ Error:** Puerto ocupado, errores de compilación

**Mantener servidor corriendo en esta terminal**

### 3.5 Verificar Aplicación Carga

Abrir navegador: `http://localhost:4200`

**✅ Esperado:** Página de login o dashboard carga
**❌ Error:** Página en blanco, errores en consola

### 3.6 Verificar Consola del Navegador

Abrir DevTools (F12) → Console

**✅ Esperado:** Sin errores
**❌ Error:** Errores de JavaScript/Angular

### 3.7 Verificar Llamadas API

En DevTools → Network → Filtrar por XHR/Fetch

Navegar en la app

**✅ Esperado:** Llamadas a http://localhost:3001/api/*
**❌ Error:** CORS errors, 404, 500

---

## 4. Test de Conexión End-to-End

### 4.1 Login Manual

1. Abrir `http://localhost:4200/login`
2. Ingresar credenciales:
   - **Email:** admin@balper.com
   - **Password:** admin123 (o el que esté en DB)
3. Click en "Iniciar Sesión"

**✅ Esperado:** Redirige a dashboard, sin errores
**❌ Error:** Error de login, revisar backend logs

### 4.2 Verificar Token JWT

En DevTools → Application → Local Storage → http://localhost:4200

**✅ Esperado:** Token JWT guardado (key: 'token' o 'authToken')
**❌ Error:** No se guarda token

### 4.3 Navegar por la App

Visitar cada sección del menú:
- Dashboard (/)
- Clientes (/customers)
- Facturas (/invoices)
- Proyectos (/projects)
- Materiales (/materials)
- Mano de Obra (/labor)
- Almacén (/warehouse)
- Pre-Inventario (/pre-inventory)
- Órdenes de Compra (/purchase-orders)
- Combustible (/fuel-requisitions)
- Administración (/admin)

**✅ Esperado:** Cada página carga correctamente
**❌ Error:** Errores 404, componentes no cargan

---

## 5. Verificación de Modelos vs Base de Datos

### 5.1 Comparar Esquema Customers

**Base de Datos:**
```sql
DESCRIBE customers;
```

**Modelo TypeScript:**
```bash
cat D:\erp\servidor\backend\src\models\mysql\Customer.ts
```

**✅ Esperado:** Columnas coinciden exactamente
**❌ Error:** Discrepancia → corregir modelo

**Campos esperados:**
- id (INT UNSIGNED, AUTO_INCREMENT, PRIMARY KEY)
- company_name (VARCHAR(255), NOT NULL)
- rfc (VARCHAR(13), NULL)
- contact_name (VARCHAR(255), NULL)
- contact_phone (VARCHAR(15), NULL)
- contact_email (VARCHAR(255), NULL)
- address (TEXT, NULL)
- city (VARCHAR(100), NULL)
- state_id (SMALLINT UNSIGNED, NULL)
- postal_code (VARCHAR(10), NULL)
- created_by (SMALLINT UNSIGNED, NOT NULL)
- modified_by (SMALLINT UNSIGNED, NOT NULL)
- created_date (DATETIME, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- modified_date (DATETIME, NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE)
- is_active (TINYINT(1), DEFAULT 1)

### 5.2 Comparar Esquema Invoices

```sql
DESCRIBE invoices;
```

**Campos esperados:**
- id
- invoice_number (VARCHAR(50), UNIQUE)
- invoice_type_id
- invoice_status_id
- customer_id
- project_id (NULL)
- invoice_date (DATE)
- due_date (DATE, NULL)
- subtotal (DECIMAL(13,2))
- tax_amount (DECIMAL(13,2))
- total_amount (DECIMAL(13,2))
- notes (TEXT, NULL)
- created_by, modified_by
- created_date, modified_date
- is_active

### 5.3 Comparar Otros Modelos Principales

Repetir para:
- projects
- materials
- labor_timesheets
- fuel_requisitions
- purchase_orders
- pre_inventory

**Documentar discrepancias en issues/high.md si las hay**

---

## 6. Checklist Final de Setup

- [ ] MySQL corriendo y accesible
- [ ] Base de datos `erp_development` existe
- [ ] Todas las tablas del dump están presentes
- [ ] Catálogos tienen datos
- [ ] Usuario admin existe
- [ ] Foreign keys y triggers existen
- [ ] Backend: npm install exitoso
- [ ] Backend: compila sin errores
- [ ] Backend: servidor inicia en puerto 3001
- [ ] Backend: /health responde correctamente
- [ ] Frontend: npm install exitoso
- [ ] Frontend: compila sin errores
- [ ] Frontend: servidor inicia en puerto 4200
- [ ] Frontend: aplicación carga en navegador
- [ ] Login funciona correctamente
- [ ] Token JWT se guarda
- [ ] Navegación básica funciona
- [ ] Modelos TypeScript alineados con DB

---

## Resultado del Setup

**Estado:** [✅ COMPLETO / ❌ CON ERRORES]

**Errores Encontrados:** [Ninguno / Ver issues/critical.md]

**Tiempo Total:** [X minutos]

**Fecha:** 2025-12-17

**Notas:**
...

---

## Próximos Pasos

Si el setup está ✅ COMPLETO:
1. Continuar con `01-authentication.md`
2. Ejecutar tests de cada módulo en orden

Si hay ❌ ERRORES:
1. Documentar en `issues/critical.md`
2. Corregir errores antes de continuar
3. Re-ejecutar setup

---

**IMPORTANTE:** No continuar con otros tests hasta que el setup esté 100% completo y sin errores CRITICAL.
