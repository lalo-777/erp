import { Component, signal, inject, ViewChild, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ProjectService } from '../../../services/project.service';
import { ToastService } from '../../../services/toast.service';
import { ProjectListItem, ProjectStats } from '../../../models/project.model';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { NewProjectModalComponent } from '../../../components/new-project-modal/new-project-modal.component';
import { TableColumn, PaginationInfo, RowAction } from '../../../shared/models/table.model';
import { KanbanBoardComponent, KanbanColumn, KanbanMoveEvent } from '../../../shared/components/kanban-board/kanban-board.component';

/** Tipo de vista del dashboard */
type ViewMode = 'table' | 'kanban';

/** Definición de estados para Kanban de Proyectos */
const PROJECT_STATUS_COLUMNS = [
  { id: 1, alias: 'active', name: 'Activo', color: 'bg-success' },
  { id: 2, alias: 'on_hold', name: 'En Espera', color: 'bg-warning' },
  { id: 3, alias: 'completed', name: 'Completado', color: 'bg-info' },
  { id: 4, alias: 'cancelled', name: 'Cancelado', color: 'bg-secondary' },
] as const;

@Component({
  selector: 'app-projects-dashboard',
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    DataTableComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
    NewProjectModalComponent,
    KanbanBoardComponent,
  ],
  templateUrl: './projects-dashboard.component.html',
  styleUrl: './projects-dashboard.component.scss',
})
export class ProjectsDashboardComponent implements OnInit {
  private router = inject(Router);
  private projectService = inject(ProjectService);
  private toastService = inject(ToastService);

  @ViewChild(NewProjectModalComponent) newProjectModal!: NewProjectModalComponent;
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  // Signals
  projects = signal<ProjectListItem[]>([]);
  allProjects = signal<ProjectListItem[]>([]); // Para Kanban (sin paginación)
  stats = signal<ProjectStats | null>(null);
  isLoading = signal(false);
  isLoadingStats = signal(false);
  isLoadingKanban = signal(false);
  searchTerm = signal('');
  currentPage = signal(1);
  pageSize = signal(10);
  pagination = signal<PaginationInfo | undefined>(undefined);
  selectedProjectId = signal<number | null>(null);
  viewMode = signal<ViewMode>('table');

  /** Columnas del Kanban calculadas a partir de los datos */
  kanbanColumns = computed<KanbanColumn<ProjectListItem>[]>(() => {
    const projectList = this.allProjects();
    return PROJECT_STATUS_COLUMNS.map((status) => ({
      id: status.id,
      name: status.name,
      color: status.color,
      items: projectList.filter((proj) => {
        const statusAlias = proj.status_alias?.toLowerCase();
        return statusAlias === status.alias || proj.project_status_id === status.id;
      }),
    }));
  });

  // Table columns
  columns: TableColumn[] = [
    { field: 'project_number', header: 'Código', sortable: true, width: '120px' },
    { field: 'project_name', header: 'Nombre', sortable: true },
    { field: 'company_name', header: 'Cliente', sortable: true },
    { field: 'project_type_name', header: 'Tipo', sortable: true },
    { field: 'manager_name', header: 'Responsable', sortable: true },
    { field: 'total_budget', header: 'Presupuesto', sortable: true, type: 'currency' },
    {
      field: 'status_alias',
      header: 'Estado',
      sortable: true,
      type: 'badge',
      format: (value: string) => {
        const statusMap: { [key: string]: string } = {
          active: 'Activo',
          completed: 'Completado',
          on_hold: 'En Espera',
          cancelled: 'Cancelado',
        };
        return statusMap[value?.toLowerCase()] || value;
      },
    },
  ];

  ngOnInit(): void {
    this.loadProjects();
    this.loadStats();
  }

  loadProjects(): void {
    this.isLoading.set(true);

    this.projectService
      .getAllProjects(this.currentPage(), this.pageSize(), this.searchTerm() || undefined)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.projects.set(response.data);
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
          console.error('Error loading projects:', err);
          this.toastService.showError('Error al cargar proyectos');
          this.isLoading.set(false);
        },
      });
  }

  loadStats(): void {
    this.isLoadingStats.set(true);

    this.projectService.getProjectStats().subscribe({
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
    this.loadProjects();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadProjects();
  }

  onNewProject(): void {
    this.selectedProjectId.set(null);
    this.newProjectModal.openModal();
  }

  onRowAction(action: RowAction): void {
    switch (action.type) {
      case 'view':
        this.onView(action.data);
        break;
      case 'edit':
        this.onEdit(action.data);
        break;
      case 'delete':
        this.onDelete(action.data);
        break;
    }
  }

  onView(project: ProjectListItem): void {
    this.router.navigate(['/projects', project.id]);
  }

  onEdit(project: ProjectListItem): void {
    this.selectedProjectId.set(project.id);
    setTimeout(() => {
      this.newProjectModal.openModal();
    }, 0);
  }

  onDelete(project: ProjectListItem): void {
    this.confirmDialog.open(
      '¿Eliminar Proyecto?',
      `¿Está seguro que desea eliminar el proyecto "${project.project_name}"? Esta acción no se puede deshacer.`,
      () => {
        this.deleteProject(project.id);
      }
    );
  }

  deleteProject(id: number): void {
    this.projectService.deleteProject(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.showSuccess('Proyecto eliminado exitosamente');
          this.loadProjects();
          this.loadStats();
        }
      },
      error: (err) => {
        console.error('Error deleting project:', err);
        this.toastService.showError('Error al eliminar el proyecto');
      },
    });
  }

  getStatusBadgeClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      active: 'success',
      completed: 'info',
      on_hold: 'warning',
      cancelled: 'secondary',
    };
    return statusMap[status?.toLowerCase()] || 'secondary';
  }

  getBudgetUtilization(): number {
    if (!this.stats()) return 0;
    const stats = this.stats()!;
    if (stats.total_estimated_budget === 0) return 0;
    return (stats.total_actual_cost / stats.total_estimated_budget) * 100;
  }

  getBudgetUtilizationClass(): string {
    const utilization = this.getBudgetUtilization();
    if (utilization < 80) return 'success';
    if (utilization < 100) return 'warning';
    return 'danger';
  }

  onProjectSaved(): void {
    this.toastService.showSuccess(
      this.selectedProjectId() ? 'Proyecto actualizado exitosamente' : 'Proyecto creado exitosamente'
    );
    this.loadProjects();
    this.loadStats();
    this.selectedProjectId.set(null);
  }

  // ==========================================
  // Kanban Methods
  // ==========================================

  /** Cambia entre vista tabla y kanban */
  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
    if (mode === 'kanban') {
      this.loadAllProjectsForKanban();
    }
  }

  /** Carga todos los proyectos sin paginación para el Kanban */
  loadAllProjectsForKanban(): void {
    this.isLoadingKanban.set(true);

    this.projectService.getAllProjects(1, 1000).subscribe({
      next: (response) => {
        if (response.success) {
          this.allProjects.set(response.data);
        }
        this.isLoadingKanban.set(false);
      },
      error: (err) => {
        console.error('Error loading projects for kanban:', err);
        this.toastService.showError('Error al cargar proyectos para vista Kanban');
        this.isLoadingKanban.set(false);
      },
    });
  }

  /** Maneja el movimiento de un item en el Kanban */
  onKanbanItemMoved(event: KanbanMoveEvent<ProjectListItem>): void {
    const newStatusId = Number(event.toColumnId);

    this.projectService.updateProjectStatus(event.item.id, newStatusId).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.showSuccess('Estado del proyecto actualizado');
          // Actualizar localmente
          this.allProjects.update((projects) =>
            projects.map((proj) =>
              proj.id === event.item.id ? { ...proj, project_status_id: newStatusId } : proj
            )
          );
          // Recargar stats
          this.loadStats();
        }
      },
      error: (err) => {
        console.error('Error updating project status:', err);
        this.toastService.showError('Error al actualizar el estado');
        // Recargar para revertir visualmente
        this.loadAllProjectsForKanban();
      },
    });
  }

  /** Maneja el click en un item del Kanban */
  onKanbanItemClicked(item: ProjectListItem): void {
    this.router.navigate(['/projects', item.id]);
  }

  /** Maneja el undo del Kanban */
  onKanbanUndo(): void {
    // Recargar datos para sincronizar
    this.loadAllProjectsForKanban();
    this.loadStats();
  }
}
