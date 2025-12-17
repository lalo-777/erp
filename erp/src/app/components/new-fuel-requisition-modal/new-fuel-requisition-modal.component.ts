import { Component, signal, output, inject, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { FuelRequisitionService } from '../../services/fuel-requisition.service';
import { ProjectService } from '../../services/project.service';
import { CreateFuelRequisitionRequest, UpdateFuelRequisitionRequest, calculateTotalAmount } from '../../models/fuel-requisition.model';

declare const bootstrap: any;

interface ProjectItem {
  id: number;
  project_name: string;
  project_code: string;
}

@Component({
  selector: 'app-new-fuel-requisition-modal',
  imports: [
    MatIconModule,CommonModule, ReactiveFormsModule],
  templateUrl: './new-fuel-requisition-modal.component.html',
  styleUrl: './new-fuel-requisition-modal.component.scss',
})
export class NewFuelRequisitionModalComponent {
  private fb = inject(FormBuilder);
  private fuelService = inject(FuelRequisitionService);
  private projectService = inject(ProjectService);

  // Inputs
  requisitionId = input<number | null>(null);

  // Outputs
  requisitionSaved = output<void>();

  // Signals
  projects = signal<ProjectItem[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  error = signal<string | null>(null);
  isEditMode = signal(false);
  modalTitle = signal('Nueva Requisición de Combustible');
  requisitionCode = signal<string>('Auto-generado');
  calculatedTotal = signal<number>(0);

  // Form
  requisitionForm!: FormGroup;

  // Modal instance
  private modalInstance: any;

  constructor() {
    this.initForm();

    // Effect to handle edit mode
    effect(() => {
      const id = this.requisitionId();
      if (id) {
        this.isEditMode.set(true);
        this.modalTitle.set('Editar Requisición de Combustible');
        this.loadRequisitionData(id);
      } else {
        this.isEditMode.set(false);
        this.modalTitle.set('Nueva Requisición de Combustible');
        this.requisitionCode.set('Auto-generado');
        this.resetForm();
      }
    });

    // Effect to calculate total amount when quantity or price change
    effect(() => {
      const form = this.requisitionForm;
      if (form) {
        const quantity = form.get('quantity_liters')?.value || 0;
        const unitPrice = form.get('unit_price')?.value || 0;
        this.calculatedTotal.set(calculateTotalAmount(quantity, unitPrice));
      }
    });
  }

  private initForm(): void {
    this.requisitionForm = this.fb.group({
      vehicle_equipment_name: ['', [Validators.required, Validators.maxLength(255)]],
      project_id: [null],
      requisition_date: ['', [Validators.required]],
      fuel_type: ['gasoline', [Validators.required]],
      quantity_liters: [0, [Validators.required, Validators.min(0.01)]],
      unit_price: [0, [Validators.required, Validators.min(0.01)]],
      odometer_reading: [null, [Validators.min(0)]],
      notes: [''],
    });

    // Subscribe to form value changes to update calculated total
    this.requisitionForm.valueChanges.subscribe(() => {
      const quantity = this.requisitionForm.get('quantity_liters')?.value || 0;
      const unitPrice = this.requisitionForm.get('unit_price')?.value || 0;
      this.calculatedTotal.set(calculateTotalAmount(quantity, unitPrice));
    });
  }

  openModal(): void {
    this.loadProjects();
    const modalElement = document.getElementById('newFuelRequisitionModal');
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
    this.requisitionForm.reset({
      requisition_date: new Date().toISOString().split('T')[0],
      fuel_type: 'gasoline',
      quantity_liters: 0,
      unit_price: 0,
    });
    this.calculatedTotal.set(0);
    this.error.set(null);
  }

  private loadProjects(): void {
    // Load all projects
    this.projectService.getAllProjects(1, 1000).subscribe({
      next: (response) => {
        if (response.success) {
          this.projects.set(response.data.map((p: any) => ({
            id: p.id,
            project_name: p.project_name,
            project_code: p.project_code,
          })));
        }
      },
      error: (err) => console.error('Error loading projects:', err),
    });
  }

  private loadRequisitionData(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.fuelService.getRequisitionById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const requisition = response.data;
          this.requisitionCode.set(requisition.requisition_code);
          this.requisitionForm.patchValue({
            vehicle_equipment_name: requisition.vehicle_equipment_name,
            project_id: requisition.project_id,
            requisition_date: requisition.requisition_date,
            fuel_type: requisition.fuel_type,
            quantity_liters: requisition.quantity_liters,
            unit_price: requisition.unit_price,
            odometer_reading: requisition.odometer_reading,
            notes: requisition.notes,
          });
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading requisition:', err);
        this.error.set('Error al cargar los datos de la requisición');
        this.isLoading.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.requisitionForm.invalid) {
      this.requisitionForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.error.set(null);

    const formData = this.requisitionForm.value;

    // Clean up empty strings to null
    Object.keys(formData).forEach((key) => {
      if (formData[key] === '' || formData[key] === null) {
        formData[key] = key === 'project_id' || key === 'odometer_reading' ? null : formData[key];
      }
    });

    // Convert odometer_reading to number if present
    if (formData.odometer_reading) {
      formData.odometer_reading = parseInt(formData.odometer_reading);
    }

    if (this.isEditMode() && this.requisitionId()) {
      this.updateRequisition(this.requisitionId()!, formData);
    } else {
      this.createRequisition(formData);
    }
  }

  private createRequisition(data: CreateFuelRequisitionRequest): void {
    this.fuelService.createRequisition(data).subscribe({
      next: (response) => {
        if (response.success) {
          this.requisitionSaved.emit();
          this.closeModal();
        }
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error('Error creating requisition:', err);
        this.error.set(err.error?.message || 'Error al crear la requisición');
        this.isSaving.set(false);
      },
    });
  }

  private updateRequisition(id: number, data: UpdateFuelRequisitionRequest): void {
    this.fuelService.updateRequisition(id, data).subscribe({
      next: (response) => {
        if (response.success) {
          this.requisitionSaved.emit();
          this.closeModal();
        }
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error('Error updating requisition:', err);
        this.error.set(err.error?.message || 'Error al actualizar la requisición');
        this.isSaving.set(false);
      },
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.requisitionForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.requisitionForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Este campo es requerido';
      if (field.errors['maxLength']) return `Máximo ${field.errors['maxLength'].requiredLength} caracteres`;
      if (field.errors['min']) return `El valor mínimo es ${field.errors['min'].min}`;
      if (field.errors['max']) return `El valor máximo es ${field.errors['max'].max}`;
    }
    return '';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  }
}
