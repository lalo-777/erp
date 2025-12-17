import { Component, signal, inject, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../../services/user.service';
import { ToastService } from '../../../services/toast.service';
import { UserListItem, UserStats } from '../../../models/user.model';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { UserModalComponent } from '../../../components/user-modal/user-modal.component';
import { TableColumn, PaginationInfo, RowAction } from '../../../shared/models/table.model';

@Component({
  selector: 'app-users-dashboard',
  imports: [
    MatIconModule,
    CommonModule,

    FormsModule,
    DataTableComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,

    UserModalComponent,
  ],
  templateUrl: './users-dashboard.component.html',
  styleUrl: './users-dashboard.component.scss',
})
export class UsersDashboardComponent implements OnInit {
  private router = inject(Router);
  private userService = inject(UserService);
  private toastService = inject(ToastService);

  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  // Signals
  users = signal<UserListItem[]>([]);
  stats = signal<UserStats | null>(null);
  isLoading = signal(false);
  isLoadingStats = signal(false);
  searchTerm = signal('');
  currentPage = signal(1);
  pageSize = signal(10);
  pagination = signal<PaginationInfo | undefined>(undefined);
  selectedUserId = signal<number | null>(null);
  showUserModal = signal(false);
  editMode = signal(false);

  // Table columns
  columns: TableColumn[] = [
    { field: 'id', header: 'ID', sortable: true, width: '80px' },
    { field: 'username', header: 'Nombre de Usuario', sortable: true },
    { field: 'lastname', header: 'Apellido', sortable: true },
    { field: 'email', header: 'Email', sortable: true },
    { field: 'role_name', header: 'Rol', sortable: true },
    {
      field: 'usr_active',
      header: 'Estado',
      sortable: true,
      type: 'badge',
      format: (value: number) => (value === 1 ? 'Activo' : 'Inactivo'),
    },
  ];

  ngOnInit(): void {
    this.loadUsers();
    this.loadStats();
  }

  loadUsers(): void {
    this.isLoading.set(true);

    this.userService
      .getAllUsers(this.currentPage(), this.pageSize(), this.searchTerm() || undefined)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.users.set(response.data);
            this.pagination.set({
              currentPage: response.pagination.currentPage,
              pageSize: response.pagination.itemsPerPage,
              totalItems: response.pagination.totalItems,
              totalPages: response.pagination.totalPages,
            });
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading users:', err);
          this.toastService.showError('Error al cargar usuarios');
          this.isLoading.set(false);
        },
      });
  }

  loadStats(): void {
    this.isLoadingStats.set(true);

    this.userService.getUserStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.stats.set(response.data);
        }
        this.isLoadingStats.set(false);
      },
      error: (err) => {
        console.error('Error loading stats:', err);
        this.isLoadingStats.set(false);
      },
    });
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadUsers();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadUsers();
  }

  onNewUser(): void {
    this.selectedUserId.set(null);
    this.editMode.set(false);
    this.showUserModal.set(true);
  }

  onRowAction(action: RowAction): void {
    switch (action.type) {
      case 'edit':
        this.onEdit(action.data);
        break;
      case 'delete':
        this.onDelete(action.data);
        break;
    }
  }

  onEdit(user: UserListItem): void {
    this.selectedUserId.set(user.id);
    this.editMode.set(true);
    this.showUserModal.set(true);
  }

  onDelete(user: UserListItem): void {
    this.selectedUserId.set(user.id);
    this.confirmDialog.open(
      'Confirmar Eliminación',
      `¿Está seguro que desea desactivar al usuario "${user.username} ${user.lastname}"?`,
      () => this.confirmDelete()
    );
  }

  confirmDelete(): void {
    const userId = this.selectedUserId();
    if (!userId) return;

    this.userService.deleteUser(userId).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.showSuccess(response.message || 'Usuario desactivado exitosamente');
          this.loadUsers();
          this.loadStats();
        }
      },
      error: (err) => {
        console.error('Error deleting user:', err);
        this.toastService.showError(
          err.error?.message || 'Error al desactivar usuario'
        );
      },
    });
  }

  onUserSaved(): void {
    this.showUserModal.set(false);
    this.loadUsers();
    this.loadStats();
  }

  onModalClosed(): void {
    this.showUserModal.set(false);
    this.selectedUserId.set(null);
  }

  getActiveStatusBadge(active: number): string {
    return active === 1 ? 'success' : 'danger';
  }

  getActiveStatusLabel(active: number): string {
    return active === 1 ? 'Activo' : 'Inactivo';
  }
}
