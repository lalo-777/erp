import { Component, signal, output, inject, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomerService } from '../../services/customer.service';
import { CatalogService } from '../../services/catalog.service';
import { CreateCustomerRequest, UpdateCustomerRequest } from '../../models/customer.model';

declare const bootstrap: any;

interface StateItem {
  id: number;
  state_name: string;
}

@Component({
  selector: 'app-new-customer-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './new-customer-modal.component.html',
  styleUrl: './new-customer-modal.component.scss',
})
export class NewCustomerModalComponent {
  private fb = inject(FormBuilder);
  private customerService = inject(CustomerService);
  private catalogService = inject(CatalogService);

  // Inputs
  customerId = input<number | null>(null);

  // Outputs
  customerSaved = output<void>();

  // Signals
  states = signal<StateItem[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  error = signal<string | null>(null);
  isEditMode = signal(false);
  modalTitle = signal('Nuevo Cliente');

  // Form
  customerForm!: FormGroup;

  constructor() {
    this.initForm();

    // Effect to handle edit mode
    effect(() => {
      const id = this.customerId();
      if (id) {
        this.isEditMode.set(true);
        this.modalTitle.set('Editar Cliente');
        this.loadCustomerData(id);
      } else {
        this.isEditMode.set(false);
        this.modalTitle.set('Nuevo Cliente');
      }
    });
  }

  private initForm(): void {
    this.customerForm = this.fb.group({
      company_name: ['', [Validators.required, Validators.maxLength(255)]],
      rfc: ['', [Validators.maxLength(13), Validators.pattern(/^[A-Z&Ñ]{3,4}\d{6}[A-Z0-9]{3}$/)]],
      contact_name: ['', [Validators.maxLength(255)]],
      contact_email: ['', [Validators.email, Validators.maxLength(255)]],
      contact_phone: ['', [Validators.maxLength(15)]],
      address: [''],
      city: ['', [Validators.maxLength(100)]],
      state_id: [null],
      postal_code: ['', [Validators.maxLength(10)]],
    });
  }

  private loadCatalogs(): void {
    this.catalogService.getCatalog('states').subscribe({
      next: (items: any[]) => {
        const stateItems: StateItem[] = items.map((item) => ({
          id: item.id,
          state_name: item.state_name,
        }));
        this.states.set(stateItems);
      },
      error: (err: any) => {
        console.error('Error loading states:', err);
        this.error.set('Error loading states catalog');
      },
    });
  }

  private loadCustomerData(id: number): void {
    this.isLoading.set(true);
    this.customerService.getCustomerById(id).subscribe({
      next: (response) => {
        if (response.success) {
          const customer = response.data;
          this.customerForm.patchValue({
            company_name: customer.company_name,
            rfc: customer.rfc,
            contact_name: customer.contact_name,
            contact_email: customer.contact_email,
            contact_phone: customer.contact_phone,
            address: customer.address,
            city: customer.city,
            state_id: customer.state_id,
            postal_code: customer.postal_code,
          });
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading customer:', err);
        this.error.set('Error loading customer data');
        this.isLoading.set(false);
      },
    });
  }

  openModal(): void {
    this.loadCatalogs();
    this.error.set(null);

    if (!this.customerId()) {
      this.resetForm();
    }

    const modalElement = document.getElementById('newCustomerModal');
    if (modalElement && typeof bootstrap !== 'undefined') {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  closeModal(): void {
    const modalElement = document.getElementById('newCustomerModal');
    if (modalElement && typeof bootstrap !== 'undefined') {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }

  onSubmit(): void {
    if (this.customerForm.invalid) {
      Object.keys(this.customerForm.controls).forEach((key) => {
        this.customerForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSaving.set(true);
    this.error.set(null);

    const formValue = this.customerForm.value;

    if (this.isEditMode() && this.customerId()) {
      // Update existing customer
      const updateRequest: UpdateCustomerRequest = formValue;
      this.customerService.updateCustomer(this.customerId()!, updateRequest).subscribe({
        next: (response) => {
          this.isSaving.set(false);
          if (response.success) {
            this.closeModal();
            this.resetForm();
            this.customerSaved.emit();
          }
        },
        error: (err) => {
          console.error('Error updating customer:', err);
          this.isSaving.set(false);
          this.error.set(err.error?.message || 'Error al actualizar el cliente');
        },
      });
    } else {
      // Create new customer
      const createRequest: CreateCustomerRequest = formValue;
      this.customerService.createCustomer(createRequest).subscribe({
        next: (response) => {
          this.isSaving.set(false);
          if (response.success) {
            this.closeModal();
            this.resetForm();
            this.customerSaved.emit();
          }
        },
        error: (err) => {
          console.error('Error creating customer:', err);
          this.isSaving.set(false);
          this.error.set(err.error?.message || 'Error al crear el cliente');
        },
      });
    }
  }

  resetForm(): void {
    this.customerForm.reset();
    this.error.set(null);
    this.isEditMode.set(false);
    this.modalTitle.set('Nuevo Cliente');
  }

  hasError(fieldName: string): boolean {
    const field = this.customerForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.customerForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (field.hasError('email')) {
      return 'Ingrese un email válido';
    }
    if (field.hasError('maxlength')) {
      const maxLength = field.errors['maxlength'].requiredLength;
      return `Máximo ${maxLength} caracteres`;
    }
    if (field.hasError('pattern')) {
      return 'RFC inválido (ej: ABC123456XYZ)';
    }
    return 'Valor inválido';
  }
}
