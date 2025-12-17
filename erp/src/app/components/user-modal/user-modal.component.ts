import { Component, signal, output, inject, input, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { CatalogService } from '../../services/catalog.service';
import { ToastService } from '../../services/toast.service';
import { CreateUserRequest, UpdateUserRequest } from '../../models/user.model';

declare const bootstrap: any;

interface RoleItem {
  id: number;
  role_name: string;
}

interface PersonItem {
  id: number;
  person_names: string;
  last_name1: string;
  last_name2?: string;
  full_name: string;
}

@Component({
  selector: 'app-user-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-modal.component.html',
  styleUrl: './user-modal.component.scss',
})
export class UserModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private catalogService = inject(CatalogService);
  private toastService = inject(ToastService);

  // Inputs
  userId = input<number | null>(null);
  isEditMode = input<boolean>(false);

  // Outputs
  userSaved = output<void>();
  modalClosed = output<void>();

  // Signals
  roles = signal<RoleItem[]>([]);
  people = signal<PersonItem[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  error = signal<string | null>(null);
  modalTitle = signal('Nuevo Usuario');

  // Form
  userForm!: FormGroup;

  private modalInstance: any;

  constructor() {
    this.initForm();

    // Effect to handle edit mode
    effect(() => {
      const id = this.userId();
      if (id) {
        this.modalTitle.set('Editar Usuario');
        this.loadUserData(id);
      } else {
        this.modalTitle.set('Nuevo Usuario');
      }
    });
  }

  ngOnInit(): void {
    this.loadCatalogs();
    this.openModal();
  }

  private initForm(): void {
    this.userForm = this.fb.group({
      person_id: [null, [Validators.required]],
      role_id: [null, [Validators.required]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      usr_password: ['', [Validators.minLength(6)]],
      username: ['', [Validators.required, Validators.maxLength(255)]],
      lastname: ['', [Validators.required, Validators.maxLength(255)]],
      usr_active: [1],
      expiration_date: [null],
      is_generic: [0],
    });

    // Password is required for new users, optional for edit
    if (!this.isEditMode()) {
      this.userForm.get('usr_password')?.setValidators([Validators.required, Validators.minLength(6)]);
    }
  }

  private loadCatalogs(): void {
    // Load roles
    this.catalogService.getCatalog('roles').subscribe({
      next: (items: any[]) => {
        const roleItems: RoleItem[] = items.map((item) => ({
          id: item.id,
          role_name: item.role_name,
        }));
        this.roles.set(roleItems);
      },
      error: (err: any) => {
        console.error('Error loading roles:', err);
        this.error.set('Error cargando catálogo de roles');
      },
    });

    // Load people - we'll need to create an endpoint for this
    // For now, we'll just set an empty array
    this.people.set([]);
  }

  private loadUserData(id: number): void {
    this.isLoading.set(true);
    this.userService.getUserById(id).subscribe({
      next: (response) => {
        if (response.success) {
          const user = response.data;
          this.userForm.patchValue({
            person_id: user.person_id,
            role_id: user.role_id,
            email: user.email,
            username: user.username,
            lastname: user.lastname,
            usr_active: user.usr_active,
            expiration_date: user.expiration_date ? new Date(user.expiration_date).toISOString().split('T')[0] : null,
            is_generic: user.is_generic,
          });
          // Don't set password for edit mode
          this.userForm.get('usr_password')?.clearValidators();
          this.userForm.get('usr_password')?.updateValueAndValidity();
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading user:', err);
        this.error.set('Error cargando datos del usuario');
        this.isLoading.set(false);
      },
    });
  }

  openModal(): void {
    this.error.set(null);

    if (!this.userId()) {
      this.resetForm();
    }

    const modalElement = document.getElementById('userModal');
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
    if (this.userForm.invalid) {
      Object.keys(this.userForm.controls).forEach((key) => {
        this.userForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSaving.set(true);
    this.error.set(null);

    const formValue = this.userForm.value;

    // Remove password if it's empty in edit mode
    if (this.isEditMode() && !formValue.usr_password) {
      delete formValue.usr_password;
    }

    if (this.isEditMode() && this.userId()) {
      this.updateUser(this.userId()!, formValue);
    } else {
      this.createUser(formValue);
    }
  }

  private createUser(data: CreateUserRequest): void {
    this.userService.createUser(data).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.showSuccess(response.message || 'Usuario creado exitosamente');
          this.userSaved.emit();
          this.closeModal();
          this.resetForm();
        }
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error('Error creating user:', err);
        this.error.set(err.error?.message || 'Error al crear usuario');
        this.toastService.showError(err.error?.message || 'Error al crear usuario');
        this.isSaving.set(false);
      },
    });
  }

  private updateUser(id: number, data: UpdateUserRequest): void {
    this.userService.updateUser(id, data).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.showSuccess(response.message || 'Usuario actualizado exitosamente');
          this.userSaved.emit();
          this.closeModal();
          this.resetForm();
        }
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error('Error updating user:', err);
        this.error.set(err.error?.message || 'Error al actualizar usuario');
        this.toastService.showError(err.error?.message || 'Error al actualizar usuario');
        this.isSaving.set(false);
      },
    });
  }

  private resetForm(): void {
    this.userForm.reset({
      person_id: null,
      role_id: null,
      email: '',
      usr_password: '',
      username: '',
      lastname: '',
      usr_active: 1,
      expiration_date: null,
      is_generic: 0,
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Este campo es requerido';
    if (field.errors['email']) return 'Email inválido';
    if (field.errors['minlength']) {
      return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    }
    if (field.errors['maxlength']) {
      return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
    }

    return '';
  }

  onActiveChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.userForm.patchValue({ usr_active: target.checked ? 1 : 0 });
  }

  onGenericChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.userForm.patchValue({ is_generic: target.checked ? 1 : 0 });
  }
}
