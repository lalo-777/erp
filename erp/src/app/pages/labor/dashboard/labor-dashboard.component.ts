import { Component, signal, inject, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LaborService } from '../../../services/labor.service';
import { ToastService } from '../../../services/toast.service';
import { LaborTimesheet, LaborStats, getPaymentStatusColor, getPaymentStatusLabel } from '../../../models/labor.model';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { NewLaborTimesheetModalComponent } from '../../../components/new-labor-timesheet-modal/new-labor-timesheet-modal.component';
import { TableColumn, PaginationInfo, RowAction } from '../../../shared/models/table.model';

@Component({
  selector: 'app-labor-dashboard',
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    DataTableComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
    BadgeComponent,
    NewLaborTimesheetModalComponent,
  ],
  templateUrl: './labor-dashboard.component.html',
  styleUrl: './labor-dashboard.component.scss',
})
export class LaborDashboardComponent implements OnInit {
  private router = inject(Router);
  private laborService = inject(LaborService);
  private toastService = inject(ToastService);

  @ViewChild(NewLaborTimesheetModalComponent) newTimesheetModal!: NewLaborTimesheetModalComponent;
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  // Signals
  timesheets = signal<LaborTimesheet[]>([]);
  stats = signal<LaborStats | null>(null);
  isLoading = signal(false);
  isLoadingStats = signal(false);
  searchTerm = signal('');
  currentPage = signal(1);
  pageSize = signal(10);
  pagination = signal<PaginationInfo | undefined>(undefined);
  selectedTimesheetId = signal<number | null>(null);
  selectedPaymentStatus = signal<string>('all');

  // Table columns
  columns: TableColumn[] = [
    { field: 'timesheet_code', header: 'Código', sortable: true, width: '120px' },
    { field: 'worker_name', header: 'Trabajador', sortable: true },
    { field: 'project_code', header: 'Proyecto', sortable: true, width: '120px' },
    { field: 'work_date', header: 'Fecha', sortable: true, type: 'date', width: '120px' },
    { field: 'hours_worked', header: 'Horas', sortable: true, type: 'number', width: '100px' },
    { field: 'hourly_rate', header: 'Tarifa/Hora', sortable: true, type: 'currency', width: '120px' },
    { field: 'payment_amount', header: 'Monto Total', sortable: true, type: 'currency', width: '130px' },
    {
      field: 'payment_status',
      header: 'Estado de Pago',
      sortable: true,
      type: 'badge',
      width: '140px',
    },
  ];

  ngOnInit(): void {
    this.loadTimesheets();
    this.loadStats();
  }

  loadTimesheets(): void {
    this.isLoading.set(true);

    this.laborService
      .getAllTimesheets(
        this.currentPage(),
        this.pageSize(),
        this.searchTerm() || undefined,
        undefined,
        this.selectedPaymentStatus() !== 'all' ? this.selectedPaymentStatus() : undefined
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            // Add badge information
            const timesheetsWithBadge = response.data.map((t: any) => ({
              ...t,
              payment_status_label: getPaymentStatusLabel(t.payment_status),
              payment_status_color: getPaymentStatusColor(t.payment_status),
            }));
            this.timesheets.set(timesheetsWithBadge);
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
          console.error('Error loading timesheets:', err);
          this.toastService.showError('Error al cargar hojas de tiempo');
          this.isLoading.set(false);
        },
      });
  }

  loadStats(): void {
    this.isLoadingStats.set(true);

    this.laborService.getLaborStats().subscribe({
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

  onSearch(): void {
    this.currentPage.set(1);
    this.loadTimesheets();
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadTimesheets();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadTimesheets();
  }

  onNewTimesheet(): void {
    this.selectedTimesheetId.set(null);
    this.newTimesheetModal.openModal();
  }

  onRowAction(action: RowAction): void {
    switch (action.type) {
      case 'view':
        this.onView(action.data);
        break;
      case 'edit':
        this.onEdit(action.data);
        break;
      case 'delete':
        this.onDelete(action.data);
        break;
      case 'custom':
        if (action.customAction === 'approve') {
          this.onApprove(action.data);
        } else if (action.customAction === 'pay') {
          this.onMarkAsPaid(action.data);
        }
        break;
    }
  }

  onView(timesheet: LaborTimesheet): void {
    this.router.navigate(['/labor', timesheet.id]);
  }

  onEdit(timesheet: LaborTimesheet): void {
    this.selectedTimesheetId.set(timesheet.id);
    setTimeout(() => {
      this.newTimesheetModal.openModal();
    }, 0);
  }

  onDelete(timesheet: LaborTimesheet): void {
    this.confirmDialog.open(
      '¿Eliminar Hoja de Tiempo?',
      `¿Está seguro que desea eliminar la hoja de tiempo "${timesheet.timesheet_code}"? Esta acción no se puede deshacer.`,
      () => {
        this.deleteTimesheet(timesheet.id);
      }
    );
  }

  onApprove(timesheet: LaborTimesheet): void {
    if (timesheet.payment_status === 'pending') {
      this.updatePaymentStatus(timesheet.id, 'approved');
    }
  }

  onMarkAsPaid(timesheet: LaborTimesheet): void {
    if (timesheet.payment_status === 'approved') {
      this.confirmDialog.open(
        '¿Marcar como Pagado?',
        `¿Confirma que se ha realizado el pago de $${timesheet.payment_amount} a ${timesheet.worker_name}?`,
        () => {
          this.updatePaymentStatus(timesheet.id, 'paid');
        }
      );
    }
  }

  updatePaymentStatus(id: number, status: 'pending' | 'approved' | 'paid'): void {
    this.laborService.updatePaymentStatus(id, status).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.showSuccess('Estado de pago actualizado exitosamente');
          this.loadTimesheets();
          this.loadStats();
        }
      },
      error: (err) => {
        console.error('Error updating payment status:', err);
        this.toastService.showError('Error al actualizar el estado de pago');
      },
    });
  }

  deleteTimesheet(id: number): void {
    this.laborService.deleteTimesheet(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.showSuccess('Hoja de tiempo eliminada exitosamente');
          this.loadTimesheets();
          this.loadStats();
        }
      },
      error: (err) => {
        console.error('Error deleting timesheet:', err);
        this.toastService.showError('Error al eliminar la hoja de tiempo');
      },
    });
  }

  onTimesheetSaved(): void {
    this.toastService.showSuccess(
      this.selectedTimesheetId()
        ? 'Hoja de tiempo actualizada exitosamente'
        : 'Hoja de tiempo creada exitosamente'
    );
    this.loadTimesheets();
    this.loadStats();
    this.selectedTimesheetId.set(null);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  }
}
