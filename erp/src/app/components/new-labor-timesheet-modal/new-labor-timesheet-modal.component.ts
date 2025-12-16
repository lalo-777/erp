import { Component, signal, output, inject, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LaborService } from '../../services/labor.service';
import { ProjectService } from '../../services/project.service';
import { CreateTimesheetRequest, UpdateTimesheetRequest, calculatePaymentAmount } from '../../models/labor.model';

declare const bootstrap: any;

interface ProjectItem {
  id: number;
  project_name: string;
  project_code: string;
}

@Component({
  selector: 'app-new-labor-timesheet-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './new-labor-timesheet-modal.component.html',
  styleUrl: './new-labor-timesheet-modal.component.scss',
})
export class NewLaborTimesheetModalComponent {
  private fb = inject(FormBuilder);
  private laborService = inject(LaborService);
  private projectService = inject(ProjectService);

  // Inputs
  timesheetId = input<number | null>(null);

  // Outputs
  timesheetSaved = output<void>();

  // Signals
  projects = signal<ProjectItem[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  error = signal<string | null>(null);
  isEditMode = signal(false);
  modalTitle = signal('Nueva Hoja de Tiempo');
  timesheetCode = signal<string>('Auto-generado');
  calculatedPayment = signal<number>(0);

  // Form
  timesheetForm!: FormGroup;

  // Modal instance
  private modalInstance: any;

  constructor() {
    this.initForm();

    // Effect to handle edit mode
    effect(() => {
      const id = this.timesheetId();
      if (id) {
        this.isEditMode.set(true);
        this.modalTitle.set('Editar Hoja de Tiempo');
        this.loadTimesheetData(id);
      } else {
        this.isEditMode.set(false);
        this.modalTitle.set('Nueva Hoja de Tiempo');
        this.timesheetCode.set('Auto-generado');
        this.resetForm();
      }
    });

    // Effect to calculate payment amount when hours or rate change
    effect(() => {
      const form = this.timesheetForm;
      if (form) {
        const hoursWorked = form.get('hours_worked')?.value || 0;
        const hourlyRate = form.get('hourly_rate')?.value || 0;
        this.calculatedPayment.set(calculatePaymentAmount(hoursWorked, hourlyRate));
      }
    });
  }

  private initForm(): void {
    this.timesheetForm = this.fb.group({
      worker_name: ['', [Validators.required, Validators.maxLength(255)]],
      project_id: [null],
      work_date: ['', [Validators.required]],
      hours_worked: [0, [Validators.required, Validators.min(0.01), Validators.max(24)]],
      hourly_rate: [0, [Validators.required, Validators.min(0.01)]],
      performance_score: [null, [Validators.min(0), Validators.max(10)]],
      notes: [''],
    });

    // Subscribe to form value changes to update calculated payment
    this.timesheetForm.valueChanges.subscribe(() => {
      const hoursWorked = this.timesheetForm.get('hours_worked')?.value || 0;
      const hourlyRate = this.timesheetForm.get('hourly_rate')?.value || 0;
      this.calculatedPayment.set(calculatePaymentAmount(hoursWorked, hourlyRate));
    });
  }

  openModal(): void {
    this.loadProjects();
    const modalElement = document.getElementById('newLaborTimesheetModal');
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
    this.timesheetForm.reset({
      work_date: new Date().toISOString().split('T')[0],
      hours_worked: 0,
      hourly_rate: 0,
    });
    this.calculatedPayment.set(0);
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

  private loadTimesheetData(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.laborService.getTimesheetById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const timesheet = response.data;
          this.timesheetCode.set(timesheet.timesheet_code);
          this.timesheetForm.patchValue({
            worker_name: timesheet.worker_name,
            project_id: timesheet.project_id,
            work_date: timesheet.work_date,
            hours_worked: timesheet.hours_worked,
            hourly_rate: timesheet.hourly_rate,
            performance_score: timesheet.performance_score,
            notes: timesheet.notes,
          });
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading timesheet:', err);
        this.error.set('Error al cargar los datos de la hoja de tiempo');
        this.isLoading.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.timesheetForm.invalid) {
      this.timesheetForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.error.set(null);

    const formData = this.timesheetForm.value;

    // Clean up empty strings to null
    Object.keys(formData).forEach((key) => {
      if (formData[key] === '' || formData[key] === null) {
        formData[key] = key === 'project_id' || key === 'performance_score' ? null : formData[key];
      }
    });

    // Convert performance_score to number if present
    if (formData.performance_score) {
      formData.performance_score = parseFloat(formData.performance_score);
    }

    if (this.isEditMode() && this.timesheetId()) {
      this.updateTimesheet(this.timesheetId()!, formData);
    } else {
      this.createTimesheet(formData);
    }
  }

  private createTimesheet(data: CreateTimesheetRequest): void {
    this.laborService.createTimesheet(data).subscribe({
      next: (response) => {
        if (response.success) {
          this.timesheetSaved.emit();
          this.closeModal();
        }
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error('Error creating timesheet:', err);
        this.error.set(err.error?.message || 'Error al crear la hoja de tiempo');
        this.isSaving.set(false);
      },
    });
  }

  private updateTimesheet(id: number, data: UpdateTimesheetRequest): void {
    this.laborService.updateTimesheet(id, data).subscribe({
      next: (response) => {
        if (response.success) {
          this.timesheetSaved.emit();
          this.closeModal();
        }
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error('Error updating timesheet:', err);
        this.error.set(err.error?.message || 'Error al actualizar la hoja de tiempo');
        this.isSaving.set(false);
      },
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.timesheetForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.timesheetForm.get(fieldName);
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
