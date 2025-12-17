import { Component, signal, inject, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { PurchaseOrderService } from '../../../services/purchase-order.service';
import { ToastService } from '../../../services/toast.service';
import {
  PurchaseOrder,
  PurchaseOrderStats,
  getPurchaseOrderStatusColor,
  getPurchaseOrderStatusLabel,
  formatCurrency,
} from '../../../models/purchase-order.model';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { TableColumn, PaginationInfo, RowAction } from '../../../shared/models/table.model';
import { NewPurchaseOrderModalComponent } from '../../../components/new-purchase-order-modal/new-purchase-order-modal.component';

@Component({
  selector: 'app-purchase-orders-dashboard',
  imports: [
    MatIconModule,
    CommonModule,
    RouterLink,
    FormsModule,
    DataTableComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
    BadgeComponent,
    NewPurchaseOrderModalComponent,
  ],
  templateUrl: './purchase-orders-dashboard.component.html',
  styleUrl: './purchase-orders-dashboard.component.scss',
})
export class PurchaseOrdersDashboardComponent implements OnInit {
  private router = inject(Router);
  private purchaseOrderService = inject(PurchaseOrderService);
  private toastService = inject(ToastService);

  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;
  @ViewChild(NewPurchaseOrderModalComponent) newPurchaseOrderModal!: NewPurchaseOrderModalComponent;

  // Signals
  purchaseOrders = signal<PurchaseOrder[]>([]);
  stats = signal<PurchaseOrderStats | null>(null);
  isLoading = signal(false);
  isLoadingStats = signal(false);
  searchTerm = signal('');
  currentPage = signal(1);
  pageSize = signal(10);
  pagination = signal<PaginationInfo | undefined>(undefined);
  selectedStatusId = signal<number | string>('all');

  // Table columns
  columns: TableColumn[] = [
    { field: 'po_number', header: 'Número de Orden', sortable: true, width: '150px' },
    { field: 'supplier_name', header: 'Proveedor', sortable: true },
    { field: 'order_date', header: 'Fecha Orden', sortable: true, type: 'date', width: '120px' },
    {
      field: 'expected_delivery_date',
      header: 'Entrega Esperada',
      sortable: true,
      type: 'date',
      width: '140px',
    },
    { field: 'total_amount', header: 'Total', sortable: true, type: 'currency', width: '130px' },
    {
      field: 'status_alias',
      header: 'Estado',
      sortable: true,
      type: 'badge',
      width: '180px',
    },
  ];

  ngOnInit(): void {
    this.loadPurchaseOrders();
    this.loadStats();
  }

  loadPurchaseOrders(): void {
    this.isLoading.set(true);

    const statusId =
      this.selectedStatusId() !== 'all' ? Number(this.selectedStatusId()) : undefined;

    this.purchaseOrderService
      .getAllPurchaseOrders(
        this.currentPage(),
        this.pageSize(),
        this.searchTerm() || undefined,
        statusId
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            // Add badge information
            const ordersWithBadge = response.data.map((po: any) => ({
              ...po,
              status_label: getPurchaseOrderStatusLabel(po.status_alias),
              status_color: getPurchaseOrderStatusColor(po.status_alias),
            }));
            this.purchaseOrders.set(ordersWithBadge);
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
          console.error('Error loading purchase orders:', err);
          this.toastService.showError('Error al cargar órdenes de compra');
          this.isLoading.set(false);
        },
      });
  }

  loadStats(): void {
    this.isLoadingStats.set(true);

    this.purchaseOrderService.getPurchaseOrderStats().subscribe({
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
    this.loadPurchaseOrders();
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadPurchaseOrders();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadPurchaseOrders();
  }

  onNewPurchaseOrder(): void {
    this.newPurchaseOrderModal.openModal();
  }

  onOrderSaved(): void {
    this.loadPurchaseOrders();
    this.loadStats();
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

  onView(po: PurchaseOrder): void {
    this.router.navigate(['/purchase-orders', po.id]);
  }

  onEdit(po: PurchaseOrder): void {
    this.router.navigate(['/purchase-orders', po.id, 'edit']);
  }

  onDelete(po: PurchaseOrder): void {
    this.confirmDialog.open(
      '¿Eliminar Orden de Compra?',
      `¿Está seguro que desea eliminar la orden de compra "${po.po_number}"? Esta acción no se puede deshacer.`,
      () => {
        this.deletePurchaseOrder(po.id);
      }
    );
  }

  deletePurchaseOrder(id: number): void {
    this.purchaseOrderService.deletePurchaseOrder(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.showSuccess('Orden de compra eliminada exitosamente');
          this.loadPurchaseOrders();
          this.loadStats();
        }
      },
      error: (err) => {
        console.error('Error deleting purchase order:', err);
        this.toastService.showError('Error al eliminar la orden de compra');
      },
    });
  }

  formatCurrency(amount: number): string {
    return formatCurrency(amount);
  }
}
