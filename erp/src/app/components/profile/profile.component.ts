import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { AppHeader } from '../app-header/app-header';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule, DatePipe, AppHeader, MatIconModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  currentUser = this.authService.currentUser;
  profileForm: FormGroup;
  loading = signal(false);
  editMode = signal(false);

  constructor() {
    this.profileForm = this.fb.group({
      first_name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/),
        ],
      ],
      last_name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/),
        ],
      ],
    });
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    const user = this.currentUser();
    if (user?.person) {
      this.profileForm.patchValue({
        first_name: user.person.first_name,
        last_name: user.person.last_name,
      });
    }
  }

  get firstName() {
    return this.profileForm.get('first_name');
  }

  get lastName() {
    return this.profileForm.get('last_name');
  }

  toggleEditMode(): void {
    this.editMode.update((mode) => !mode);
    if (!this.editMode()) {
      this.loadUserData();
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: () => {
        this.loading.set(false);
        this.toastService.showSuccess('Perfil actualizado exitosamente');
        this.editMode.set(false);
      },
      error: (error: Error) => {
        this.loading.set(false);
        this.toastService.showError(error.message || 'Error al actualizar el perfil');
      },
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
