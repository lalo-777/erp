import { Component, signal, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { WarehouseService } from '../../services/warehouse.service';
import { MaterialService } from '../../services/material.service';
import { WarehouseLocation } from '../../models/warehouse.model';
import { Material } from '../../models/material.model';

declare const bootstrap: any;

@Component({
  selector: 'app-transfer-material-modal',
  imports: [
    MatIconModule,CommonModule, ReactiveFormsModule],
  templateUrl: './transfer-material-modal.component.html',
  styleUrl: './transfer-material-modal.component.scss',
})
export class TransferMaterialModalComponent {
  private fb = inject(FormBuilder);
  private warehouseService = inject(WarehouseService);
  private materialService = inject(MaterialService);

  // Outputs
  transferComplete = output<void>();

  // Signals
  locations = signal<WarehouseLocation[]>([]);
  materials = signal<Material[]>([]);
  isSaving = signal(false);
  error = signal<string | null>(null);

  // Form
  transferForm!: FormGroup;

  // Modal instance
  private modalInstance: any;

  constructor() {
    this.initForm();
  }

  private initForm(): void {
    this.transferForm = this.fb.group({
      material_id: [null, [Validators.required]],
      from_location_id: [null, [Validators.required]],
      to_location_id: [null, [Validators.required]],
      quantity: [0, [Validators.required, Validators.min(0.01)]],
      reason: [''],
      transfer_date: [new Date().toISOString().split('T')[0]],
    });
  }

  openModal(): void {
    this.loadData();
    const modalElement = document.getElementById('transferMaterialModal');
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
    if (this.transferForm.invalid) {
      this.transferForm.markAllAsTouched();
      return;
    }

    const formValue = this.transferForm.value;

    // Validate that from and to locations are different
    if (formValue.from_location_id === formValue.to_location_id) {
      this.error.set('Las ubicaciones de origen y destino deben ser diferentes');
      return;
    }

    this.isSaving.set(true);
    this.error.set(null);

    this.warehouseService.transferMaterial(formValue).subscribe({
      next: (response) => {
        if (response.success) {
          this.transferComplete.emit();
          this.closeModal();
        }
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error('Error transferring material:', err);
        this.error.set(err.error?.message || 'Error al transferir el material');
        this.isSaving.set(false);
      },
    });
  }

  private resetForm(): void {
    this.transferForm.reset({
      transfer_date: new Date().toISOString().split('T')[0],
    });
    this.error.set(null);
  }
}
