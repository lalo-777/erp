import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

/**
 * Registro individual del historial de cambios
 */
export interface HistoryItem {
  id: number;
  change_date: string;
  field_display_name: string;
  table_name: string;
  old_value: string | null;
  new_value: string | null;
  old_value_display?: string;
  new_value_display?: string;
  is_foreign_key: boolean;
  changed_by_user: string;
}

/**
 * Información de paginación del historial
 */
export interface HistoryPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

/**
 * Filtros aplicables al historial
 */
export interface HistoryFilters {
  dateFrom: string;
  dateTo: string;
  limit: number;
}

/**
 * Componente controlado para mostrar el historial de cambios con filtros y paginación.
 * Los componentes padre mantienen el control del estado de filtros y paginación.
 *
 * @example
 * ```html
 * <app-history-tab
 *   [history]="history()"
 *   [pagination]="historyPagination()"
 *   [filters]="historyFilters()"
 *   [isLoading]="isLoadingHistory()"
 *   (loadPage)="onHistoryPageChange($event)"
 *   (filtersChange)="onHistoryFiltersChange($event)"
 *   (clearFilters)="onClearHistoryFilters()"
 * />
 * ```
 */
@Component({
  selector: 'app-history-tab',
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './history-tab.component.html',
  styleUrl: './history-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryTabComponent {
  /**
   * Lista de registros del historial
   */
  history = input.required<HistoryItem[]>();

  /**
   * Información de paginación
   */
  pagination = input.required<HistoryPagination>();

  /**
   * Filtros actuales
   */
  filters = input.required<HistoryFilters>();

  /**
   * Indica si se está cargando el historial
   */
  isLoading = input<boolean>(false);

  /**
   * Evento para cargar una página específica
   */
  loadPage = output<number>();

  /**
   * Evento cuando cambian los filtros
   */
  filtersChange = output<HistoryFilters>();

  /**
   * Evento para limpiar los filtros
   */
  clearFilters = output<void>();

  /**
   * Array de números de página para la paginación
   */
  protected paginationArray = computed(() => {
    const totalPages = this.pagination().totalPages;
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  });

  /**
   * Maneja el cambio en el límite de items por página
   */
  protected onLimitChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newLimit = parseInt(target.value, 10);
    const currentFilters = this.filters();

    this.filtersChange.emit({
      ...currentFilters,
      limit: newLimit,
    });
  }

  /**
   * Maneja el cambio en la fecha "desde"
   */
  protected onDateFromChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const currentFilters = this.filters();

    this.filtersChange.emit({
      ...currentFilters,
      dateFrom: target.value,
    });
  }

  /**
   * Maneja el cambio en la fecha "hasta"
   */
  protected onDateToChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const currentFilters = this.filters();

    this.filtersChange.emit({
      ...currentFilters,
      dateTo: target.value,
    });
  }

  /**
   * Maneja el click en limpiar filtros
   */
  protected onClearFiltersClick(): void {
    this.clearFilters.emit();
  }

  /**
   * Maneja el click en un número de página
   */
  protected onPageClick(page: number): void {
    const currentPage = this.pagination().currentPage;
    if (page !== currentPage && page >= 1 && page <= this.pagination().totalPages) {
      this.loadPage.emit(page);
    }
  }

  /**
   * Maneja el click en el botón "Anterior"
   */
  protected onPreviousClick(): void {
    const currentPage = this.pagination().currentPage;
    if (currentPage > 1) {
      this.loadPage.emit(currentPage - 1);
    }
  }

  /**
   * Maneja el click en el botón "Siguiente"
   */
  protected onNextClick(): void {
    const pagination = this.pagination();
    if (pagination.currentPage < pagination.totalPages) {
      this.loadPage.emit(pagination.currentPage + 1);
    }
  }
}
