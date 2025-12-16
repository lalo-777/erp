import { Component, signal, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProjectService } from '../../../services/project.service';
import { ToastService } from '../../../services/toast.service';
import { Project, ProjectHistoryEntry } from '../../../models/project.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { NewProjectModalComponent } from '../../../components/new-project-modal/new-project-modal.component';

@Component({
  selector: 'app-project-tracking',
  imports: [
    CommonModule,
    RouterLink,
    LoadingSpinnerComponent,
    ErrorAlertComponent,
    BadgeComponent,
    ConfirmDialogComponent,
    NewProjectModalComponent,
  ],
  templateUrl: './project-tracking.component.html',
  styleUrl: './project-tracking.component.scss',
})
export class ProjectTrackingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projectService = inject(ProjectService);
  private toastService = inject(ToastService);

  @ViewChild(NewProjectModalComponent) newProjectModal!: NewProjectModalComponent;
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  // Signals
  project = signal<Project | null>(null);
  projectId = signal<number | null>(null);
  history = signal<ProjectHistoryEntry[]>([]);
  isLoading = signal(false);
  isLoadingHistory = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = Number(params['id']);
      if (id) {
        this.projectId.set(id);
        this.loadProject(id);
        this.loadHistory(id);
      }
    });
  }

  loadProject(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.projectService.getProjectById(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.project.set(response.data);
        } else {
          this.error.set('Proyecto no encontrado');
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

  loadHistory(id: number): void {
    this.isLoadingHistory.set(true);

    this.projectService.getProjectHistory(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.history.set(response.data);
        }
        this.isLoadingHistory.set(false);
      },
      error: (err) => {
        console.error('Error loading history:', err);
        this.isLoadingHistory.set(false);
      },
    });
  }

  onEdit(): void {
    if (this.projectId()) {
      setTimeout(() => {
        this.newProjectModal.openModal();
      }, 0);
    }
  }

  onDelete(): void {
    const project = this.project();
    if (!project) return;

    this.confirmDialog.open(
      '¿Eliminar Proyecto?',
      `¿Está seguro que desea eliminar el proyecto "${project.project_name}"? Esta acción no se puede deshacer.`,
      () => {
        this.deleteProject();
      }
    );
  }

  deleteProject(): void {
    const id = this.projectId();
    if (!id) return;

    this.projectService.deleteProject(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.showSuccess('Proyecto eliminado exitosamente');
          this.router.navigate(['/projects']);
        }
      },
      error: (err) => {
        console.error('Error deleting project:', err);
        this.toastService.showError('Error al eliminar el proyecto');
      },
    });
  }

  onProjectSaved(): void {
    this.toastService.showSuccess('Proyecto actualizado exitosamente');
    if (this.projectId()) {
      this.loadProject(this.projectId()!);
      this.loadHistory(this.projectId()!);
    }
  }

  getStatusBadgeVariant(
    status: string
  ): 'success' | 'danger' | 'primary' | 'warning' | 'info' | 'secondary' | 'dark' {
    const statusMap: {
      [key: string]: 'success' | 'danger' | 'primary' | 'warning' | 'info' | 'secondary' | 'dark';
    } = {
      active: 'success',
      completed: 'info',
      on_hold: 'warning',
      cancelled: 'secondary',
    };
    return statusMap[status?.toLowerCase()] || 'secondary';
  }

  getStatusBadgeText(status: string): string {
    const statusMap: { [key: string]: string } = {
      active: 'Activo',
      completed: 'Completado',
      on_hold: 'En Espera',
      cancelled: 'Cancelado',
    };
    return statusMap[status?.toLowerCase()] || status;
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  formatCurrency(amount: number | undefined): string {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  }
}
