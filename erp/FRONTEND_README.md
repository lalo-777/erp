# ERP Sistema - Frontend

Frontend del sistema ERP construido con Angular 20 siguiendo el patrón de diseño del CRM.

## 🚀 Stack Tecnológico

- **Framework**: Angular 20.3.0
- **UI Framework**: Bootstrap 5.3.8 + Angular Material 20.2.12
- **Lenguaje**: TypeScript 5.9.2
- **Estado**: Angular Signals (Reactive State Management)
- **SSR**: Angular Universal con Server-Side Rendering
- **Charts**: Chart.js 4.4.8
- **Estilos**: SCSS

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── components/          # Componentes reutilizables
│   │   ├── login/
│   │   ├── register/
│   │   ├── profile/
│   │   ├── settings/
│   │   ├── search-modal/
│   │   └── app-header/
│   ├── pages/               # Páginas de la aplicación
│   │   ├── home/
│   │   ├── customers/
│   │   │   ├── dashboard/
│   │   │   └── tracking/
│   │   ├── invoices/
│   │   │   ├── dashboard/
│   │   │   └── tracking/
│   │   ├── projects/
│   │   │   ├── dashboard/
│   │   │   └── tracking/
│   │   ├── materials/
│   │   │   ├── dashboard/
│   │   │   └── tracking/
│   │   └── admin/
│   │       └── dashboard/
│   ├── services/            # Servicios de negocio
│   │   ├── auth.service.ts
│   │   ├── customer.service.ts
│   │   ├── invoice.service.ts
│   │   ├── project.service.ts
│   │   ├── material.service.ts
│   │   └── catalog.service.ts
│   ├── models/              # Modelos TypeScript
│   │   ├── user.model.ts
│   │   ├── customer.model.ts
│   │   ├── invoice.model.ts
│   │   ├── project.model.ts
│   │   ├── material.model.ts
│   │   └── catalog.model.ts
│   ├── guards/              # Route guards
│   │   └── auth.guard.ts
│   ├── interceptors/        # HTTP interceptors
│   │   └── auth.interceptor.ts
│   ├── layout/              # Layout principal
│   │   ├── layout.ts
│   │   ├── layout.html
│   │   └── layout.scss
│   ├── shared/              # Recursos compartidos
│   ├── app.ts               # Componente raíz
│   ├── app.config.ts        # Configuración de la aplicación
│   ├── app.routes.ts        # Definición de rutas
│   └── app.routes.server.ts # Rutas SSR
├── environments/            # Configuración de entornos
│   └── environment.ts
├── styles.scss              # Estilos globales
├── index.html
├── main.ts                  # Bootstrap de la app
├── main.server.ts           # Bootstrap SSR
└── server.ts                # Express server para SSR
```

## 🛠️ Instalación y Configuración

### 1. Instalar dependencias

```bash
cd D:\erp\servidor\erp
npm install
```

### 2. Configurar variables de entorno

Editar `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3001/api',  // Ajustar según tu backend
};
```

### 3. Iniciar el servidor de desarrollo

```bash
npm start
```

La aplicación estará disponible en `http://localhost:4200`

### 4. Compilar para producción

```bash
npm run build
```

### 5. Ejecutar con SSR

```bash
npm run serve:ssr:erp
```

## 🏗️ Arquitectura

### Patrón de Componentes Stand-alone

El proyecto utiliza la arquitectura moderna de Angular 20 con componentes stand-alone (sin NgModules):

```typescript
@Component({
  selector: 'app-customers-dashboard',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './customers-dashboard.component.html',
  styleUrl: './customers-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomersDashboardComponent {
  // ...
}
```

### Gestión de Estado con Signals

El proyecto utiliza **Angular Signals** como sistema principal de gestión de estado:

```typescript
export class AuthService {
  // Signals para estado reactivo
  private readonly currentUserSignal = signal<User | null>(null);
  private readonly tokenSignal = signal<string | null>(null);

  // Public computed signals
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
  readonly isAdmin = computed(() => this.currentUserSignal()?.role === 'admin');
}
```

### Routing con Guards

```typescript
export const routes: Routes = [
  // Rutas públicas (solo invitados)
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./components/login/login.component'),
  },

  // Rutas protegidas (usuarios autenticados)
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      // ...
    ],
  },
];
```

### HTTP Interceptor para JWT

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(clonedRequest);
  }

  return next(req);
};
```

## 📋 Módulos Implementados

### ✅ Completados

1. **Autenticación**
   - Login con JWT
   - Guards de autenticación
   - Interceptor HTTP
   - Gestión de sesión con Signals

2. **Layout Principal**
   - Sidebar colapsable
   - Header con navegación
   - Responsive design
   - Integración con Bootstrap

3. **Dashboard Principal**
   - Vista de inicio
   - Estadísticas generales
   - Acciones rápidas

### 🚧 Pendientes de Implementación

Los siguientes módulos tienen la estructura base pero necesitan implementación completa:

1. **Clientes**
   - Dashboard con listado
   - Detalle/tracking de cliente
   - CRUD de clientes

2. **Facturas**
   - Dashboard con listado
   - Detalle/tracking de factura
   - CRUD de facturas
   - Historial de auditoría

3. **Proyectos**
   - Dashboard con listado
   - Detalle/tracking de proyecto
   - CRUD de proyectos
   - Historial de auditoría

4. **Materiales**
   - Dashboard con listado
   - Detalle/tracking de material
   - CRUD de materiales
   - Alertas de stock bajo

5. **Administración**
   - Gestión de usuarios
   - Catálogos del sistema
   - Configuración general

## 🔌 Integración con Backend

El frontend está configurado para conectarse al backend en `http://localhost:3001/api`.

### Servicios Disponibles

- **AuthService**: Autenticación y gestión de sesión
- **CustomerService**: Gestión de clientes
- **InvoiceService**: Gestión de facturas
- **ProjectService**: Gestión de proyectos
- **MaterialService**: Gestión de materiales
- **CatalogService**: Gestión de catálogos

### Ejemplo de Uso

```typescript
export class CustomersDashboardComponent implements OnInit {
  private readonly customerService = inject(CustomerService);

  protected readonly customers = signal<CustomerListItem[]>([]);
  protected readonly isLoading = signal(false);

  ngOnInit(): void {
    this.loadCustomers();
  }

  protected loadCustomers(): void {
    this.isLoading.set(true);
    this.customerService.getAllCustomers().subscribe({
      next: (response) => {
        this.customers.set(response.data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.isLoading.set(false);
      },
    });
  }
}
```

## 🎨 Estilos y UI

### Bootstrap 5

El proyecto utiliza Bootstrap 5 para el layout y componentes básicos.

### Material Icons

Iconos de Google Material Symbols para una interfaz moderna.

Uso:
```html
<span class="material-symbols-outlined">home</span>
```

### Scrollbar Personalizado

El proyecto incluye un scrollbar personalizado estilo "gota" definido en `styles.scss`.

## 🔒 Autenticación

### Login

1. El usuario ingresa email y contraseña
2. Se envía petición a `/api/auth/login`
3. El backend retorna un JWT token
4. El token se guarda en localStorage
5. El interceptor HTTP añade el token a todas las peticiones

### Guards

- **authGuard**: Protege rutas que requieren autenticación
- **guestGuard**: Protege rutas que solo pueden acceder usuarios no autenticados (login, register)

## 📝 Próximos Pasos

1. Implementar los dashboards de cada módulo con datos reales
2. Crear componentes de formularios para CRUD
3. Implementar modales para crear/editar registros
4. Añadir paginación en listados
5. Implementar filtros y búsqueda
6. Crear componentes de tracking/detalle completos
7. Añadir gráficas con Chart.js
8. Implementar sistema de notificaciones
9. Añadir validación de formularios
10. Implementar manejo de errores global

## 🐛 Troubleshooting

### Error de CORS

Si experimentas errores de CORS, verifica que el backend esté configurado correctamente:

```typescript
// Backend config
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true,
}));
```

### Error de conexión al backend

Verifica que el backend esté ejecutándose en el puerto correcto y que la URL en `environment.ts` sea correcta.

### Errores de compilación

Ejecuta:
```bash
npm install
rm -rf node_modules/.cache
npm run build
```

## 📚 Recursos

- [Angular Documentation](https://angular.io/docs)
- [Angular Signals](https://angular.io/guide/signals)
- [Bootstrap 5](https://getbootstrap.com/docs/5.3/)
- [Material Symbols](https://fonts.google.com/icons)
- [Chart.js](https://www.chartjs.org/)

## 👥 Equipo de Desarrollo

Este proyecto sigue el mismo patrón de diseño del CRM existente para mantener consistencia en el código y facilitar el mantenimiento.
