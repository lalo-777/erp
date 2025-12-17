# Issues MEDIUM

**Severidad:** MEDIUM - Afectan experiencia del usuario pero no bloquean funcionalidad crítica

---

## Estado

**Total Issues:** 1
**Abiertos:** 1
**En Progreso:** 0
**Corregidos:** 0
**Verificados:** 0

---

## Issue #F001

**Módulo:** Authentication / Profile
**Severidad:** MEDIUM
**Tipo:** Frontend-Backend Mismatch
**Estado:** ❌ Abierto

### Descripción
El servicio de autenticación del frontend llama a endpoints `/api/auth/profile` para obtener y actualizar el perfil del usuario, pero el backend solo implementa el endpoint `/api/auth/me`. Esto causa un desajuste entre frontend y backend.

### Pasos para Reproducir
1. Hacer login exitoso con credenciales válidas
2. Navegar a la página de perfil `/profile`
3. El frontend intenta llamar a `GET /api/auth/profile`
4. Backend retorna 404 Not Found

```bash
# Endpoint que el frontend espera (no existe):
curl http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer [token]"

# Resultado: {"success":false,"message":"Route /api/auth/profile not found"}
```

### Comportamiento Esperado
```typescript
// Frontend debería llamar al endpoint correcto:
getProfile(): Observable<ProfileResponse> {
  return this.http.get<ProfileResponse>(`${environment.apiUrl}/auth/me`)
}

updateProfile(data: UpdateProfileRequest): Observable<ProfileResponse> {
  return this.http.put<ProfileResponse>(`${environment.apiUrl}/auth/me`, data)
}
```

### Comportamiento Actual
```typescript
// Frontend está llamando:
getProfile(): Observable<ProfileResponse> {
  return this.http.get<ProfileResponse>(`${environment.apiUrl}/auth/profile`)  // ❌ No existe
}

updateProfile(data: UpdateProfileRequest): Observable<ProfileResponse> {
  return this.http.put<ProfileResponse>(`${environment.apiUrl}/auth/profile`, data)  // ❌ No existe
}
```

### Error/Stack Trace
```json
{
  "success": false,
  "message": "Route /api/auth/profile not found"
}
```

HTTP Status: 404 Not Found

### Archivos Afectados
**Frontend:**
- `erp/src/app/services/auth.service.ts:56` - método `getProfile()`
- `erp/src/app/services/auth.service.ts:63` - método `updateProfile()`

**Backend:**
- `backend/src/routes/auth.routes.ts` - Solo tiene ruta `/me`, no `/profile`

### Solución Propuesta

Hay dos opciones para resolver este issue:

#### Opción A: Cambiar Frontend (Recomendado)
Modificar el frontend para usar el endpoint `/me` que ya existe en el backend.

**Cambios en** `erp/src/app/services/auth.service.ts`:

```typescript
// Línea 56 - Cambiar:
getProfile(): Observable<ProfileResponse> {
  return this.http.get<ProfileResponse>(`${environment.apiUrl}/auth/me`).pipe(
    tap((response) => this.setUser(response.data.user)),
    catchError((error) => this.handleError(error))
  );
}

// Línea 63 - Cambiar:
updateProfile(data: UpdateProfileRequest): Observable<ProfileResponse> {
  return this.http.put<ProfileResponse>(`${environment.apiUrl}/auth/me`, data).pipe(
    tap((response) => this.setUser(response.data.user)),
    catchError((error) => this.handleError(error))
  );
}
```

**Ventajas:**
- No requiere cambios en backend
- Solo 2 líneas de código
- Mantiene consistencia con backend actual

#### Opción B: Agregar Endpoint al Backend
Agregar ruta `/profile` al backend que funcione como alias de `/me`.

**Cambios en** `backend/src/routes/auth.routes.ts`:

```typescript
// Agregar después de la ruta /me:
router.get('/profile', authenticate, authController.getCurrentUser);
router.put('/profile', authenticate, authController.updateProfile);
```

**Ventajas:**
- Mantiene el frontend sin cambios
- Proporciona flexibilidad en naming

**Desventajas:**
- Endpoints duplicados (confusión)
- Más código a mantener

### Recomendación
**Usar Opción A** - Cambiar el frontend es más simple y mantiene una sola fuente de verdad.

### Impacto
- Pantalla de perfil de usuario (`/profile`) probablemente no carga datos
- Actualización de perfil falla con 404
- Usuarios no pueden ver ni editar su información personal

### Fecha Identificado
2025-12-17

---

<!-- Template para próximos issues -->
