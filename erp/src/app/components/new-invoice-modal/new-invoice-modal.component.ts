import { Component, signal, output, inject, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { InvoiceService } from '../../services/invoice.service';
import { CustomerService } from '../../services/customer.service';
import { CatalogService } from '../../services/catalog.service';
import { CreateInvoiceRequest, UpdateInvoiceRequest, InvoiceItem } from '../../models/invoice.model';

declare const bootstrap: any;

interface CustomerItem {
  id: number;
  company_name: string;
}

interface InvoiceTypeItem {
  id: number;
  name: string;
}

interface InvoiceStatusItem {
  id: number;
  name: string;
  alias: string;
}

@Component({
  selector: 'app-new-invoice-modal',
  imports: [
    MatIconModule,CommonModule, ReactiveFormsModule],
  templateUrl: './new-invoice-modal.component.html',
  styleUrl: './new-invoice-modal.component.scss',
})
export class NewInvoiceModalComponent {
  private fb = inject(FormBuilder);
  private invoiceService = inject(InvoiceService);
  private customerService = inject(CustomerService);
  private catalogService = inject(CatalogService);

  // Inputs
  invoiceId = input<number | null>(null);

  // Outputs
  invoiceSaved = output<void>();

  // Signals
  customers = signal<CustomerItem[]>([]);
  invoiceTypes = signal<InvoiceTypeItem[]>([]);
  invoiceStatuses = signal<InvoiceStatusItem[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  error = signal<string | null>(null);
  isEditMode = signal(false);
  modalTitle = signal('Nueva Factura');

  // Form
  invoiceForm!: FormGroup;

  // Tax rate (default 16%)
  defaultTaxRate = 16;

  constructor() {
    this.initForm();

    // Effect to handle edit mode
    effect(() => {
      const id = this.invoiceId();
      if (id) {
        this.isEditMode.set(true);
        this.modalTitle.set('Editar Factura');
        this.loadInvoiceData(id);
      } else {
        this.isEditMode.set(false);
        this.modalTitle.set('Nueva Factura');
      }
    });
  }

  private initForm(): void {
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    this.invoiceForm = this.fb.group({
      customer_id: [null, [Validators.required]],
      invoice_type_id: [null, [Validators.required]],
      invoice_status_id: [null, [Validators.required]],
      invoice_date: [today, [Validators.required]],
      due_date: [dueDateStr, [Validators.required]],
      notes: [''],
      items: this.fb.array([]),
    });

    // Add one initial item
    this.addItem();
  }

  get items(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  createItemFormGroup(): FormGroup {
    return this.fb.group({
      description: ['', [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unit_price: [0, [Validators.required, Validators.min(0)]],
    });
  }

  addItem(): void {
    this.items.push(this.createItemFormGroup());
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  calculateItemAmount(item: any): number {
    const quantity = item.value.quantity || 0;
    const unitPrice = item.value.unit_price || 0;
    return quantity * unitPrice;
  }

  calculateSubtotal(): number {
    let subtotal = 0;
    this.items.controls.forEach((item) => {
      subtotal += this.calculateItemAmount(item);
    });
    return subtotal;
  }

  calculateTax(): number {
    const subtotal = this.calculateSubtotal();
    return subtotal * (this.defaultTaxRate / 100);
  }

  calculateTotal(): number {
    return this.calculateSubtotal() + this.calculateTax();
  }

  private loadCatalogs(): void {
    // Load customers
    this.customerService.getAllCustomers(1, 1000).subscribe({
      next: (response) => {
        if (response.success) {
          const customerItems: CustomerItem[] = response.data.map((c: any) => ({
            id: c.id,
            company_name: c.company_name,
          }));
          this.customers.set(customerItems);
        }
      },
      error: (err: any) => {
        console.error('Error loading customers:', err);
        this.error.set('Error loading customers catalog');
      },
    });

    // Load invoice types
    this.catalogService.getCatalog('invoice-types').subscribe({
      next: (items: any[]) => {
        const typeItems: InvoiceTypeItem[] = items.map((item) => ({
          id: item.id,
          name: item.name,
        }));
        this.invoiceTypes.set(typeItems);
      },
      error: (err: any) => {
        console.error('Error loading invoice types:', err);
        this.error.set('Error loading invoice types catalog');
      },
    });

    // Load invoice statuses
    this.catalogService.getCatalog('invoice-statuses').subscribe({
      next: (items: any[]) => {
        const statusItems: InvoiceStatusItem[] = items.map((item) => ({
          id: item.id,
          name: item.name,
          alias: item.alias,
        }));
        this.invoiceStatuses.set(statusItems);
      },
      error: (err: any) => {
        console.error('Error loading invoice statuses:', err);
        this.error.set('Error loading invoice statuses catalog');
      },
    });
  }

  private loadInvoiceData(id: number): void {
    this.isLoading.set(true);
    this.invoiceService.getInvoiceById(id).subscribe({
      next: (response) => {
        if (response.success) {
          const invoice = response.data;
          this.invoiceForm.patchValue({
            customer_id: invoice.customer_id,
            invoice_type_id: invoice.invoice_type_id,
            invoice_status_id: invoice.invoice_status_id,
            invoice_date: invoice.invoice_date,
            due_date: invoice.due_date,
            notes: invoice.notes,
          });
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading invoice:', err);
        this.error.set('Error loading invoice data');
        this.isLoading.set(false);
      },
    });
  }

  openModal(): void {
    this.loadCatalogs();
    this.error.set(null);

    if (!this.invoiceId()) {
      this.resetForm();
    }

    const modalElement = document.getElementById('newInvoiceModal');
    if (modalElement && typeof bootstrap !== 'undefined') {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  closeModal(): void {
    const modalElement = document.getElementById('newInvoiceModal');
    if (modalElement && typeof bootstrap !== 'undefined') {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }

  onSubmit(): void {
    if (this.invoiceForm.invalid) {
      Object.keys(this.invoiceForm.controls).forEach((key) => {
        this.invoiceForm.get(key)?.markAsTouched();
      });
      this.items.controls.forEach((item) => {
        Object.keys(item.value).forEach((key) => {
          item.get(key)?.markAsTouched();
        });
      });
      return;
    }

    this.isSaving.set(true);
    this.error.set(null);

    const formValue = this.invoiceForm.value;
    const subtotal = this.calculateSubtotal();
    const tax = this.calculateTax();
    const total = this.calculateTotal();

    const invoiceData = {
      customer_id: formValue.customer_id,
      invoice_type_id: formValue.invoice_type_id,
      invoice_status_id: formValue.invoice_status_id,
      invoice_date: formValue.invoice_date,
      due_date: formValue.due_date,
      subtotal: subtotal,
      tax: tax,
      discount: 0,
      total: total,
      notes: formValue.notes || '',
      items: formValue.items,
    };

    if (this.isEditMode() && this.invoiceId()) {
      // Update existing invoice
      const updateRequest: UpdateInvoiceRequest = invoiceData;
      this.invoiceService.updateInvoice(this.invoiceId()!, updateRequest).subscribe({
        next: (response) => {
          this.isSaving.set(false);
          if (response.success) {
            this.closeModal();
            this.resetForm();
            this.invoiceSaved.emit();
          }
        },
        error: (err) => {
          console.error('Error updating invoice:', err);
          this.isSaving.set(false);
          this.error.set(err.error?.message || 'Error al actualizar la factura');
        },
      });
    } else {
      // Create new invoice
      const createRequest: CreateInvoiceRequest = invoiceData;
      this.invoiceService.createInvoice(createRequest).subscribe({
        next: (response) => {
          this.isSaving.set(false);
          if (response.success) {
            this.closeModal();
            this.resetForm();
            this.invoiceSaved.emit();
          }
        },
        error: (err) => {
          console.error('Error creating invoice:', err);
          this.isSaving.set(false);
          this.error.set(err.error?.message || 'Error al crear la factura');
        },
      });
    }
  }

  resetForm(): void {
    this.invoiceForm.reset();
    this.items.clear();
    this.addItem();
    this.error.set(null);
    this.isEditMode.set(false);
    this.modalTitle.set('Nueva Factura');

    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    this.invoiceForm.patchValue({
      invoice_date: today,
      due_date: dueDateStr,
    });
  }

  hasError(fieldName: string): boolean {
    const field = this.invoiceForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  hasItemError(index: number, fieldName: string): boolean {
    const item = this.items.at(index);
    const field = item.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.invoiceForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.hasError('required')) {
      return 'Este campo es requerido';
    }
    return 'Valor inválido';
  }

  getItemErrorMessage(index: number, fieldName: string): string {
    const item = this.items.at(index);
    const field = item.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.hasError('required')) {
      return 'Requerido';
    }
    if (field.hasError('min')) {
      return 'Valor mínimo: ' + field.errors['min'].min;
    }
    return 'Inválido';
  }
}
