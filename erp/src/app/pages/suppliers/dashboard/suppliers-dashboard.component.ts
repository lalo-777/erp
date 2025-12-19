import { Component, signal, inject, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { SupplierService } from '../../../services/supplier.service';
import { ToastService } from '../../../services/toast.service';
import { Supplier, SupplierStats, SupplierCategory } from '../../../models/supplier.model';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { NewSupplierModalComponent } from '../../../components/new-supplier-modal/new-supplier-modal.component';
import { TableColumn, PaginationInfo, RowAction } from '../../../shared/models/table.model';

@Component({
  selector: 'app-suppliers-dashboard',
  imports: [
    MatIconModule,
    CommonModule,
    FormsModule,
    DataTableComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
    NewSupplierModalComponent,
  ],
  templateUrl: './suppliers-dashboard.component.html',
  styleUrl: './suppliers-dashboard.component.scss',
})
export class SuppliersDashboardComponent implements OnInit {
  private router = inject(Router);
  private supplierService = inject(SupplierService);
  private toastService = inject(ToastService);

  @ViewChild(NewSupplierModalComponent) newSupplierModal!: NewSupplierModalComponent;
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  // Signals
  suppliers = signal<Supplier[]>([]);
  stats = signal<SupplierStats | null>(null);
  categories = signal<SupplierCategory[]>([]);
  isLoading = signal(false);
  isLoadingStats = signal(false);
  searchTerm = signal('');
  selectedCategoryId = signal<number | null>(null);
  currentPage = signal(1);
  pageSize = signal(10);
  pagination = signal<PaginationInfo | undefined>(undefined);
  selectedSupplierId = signal<number | null>(null);

  // Table columns
  columns: TableColumn[] = [
    { field: 'supplier_name', header: 'Nombre', sortable: true },
    { field: 'category_name', header: 'Categoría', sortable: true, width: '150px' },
    { field: 'contact_name', header: 'Contacto', sortable: true },
    { field: 'phone', header: 'Teléfono', sortable: true, width: '130px' },
    { field: 'email', header: 'Email', sortable: true },
    { field: 'payment_terms', header: 'Términos de Pago', sortable: true, width: '150px' },
    { field: 'purchase_orders_count', header: 'Órdenes', sortable: true, type: 'number', width: '100px' },
  ];

  ngOnInit(): void {
    this.loadSuppliers();
    this.loadStats();
    this.loadCategories();
  }

  loadSuppliers(): void {
    this.isLoading.set(true);

    this.supplierService
      .getAllSuppliers(
        this.currentPage(),
        this.pageSize(),
        this.searchTerm() || undefined,
        this.selectedCategoryId() || undefined
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.suppliers.set(response.data);
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
          console.error('Error loading suppliers:', err);
          this.toastService.showError('Error al cargar proveedores');
          this.isLoading.set(false);
        },
      });
  }

  loadStats(): void {
    this.isLoadingStats.set(true);

    this.supplierService.getSupplierStats().subscribe({
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

  loadCategories(): void {
    this.supplierService.getSupplierCategories().subscribe({
      next: (response) => {
        if (response.success) {
          this.categories.set(response.data);
        }
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      },
    });
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadSuppliers();
  }

  onCategoryChange(): void {
    this.currentPage.set(1);
    this.loadSuppliers();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadSuppliers();
  }

  onNewSupplier(): void {
    this.selectedSupplierId.set(null);
    this.newSupplierModal.openModal();
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

  onView(supplier: Supplier): void {
    this.router.navigate(['/suppliers', supplier.id]);
  }

  onEdit(supplier: Supplier): void {
    this.selectedSupplierId.set(supplier.id);
    setTimeout(() => {
      this.newSupplierModal.openModal();
    }, 0);
  }

  onDelete(supplier: Supplier): void {
    this.confirmDialog.open(
      '¿Eliminar Proveedor?',
      `¿Está seguro que desea eliminar el proveedor "${supplier.supplier_name}"? Esta acción no se puede deshacer.`,
      () => {
        this.deleteSupplier(supplier.id);
      }
    );
  }

  deleteSupplier(id: number): void {
    this.supplierService.deleteSupplier(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.showSuccess('Proveedor eliminado exitosamente');
          this.loadSuppliers();
          this.loadStats();
        }
      },
      error: (err) => {
        console.error('Error deleting supplier:', err);
        this.toastService.showError(err.error?.message || 'Error al eliminar el proveedor');
      },
    });
  }

  onSupplierSaved(): void {
    this.toastService.showSuccess(
      this.selectedSupplierId() ? 'Proveedor actualizado exitosamente' : 'Proveedor creado exitosamente'
    );
    this.loadSuppliers();
    this.loadStats();
    this.selectedSupplierId.set(null);
  }

  getCategoryCount(categoryName: string): number {
    const category = this.stats()?.suppliers_by_category?.find((c) => c.category_name === categoryName);
    return category?.count || 0;
  }
}
