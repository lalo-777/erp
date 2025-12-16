import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WarehouseService } from '../../../services/warehouse.service';
import { ToastService } from '../../../services/toast.service';
import { StockByLocation, WarehouseLocation } from '../../../models/warehouse.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { getStockStatusColor, getStockStatusLabel } from '../../../models/material.model';

@Component({
  selector: 'app-stock-by-location',
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
  templateUrl: './stock-by-location.component.html',
  styleUrl: './stock-by-location.component.scss',
})
export class StockByLocationComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private warehouseService = inject(WarehouseService);
  private toastService = inject(ToastService);

  // Signals
  locationId = signal<number | null>(null);
  location = signal<WarehouseLocation | null>(null);
  stock = signal<StockByLocation[]>([]);
  allLocations = signal<WarehouseLocation[]>([]);
  isLoading = signal(false);
  searchTerm = signal('');

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.locationId.set(id);
        this.loadLocations();
        this.loadStock();
      }
    });
  }

  loadLocations(): void {
    this.warehouseService.getAllLocations().subscribe({
      next: (response) => {
        if (response.success) {
          this.allLocations.set(response.data);
          const currentLocation = response.data.find(loc => loc.id === this.locationId());
          if (currentLocation) {
            this.location.set(currentLocation);
          }
        }
      },
      error: (err) => {
        console.error('Error loading locations:', err);
      },
    });
  }

  loadStock(): void {
    const id = this.locationId();
    if (!id) return;

    this.isLoading.set(true);

    this.warehouseService
      .getStockByLocation(id, this.searchTerm() || undefined)
      .subscribe({
        next: (response) => {
          if (response.success) {
            // Calculate stock value and add badge info
            const stockWithExtras = response.data.map((item: any) => {
              const stockValue = item.location_stock * item.unit_cost;
              const stockStatus = this.getStockStatus(item.location_stock, item.minimum_stock);
              return {
                ...item,
                stock_value: stockValue,
                stock_status: stockStatus,
                stock_status_label: getStockStatusLabel(stockStatus),
                stock_status_color: getStockStatusColor(stockStatus),
              };
            });
            this.stock.set(stockWithExtras);
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading stock:', err);
          this.toastService.showError('Error al cargar el stock de la ubicación');
          this.isLoading.set(false);
        },
      });
  }

  onLocationChange(): void {
    if (this.locationId()) {
      this.router.navigate(['/warehouse/stock', this.locationId()]);
      this.loadStock();
    }
  }

  onSearch(): void {
    this.loadStock();
  }

  getTotalStockValue(): number {
    return this.stock().reduce((sum, item) => sum + (item.stock_value || 0), 0);
  }

  getTotalQuantity(): number {
    return this.stock().reduce((sum, item) => sum + item.location_stock, 0);
  }

  getLowStockCount(): number {
    return this.stock().filter(item => item.location_stock < item.minimum_stock).length;
  }

  getStockStatus(currentStock: number, minimumStock: number): string {
    if (currentStock <= 0) {
      return 'out_of_stock';
    } else if (currentStock < minimumStock) {
      return 'critical';
    } else if (currentStock <= minimumStock * 1.2) {
      return 'low';
    } else {
      return 'adequate';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
}
