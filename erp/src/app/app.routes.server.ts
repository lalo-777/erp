import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Routes with dynamic parameters must use Server rendering
  { path: 'customers/:id', renderMode: RenderMode.Server },
  { path: 'invoices/:id', renderMode: RenderMode.Server },
  { path: 'projects/:id', renderMode: RenderMode.Server },
  { path: 'materials/:id', renderMode: RenderMode.Server },
  { path: 'labor/:id', renderMode: RenderMode.Server },
  { path: 'warehouse/stock/:id', renderMode: RenderMode.Server },
  { path: 'pre-inventory/detail/:id', renderMode: RenderMode.Server },
  { path: 'purchase-orders/:id', renderMode: RenderMode.Server },
  { path: 'suppliers/:id', renderMode: RenderMode.Server },
  { path: 'fuel-requisitions/:id', renderMode: RenderMode.Server },
  { path: 'admin/catalogs/:catalogName', renderMode: RenderMode.Server },
  // Default: prerender static routes
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
