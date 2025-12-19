import { Component, signal, output, inject, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { SupplierService } from '../../services/supplier.service';
import { SupplierCategory, CreateSupplierRequest, UpdateSupplierRequest } from '../../models/supplier.model';

declare const bootstrap: any;

@Component({
  selector: 'app-new-supplier-modal',
  imports: [MatIconModule, CommonModule, ReactiveFormsModule],
  templateUrl: './new-supplier-modal.component.html',
  styleUrl: './new-supplier-modal.component.scss',
})
export class NewSupplierModalComponent {
  private fb = inject(FormBuilder);
  private supplierService = inject(SupplierService);

  // Inputs
  supplierId = input<number | null>(null);

  // Outputs
  supplierSaved = output<void>();

  // Signals
  categories = signal<SupplierCategory[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  error = signal<string | null>(null);
  isEditMode = signal(false);
  modalTitle = signal('Nuevo Proveedor');

  // Form
  supplierForm!: FormGroup;

  // Modal instance
  private modalInstance: any;

  constructor() {
    this.initForm();

    // Effect to handle edit mode
    effect(() => {
      const id = this.supplierId();
      if (id) {
        this.isEditMode.set(true);
        this.modalTitle.set('Editar Proveedor');
        this.loadSupplierData(id);
      } else {
        this.isEditMode.set(false);
        this.modalTitle.set('Nuevo Proveedor');
        this.resetForm();
      }
    });
  }

  private initForm(): void {
    this.supplierForm = this.fb.group({
      supplier_name: ['', [Validators.required, Validators.maxLength(255)]],
      supplier_category_id: [null, [Validators.required]],
      contact_name: ['', [Validators.maxLength(255)]],
      phone: ['', [Validators.maxLength(15)]],
      email: ['', [Validators.email, Validators.maxLength(255)]],
      address: [''],
      payment_terms: ['', [Validators.maxLength(100)]],
    });
  }

  openModal(): void {
    this.loadCategories();
    const modalElement = document.getElementById('newSupplierModal');
    if (modalElement) {
      this.modalInstance = new bootstrap.Modal(modalElement);
      this.modalInstance.show();
    }
  }

  closeModal(): void {
    if (this.modalInstance) {
      this.modalInstance.hide();
      this.resetForm();
    }
  }

  private resetForm(): void {
    this.supplierForm.reset();
    this.error.set(null);
  }

  private loadCategories(): void {
    this.supplierService.getSupplierCategories().subscribe({
      next: (response) => {
        if (response.success) {
          this.categories.set(response.data);
        }
      },
      error: (err) => console.error('Error loading categories:', err),
    });
  }

  private loadSupplierData(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.supplierService.getSupplierById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const supplier = response.data;
          this.supplierForm.patchValue({
            supplier_name: supplier.supplier_name,
            supplier_category_id: supplier.supplier_category_id,
            contact_name: supplier.contact_name,
            phone: supplier.phone,
            email: supplier.email,
            address: supplier.address,
            payment_terms: supplier.payment_terms,
          });
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading supplier:', err);
        this.error.set('Error al cargar los datos del proveedor');
        this.isLoading.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.supplierForm.invalid) {
      this.supplierForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.error.set(null);

    const formData = this.supplierForm.value;

    // Clean up empty strings to null
    Object.keys(formData).forEach((key) => {
      if (formData[key] === '') {
        formData[key] = null;
      }
    });

    if (this.isEditMode() && this.supplierId()) {
      this.updateSupplier(this.supplierId()!, formData);
    } else {
      this.createSupplier(formData);
    }
  }

  private createSupplier(data: CreateSupplierRequest): void {
    this.supplierService.createSupplier(data).subscribe({
      next: (response) => {
        if (response.success) {
          this.supplierSaved.emit();
          this.closeModal();
        }
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error('Error creating supplier:', err);
        this.error.set(err.error?.message || 'Error al crear el proveedor');
        this.isSaving.set(false);
      },
    });
  }

  private updateSupplier(id: number, data: UpdateSupplierRequest): void {
    this.supplierService.updateSupplier(id, data).subscribe({
      next: (response) => {
        if (response.success) {
          this.supplierSaved.emit();
          this.closeModal();
        }
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error('Error updating supplier:', err);
        this.error.set(err.error?.message || 'Error al actualizar el proveedor');
        this.isSaving.set(false);
      },
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.supplierForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.supplierForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Este campo es requerido';
      if (field.errors['maxlength']) return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
      if (field.errors['email']) return 'Ingrese un correo electrónico válido';
    }
    return '';
  }
}
