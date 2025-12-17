import { Component, signal, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CatalogService } from '../../../services/catalog.service';
import { ToastService } from '../../../services/toast.service';
import { CatalogItem } from '../../../models/catalog.model';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { CatalogEntryModalComponent } from '../../../components/catalog-entry-modal/catalog-entry-modal.component';
import { TableColumn, RowAction } from '../../../shared/models/table.model';

@Component({
  selector: 'app-catalog-detail',
  imports: [
    MatIconModule,
    CommonModule,
    RouterLink,
    FormsModule,
    DataTableComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
    BadgeComponent,
    CatalogEntryModalComponent,
  ],
  templateUrl: './catalog-detail.component.html',
  styleUrl: './catalog-detail.component.scss',
})
export class CatalogDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private catalogService = inject(CatalogService);
  private toastService = inject(ToastService);

  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  // Signals
  catalogName = signal<string>('');
  catalogDisplayName = signal<string>('');
  entries = signal<CatalogItem[]>([]);
  filteredEntries = signal<CatalogItem[]>([]);
  isLoading = signal(false);
  searchTerm = signal('');
  selectedEntryId = signal<number | null>(null);
  showEntryModal = signal(false);
  editMode = signal(false);

  // Table columns
  columns: TableColumn[] = [
    { field: 'id', header: 'ID', sortable: true, width: '80px' },
    { field: 'name', header: 'Nombre', sortable: true },
    { field: 'alias', header: 'Alias', sortable: true },
    { field: 'description', header: 'Descripción', sortable: false },
  ];

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const name = params['catalogName'];
      this.catalogName.set(name);
      this.catalogDisplayName.set(this.formatCatalogName(name));
      this.loadEntries();
    });
  }

  loadEntries(): void {
    this.isLoading.set(true);

    this.catalogService.getCatalog(this.catalogName()).subscribe({
      next: (data) => {
        this.entries.set(data);
        this.filteredEntries.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading catalog entries:', err);
        this.toastService.showError('Error al cargar entradas del catálogo');
        this.isLoading.set(false);
      },
    });
  }

  onSearch(): void {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      this.filteredEntries.set(this.entries());
      return;
    }

    const filtered = this.entries().filter(
      (entry) =>
        entry.name?.toLowerCase().includes(term) ||
        entry.alias?.toLowerCase().includes(term) ||
        entry.description?.toLowerCase().includes(term)
    );
    this.filteredEntries.set(filtered);
  }

  onNewEntry(): void {
    this.selectedEntryId.set(null);
    this.editMode.set(false);
    this.showEntryModal.set(true);
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

  onEdit(entry: CatalogItem): void {
    this.selectedEntryId.set(entry.id);
    this.editMode.set(true);
    this.showEntryModal.set(true);
  }

  onDelete(entry: CatalogItem): void {
    this.selectedEntryId.set(entry.id);
    this.confirmDialog.open(
      'Confirmar Eliminación',
      `¿Está seguro que desea eliminar la entrada "${entry.name}"?`,
      () => this.confirmDelete()
    );
  }

  confirmDelete(): void {
    const entryId = this.selectedEntryId();
    if (!entryId) return;

    this.catalogService.deleteCatalogItem(this.catalogName(), entryId).subscribe({
      next: () => {
        this.toastService.showSuccess('Entrada eliminada exitosamente');
        this.loadEntries();
      },
      error: (err) => {
        console.error('Error deleting entry:', err);
        this.toastService.showError(
          err.error?.message || 'Error al eliminar entrada'
        );
      },
    });
  }

  onEntrySaved(): void {
    this.showEntryModal.set(false);
    this.loadEntries();
  }

  onModalClosed(): void {
    this.showEntryModal.set(false);
    this.selectedEntryId.set(null);
  }

  formatCatalogName(name: string): string {
    return name
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  goBack(): void {
    this.router.navigate(['/admin/catalogs']);
  }
}
