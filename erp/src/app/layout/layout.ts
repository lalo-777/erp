import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-layout',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly currentUser = this.authService.currentUser;
  protected readonly isSidebarCollapsed = signal(false);

  protected readonly menuItems = [
    {
      icon: 'home',
      label: 'Inicio',
      route: '/',
      exact: true,
    },
    {
      icon: 'groups',
      label: 'Clientes',
      route: '/customers',
    },
    {
      icon: 'receipt_long',
      label: 'Facturas',
      route: '/invoices',
    },
    {
      icon: 'apartment',
      label: 'Proyectos',
      route: '/projects',
    },
    {
      icon: 'inventory_2',
      label: 'Materiales',
      route: '/materials',
    },
    {
      icon: 'admin_panel_settings',
      label: 'Administración',
      route: '/admin',
      adminOnly: true,
    },
  ];

  protected toggleSidebar(): void {
    this.isSidebarCollapsed.update((v) => !v);
  }

  protected logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        this.router.navigate(['/login']);
      },
    });
  }
}
