import { Component, signal, output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { MaterialService } from '../../services/material.service';
import { ProjectService } from '../../services/project.service';
import { SupplierService } from '../../services/supplier.service';
import { ToastService } from '../../services/toast.service';
import {
  CreatePurchaseOrderRequest,
  calculateOrderTotals,
  formatCurrency,
} from '../../models/purchase-order.model';

declare const bootstrap: any;

interface SupplierItem {
  id: number;
  supplier_name: string;
  contact_name?: string;
  phone?: string;
  email?: string;
}

interface MaterialItem {
  id: number;
  material_code: string;
  material_name: string;
  unit_of_measure?: string;
  unit_price: number;
}

interface ProjectItem {
  id: number;
  project_name: string;
  project_code: string;
}

@Component({
  selector: 'app-new-purchase-order-modal',
  imports: [MatIconModule, CommonModule, ReactiveFormsModule],
  templateUrl: './new-purchase-order-modal.component.html',
  styleUrl: './new-purchase-order-modal.component.scss',
})
export class NewPurchaseOrderModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private purchaseOrderService = inject(PurchaseOrderService);
  private materialService = inject(MaterialService);
  private projectService = inject(ProjectService);
  private supplierService = inject(SupplierService);
  private toastService = inject(ToastService);

  // Outputs
  orderSaved = output<void>();

  // Signals
  suppliers = signal<SupplierItem[]>([]);
  materials = signal<MaterialItem[]>([]);
  projects = signal<ProjectItem[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  error = signal<string | null>(null);
  modalTitle = signal('Nueva Orden de Compra');

  // Calculated totals
  subtotal = signal<number>(0);
  taxAmount = signal<number>(0);
  totalAmount = signal<number>(0);

  // Form
  orderForm!: FormGroup;

  // Modal instance
  private modalInstance: any;

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.orderForm = this.fb.group({
      supplier_id: [null, [Validators.required]],
      project_id: [null],
      order_date: [new Date().toISOString().split('T')[0], [Validators.required]],
      expected_delivery_date: [''],
      notes: [''],
      items: this.fb.array([], [Validators.required, Validators.minLength(1)]),
    });

    // Subscribe to items changes to calculate totals
    this.itemsFormArray.valueChanges.subscribe(() => {
      this.calculateTotals();
    });
  }

  get itemsFormArray(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  addItem(): void {
    const itemGroup = this.fb.group({
      material_id: [null, [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(0.01)]],
      unit_price: [0, [Validators.required, Validators.min(0.01)]],
    });

    // Subscribe to material selection to auto-fill unit price
    itemGroup.get('material_id')?.valueChanges.subscribe((materialId) => {
      if (materialId) {
        const material = this.materials().find((m) => m.id === materialId);
        if (material && material.unit_price) {
          itemGroup.patchValue({ unit_price: material.unit_price }, { emitEvent: false });
          this.calculateTotals();
        }
      }
    });

    this.itemsFormArray.push(itemGroup);
  }

  removeItem(index: number): void {
    this.itemsFormArray.removeAt(index);
    this.calculateTotals();
  }

  private calculateTotals(): void {
    const items = this.itemsFormArray.value;
    const totals = calculateOrderTotals(items);
    this.subtotal.set(totals.subtotal);
    this.taxAmount.set(totals.tax_amount);
    this.totalAmount.set(totals.total_amount);
  }

  getItemAmount(index: number): number {
    const item = this.itemsFormArray.at(index);
    const quantity = item.get('quantity')?.value || 0;
    const unitPrice = item.get('unit_price')?.value || 0;
    return quantity * unitPrice;
  }

  openModal(): void {
    this.loadData();
    this.resetForm();
    const modalElement = document.getElementById('newPurchaseOrderModal');
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
    this.orderForm.reset({
      order_date: new Date().toISOString().split('T')[0],
    });
    this.itemsFormArray.clear();
    this.addItem(); // Add one empty item by default
    this.subtotal.set(0);
    this.taxAmount.set(0);
    this.totalAmount.set(0);
    this.error.set(null);
  }

  private loadData(): void {
    this.isLoading.set(true);

    // Load suppliers
    this.supplierService.getAllSuppliers(1, 1000).subscribe({
      next: (response) => {
        if (response.success) {
          this.suppliers.set(response.data);
        }
      },
      error: (err) => console.error('Error loading suppliers:', err),
    });

    // Load materials
    this.materialService.getAllMaterials(1, 1000).subscribe({
      next: (response) => {
        if (response.success) {
          this.materials.set(
            response.data.map((m: any) => ({
              id: m.id,
              material_code: m.material_code,
              material_name: m.material_name,
              unit_of_measure: m.unit_name || m.unit_of_measure,
              unit_price: m.unit_price || 0,
            }))
          );
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading materials:', err);
        this.isLoading.set(false);
      },
    });

    // Load projects
    this.projectService.getAllProjects(1, 1000).subscribe({
      next: (response) => {
        if (response.success) {
          this.projects.set(
            response.data.map((p: any) => ({
              id: p.id,
              project_name: p.project_name,
              project_code: p.project_code,
            }))
          );
        }
      },
      error: (err) => console.error('Error loading projects:', err),
    });
  }

  onSubmit(): void {
    if (this.orderForm.invalid || this.itemsFormArray.length === 0) {
      this.orderForm.markAllAsTouched();
      this.itemsFormArray.controls.forEach((control) => control.markAllAsTouched());
      if (this.itemsFormArray.length === 0) {
        this.error.set('Debe agregar al menos un material');
      }
      return;
    }

    this.isSaving.set(true);
    this.error.set(null);

    const formData = this.orderForm.value;

    const requestData: CreatePurchaseOrderRequest = {
      supplier_id: formData.supplier_id,
      project_id: formData.project_id || undefined,
      order_date: formData.order_date,
      expected_delivery_date: formData.expected_delivery_date || undefined,
      notes: formData.notes || undefined,
      items: formData.items.map((item: any) => ({
        material_id: item.material_id,
        quantity: parseFloat(item.quantity),
        unit_price: parseFloat(item.unit_price),
      })),
    };

    this.purchaseOrderService.createPurchaseOrder(requestData).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.showSuccess(
            `Orden de compra ${response.data.po_number} creada exitosamente`
          );
          this.orderSaved.emit();
          this.closeModal();
        }
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error('Error creating purchase order:', err);
        this.error.set(err.error?.message || 'Error al crear la orden de compra');
        this.isSaving.set(false);
      },
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.orderForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isItemFieldInvalid(index: number, fieldName: string): boolean {
    const item = this.itemsFormArray.at(index);
    const field = item.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.orderForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Este campo es requerido';
    }
    return '';
  }

  getItemFieldError(index: number, fieldName: string): string {
    const item = this.itemsFormArray.at(index);
    const field = item.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Requerido';
      if (field.errors['min']) return `Mínimo ${field.errors['min'].min}`;
    }
    return '';
  }

  formatCurrency(amount: number): string {
    return formatCurrency(amount);
  }

  getMaterialName(materialId: number): string {
    const material = this.materials().find((m) => m.id === materialId);
    return material ? `${material.material_code} - ${material.material_name}` : '';
  }
}
