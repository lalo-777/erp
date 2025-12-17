import { Component, signal, output, inject, input, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CatalogService } from '../../services/catalog.service';
import { ToastService } from '../../services/toast.service';
import { CatalogItem } from '../../models/catalog.model';

declare const bootstrap: any;

@Component({
  selector: 'app-catalog-entry-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './catalog-entry-modal.component.html',
  styleUrl: './catalog-entry-modal.component.scss',
})
export class CatalogEntryModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private catalogService = inject(CatalogService);
  private toastService = inject(ToastService);

  // Inputs
  catalogName = input.required<string>();
  entryId = input<number | null>(null);
  isEditMode = input<boolean>(false);

  // Outputs
  entrySaved = output<void>();
  modalClosed = output<void>();

  // Signals
  isLoading = signal(false);
  isSaving = signal(false);
  error = signal<string | null>(null);
  modalTitle = signal('Nueva Entrada');

  // Form
  entryForm!: FormGroup;

  private modalInstance: any;

  constructor() {
    this.initForm();

    // Effect to handle edit mode
    effect(() => {
      const id = this.entryId();
      if (id) {
        this.modalTitle.set('Editar Entrada');
        this.loadEntryData(id);
      } else {
        this.modalTitle.set('Nueva Entrada');
      }
    });
  }

  ngOnInit(): void {
    this.openModal();
  }

  private initForm(): void {
    this.entryForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      alias: ['', [Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
    });
  }

  private loadEntryData(id: number): void {
    this.isLoading.set(true);
    this.catalogService.getCatalogItem(this.catalogName(), id).subscribe({
      next: (entry: CatalogItem) => {
        this.entryForm.patchValue({
          name: entry.name,
          alias: entry.alias || '',
          description: entry.description || '',
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading entry:', err);
        this.error.set('Error cargando datos de la entrada');
        this.isLoading.set(false);
      },
    });
  }

  openModal(): void {
    this.error.set(null);

    if (!this.entryId()) {
      this.resetForm();
    }

    const modalElement = document.getElementById('catalogEntryModal');
    if (modalElement && typeof bootstrap !== 'undefined') {
      this.modalInstance = new bootstrap.Modal(modalElement);
      this.modalInstance.show();

      // Add event listener for when modal is hidden
      modalElement.addEventListener('hidden.bs.modal', () => {
        this.modalClosed.emit();
      });
    }
  }

  closeModal(): void {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
  }

  onSubmit(): void {
    if (this.entryForm.invalid) {
      Object.keys(this.entryForm.controls).forEach((key) => {
        this.entryForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSaving.set(true);
    this.error.set(null);

    const formValue = this.entryForm.value;

    if (this.isEditMode() && this.entryId()) {
      this.updateEntry(this.entryId()!, formValue);
    } else {
      this.createEntry(formValue);
    }
  }

  private createEntry(data: Partial<CatalogItem>): void {
    this.catalogService.createCatalogItem(this.catalogName(), data).subscribe({
      next: () => {
        this.toastService.showSuccess('Entrada creada exitosamente');
        this.entrySaved.emit();
        this.closeModal();
        this.resetForm();
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error('Error creating entry:', err);
        this.error.set(err.error?.message || 'Error al crear entrada');
        this.toastService.showError(err.error?.message || 'Error al crear entrada');
        this.isSaving.set(false);
      },
    });
  }

  private updateEntry(id: number, data: Partial<CatalogItem>): void {
    this.catalogService.updateCatalogItem(this.catalogName(), id, data).subscribe({
      next: () => {
        this.toastService.showSuccess('Entrada actualizada exitosamente');
        this.entrySaved.emit();
        this.closeModal();
        this.resetForm();
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error('Error updating entry:', err);
        this.error.set(err.error?.message || 'Error al actualizar entrada');
        this.toastService.showError(err.error?.message || 'Error al actualizar entrada');
        this.isSaving.set(false);
      },
    });
  }

  private resetForm(): void {
    this.entryForm.reset({
      name: '',
      alias: '',
      description: '',
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.entryForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.entryForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Este campo es requerido';
    if (field.errors['maxlength']) {
      return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
    }

    return '';
  }
}
