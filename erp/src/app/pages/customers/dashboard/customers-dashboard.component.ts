import { Component, signal, inject, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CustomerService } from '../../../services/customer.service';
import { ToastService } from '../../../services/toast.service';
import { CustomerListItem, CustomerStats } from '../../../models/customer.model';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { NewCustomerModalComponent } from '../../../components/new-customer-modal/new-customer-modal.component';
import { TableColumn, PaginationInfo, RowAction } from '../../../shared/models/table.model';

@Component({
  selector: 'app-customers-dashboard',
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatIconModule,
    DataTableComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
    BadgeComponent,
    NewCustomerModalComponent,
  ],
  templateUrl: './customers-dashboard.component.html',
  styleUrl: './customers-dashboard.component.scss',
})
export class CustomersDashboardComponent implements OnInit {
  private router = inject(Router);
  private customerService = inject(CustomerService);
  private toastService = inject(ToastService);

  @ViewChild(NewCustomerModalComponent) newCustomerModal!: NewCustomerModalComponent;
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  // Signals
  customers = signal<CustomerListItem[]>([]);
  stats = signal<CustomerStats | null>(null);
  isLoading = signal(false);
  isLoadingStats = signal(false);
  searchTerm = signal('');
  currentPage = signal(1);
  pageSize = signal(10);
  pagination = signal<PaginationInfo | undefined>(undefined);
  selectedCustomerId = signal<number | null>(null);

  // Table columns
  columns: TableColumn[] = [
    { field: 'id', header: 'ID', sortable: true, width: '80px' },
    { field: 'company_name', header: 'Empresa', sortable: true },
    { field: 'rfc', header: 'RFC', sortable: true },
    { field: 'contact_name', header: 'Contacto', sortable: true },
    { field: 'contact_email', header: 'Email', sortable: false },
    { field: 'contact_phone', header: 'Teléfono', sortable: false },
    {
      field: 'is_active',
      header: 'Estado',
      sortable: true,
      type: 'badge',
      format: (value: boolean) => (value ? 'Activo' : 'Inactivo'),
    },
  ];

  ngOnInit(): void {
    this.loadCustomers();
    this.loadStats();
  }

  loadCustomers(): void {
    this.isLoading.set(true);

    this.customerService
      .getAllCustomers(this.currentPage(), this.pageSize(), this.searchTerm() || undefined)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.customers.set(response.data);
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
          console.error('Error loading customers:', err);
          this.toastService.showError('Error al cargar clientes');
          this.isLoading.set(false);
        },
      });
  }

  loadStats(): void {
    this.isLoadingStats.set(true);

    this.customerService.getCustomerStats().subscribe({
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
    this.loadCustomers();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadCustomers();
  }

  onNewCustomer(): void {
    this.selectedCustomerId.set(null);
    this.newCustomerModal.openModal();
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

  onView(customer: CustomerListItem): void {
    this.router.navigate(['/customers', customer.id]);
  }

  onEdit(customer: CustomerListItem): void {
    this.selectedCustomerId.set(customer.id);
    setTimeout(() => {
      this.newCustomerModal.openModal();
    }, 0);
  }

  onDelete(customer: CustomerListItem): void {
    this.confirmDialog.open(
      '¿Eliminar Cliente?',
      `¿Está seguro que desea eliminar el cliente "${customer.company_name}"? Esta acción no se puede deshacer.`,
      () => {
        this.deleteCustomer(customer.id);
      }
    );
  }

  deleteCustomer(id: number): void {
    this.customerService.deleteCustomer(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.showSuccess('Cliente eliminado exitosamente');
          this.loadCustomers();
          this.loadStats();
        }
      },
      error: (err) => {
        console.error('Error deleting customer:', err);
        this.toastService.showError('Error al eliminar el cliente');
      },
    });
  }

  onCustomerSaved(): void {
    this.toastService.showSuccess(
      this.selectedCustomerId() ? 'Cliente actualizado exitosamente' : 'Cliente creado exitosamente'
    );
    this.loadCustomers();
    this.loadStats();
    this.selectedCustomerId.set(null);
  }
}
