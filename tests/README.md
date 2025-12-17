# ERP Testing Suite

## Descripción

Suite de pruebas exhaustiva para la aplicación ERP Balper. Este conjunto de pruebas cubre todos los módulos de la aplicación, tanto backend como frontend, garantizando que todo funcione correctamente con la base de datos real.

## Estructura

```
tests/
├── README.md                      # Este archivo
├── 00-setup.md                    # Configuración inicial y verificación
├── 01-authentication.md           # Tests módulo Auth
├── 02-dashboard.md                # Tests Dashboard
├── 03-customers.md                # Tests Clientes
├── 04-invoices.md                 # Tests Facturas
├── 05-projects.md                 # Tests Proyectos
├── 06-materials.md                # Tests Materiales
├── 07-labor.md                    # Tests Mano de Obra
├── 08-warehouse.md                # Tests Almacén
├── 09-pre-inventory.md            # Tests Pre-Inventario
├── 10-purchase-orders.md          # Tests Órdenes de Compra
├── 11-fuel-requisitions.md        # Tests Vales de Combustible
├── 12-admin.md                    # Tests Administración
├── test-results/                  # Resultados de pruebas
├── issues/                        # Issues encontrados
│   ├── critical.md
│   ├── high.md
│   ├── medium.md
│   └── low.md
└── scripts/                       # Scripts de automatización
```

## Metodología de Testing

### 1. Preparación
- Verificar que la base de datos esté corriendo
- Verificar que el dump esté cargado
- Iniciar backend (puerto 3001)
- Iniciar frontend (puerto 4200)

### 2. Tipos de Tests

#### Backend API Tests
- Health checks de endpoints
- CRUD operations (Create, Read, Update, Delete)
- Validaciones de negocio
- Manejo de errores (400, 401, 404, 500)
- Paginación y búsqueda
- Filtros
- Autenticación/Autorización

#### Frontend UI Tests
- Navegación entre páginas
- Carga de componentes
- Formularios y validaciones
- Modales (abrir, cerrar, submit)
- Tablas con paginación
- Búsqueda y filtros
- Mensajes de error/éxito (toasts)

#### Integration Tests
- Flujos completos end-to-end
- CRUD completo (Create → Read → Update → Delete)
- Workflows específicos (aprobaciones, etc.)
- Relaciones entre módulos

### 3. Clasificación de Errores

**CRITICAL** - Bloquean la aplicación completamente
- Servidor no inicia
- Base de datos no conecta
- Error 500 en endpoints principales
- Autenticación no funciona
- Pérdida de datos

**HIGH** - Bloquean funcionalidades principales
- CRUD operations fallan
- Validaciones no funcionan
- Cálculos incorrectos
- Workflows rotos
- Navegación rota

**MEDIUM** - Afectan experiencia del usuario
- UI/UX inconsistente
- Validaciones faltantes
- Mensajes confusos
- Performance lento

**LOW** - Mejoras opcionales
- Typos
- Estilos menores
- Features opcionales

## Orden de Ejecución

1. **00-setup.md** - SIEMPRE ejecutar primero
2. **01-authentication.md** - Requerido para otros módulos
3. **02-dashboard.md** - Verificar stats
4. **03 a 12** - Módulos principales en cualquier orden

## Comandos Útiles

### Iniciar Backend
```bash
cd D:\erp\servidor\backend
npm run dev
```

### Iniciar Frontend
```bash
cd D:\erp\servidor\erp
npm start
```

### Test Endpoint (ejemplo)
```bash
# Health check
curl http://localhost:3001/health

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@balper.com\",\"password\":\"admin123\"}"
```

### MySQL
```bash
mysql -u root -p erp_development
```

## Formato de Documentación de Resultados

Cada archivo en `test-results/` sigue este formato:

```markdown
# Resultados - [Módulo]

**Fecha:** YYYY-MM-DD
**Ejecutado por:** [Nombre]
**Duración:** X minutos

## Resumen
- ✅ Tests pasados: X
- ❌ Tests fallidos: X
- Total: X

## Detalles

### Backend Tests
- [✅/❌] Descripción del test
  - Resultado esperado
  - Resultado actual
  - Errores (si aplica)

### Frontend Tests
...

### Issues Encontrados
- [Severidad] Descripción breve → Ver issues/[severidad].md #[número]
```

## Formato de Issues

Cada issue en `issues/[severidad].md` sigue este formato:

```markdown
## Issue #[número]

**Módulo:** [nombre]
**Severidad:** [CRITICAL|HIGH|MEDIUM|LOW]
**Tipo:** [Backend|Frontend|Integration]
**Estado:** [Identificado|En progreso|Corregido|Verificado]

### Descripción
...

### Pasos para Reproducir
1. ...
2. ...

### Comportamiento Esperado
...

### Comportamiento Actual
...

### Error/Stack Trace
```
...
```

### Archivos Afectados
- `ruta/archivo.ts:línea`

### Solución Propuesta
...

### Solución Implementada
... (después de corregir)
```

## Notas Importantes

1. **Base de Datos como Fuente de Verdad**
   - El dump en `D:\erp\servidor\dump\` es la fuente de verdad
   - Cualquier discrepancia entre código y dump se corrige en el código

2. **Documentar TODO**
   - Cada test ejecutado
   - Cada error encontrado
   - Cada corrección aplicada

3. **Re-Testing**
   - Después de corregir un error, RE-EJECUTAR el test
   - Verificar que la corrección no rompió otros módulos

4. **Credentials de Prueba**
   - Email: `admin@balper.com`
   - Password: `admin123`
   - (O el que esté en la base de datos)

## Métricas de Éxito

Al final del testing:
- ✅ 100% endpoints funcionando
- ✅ 100% páginas cargando sin errores
- ✅ 100% flujos CRUD completados
- ✅ 0 errores CRITICAL
- ✅ 0 errores HIGH
- ✅ Modelos alineados 100% con DB

## Contacto

Cualquier duda o issue crítico, documentar en `issues/critical.md` inmediatamente.

---

**Última Actualización:** 2025-12-17
**Versión:** 1.0.0
