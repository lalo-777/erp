import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableColumn, PaginationInfo, SortInfo, RowAction } from '../../models/table.model';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() loading = false;
  @Input() pagination?: PaginationInfo;
  @Input() emptyMessage = 'No hay datos disponibles';
  @Input() showActions = true;
  @Input() actionLabels = {
    view: 'Ver',
    edit: 'Editar',
    delete: 'Eliminar'
  };

  @Output() pageChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<SortInfo>();
  @Output() rowAction = new EventEmitter<RowAction>();

  sortInfo = signal<SortInfo | null>(null);

  get pageNumbers(): number[] {
    if (!this.pagination) return [];
    const pages: number[] = [];
    const totalPages = this.pagination.totalPages;
    const current = this.pagination.currentPage;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push(-1); // Ellipsis
        pages.push(totalPages);
      } else if (current >= totalPages - 3) {
        pages.push(1);
        pages.push(-1);
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push(-1);
        pages.push(totalPages);
      }
    }
    return pages;
  }

  onSort(column: TableColumn): void {
    if (!column.sortable) return;

    const currentSort = this.sortInfo();
    let direction: 'asc' | 'desc' = 'asc';

    if (currentSort?.field === column.field) {
      direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    }

    const newSort: SortInfo = { field: column.field, direction };
    this.sortInfo.set(newSort);
    this.sortChange.emit(newSort);
  }

  onPageChange(page: number): void {
    if (!this.pagination || page < 1 || page > this.pagination.totalPages) return;
    if (page === this.pagination.currentPage) return;
    this.pageChange.emit(page);
  }

  onAction(type: 'view' | 'edit' | 'delete', row: any): void {
    this.rowAction.emit({ type, data: row });
  }

  getCellValue(row: any, column: TableColumn): any {
    const value = row[column.field];

    if (column.format) {
      return column.format(value);
    }

    if (column.type === 'currency' && typeof value === 'number') {
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
      }).format(value);
    }

    if (column.type === 'date' && value) {
      return new Date(value).toLocaleDateString('es-MX');
    }

    return value;
  }

  getSortIcon(column: TableColumn): string {
    if (!column.sortable) return '';
    const currentSort = this.sortInfo();
    if (currentSort?.field !== column.field) return 'unfold_more';
    return currentSort.direction === 'asc' ? 'expand_less' : 'expand_more';
  }

  trackByIndex(index: number): number {
    return index;
  }

  getItemsRangeEnd(): number {
    if (!this.pagination) return 0;
    return Math.min(
      this.pagination.currentPage * this.pagination.pageSize,
      this.pagination.totalItems
    );
  }
}
