import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
    RouterLink,
    FormsModule,
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
      roles: 'shield-check',
      genders: 'gender-ambiguous',
      'marital-statuses': 'heart',
      'person-titles': 'award',
      nationalities: 'globe',
      states: 'map',
      'invoice-types': 'file-earmark-text',
      'invoice-statuses': 'check-circle',
      'payment-methods': 'credit-card',
      'payment-statuses': 'cash-stack',
      'expense-categories': 'tag',
      'expense-statuses': 'clipboard-check',
      'project-statuses': 'kanban',
      'project-types': 'folder',
      'project-areas': 'geo-alt',
      'contract-types': 'file-earmark-ruled',
      'contract-statuses': 'file-earmark-check',
      'work-order-types': 'list-task',
      'work-order-statuses': 'check2-square',
      'labor-types': 'people',
      'units-of-measure': 'rulers',
      'material-categories': 'box',
      'warehouse-locations': 'building',
      'transaction-types': 'arrow-left-right',
      'supplier-categories': 'truck',
      'purchase-order-statuses': 'cart-check',
      'fuel-types': 'fuel-pump',
      'ml-models': 'cpu',
    };

    return iconMap[name] || 'list';
  }
}
