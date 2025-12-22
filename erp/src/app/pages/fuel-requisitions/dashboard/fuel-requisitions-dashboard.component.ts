import { Component, signal, inject, ViewChild, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { FuelRequisitionService } from '../../../services/fuel-requisition.service';
import { ToastService } from '../../../services/toast.service';
import { FuelRequisition, FuelStats, getRequisitionStatusColor, getRequisitionStatusLabel, getFuelTypeLabel } from '../../../models/fuel-requisition.model';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { NewFuelRequisitionModalComponent } from '../../../components/new-fuel-requisition-modal/new-fuel-requisition-modal.component';
import { TableColumn, PaginationInfo, RowAction } from '../../../shared/models/table.model';
import { KanbanBoardComponent, KanbanColumn, KanbanMoveEvent } from '../../../shared/components/kanban-board/kanban-board.component';

/** Tipo de vista del dashboard */
type ViewMode = 'table' | 'kanban';

/** Definición de estados para Kanban de Requisiciones */
const FUEL_STATUS_COLUMNS = [
  { id: 'pending', name: 'Pendiente', color: 'bg-warning' },
  { id: 'approved', name: 'Aprobada', color: 'bg-info' },
  { id: 'delivered', name: 'Entregada', color: 'bg-success' },
  { id: 'cancelled', name: 'Cancelada', color: 'bg-secondary' },
] as const;

@Component({
  selector: 'app-fuel-requisitions-dashboard',
  imports: [
    MatIconModule,
    CommonModule,
    FormsModule,
    DataTableComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
    NewFuelRequisitionModalComponent,
    KanbanBoardComponent,
  ],
  templateUrl: './fuel-requisitions-dashboard.component.html',
  styleUrl: './fuel-requisitions-dashboard.component.scss',
})
export class FuelRequisitionsDashboardComponent implements OnInit {
  private router = inject(Router);
  private fuelService = inject(FuelRequisitionService);
  private toastService = inject(ToastService);

  @ViewChild(NewFuelRequisitionModalComponent) newRequisitionModal!: NewFuelRequisitionModalComponent;
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  // Signals
  requisitions = signal<FuelRequisition[]>([]);
  allRequisitions = signal<FuelRequisition[]>([]); // Para Kanban (sin paginación)
  stats = signal<FuelStats | null>(null);
  isLoading = signal(false);
  isLoadingStats = signal(false);
  isLoadingKanban = signal(false);
  searchTerm = signal('');
  currentPage = signal(1);
  pageSize = signal(10);
  pagination = signal<PaginationInfo | undefined>(undefined);
  selectedRequisitionId = signal<number | null>(null);
  selectedRequisitionStatus = signal<string>('all');
  selectedFuelType = signal<string>('all');
  viewMode = signal<ViewMode>('table');

  /** Columnas del Kanban calculadas a partir de los datos */
  kanbanColumns = computed<KanbanColumn<FuelRequisition>[]>(() => {
    const reqList = this.allRequisitions();
    return FUEL_STATUS_COLUMNS.map((status) => ({
      id: status.id,
      name: status.name,
      color: status.color,
      items: reqList.filter((r) => r.requisition_status === status.id),
    }));
  });

  // Table columns
  columns: TableColumn[] = [
    { field: 'requisition_code', header: 'Código', sortable: true, width: '120px' },
    { field: 'vehicle_equipment_name', header: 'Vehículo/Equipo', sortable: true },
    { field: 'project_code', header: 'Proyecto', sortable: true, width: '120px' },
    { field: 'requisition_date', header: 'Fecha', sortable: true, type: 'date', width: '120px' },
    { field: 'fuel_type', header: 'Tipo Combustible', sortable: true, width: '140px' },
    { field: 'quantity_liters', header: 'Litros', sortable: true, type: 'number', width: '100px' },
    { field: 'total_amount', header: 'Monto Total', sortable: true, type: 'currency', width: '130px' },
    {
      field: 'requisition_status',
      header: 'Estado',
      sortable: true,
      type: 'badge',
      width: '140px',
    },
  ];

  ngOnInit(): void {
    this.loadRequisitions();
    this.loadStats();
  }

  loadRequisitions(): void {
    this.isLoading.set(true);

    this.fuelService
      .getAllRequisitions(
        this.currentPage(),
        this.pageSize(),
        this.searchTerm() || undefined,
        undefined,
        this.selectedRequisitionStatus() !== 'all' ? this.selectedRequisitionStatus() : undefined,
        this.selectedFuelType() !== 'all' ? this.selectedFuelType() : undefined
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            // Add badge information
            const requisitionsWithBadge = response.data.map((r: any) => ({
              ...r,
              requisition_status_label: getRequisitionStatusLabel(r.requisition_status),
              requisition_status_color: getRequisitionStatusColor(r.requisition_status),
              fuel_type_label: getFuelTypeLabel(r.fuel_type),
            }));
            this.requisitions.set(requisitionsWithBadge);
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
          console.error('Error loading fuel requisitions:', err);
          this.toastService.showError('Error al cargar requisiciones de combustible');
          this.isLoading.set(false);
        },
      });
  }

  loadStats(): void {
    this.isLoadingStats.set(true);

    this.fuelService.getFuelStats().subscribe({
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
    this.loadRequisitions();
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadRequisitions();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadRequisitions();
  }

  onNewRequisition(): void {
    this.selectedRequisitionId.set(null);
    this.newRequisitionModal.openModal();
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
        } else if (action.customAction === 'deliver') {
          this.onMarkAsDelivered(action.data);
        }
        break;
    }
  }

  onView(requisition: FuelRequisition): void {
    this.router.navigate(['/fuel-requisitions', requisition.id]);
  }

  onEdit(requisition: FuelRequisition): void {
    this.selectedRequisitionId.set(requisition.id);
    setTimeout(() => {
      this.newRequisitionModal.openModal();
    }, 0);
  }

  onDelete(requisition: FuelRequisition): void {
    this.confirmDialog.open(
      '¿Eliminar Requisición?',
      `¿Está seguro que desea eliminar la requisición "${requisition.requisition_code}"? Esta acción no se puede deshacer.`,
      () => {
        this.deleteRequisition(requisition.id);
      }
    );
  }

  onApprove(requisition: FuelRequisition): void {
    if (requisition.requisition_status === 'pending') {
      this.updateRequisitionStatus(requisition.id, 'approved');
    }
  }

  onMarkAsDelivered(requisition: FuelRequisition): void {
    if (requisition.requisition_status === 'approved') {
      this.confirmDialog.open(
        '¿Marcar como Entregada?',
        `¿Confirma que se ha entregado el combustible para "${requisition.vehicle_equipment_name}"?`,
        () => {
          this.updateRequisitionStatus(requisition.id, 'delivered');
        }
      );
    }
  }

  updateRequisitionStatus(id: number, status: 'pending' | 'approved' | 'delivered' | 'cancelled'): void {
    this.fuelService.updateRequisitionStatus(id, status).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.showSuccess('Estado de requisición actualizado exitosamente');
          this.loadRequisitions();
          this.loadStats();
        }
      },
      error: (err) => {
        console.error('Error updating requisition status:', err);
        this.toastService.showError('Error al actualizar el estado de la requisición');
      },
    });
  }

  deleteRequisition(id: number): void {
    this.fuelService.deleteRequisition(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.showSuccess('Requisición eliminada exitosamente');
          this.loadRequisitions();
          this.loadStats();
        }
      },
      error: (err) => {
        console.error('Error deleting requisition:', err);
        this.toastService.showError('Error al eliminar la requisición');
      },
    });
  }

  onRequisitionSaved(): void {
    this.toastService.showSuccess(
      this.selectedRequisitionId()
        ? 'Requisición actualizada exitosamente'
        : 'Requisición creada exitosamente'
    );
    this.loadRequisitions();
    this.loadStats();
    this.selectedRequisitionId.set(null);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  }

  formatLiters(liters: number): string {
    return `${liters.toFixed(2)} L`;
  }

  // ==========================================
  // Kanban Methods
  // ==========================================

  /** Cambia entre vista tabla y kanban */
  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
    if (mode === 'kanban') {
      this.loadAllRequisitionsForKanban();
    }
  }

  /** Carga todas las requisiciones sin paginación para el Kanban */
  loadAllRequisitionsForKanban(): void {
    this.isLoadingKanban.set(true);

    this.fuelService.getAllRequisitions(1, 1000).subscribe({
      next: (response) => {
        if (response.success) {
          const requisitionsWithBadge = response.data.map((r: any) => ({
            ...r,
            requisition_status_label: getRequisitionStatusLabel(r.requisition_status),
            requisition_status_color: getRequisitionStatusColor(r.requisition_status),
            fuel_type_label: getFuelTypeLabel(r.fuel_type),
          }));
          this.allRequisitions.set(requisitionsWithBadge);
        }
        this.isLoadingKanban.set(false);
      },
      error: (err) => {
        console.error('Error loading requisitions for kanban:', err);
        this.toastService.showError('Error al cargar requisiciones para vista Kanban');
        this.isLoadingKanban.set(false);
      },
    });
  }

  /** Maneja el movimiento de un item en el Kanban */
  onKanbanItemMoved(event: KanbanMoveEvent<FuelRequisition>): void {
    const newStatus = event.toColumnId as 'pending' | 'approved' | 'delivered' | 'cancelled';

    this.fuelService.updateRequisitionStatus(event.item.id, newStatus).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.showSuccess('Estado actualizado correctamente');
          // Actualizar localmente
          this.allRequisitions.update((requisitions) =>
            requisitions.map((r) =>
              r.id === event.item.id ? { ...r, requisition_status: newStatus } : r
            )
          );
          // Recargar stats
          this.loadStats();
        }
      },
      error: (err) => {
        console.error('Error updating status:', err);
        this.toastService.showError('Error al actualizar el estado');
        // Recargar para revertir visualmente
        this.loadAllRequisitionsForKanban();
      },
    });
  }

  /** Maneja el click en un item del Kanban */
  onKanbanItemClicked(item: FuelRequisition): void {
    this.router.navigate(['/fuel-requisitions', item.id]);
  }

  /** Maneja el undo del Kanban */
  onKanbanUndo(): void {
    // Recargar datos para sincronizar
    this.loadAllRequisitionsForKanban();
    this.loadStats();
  }
}
