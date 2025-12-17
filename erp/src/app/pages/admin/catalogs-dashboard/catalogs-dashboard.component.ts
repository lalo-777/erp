import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CatalogService } from '../../../services/catalog.service';
import { ToastService } from '../../../services/toast.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

interface CatalogInfo {
  name: string;
  table: string;
  displayName: string;
  entryCount?: number;
}

@Component({
  selector: 'app-catalogs-dashboard',
  imports: [
    CommonModule,

    FormsModule,
    MatIconModule,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
  templateUrl: './catalogs-dashboard.component.html',
  styleUrl: './catalogs-dashboard.component.scss',
})
export class CatalogsDashboardComponent implements OnInit {
  private router = inject(Router);
  private catalogService = inject(CatalogService);
  private toastService = inject(ToastService);

  // Signals
  catalogs = signal<CatalogInfo[]>([]);
  filteredCatalogs = signal<CatalogInfo[]>([]);
  isLoading = signal(false);
  searchTerm = signal('');

  ngOnInit(): void {
    this.loadCatalogs();
  }

  loadCatalogs(): void {
    this.isLoading.set(true);

    this.catalogService.getAllCatalogs().subscribe({
      next: (response) => {
        if (response.success) {
          const catalogsWithDisplay = response.data.map((cat) => ({
            ...cat,
            displayName: this.formatCatalogName(cat.name),
          }));
          this.catalogs.set(catalogsWithDisplay);
          this.filteredCatalogs.set(catalogsWithDisplay);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading catalogs:', err);
        this.toastService.showError('Error al cargar catálogos');
        this.isLoading.set(false);
      },
    });
  }

  onSearch(): void {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      this.filteredCatalogs.set(this.catalogs());
      return;
    }

    const filtered = this.catalogs().filter(
      (cat) =>
        cat.displayName.toLowerCase().includes(term) ||
        cat.name.toLowerCase().includes(term) ||
        cat.table.toLowerCase().includes(term)
    );
    this.filteredCatalogs.set(filtered);
  }

  onViewCatalog(catalogName: string): void {
    this.router.navigate(['/admin/catalogs', catalogName]);
  }

  formatCatalogName(name: string): string {
    return name
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getCatalogIcon(name: string): string {
    const iconMap: Record<string, string> = {
      roles: 'shield',
      genders: 'wc',
      'marital-statuses': 'favorite',
      'person-titles': 'military_tech',
      nationalities: 'public',
      states: 'map',
      'invoice-types': 'description',
      'invoice-statuses': 'check_circle',
      'payment-methods': 'credit_card',
      'payment-statuses': 'payments',
      'expense-categories': 'local_offer',
      'expense-statuses': 'task',
      'project-statuses': 'view_kanban',
      'project-types': 'folder',
      'project-areas': 'place',
      'contract-types': 'article',
      'contract-statuses': 'verified',
      'work-order-types': 'assignment',
      'work-order-statuses': 'check_box',
      'labor-types': 'people',
      'units-of-measure': 'straighten',
      'material-categories': 'inventory_2',
      'warehouse-locations': 'business',
      'transaction-types': 'swap_horiz',
      'supplier-categories': 'local_shipping',
      'purchase-order-statuses': 'shopping_cart_checkout',
      'fuel-types': 'local_gas_station',
      'ml-models': 'memory',
    };

    return iconMap[name] || 'list';
  }
}
