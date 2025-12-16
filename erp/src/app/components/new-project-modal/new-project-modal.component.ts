import { Component, signal, output, inject, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { CustomerService } from '../../services/customer.service';
import { CatalogService } from '../../services/catalog.service';
import { CreateProjectRequest, UpdateProjectRequest } from '../../models/project.model';

declare const bootstrap: any;

interface CustomerItem {
  id: number;
  company_name: string;
}

interface ProjectTypeItem {
  id: number;
  name: string;
}

interface ProjectAreaItem {
  id: number;
  name: string;
}

interface ProjectStatusItem {
  id: number;
  name: string;
  alias: string;
}

interface UserItem {
  id: number;
  username: string;
}

@Component({
  selector: 'app-new-project-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './new-project-modal.component.html',
  styleUrl: './new-project-modal.component.scss',
})
export class NewProjectModalComponent {
  private fb = inject(FormBuilder);
  private projectService = inject(ProjectService);
  private customerService = inject(CustomerService);
  private catalogService = inject(CatalogService);

  // Inputs
  projectId = input<number | null>(null);

  // Outputs
  projectSaved = output<void>();

  // Signals
  customers = signal<CustomerItem[]>([]);
  projectTypes = signal<ProjectTypeItem[]>([]);
  projectAreas = signal<ProjectAreaItem[]>([]);
  projectStatuses = signal<ProjectStatusItem[]>([]);
  users = signal<UserItem[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  error = signal<string | null>(null);
  isEditMode = signal(false);
  modalTitle = signal('Nuevo Proyecto');

  // Form
  projectForm!: FormGroup;

  // Modal instance
  private modalInstance: any;

  constructor() {
    this.initForm();

    // Effect to handle edit mode
    effect(() => {
      const id = this.projectId();
      if (id) {
        this.isEditMode.set(true);
        this.modalTitle.set('Editar Proyecto');
        this.loadProjectData(id);
      } else {
        this.isEditMode.set(false);
        this.modalTitle.set('Nuevo Proyecto');
        this.resetForm();
      }
    });
  }

  private initForm(): void {
    const today = new Date().toISOString().split('T')[0];

    this.projectForm = this.fb.group({
      customer_id: [null, [Validators.required]],
      project_name: ['', [Validators.required, Validators.maxLength(255)]],
      project_type_id: [null, [Validators.required]],
      project_status_id: [null, [Validators.required]],
      project_area_id: [null, [Validators.required]],
      project_manager_id: [null, [Validators.required]],
      start_date: [today, [Validators.required]],
      estimated_end_date: [today, [Validators.required]],
      total_budget: [0, [Validators.min(0)]],
      location_address: [''],
      location_city: ['', [Validators.maxLength(100)]],
      location_state_id: [null],
      description: [''],
    });
  }

  openModal(): void {
    this.loadCatalogs();
    const modalElement = document.getElementById('newProjectModal');
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
    const today = new Date().toISOString().split('T')[0];
    this.projectForm.reset({
      start_date: today,
      estimated_end_date: today,
      total_budget: 0,
    });
    this.error.set(null);
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
      error: (err) => console.error('Error loading customers:', err),
    });

    // Load project types
    this.catalogService.getProjectTypes().subscribe({
      next: (response) => {
        if (response.success) {
          this.projectTypes.set(response.data);
        }
      },
      error: (err) => console.error('Error loading project types:', err),
    });

    // Load project areas
    this.catalogService.getProjectAreas().subscribe({
      next: (response) => {
        if (response.success) {
          this.projectAreas.set(response.data);
        }
      },
      error: (err) => console.error('Error loading project areas:', err),
    });

    // Load project statuses
    this.catalogService.getProjectStatuses().subscribe({
      next: (response) => {
        if (response.success) {
          this.projectStatuses.set(response.data);
          // Set default status to "active" if available
          if (!this.isEditMode() && response.data.length > 0) {
            const activeStatus = response.data.find((s: any) => s.alias === 'active');
            if (activeStatus) {
              this.projectForm.patchValue({ project_status_id: activeStatus.id });
            }
          }
        }
      },
      error: (err) => console.error('Error loading project statuses:', err),
    });

    // Load users (project managers)
    this.catalogService.getUsers().subscribe({
      next: (response) => {
        if (response.success) {
          const userItems: UserItem[] = response.data.map((u: any) => ({
            id: u.id,
            username: u.username,
          }));
          this.users.set(userItems);
        }
      },
      error: (err) => console.error('Error loading users:', err),
    });
  }

  private loadProjectData(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.projectService.getProjectById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const project = response.data;
          this.projectForm.patchValue({
            customer_id: project.customer_id,
            project_name: project.project_name,
            project_type_id: project.project_type_id,
            project_status_id: project.project_status_id,
            project_area_id: project.project_area_id,
            project_manager_id: project.project_manager_id,
            start_date: project.start_date?.split('T')[0],
            estimated_end_date: project.estimated_end_date?.split('T')[0],
            total_budget: project.total_budget,
            location_address: project.location_address,
            location_city: project.location_city,
            location_state_id: project.location_state_id,
            description: project.description,
          });
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading project:', err);
        this.error.set('Error al cargar los datos del proyecto');
        this.isLoading.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.error.set(null);

    const formData = this.projectForm.value;

    // Clean up empty strings to null
    Object.keys(formData).forEach((key) => {
      if (formData[key] === '') {
        formData[key] = null;
      }
    });

    if (this.isEditMode() && this.projectId()) {
      this.updateProject(this.projectId()!, formData);
    } else {
      this.createProject(formData);
    }
  }

  private createProject(data: CreateProjectRequest): void {
    this.projectService.createProject(data).subscribe({
      next: (response) => {
        if (response.success) {
          this.projectSaved.emit();
          this.closeModal();
        }
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error('Error creating project:', err);
        this.error.set(err.error?.message || 'Error al crear el proyecto');
        this.isSaving.set(false);
      },
    });
  }

  private updateProject(id: number, data: UpdateProjectRequest): void {
    this.projectService.updateProject(id, data).subscribe({
      next: (response) => {
        if (response.success) {
          this.projectSaved.emit();
          this.closeModal();
        }
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error('Error updating project:', err);
        this.error.set(err.error?.message || 'Error al actualizar el proyecto');
        this.isSaving.set(false);
      },
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.projectForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.projectForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Este campo es requerido';
      if (field.errors['maxLength']) return `Máximo ${field.errors['maxLength'].requiredLength} caracteres`;
      if (field.errors['min']) return `El valor mínimo es ${field.errors['min'].min}`;
    }
    return '';
  }
}
