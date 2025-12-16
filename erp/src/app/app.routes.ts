import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';
import { Layout } from './layout/layout';
import { Home } from './pages/home/home.component';

export const routes: Routes = [
  // Public routes (guest only)
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./components/login/login.component').then((m) => m.LoginComponent),
  },

  // Protected routes (authenticated users only)
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: Home,
      },
      {
        path: 'customers',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/customers/dashboard/customers-dashboard.component').then(
                (m) => m.CustomersDashboardComponent
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./pages/customers/tracking/customers-tracking.component').then(
                (m) => m.CustomersTrackingComponent
              ),
          },
        ],
      },
      {
        path: 'invoices',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/invoices/dashboard/invoices-dashboard.component').then(
                (m) => m.InvoicesDashboardComponent
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./pages/invoices/tracking/invoices-tracking.component').then(
                (m) => m.InvoicesTrackingComponent
              ),
          },
        ],
      },
      {
        path: 'projects',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/projects/dashboard/projects-dashboard.component').then(
                (m) => m.ProjectsDashboardComponent
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./pages/projects/tracking/project-tracking.component').then(
                (m) => m.ProjectTrackingComponent
              ),
          },
        ],
      },
      {
        path: 'materials',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/materials/dashboard/materials-dashboard.component').then(
                (m) => m.MaterialsDashboardComponent
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./pages/materials/tracking/materials-tracking.component').then(
                (m) => m.MaterialsTrackingComponent
              ),
          },
        ],
      },
      {
        path: 'labor',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/labor/dashboard/labor-dashboard.component').then(
                (m) => m.LaborDashboardComponent
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./pages/labor/tracking/labor-tracking.component').then(
                (m) => m.LaborTrackingComponent
              ),
          },
        ],
      },
      {
        path: 'admin',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/admin/dashboard/admin-dashboard.component').then(
                (m) => m.AdminDashboardComponent
              ),
          },
        ],
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./components/profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./components/settings/settings.component').then((m) => m.SettingsComponent),
      },
    ],
  },

  // Wildcard redirect
  {
    path: '**',
    redirectTo: '',
  },
];
