import { Component, signal, inject, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MaterialService } from '../../../services/material.service';
import { ToastService } from '../../../services/toast.service';
import { Material, MaterialStats, getStockStatus, getStockStatusColor } from '../../../models/material.model';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { NewMaterialModalComponent } from '../../../components/new-material-modal/new-material-modal.component';
import { TableColumn, PaginationInfo, RowAction } from '../../../shared/models/table.model';

@Component({
  selector: 'app-materials-dashboard',
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    DataTableComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
    BadgeComponent,
    NewMaterialModalComponent,
  ],
  templateUrl: './materials-dashboard.component.html',
  styleUrl: './materials-dashboard.component.scss',
})
export class MaterialsDashboardComponent implements OnInit {
  private router = inject(Router);
  private materialService = inject(MaterialService);
  private toastService = inject(ToastService);

  @ViewChild(NewMaterialModalComponent) newMaterialModal!: NewMaterialModalComponent;
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  // Signals
  materials = signal<Material[]>([]);
  stats = signal<MaterialStats | null>(null);
  isLoading = signal(false);
  isLoadingStats = signal(false);
  searchTerm = signal('');
  currentPage = signal(1);
  pageSize = signal(10);
  pagination = signal<PaginationInfo | undefined>(undefined);
  selectedMaterialId = signal<number | null>(null);

  // Table columns
  columns: TableColumn[] = [
    { field: 'material_code', header: 'Código', sortable: true, width: '120px' },
    { field: 'material_name', header: 'Nombre', sortable: true },
    { field: 'category_name', header: 'Categoría', sortable: true },
    { field: 'unit_name', header: 'Unidad', sortable: true, width: '100px' },
    { field: 'current_stock', header: 'Stock Actual', sortable: true, type: 'number', width: '120px' },
    { field: 'minimum_stock', header: 'Stock Mínimo', sortable: true, type: 'number', width: '120px' },
    { field: 'unit_cost', header: 'Costo Unitario', sortable: true, type: 'currency', width: '130px' },
    {
      field: 'total_value',
      header: 'Valor Total',
      sortable: true,
      type: 'currency',
      width: '130px',
    },
    {
      field: 'stock_status',
      header: 'Estado',
      sortable: true,
      type: 'badge',
      width: '130px',
    },
  ];

  ngOnInit(): void {
    this.loadMaterials();
    this.loadStats();
  }

  loadMaterials(): void {
    this.isLoading.set(true);

    this.materialService
      .getAllMaterials(this.currentPage(), this.pageSize(), this.searchTerm() || undefined)
      .subscribe({
        next: (response) => {
          if (response.success) {
            // Add calculated fields
            const materialsWithCalcs = response.data.map((m: any) => ({
              ...m,
              total_value: m.current_stock * m.unit_cost,
              stock_status: this.getStockStatusLabel(m.current_stock, m.minimum_stock),
            }));
            this.materials.set(materialsWithCalcs);
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
          console.error('Error loading materials:', err);
          this.toastService.showError('Error al cargar materiales');
          this.isLoading.set(false);
        },
      });
  }

  loadStats(): void {
    this.isLoadingStats.set(true);

    this.materialService.getMaterialStats().subscribe({
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
    this.loadMaterials();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadMaterials();
  }

  onNewMaterial(): void {
    this.selectedMaterialId.set(null);
    this.newMaterialModal.openModal();
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

  onView(material: Material): void {
    this.router.navigate(['/materials', material.id]);
  }

  onEdit(material: Material): void {
    this.selectedMaterialId.set(material.id);
    setTimeout(() => {
      this.newMaterialModal.openModal();
    }, 0);
  }

  onDelete(material: Material): void {
    this.confirmDialog.open(
      '¿Eliminar Material?',
      `¿Está seguro que desea eliminar el material "${material.material_name}"? Esta acción no se puede deshacer.`,
      () => {
        this.deleteMaterial(material.id);
      }
    );
  }

  deleteMaterial(id: number): void {
    this.materialService.deleteMaterial(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.showSuccess('Material eliminado exitosamente');
          this.loadMaterials();
          this.loadStats();
        }
      },
      error: (err) => {
        console.error('Error deleting material:', err);
        this.toastService.showError('Error al eliminar el material');
      },
    });
  }

  getStockStatusBadgeClass(currentStock: number, minimumStock: number): string {
    const status = getStockStatus(currentStock, minimumStock);
    return getStockStatusColor(status);
  }

  getStockStatusLabel(currentStock: number, minimumStock: number): string {
    const status = getStockStatus(currentStock, minimumStock);
    const labels: { [key: string]: string } = {
      out_of_stock: 'Agotado',
      critical: 'Crítico',
      low: 'Bajo',
      adequate: 'Adecuado',
    };
    return labels[status] || 'Desconocido';
  }

  getLowStockCount(): number {
    return this.stats()?.low_stock_count || 0;
  }

  onMaterialSaved(): void {
    this.toastService.showSuccess(
      this.selectedMaterialId() ? 'Material actualizado exitosamente' : 'Material creado exitosamente'
    );
    this.loadMaterials();
    this.loadStats();
    this.selectedMaterialId.set(null);
  }
}
