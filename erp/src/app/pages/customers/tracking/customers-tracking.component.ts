import { Component, signal, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CustomerService } from '../../../services/customer.service';
import { ToastService } from '../../../services/toast.service';
import { Customer } from '../../../models/customer.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { NewCustomerModalComponent } from '../../../components/new-customer-modal/new-customer-modal.component';

@Component({
  selector: 'app-customers-tracking',
  imports: [
    CommonModule,
    RouterLink,
    LoadingSpinnerComponent,
    ErrorAlertComponent,
    BadgeComponent,
    ConfirmDialogComponent,
    NewCustomerModalComponent,
  ],
  templateUrl: './customers-tracking.component.html',
  styleUrl: './customers-tracking.component.scss',
})
export class CustomersTrackingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private customerService = inject(CustomerService);
  private toastService = inject(ToastService);

  @ViewChild(NewCustomerModalComponent) newCustomerModal!: NewCustomerModalComponent;
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  // Signals
  customer = signal<Customer | null>(null);
  customerId = signal<number | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = Number(params['id']);
      if (id) {
        this.customerId.set(id);
        this.loadCustomer(id);
      }
    });
  }

  loadCustomer(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.customerService.getCustomerById(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.customer.set(response.data);
        } else {
          this.error.set('Cliente no encontrado');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading customer:', err);
        this.error.set('Error al cargar los datos del cliente');
        this.isLoading.set(false);
      },
    });
  }

  onEdit(): void {
    if (this.customerId()) {
      setTimeout(() => {
        this.newCustomerModal.openModal();
      }, 0);
    }
  }

  onDelete(): void {
    const customer = this.customer();
    if (!customer) return;

    this.confirmDialog.open(
      '¿Eliminar Cliente?',
      `¿Está seguro que desea eliminar el cliente "${customer.company_name}"? Esta acción no se puede deshacer.`,
      () => {
        this.deleteCustomer();
      }
    );
  }

  deleteCustomer(): void {
    const id = this.customerId();
    if (!id) return;

    this.customerService.deleteCustomer(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.showSuccess('Cliente eliminado exitosamente');
          this.router.navigate(['/customers']);
        }
      },
      error: (err) => {
        console.error('Error deleting customer:', err);
        this.toastService.showError('Error al eliminar el cliente');
      },
    });
  }

  onCustomerSaved(): void {
    this.toastService.showSuccess('Cliente actualizado exitosamente');
    if (this.customerId()) {
      this.loadCustomer(this.customerId()!);
    }
  }

  getBadgeVariant(isActive: boolean): 'success' | 'danger' | 'primary' | 'warning' | 'info' | 'secondary' | 'dark' {
    return isActive ? 'success' : 'danger';
  }

  getBadgeText(isActive: boolean): string {
    return isActive ? 'Activo' : 'Inactivo';
  }
}
