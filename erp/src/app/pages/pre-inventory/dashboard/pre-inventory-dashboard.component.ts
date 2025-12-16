import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PreInventoryService } from '../../../services/pre-inventory.service';
import { ToastService } from '../../../services/toast.service';
import {
  PreInventory,
  PreInventoryStats,
  getPreInventoryStatusColor,
  getPreInventoryStatusIcon,
  getDiscrepancyColor as getDiscrepancyColorUtil,
  getDiscrepancyLabel,
} from '../../../models/pre-inventory.model';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { TableColumn, PaginationInfo } from '../../../shared/models/table.model';

@Component({
  selector: 'app-pre-inventory-dashboard',
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    DataTableComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    BadgeComponent,
  ],
  templateUrl: './pre-inventory-dashboard.component.html',
  styleUrl: './pre-inventory-dashboard.component.scss',
})
export class PreInventoryDashboardComponent implements OnInit {
  private router = inject(Router);
  private preInventoryService = inject(PreInventoryService);
  private toastService = inject(ToastService);

  // Signals
  records = signal<PreInventory[]>([]);
  stats = signal<PreInventoryStats | null>(null);
  isLoading = signal(false);
  isLoadingStats = signal(false);
  currentPage = signal(1);
  pageSize = signal(10);
  pagination = signal<PaginationInfo | undefined>(undefined);
  selectedStatusFilter = signal<number | undefined>(undefined);

  // Table columns for pre-inventory records
  recordColumns: TableColumn[] = [
    { field: 'pre_inventory_number', header: 'Número', sortable: true, width: '130px' },
    { field: 'material_name', header: 'Material', sortable: true },
    { field: 'location_name', header: 'Ubicación', sortable: true, width: '150px' },
    { field: 'expected_quantity', header: 'Esperado', sortable: true, type: 'number', width: '100px' },
    { field: 'counted_quantity', header: 'Contado', sortable: true, type: 'number', width: '100px' },
    { field: 'discrepancy', header: 'Discrepancia', sortable: true, type: 'number', width: '120px' },
    { field: 'status_name', header: 'Estado', sortable: true, type: 'badge', width: '120px' },
    { field: 'count_date', header: 'Fecha', sortable: true, type: 'date', width: '120px' },
  ];

  ngOnInit(): void {
    this.loadStats();
    this.loadRecords();
  }

  loadStats(): void {
    this.isLoadingStats.set(true);

    this.preInventoryService.getPreInventoryStats().subscribe({
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

  loadRecords(): void {
    this.isLoading.set(true);

    this.preInventoryService
      .getAllPreInventory({
        page: this.currentPage(),
        limit: this.pageSize(),
        statusId: this.selectedStatusFilter(),
      })
      .subscribe({
        next: (response) => {
          if (response.success) {
            // Add badge information
            const recordsWithBadge = response.data.map((r: any) => ({
              ...r,
              status_color: getPreInventoryStatusColor(r.status_id),
              status_icon: getPreInventoryStatusIcon(r.status_id),
              discrepancy_color: r.discrepancy ? this.getDiscrepancyColor(r.discrepancy) : 'secondary',
              discrepancy_label: r.discrepancy ? getDiscrepancyLabel(r.discrepancy) : '-',
            }));
            this.records.set(recordsWithBadge);
            this.pagination.set({
              currentPage: response.pagination.currentPage,
              pageSize: response.pagination.itemsPerPage,
              totalItems: response.pagination.totalItems,
              totalPages: response.pagination.totalPages,
            });
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading records:', err);
          this.toastService.showError('Error al cargar registros de pre-inventario');
          this.isLoading.set(false);
        },
      });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadRecords();
  }

  onFilterByStatus(statusId?: number): void {
    this.selectedStatusFilter.set(statusId);
    this.currentPage.set(1);
    this.loadRecords();
  }

  onRowAction(event: any): void {
    if (event.type === 'view') {
      this.router.navigate(['/pre-inventory/detail', event.data.id]);
    }
  }

  onViewRecord(record: PreInventory): void {
    this.router.navigate(['/pre-inventory/detail', record.id]);
  }

  onCreateNew(): void {
    this.router.navigate(['/pre-inventory/new']);
  }

  onViewDiscrepancyReport(): void {
    this.router.navigate(['/pre-inventory/discrepancy-report']);
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

  getDiscrepancyPercentage(): number {
    const stats = this.stats();
    if (!stats || stats.total_counts === 0) return 0;
    return (stats.with_discrepancies / stats.total_counts) * 100;
  }

  getAdjustmentPercentage(): number {
    const stats = this.stats();
    if (!stats || stats.with_discrepancies === 0) return 0;
    return (stats.adjusted_counts / stats.with_discrepancies) * 100;
  }

  getDiscrepancyColor(discrepancy: number): 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'dark' {
    return getDiscrepancyColorUtil(discrepancy);
  }
}
