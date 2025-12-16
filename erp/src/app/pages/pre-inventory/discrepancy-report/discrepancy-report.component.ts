import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PreInventoryService } from '../../../services/pre-inventory.service';
import { ToastService } from '../../../services/toast.service';
import { WarehouseService } from '../../../services/warehouse.service';
import {
  DiscrepancyReport,
  DiscrepancyReportItem,
  getDiscrepancyColor,
  getDiscrepancyLabel,
} from '../../../models/pre-inventory.model';
import { WarehouseLocation } from '../../../models/warehouse.model';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { TableColumn } from '../../../shared/models/table.model';

@Component({
  selector: 'app-discrepancy-report',
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    DataTableComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    BadgeComponent,
  ],
  templateUrl: './discrepancy-report.component.html',
  styleUrl: './discrepancy-report.component.scss',
})
export class DiscrepancyReportComponent implements OnInit {
  private preInventoryService = inject(PreInventoryService);
  private toastService = inject(ToastService);
  private warehouseService = inject(WarehouseService);

  // Signals
  report = signal<DiscrepancyReport | null>(null);
  locations = signal<WarehouseLocation[]>([]);
  isLoading = signal(false);
  isLoadingLocations = signal(false);

  // Filters
  selectedLocation = signal<number | undefined>(undefined);
  startDate = signal<string>('');
  endDate = signal<string>('');
  onlyDiscrepancies = signal<boolean>(true);

  // Table columns
  reportColumns: TableColumn[] = [
    { field: 'pre_inventory_number', header: 'Número', sortable: true, width: '130px' },
    { field: 'material_name', header: 'Material', sortable: true },
    { field: 'category_name', header: 'Categoría', sortable: true, width: '150px' },
    { field: 'location_name', header: 'Ubicación', sortable: true, width: '150px' },
    { field: 'expected_quantity', header: 'Esperado', sortable: true, type: 'number', width: '100px' },
    { field: 'counted_quantity', header: 'Contado', sortable: true, type: 'number', width: '100px' },
    { field: 'discrepancy', header: 'Discrepancia', sortable: true, type: 'number', width: '120px' },
    { field: 'discrepancy_value', header: 'Valor', sortable: true, type: 'currency', width: '120px' },
    { field: 'adjusted', header: 'Ajustado', sortable: true, width: '100px' },
  ];

  ngOnInit(): void {
    this.loadLocations();
    this.loadReport();
  }

  loadLocations(): void {
    this.isLoadingLocations.set(true);

    this.warehouseService.getAllLocations().subscribe({
      next: (response: { success: boolean; data: WarehouseLocation[] }) => {
        if (response.success) {
          this.locations.set(response.data);
        }
        this.isLoadingLocations.set(false);
      },
      error: (err: any) => {
        console.error('Error loading locations:', err);
        this.isLoadingLocations.set(false);
      },
    });
  }

  loadReport(): void {
    this.isLoading.set(true);

    this.preInventoryService
      .getDiscrepancyReport({
        locationId: this.selectedLocation(),
        startDate: this.startDate() || undefined,
        endDate: this.endDate() || undefined,
        onlyDiscrepancies: this.onlyDiscrepancies(),
      })
      .subscribe({
        next: (response) => {
          if (response.success) {
            // Add badge information
            const detailsWithBadge = response.data.details.map((item: any) => ({
              ...item,
              discrepancy_color: getDiscrepancyColor(item.discrepancy),
              discrepancy_label: getDiscrepancyLabel(item.discrepancy),
            }));
            this.report.set({
              summary: response.data.summary,
              details: detailsWithBadge,
            });
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading report:', err);
          this.toastService.showError('Error al cargar reporte de discrepancias');
          this.isLoading.set(false);
        },
      });
  }

  onFilterChange(): void {
    this.loadReport();
  }

  onClearFilters(): void {
    this.selectedLocation.set(undefined);
    this.startDate.set('');
    this.endDate.set('');
    this.onlyDiscrepancies.set(true);
    this.loadReport();
  }

  onExportReport(): void {
    // TODO: Implement export functionality
    this.toastService.showInfo('Funcionalidad de exportación próximamente');
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
    const summary = this.report()?.summary;
    if (!summary || summary.total_counts === 0) return 0;
    return (summary.discrepancies_count / summary.total_counts) * 100;
  }

  getAdjustmentPercentage(): number {
    const summary = this.report()?.summary;
    if (!summary || summary.discrepancies_count === 0) return 0;
    return (summary.adjustments_processed / summary.discrepancies_count) * 100;
  }
}
