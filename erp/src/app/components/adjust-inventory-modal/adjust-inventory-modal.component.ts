import { Component, signal, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WarehouseService } from '../../services/warehouse.service';
import { MaterialService } from '../../services/material.service';
import { WarehouseLocation } from '../../models/warehouse.model';
import { Material } from '../../models/material.model';

declare const bootstrap: any;

@Component({
  selector: 'app-adjust-inventory-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './adjust-inventory-modal.component.html',
  styleUrl: './adjust-inventory-modal.component.scss',
})
export class AdjustInventoryModalComponent {
  private fb = inject(FormBuilder);
  private warehouseService = inject(WarehouseService);
  private materialService = inject(MaterialService);

  // Outputs
  adjustmentComplete = output<void>();

  // Signals
  locations = signal<WarehouseLocation[]>([]);
  materials = signal<Material[]>([]);
  isSaving = signal(false);
  error = signal<string | null>(null);

  // Form
  adjustForm!: FormGroup;

  // Modal instance
  private modalInstance: any;

  constructor() {
    this.initForm();
  }

  private initForm(): void {
    this.adjustForm = this.fb.group({
      material_id: [null, [Validators.required]],
      warehouse_location_id: [null, [Validators.required]],
      transaction_type: ['entry', [Validators.required]],
      quantity: [0, [Validators.required, Validators.min(0.01)]],
      reference_number: [''],
      notes: [''],
      transaction_date: [new Date().toISOString().split('T')[0]],
    });
  }

  openModal(): void {
    this.loadData();
    const modalElement = document.getElementById('adjustInventoryModal');
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

  private loadData(): void {
    this.warehouseService.getAllLocations().subscribe({
      next: (response) => {
        if (response.success) {
          this.locations.set(response.data);
        }
      },
      error: (err) => console.error('Error loading locations:', err),
    });

    this.materialService.getAllMaterials(1, 1000).subscribe({
      next: (response) => {
        if (response.success) {
          this.materials.set(response.data);
        }
      },
      error: (err) => console.error('Error loading materials:', err),
    });
  }

  onSubmit(): void {
    if (this.adjustForm.invalid) {
      this.adjustForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.error.set(null);

    this.warehouseService.adjustInventory(this.adjustForm.value).subscribe({
      next: (response) => {
        if (response.success) {
          this.adjustmentComplete.emit();
          this.closeModal();
        }
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error('Error adjusting inventory:', err);
        this.error.set(err.error?.message || 'Error al ajustar el inventario');
        this.isSaving.set(false);
      },
    });
  }

  private resetForm(): void {
    this.adjustForm.reset({
      transaction_type: 'entry',
      transaction_date: new Date().toISOString().split('T')[0],
    });
    this.error.set(null);
  }

  getTransactionTypeLabel(): string {
    const type = this.adjustForm.get('transaction_type')?.value;
    switch (type) {
      case 'entry':
        return 'Entrada';
      case 'exit':
        return 'Salida';
      case 'adjustment':
        return 'Ajuste';
      default:
        return '';
    }
  }
}
