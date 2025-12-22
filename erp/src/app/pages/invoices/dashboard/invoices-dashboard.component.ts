import { Component, signal, inject, ViewChild, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { InvoiceService } from '../../../services/invoice.service';
import { ToastService } from '../../../services/toast.service';
import { InvoiceListItem, InvoiceStats } from '../../../models/invoice.model';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { NewInvoiceModalComponent } from '../../../components/new-invoice-modal/new-invoice-modal.component';
import { TableColumn, PaginationInfo, RowAction } from '../../../shared/models/table.model';
import { KanbanBoardComponent, KanbanColumn, KanbanMoveEvent } from '../../../shared/components/kanban-board/kanban-board.component';

/** Tipo de vista del dashboard */
type ViewMode = 'table' | 'kanban';

/** Definición de estados para Kanban de Facturas */
const INVOICE_STATUS_COLUMNS = [
  { id: 1, alias: 'pending', name: 'Pendiente', color: 'bg-warning' },
  { id: 2, alias: 'paid', name: 'Pagada', color: 'bg-success' },
  { id: 3, alias: 'overdue', name: 'Vencida', color: 'bg-danger' },
  { id: 4, alias: 'cancelled', name: 'Cancelada', color: 'bg-secondary' },
] as const;

@Component({
  selector: 'app-invoices-dashboard',
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    DataTableComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
    NewInvoiceModalComponent,
    KanbanBoardComponent,
  ],
  templateUrl: './invoices-dashboard.component.html',
  styleUrl: './invoices-dashboard.component.scss',
})
export class InvoicesDashboardComponent implements OnInit {
  private router = inject(Router);
  private invoiceService = inject(InvoiceService);
  private toastService = inject(ToastService);

  @ViewChild(NewInvoiceModalComponent) newInvoiceModal!: NewInvoiceModalComponent;
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  // Signals
  invoices = signal<InvoiceListItem[]>([]);
  allInvoices = signal<InvoiceListItem[]>([]); // Para Kanban (sin paginación)
  stats = signal<InvoiceStats | null>(null);
  isLoading = signal(false);
  isLoadingStats = signal(false);
  isLoadingKanban = signal(false);
  searchTerm = signal('');
  currentPage = signal(1);
  pageSize = signal(10);
  pagination = signal<PaginationInfo | undefined>(undefined);
  selectedInvoiceId = signal<number | null>(null);
  viewMode = signal<ViewMode>('table');

  /** Columnas del Kanban calculadas a partir de los datos */
  kanbanColumns = computed<KanbanColumn<InvoiceListItem>[]>(() => {
    const invoiceList = this.allInvoices();
    return INVOICE_STATUS_COLUMNS.map((status) => ({
      id: status.id,
      name: status.name,
      color: status.color,
      items: invoiceList.filter((inv) => {
        // Match by status alias (from backend)
        const statusAlias = inv.invoice_status?.toLowerCase();
        return statusAlias === status.alias || inv.invoice_status_id === status.id;
      }),
    }));
  });

  // Table columns
  columns: TableColumn[] = [
    { field: 'id', header: 'ID', sortable: true, width: '80px' },
    { field: 'invoice_number', header: 'Número', sortable: true },
    { field: 'customer_name', header: 'Cliente', sortable: true },
    { field: 'invoice_type', header: 'Tipo', sortable: true },
    { field: 'invoice_date', header: 'Fecha Emisión', sortable: true, type: 'date' },
    { field: 'due_date', header: 'Fecha Vencimiento', sortable: true, type: 'date' },
    { field: 'total', header: 'Total', sortable: true, type: 'currency' },
    {
      field: 'invoice_status',
      header: 'Estado',
      sortable: true,
      type: 'badge',
      format: (value: string) => {
        const statusMap: { [key: string]: string } = {
          paid: 'Pagada',
          pending: 'Pendiente',
          overdue: 'Vencida',
          cancelled: 'Cancelada',
        };
        return value ? (statusMap[value.toLowerCase()] || value) : '';
      },
    },
  ];

  ngOnInit(): void {
    this.loadInvoices();
    this.loadStats();
  }

  loadInvoices(): void {
    this.isLoading.set(true);

    this.invoiceService
      .getAllInvoices(this.currentPage(), this.pageSize(), this.searchTerm() || undefined)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.invoices.set(response.data);
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
          console.error('Error loading invoices:', err);
          this.toastService.showError('Error al cargar facturas');
          this.isLoading.set(false);
        },
      });
  }

  loadStats(): void {
    this.isLoadingStats.set(true);

    this.invoiceService.getInvoiceStats().subscribe({
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
    this.loadInvoices();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadInvoices();
  }

  onNewInvoice(): void {
    this.selectedInvoiceId.set(null);
    this.newInvoiceModal.openModal();
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
    }
  }

  onView(invoice: InvoiceListItem): void {
    this.router.navigate(['/invoices', invoice.id]);
  }

  onEdit(invoice: InvoiceListItem): void {
    this.selectedInvoiceId.set(invoice.id);
    setTimeout(() => {
      this.newInvoiceModal.openModal();
    }, 0);
  }

  onDelete(invoice: InvoiceListItem): void {
    this.confirmDialog.open(
      '¿Eliminar Factura?',
      `¿Está seguro que desea eliminar la factura "${invoice.invoice_number}"? Esta acción no se puede deshacer.`,
      () => {
        this.deleteInvoice(invoice.id);
      }
    );
  }

  deleteInvoice(id: number): void {
    this.invoiceService.deleteInvoice(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.showSuccess('Factura eliminada exitosamente');
          this.loadInvoices();
          this.loadStats();
        }
      },
      error: (err) => {
        console.error('Error deleting invoice:', err);
        this.toastService.showError('Error al eliminar la factura');
      },
    });
  }

  getStatusBadgeClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      paid: 'success',
      pending: 'warning',
      overdue: 'danger',
      cancelled: 'secondary',
    };
    return statusMap[status.toLowerCase()] || 'secondary';
  }

  onInvoiceSaved(): void {
    this.toastService.showSuccess(
      this.selectedInvoiceId() ? 'Factura actualizada exitosamente' : 'Factura creada exitosamente'
    );
    this.loadInvoices();
    this.loadStats();
    this.selectedInvoiceId.set(null);
  }

  // ==========================================
  // Kanban Methods
  // ==========================================

  /** Cambia entre vista tabla y kanban */
  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
    if (mode === 'kanban') {
      this.loadAllInvoicesForKanban();
    }
  }

  /** Carga todas las facturas sin paginación para el Kanban */
  loadAllInvoicesForKanban(): void {
    this.isLoadingKanban.set(true);

    this.invoiceService.getAllInvoices(1, 1000).subscribe({
      next: (response) => {
        if (response.success) {
          this.allInvoices.set(response.data);
        }
        this.isLoadingKanban.set(false);
      },
      error: (err) => {
        console.error('Error loading invoices for kanban:', err);
        this.toastService.showError('Error al cargar facturas para vista Kanban');
        this.isLoadingKanban.set(false);
      },
    });
  }

  /** Maneja el movimiento de un item en el Kanban */
  onKanbanItemMoved(event: KanbanMoveEvent<InvoiceListItem>): void {
    const newStatusId = Number(event.toColumnId);

    this.invoiceService.updateInvoiceStatus(event.item.id, newStatusId).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.showSuccess('Estado actualizado correctamente');
          // Actualizar localmente
          this.allInvoices.update((invoices) =>
            invoices.map((inv) =>
              inv.id === event.item.id ? { ...inv, invoice_status_id: newStatusId } : inv
            )
          );
          // Recargar stats
          this.loadStats();
        }
      },
      error: (err) => {
        console.error('Error updating invoice status:', err);
        this.toastService.showError('Error al actualizar el estado');
        // Recargar para revertir visualmente
        this.loadAllInvoicesForKanban();
      },
    });
  }

  /** Maneja el click en un item del Kanban */
  onKanbanItemClicked(item: InvoiceListItem): void {
    this.router.navigate(['/invoices', item.id]);
  }

  /** Maneja el undo del Kanban */
  onKanbanUndo(): void {
    // Recargar datos para sincronizar
    this.loadAllInvoicesForKanban();
    this.loadStats();
  }
}
