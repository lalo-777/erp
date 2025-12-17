# Tests - Authentication Module

## Objetivo
Verificar que el sistema de autenticación funciona correctamente: registro, login, logout, protección de rutas.

---

## Pre-requisitos
- ✅ Setup completado (00-setup.md)
- ✅ Backend corriendo en puerto 3001
- ✅ Frontend corriendo en puerto 4200
- ✅ Usuario admin existe en DB

---

## 1. Backend API Tests

### 1.1 POST /api/auth/register

#### Test 1.1.1: Registro exitoso con datos válidos

**Request:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "first_name": "Test",
    "last_name": "User",
    "gender_id": 1,
    "role_id": 2
  }'
```

**✅ Esperado:**
- Status: 201 Created
- Response:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "id": X,
      "email": "test@example.com",
      "first_name": "Test",
      "last_name": "User"
    }
  }
  ```

**❌ Actual:** [Documentar resultado]

#### Test 1.1.2: Registro falla con email duplicado

**Request:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@balper.com",
    "password": "Test123!",
    "first_name": "Test",
    "last_name": "User",
    "gender_id": 1,
    "role_id": 2
  }'
```

**✅ Esperado:**
- Status: 400 Bad Request
- Error: "Email already exists" o similar

**❌ Actual:** [Documentar resultado]

#### Test 1.1.3: Registro falla sin campos requeridos

**Request:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "incomplete@example.com"
  }'
```

**✅ Esperado:**
- Status: 400 Bad Request
- Error: Validation errors para campos faltantes

**❌ Actual:** [Documentar resultado]

---

### 1.2 POST /api/auth/login

#### Test 1.2.1: Login exitoso con credenciales válidas

**Request:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@balper.com",
    "password": "admin123"
  }'
```

**✅ Esperado:**
- Status: 200 OK
- Response:
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": 1,
        "email": "admin@balper.com",
        "first_name": "Admin",
        "last_name": "Balper",
        "role_id": 1
      }
    }
  }
  ```
- Token JWT válido

**❌ Actual:** [Documentar resultado]

**Guardar token para tests siguientes:**
```bash
TOKEN="[token recibido]"
```

#### Test 1.2.2: Login falla con credenciales inválidas

**Request:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@balper.com",
    "password": "wrongpassword"
  }'
```

**✅ Esperado:**
- Status: 401 Unauthorized
- Error: "Invalid credentials" o similar

**❌ Actual:** [Documentar resultado]

#### Test 1.2.3: Login falla con email inexistente

**Request:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "anypassword"
  }'
```

**✅ Esperado:**
- Status: 401 Unauthorized
- Error: "Invalid credentials"

**❌ Actual:** [Documentar resultado]

---

### 1.3 GET /api/auth/me

#### Test 1.3.1: Retorna usuario actual con token válido

**Request:**
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**✅ Esperado:**
- Status: 200 OK
- Response:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "email": "admin@balper.com",
      "first_name": "Admin",
      "last_name": "Balper",
      "role_id": 1,
      "role_name": "Administrator"
    }
  }
  ```

**❌ Actual:** [Documentar resultado]

#### Test 1.3.2: Falla sin token

**Request:**
```bash
curl -X GET http://localhost:3001/api/auth/me
```

**✅ Esperado:**
- Status: 401 Unauthorized
- Error: "No token provided" o similar

**❌ Actual:** [Documentar resultado]

#### Test 1.3.3: Falla con token inválido

**Request:**
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer invalidtoken123"
```

**✅ Esperado:**
- Status: 401 Unauthorized
- Error: "Invalid token"

**❌ Actual:** [Documentar resultado]

---

## 2. Frontend UI Tests

### 2.1 Login Page

#### Test 2.1.1: Navegación a /login

**Pasos:**
1. Abrir `http://localhost:4200/login`

**✅ Esperado:**
- Página carga correctamente
- Formulario de login visible
- Campos: email, password
- Botón "Iniciar Sesión"
- Link "¿Olvidaste tu contraseña?" (opcional)

**❌ Actual:** [Documentar resultado]

#### Test 2.1.2: Validaciones del formulario

**Pasos:**
1. Dejar campos vacíos
2. Click en "Iniciar Sesión"

**✅ Esperado:**
- Mensajes de validación: "Email requerido", "Password requerido"
- Botón deshabilitado o no envía

**❌ Actual:** [Documentar resultado]

**Pasos:**
1. Email inválido: "notanemail"
2. Click en "Iniciar Sesión"

**✅ Esperado:**
- Mensaje: "Email inválido"

**❌ Actual:** [Documentar resultado]

#### Test 2.1.3: Login exitoso

**Pasos:**
1. Ingresar email: `admin@balper.com`
2. Ingresar password: `admin123`
3. Click en "Iniciar Sesión"

**✅ Esperado:**
- Loading spinner se muestra
- Redirige a `/` (dashboard)
- Sin errores en consola
- Token guardado en localStorage

**❌ Actual:** [Documentar resultado]

**Verificar localStorage:**
1. F12 → Application → Local Storage → `http://localhost:4200`
2. Buscar key: `token` o `authToken`

**✅ Esperado:** Token presente

#### Test 2.1.4: Login fallido

**Pasos:**
1. Ingresar email: `admin@balper.com`
2. Ingresar password: `wrongpassword`
3. Click en "Iniciar Sesión"

**✅ Esperado:**
- Toast de error: "Credenciales inválidas"
- Permanece en /login
- No se guarda token

**❌ Actual:** [Documentar resultado]

---

### 2.2 Protected Routes

#### Test 2.2.1: Rutas protegidas sin token

**Pasos:**
1. Borrar localStorage
2. Navegar directamente a `http://localhost:4200/customers`

**✅ Esperado:**
- Redirige automáticamente a `/login`

**❌ Actual:** [Documentar resultado]

**Repetir para:**
- /invoices
- /projects
- /materials
- /admin

#### Test 2.2.2: Rutas protegidas con token válido

**Pasos:**
1. Login exitoso
2. Navegar a `/customers`

**✅ Esperado:**
- Página carga correctamente
- Sin redirección a login

**❌ Actual:** [Documentar resultado]

---

### 2.3 Logout

#### Test 2.3.1: Logout funcional

**Pasos:**
1. Login exitoso
2. Click en avatar/usuario (top right)
3. Click en "Cerrar Sesión"

**✅ Esperado:**
- Token se borra de localStorage
- Redirige a `/login`
- Navegar a rutas protegidas redirige a /login

**❌ Actual:** [Documentar resultado]

---

## 3. Integration Tests

### 3.1 Flujo completo de autenticación

**Pasos:**
1. Abrir app (sin token)
2. Redirige a /login
3. Login con credenciales válidas
4. Redirige a dashboard
5. Navegar a diferentes páginas (customers, invoices, etc.)
6. Todo funciona correctamente
7. Cerrar sesión
8. Redirige a /login
9. Intento de acceso a rutas protegidas redirige a /login

**✅ Esperado:** Flujo completo funciona sin errores

**❌ Actual:** [Documentar resultado]

### 3.2 Persistencia de sesión

**Pasos:**
1. Login exitoso
2. Cerrar navegador
3. Reabrir navegador
4. Navegar a `http://localhost:4200`

**✅ Esperado:**
- Si token válido → va a dashboard
- Si token expiró → va a login

**❌ Actual:** [Documentar resultado]

### 3.3 Token expiration

**Pasos:**
1. Login exitoso
2. Esperar a que token expire (según JWT_EXPIRES_IN en .env)
3. Intentar navegar o hacer acción

**✅ Esperado:**
- Redirige a /login
- Mensaje: "Sesión expirada"

**❌ Actual:** [Documentar resultado]

---

## 4. Security Tests

### 4.1 Password no se muestra en network

**Pasos:**
1. F12 → Network
2. Hacer login
3. Ver request en Network tab

**✅ Esperado:**
- Password enviada en POST body (OK)
- NUNCA en URL o headers

**❌ Actual:** [Documentar resultado]

### 4.2 Token en headers (no en URL)

**Pasos:**
1. Después de login, hacer cualquier request API
2. Ver en Network tab

**✅ Esperado:**
- Token en `Authorization: Bearer [token]` header
- NUNCA en URL

**❌ Actual:** [Documentar resultado]

---

## Resumen de Tests

**Total Tests:** 20
**Pasados:** [X]
**Fallidos:** [X]

### Issues Encontrados
- [Severidad] Descripción → Ver issues/[severidad].md #[número]

---

## Notas
...

---

**Fecha:** 2025-12-17
**Ejecutado por:** [Nombre]
**Duración:** [X minutos]
