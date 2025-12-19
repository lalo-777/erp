# Scripts de Pruebas - Backend ERP

Esta carpeta contiene ejemplos de tests para el backend usando **Jest** y **Supertest**.

## Estructura

```
temporal/
├── jest.config.js    # Configuracion de Jest
├── setup.ts          # Setup inicial de tests
├── health.test.ts    # Tests del endpoint /health
├── auth.test.ts      # Tests del modulo de autenticacion
├── catalog.test.ts   # Tests del modulo de catalogos
└── README.md         # Este archivo
```

## Ejecutar Tests

### Opcion 1: Usar configuracion de esta carpeta
```bash
npx jest --config temporal/jest.config.js
```

### Opcion 2: Ejecutar un test especifico
```bash
npx jest --config temporal/jest.config.js temporal/health.test.ts
```

### Opcion 3: Con cobertura
```bash
npx jest --config temporal/jest.config.js --coverage
```

### Opcion 4: Modo watch (desarrollo)
```bash
npx jest --config temporal/jest.config.js --watch
```

## Que se prueba

### health.test.ts
- Endpoint `/health` sin autenticacion
- Verifica estructura de respuesta
- Valida timestamp y version

### auth.test.ts
- Generacion de JWT tokens
- Decodificacion de tokens
- Middleware de autenticacion
- Validacion de tokens expirados

### catalog.test.ts
- Listado de catalogos disponibles
- Obtencion de entradas por catalogo
- Busqueda de entrada por ID
- Creacion de nuevas entradas
- Validacion de datos requeridos

## Notas

- Estos tests usan mocks y no requieren conexion a base de datos
- Para tests de integracion completos, se necesitaria configurar una BD de test
- Las dependencias necesarias ya estan en package.json (jest, supertest, ts-jest)
