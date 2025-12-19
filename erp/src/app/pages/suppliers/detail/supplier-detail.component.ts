import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { SupplierService } from '../../../services/supplier.service';
import { ToastService } from '../../../services/toast.service';
import { Supplier } from '../../../models/supplier.model';
import { PurchaseOrder } from '../../../models/purchase-order.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { TableColumn, PaginationInfo, RowAction } from '../../../shared/models/table.model';

@Component({
  selector: 'app-supplier-detail',
  imports: [
    MatIconModule,
    CommonModule,
    LoadingSpinnerComponent,
    BadgeComponent,
    DataTableComponent,
  ],
  templateUrl: './supplier-detail.component.html',
  styleUrl: './supplier-detail.component.scss',
})
export class SupplierDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private supplierService = inject(SupplierService);
  private toastService = inject(ToastService);

  // Signals
  supplier = signal<Supplier | null>(null);
  purchaseOrders = signal<PurchaseOrder[]>([]);
  isLoading = signal(false);
  isLoadingOrders = signal(false);
  error = signal<string | null>(null);
  supplierId = signal<number | null>(null);
  currentPage = signal(1);
  pageSize = signal(10);
  pagination = signal<PaginationInfo | undefined>(undefined);

  // Table columns for purchase orders
  orderColumns: TableColumn[] = [
    { field: 'po_number', header: 'Número', sortable: true, width: '130px' },
    { field: 'order_date', header: 'Fecha', sortable: true, type: 'date', width: '120px' },
    { field: 'project_name', header: 'Proyecto', sortable: true },
    { field: 'status_name', header: 'Estado', sortable: true, width: '150px' },
    { field: 'total_amount', header: 'Total', sortable: true, type: 'currency', width: '130px' },
    { field: 'items_count', header: 'Items', sortable: true, type: 'number', width: '80px' },
  ];

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = parseInt(params['id']);
      if (id) {
        this.supplierId.set(id);
        this.loadSupplier(id);
        this.loadPurchaseOrders(id);
      }
    });
  }

  loadSupplier(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.supplierService.getSupplierById(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.supplier.set(response.data);
        } else {
          this.error.set('No se pudo cargar el proveedor');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading supplier:', err);
        this.error.set('Error al cargar el proveedor');
        this.toastService.showError('Error al cargar el proveedor');
        this.isLoading.set(false);
      },
    });
  }

  loadPurchaseOrders(id: number): void {
    this.isLoadingOrders.set(true);

    this.supplierService.getSupplierPurchaseOrders(id, this.currentPage(), this.pageSize()).subscribe({
      next: (response) => {
        if (response.success) {
          this.purchaseOrders.set(response.data);
          this.pagination.set({
            currentPage: response.pagination.currentPage,
            pageSize: response.pagination.itemsPerPage,
            totalItems: response.pagination.totalItems,
            totalPages: response.pagination.totalPages,
          });
        }
        this.isLoadingOrders.set(false);
      },
      error: (err) => {
        console.error('Error loading purchase orders:', err);
        this.isLoadingOrders.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/suppliers']);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    if (this.supplierId()) {
      this.loadPurchaseOrders(this.supplierId()!);
    }
  }

  onRowAction(action: RowAction): void {
    if (action.type === 'view') {
      this.router.navigate(['/purchase-orders', action.data.id]);
    }
  }

  formatDate(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
