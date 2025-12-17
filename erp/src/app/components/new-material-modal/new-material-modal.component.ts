import { Component, signal, output, inject, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MaterialService } from '../../services/material.service';
import { CatalogService } from '../../services/catalog.service';
import { CreateMaterialRequest, UpdateMaterialRequest } from '../../models/material.model';

declare const bootstrap: any;

interface CategoryItem {
  id: number;
  name: string;
}

interface UnitOfMeasureItem {
  id: number;
  name: string;
  alias: string;
}

@Component({
  selector: 'app-new-material-modal',
  imports: [
    MatIconModule,CommonModule, ReactiveFormsModule],
  templateUrl: './new-material-modal.component.html',
  styleUrl: './new-material-modal.component.scss',
})
export class NewMaterialModalComponent {
  private fb = inject(FormBuilder);
  private materialService = inject(MaterialService);
  private catalogService = inject(CatalogService);

  // Inputs
  materialId = input<number | null>(null);

  // Outputs
  materialSaved = output<void>();

  // Signals
  categories = signal<CategoryItem[]>([]);
  unitsOfMeasure = signal<UnitOfMeasureItem[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  error = signal<string | null>(null);
  isEditMode = signal(false);
  modalTitle = signal('Nuevo Material');
  materialCode = signal<string>('Auto-generado');

  // Form
  materialForm!: FormGroup;

  // Modal instance
  private modalInstance: any;

  constructor() {
    this.initForm();

    // Effect to handle edit mode
    effect(() => {
      const id = this.materialId();
      if (id) {
        this.isEditMode.set(true);
        this.modalTitle.set('Editar Material');
        this.loadMaterialData(id);
      } else {
        this.isEditMode.set(false);
        this.modalTitle.set('Nuevo Material');
        this.materialCode.set('Auto-generado');
        this.resetForm();
      }
    });
  }

  private initForm(): void {
    this.materialForm = this.fb.group({
      material_name: ['', [Validators.required, Validators.maxLength(255)]],
      description: [''],
      category_id: [null, [Validators.required]],
      unit_of_measure_id: [null, [Validators.required]],
      unit_cost: [0, [Validators.required, Validators.min(0)]],
      current_stock: [0, [Validators.required, Validators.min(0)]],
      minimum_stock: [0, [Validators.required, Validators.min(0)]],
      reorder_point: [0, [Validators.required, Validators.min(0)]],
    });
  }

  openModal(): void {
    this.loadCatalogs();
    const modalElement = document.getElementById('newMaterialModal');
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
    this.materialForm.reset({
      unit_cost: 0,
      current_stock: 0,
      minimum_stock: 0,
      reorder_point: 0,
    });
    this.error.set(null);
  }

  private loadCatalogs(): void {
    // Load material categories
    this.catalogService.getMaterialCategories().subscribe({
      next: (response) => {
        if (response.success) {
          this.categories.set(response.data);
        }
      },
      error: (err) => console.error('Error loading categories:', err),
    });

    // Load units of measure
    this.catalogService.getUnitsOfMeasure().subscribe({
      next: (response) => {
        if (response.success) {
          this.unitsOfMeasure.set(response.data);
        }
      },
      error: (err) => console.error('Error loading units of measure:', err),
    });
  }

  private loadMaterialData(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.materialService.getMaterialById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const material = response.data;
          this.materialCode.set(material.material_code);
          this.materialForm.patchValue({
            material_name: material.material_name,
            description: material.description,
            category_id: material.category_id,
            unit_of_measure_id: material.unit_of_measure_id,
            unit_cost: material.unit_cost,
            current_stock: material.current_stock,
            minimum_stock: material.minimum_stock,
            reorder_point: material.reorder_point,
          });
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading material:', err);
        this.error.set('Error al cargar los datos del material');
        this.isLoading.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.materialForm.invalid) {
      this.materialForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.error.set(null);

    const formData = this.materialForm.value;

    // Clean up empty strings to null
    Object.keys(formData).forEach((key) => {
      if (formData[key] === '') {
        formData[key] = null;
      }
    });

    if (this.isEditMode() && this.materialId()) {
      this.updateMaterial(this.materialId()!, formData);
    } else {
      this.createMaterial(formData);
    }
  }

  private createMaterial(data: CreateMaterialRequest): void {
    this.materialService.createMaterial(data).subscribe({
      next: (response) => {
        if (response.success) {
          this.materialSaved.emit();
          this.closeModal();
        }
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error('Error creating material:', err);
        this.error.set(err.error?.message || 'Error al crear el material');
        this.isSaving.set(false);
      },
    });
  }

  private updateMaterial(id: number, data: UpdateMaterialRequest): void {
    this.materialService.updateMaterial(id, data).subscribe({
      next: (response) => {
        if (response.success) {
          this.materialSaved.emit();
          this.closeModal();
        }
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error('Error updating material:', err);
        this.error.set(err.error?.message || 'Error al actualizar el material');
        this.isSaving.set(false);
      },
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.materialForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.materialForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Este campo es requerido';
      if (field.errors['maxLength']) return `Máximo ${field.errors['maxLength'].requiredLength} caracteres`;
      if (field.errors['min']) return `El valor mínimo es ${field.errors['min'].min}`;
    }
    return '';
  }
}
