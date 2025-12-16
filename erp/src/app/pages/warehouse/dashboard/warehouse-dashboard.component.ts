import { Component, signal, inject, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WarehouseService } from '../../../services/warehouse.service';
import { ToastService } from '../../../services/toast.service';
import {
  WarehouseLocation,
  WarehouseStats,
  InventoryTransaction,
  getTransactionTypeColor,
  getTransactionTypeLabel,
  getTransactionTypeIcon,
} from '../../../models/warehouse.model';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { TableColumn, PaginationInfo } from '../../../shared/models/table.model';

@Component({
  selector: 'app-warehouse-dashboard',
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    DataTableComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    BadgeComponent,
  ],
  templateUrl: './warehouse-dashboard.component.html',
  styleUrl: './warehouse-dashboard.component.scss',
})
export class WarehouseDashboardComponent implements OnInit {
  private router = inject(Router);
  private warehouseService = inject(WarehouseService);
  private toastService = inject(ToastService);

  // Signals
  locations = signal<WarehouseLocation[]>([]);
  stats = signal<WarehouseStats | null>(null);
  transactions = signal<InventoryTransaction[]>([]);
  isLoading = signal(false);
  isLoadingStats = signal(false);
  isLoadingTransactions = signal(false);
  currentPage = signal(1);
  pageSize = signal(10);
  pagination = signal<PaginationInfo | undefined>(undefined);

  // Table columns for recent transactions
  transactionColumns: TableColumn[] = [
    { field: 'transaction_number', header: 'Número', sortable: true, width: '130px' },
    { field: 'material_name', header: 'Material', sortable: true },
    { field: 'location_name', header: 'Ubicación', sortable: true, width: '150px' },
    { field: 'quantity', header: 'Cantidad', sortable: true, type: 'number', width: '100px' },
    { field: 'transaction_type', header: 'Tipo', sortable: true, type: 'badge', width: '130px' },
    { field: 'transaction_date', header: 'Fecha', sortable: true, type: 'date', width: '120px' },
  ];

  ngOnInit(): void {
    this.loadLocations();
    this.loadStats();
    this.loadRecentTransactions();
  }

  loadLocations(): void {
    this.isLoading.set(true);

    this.warehouseService.getAllLocations().subscribe({
      next: (response) => {
        if (response.success) {
          this.locations.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading locations:', err);
        this.toastService.showError('Error al cargar ubicaciones de almacén');
        this.isLoading.set(false);
      },
    });
  }

  loadStats(): void {
    this.isLoadingStats.set(true);

    this.warehouseService.getWarehouseStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.stats.set(response.data);
        }
        this.isLoadingStats.set(false);
      },
      error: (err) => {
        console.error('Error loading stats:', err);
        this.isLoadingStats.set(false);
      },
    });
  }

  loadRecentTransactions(): void {
    this.isLoadingTransactions.set(true);

    this.warehouseService
      .getTransactionHistory({
        page: this.currentPage(),
        limit: this.pageSize(),
      })
      .subscribe({
        next: (response) => {
          if (response.success) {
            // Add badge information
            const transactionsWithBadge = response.data.map((t: any) => ({
              ...t,
              transaction_type_label: getTransactionTypeLabel(t.transaction_type_alias),
              transaction_type_color: getTransactionTypeColor(t.transaction_type_alias),
            }));
            this.transactions.set(transactionsWithBadge);
            this.pagination.set({
              currentPage: response.pagination.currentPage,
              pageSize: response.pagination.itemsPerPage,
              totalItems: response.pagination.totalItems,
              totalPages: response.pagination.totalPages,
            });
          }
          this.isLoadingTransactions.set(false);
        },
        error: (err) => {
          console.error('Error loading transactions:', err);
          this.toastService.showError('Error al cargar transacciones');
          this.isLoadingTransactions.set(false);
        },
      });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadRecentTransactions();
  }

  onViewLocation(location: WarehouseLocation): void {
    this.router.navigate(['/warehouse/stock', location.id]);
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

  getTotalStockValue(): number {
    if (!this.stats()) return 0;
    return this.stats()!.stock_by_location.reduce((sum, loc) => sum + (loc.stock_value || 0), 0);
  }
}
