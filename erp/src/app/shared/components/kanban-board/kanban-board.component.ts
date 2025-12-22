import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  inject,
  TemplateRef,
  ContentChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {
  CdkDropList,
  CdkDrag,
  CdkDropListGroup,
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

import { UndoToastService } from '../../../services/undo-toast.service';

/**
 * Configuración de una columna del Kanban
 */
export interface KanbanColumn<T = unknown> {
  id: number | string;
  name: string;
  color?: string; // bg-info, bg-primary, etc.
  items: T[];
}

/**
 * Configuración del Kanban
 */
export interface KanbanConfig {
  columnWidth?: number;        // default: 280px
  undoTimeout?: number;        // default: 8000ms
  showUndoToast?: boolean;     // default: true
  allowReorder?: boolean;      // default: false (solo mover entre columnas)
}

/**
 * Evento emitido cuando un item se mueve
 */
export interface KanbanMoveEvent<T = unknown> {
  item: T;
  fromColumnId: number | string;
  toColumnId: number | string;
  fromIndex: number;
  toIndex: number;
}

/**
 * Componente genérico de tablero Kanban con drag & drop
 *
 * @example
 * ```html
 * <app-kanban-board
 *   [columns]="ordersByStatus()"
 *   [config]="{ columnWidth: 300 }"
 *   (itemMoved)="onOrderMoved($event)"
 *   (itemClicked)="onOrderClicked($event)"
 * >
 *   <ng-template #itemTemplate let-item>
 *     <div class="kanban-card-body">
 *       <h6>{{ item.order_number }}</h6>
 *       <p>{{ item.supplier_name }}</p>
 *     </div>
 *   </ng-template>
 * </app-kanban-board>
 * ```
 */
@Component({
  selector: 'app-kanban-board',
  imports: [
    CommonModule,
    MatIconModule,
    CdkDropListGroup,
    CdkDropList,
    CdkDrag,
  ],
  templateUrl: './kanban-board.component.html',
  styleUrl: './kanban-board.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanBoardComponent<T extends { id: number | string }> {
  private undoToastService = inject(UndoToastService);

  /** Columnas del Kanban */
  columns = input.required<KanbanColumn<T>[]>();

  /** Configuración del Kanban */
  config = input<KanbanConfig>({});

  /** Evento emitido cuando un item se mueve */
  itemMoved = output<KanbanMoveEvent<T>>();

  /** Evento emitido cuando se hace click en un item */
  itemClicked = output<T>();

  /** Evento emitido cuando se deshace un movimiento */
  undoMove = output<void>();

  /** Template personalizado para los items */
  @ContentChild('itemTemplate') itemTemplate!: TemplateRef<{ $implicit: T }>;

  // Estado para undo
  private pendingMove = signal<{
    item: T;
    fromColumnId: number | string;
    toColumnId: number | string;
    fromIndex: number;
    toIndex: number;
    timeoutId: number;
  } | null>(null);

  /** Ancho de columna */
  get columnWidth(): number {
    return this.config().columnWidth || 280;
  }

  /** Tiempo de undo en ms */
  get undoTimeout(): number {
    return this.config().undoTimeout || 8000;
  }

  /** Mostrar toast de undo */
  get showUndoToast(): boolean {
    return this.config().showUndoToast !== false;
  }

  /**
   * Maneja el drop de un item
   */
  onDrop(event: CdkDragDrop<KanbanColumn<T>>): void {
    if (event.previousContainer === event.container) {
      // Reordenar dentro de la misma columna
      if (this.config().allowReorder) {
        moveItemInArray(
          event.container.data.items,
          event.previousIndex,
          event.currentIndex
        );
      }
      return;
    }

    const item = event.previousContainer.data.items[event.previousIndex];
    const fromColumnId = event.previousContainer.data.id;
    const toColumnId = event.container.data.id;
    const fromColumn = event.previousContainer.data;
    const toColumn = event.container.data;

    // Mover visualmente
    transferArrayItem(
      fromColumn.items,
      toColumn.items,
      event.previousIndex,
      event.currentIndex
    );

    if (this.showUndoToast) {
      // Guardar para posible undo
      const timeoutId = window.setTimeout(() => {
        this.commitMove(item, fromColumnId, toColumnId, event.previousIndex, event.currentIndex);
      }, this.undoTimeout);

      this.pendingMove.set({
        item,
        fromColumnId,
        toColumnId,
        fromIndex: event.previousIndex,
        toIndex: event.currentIndex,
        timeoutId,
      });

      // Mostrar toast de undo
      this.undoToastService.show({
        title: 'Elemento movido',
        message: `Movido a "${toColumn.name}"`,
        duration: this.undoTimeout,
        onUndo: () => this.onUndoClick(),
      });
    } else {
      // Emitir inmediatamente sin undo
      this.itemMoved.emit({
        item,
        fromColumnId,
        toColumnId,
        fromIndex: event.previousIndex,
        toIndex: event.currentIndex,
      });
    }
  }

  /**
   * Confirma el movimiento después del timeout
   */
  private commitMove(
    item: T,
    fromColumnId: number | string,
    toColumnId: number | string,
    fromIndex: number,
    toIndex: number
  ): void {
    this.pendingMove.set(null);
    this.itemMoved.emit({
      item,
      fromColumnId,
      toColumnId,
      fromIndex,
      toIndex,
    });
  }

  /**
   * Deshace el último movimiento
   */
  onUndoClick(): void {
    const pending = this.pendingMove();
    if (!pending) return;

    // Cancelar el timeout
    clearTimeout(pending.timeoutId);

    // Encontrar las columnas
    const columns = this.columns();
    const fromColumn = columns.find((c) => c.id === pending.fromColumnId);
    const toColumn = columns.find((c) => c.id === pending.toColumnId);

    if (fromColumn && toColumn) {
      // Revertir el movimiento
      const itemIndex = toColumn.items.findIndex(
        (i) => i.id === pending.item.id
      );
      if (itemIndex !== -1) {
        transferArrayItem(
          toColumn.items,
          fromColumn.items,
          itemIndex,
          pending.fromIndex
        );
      }
    }

    this.pendingMove.set(null);
    this.undoMove.emit();
  }

  /**
   * Maneja el click en un item
   */
  onItemClick(item: T, event: Event): void {
    // Evitar que el click se propague si es un drag
    if ((event.target as HTMLElement).closest('.cdk-drag-handle')) {
      return;
    }
    this.itemClicked.emit(item);
  }

  /**
   * TrackBy para las columnas
   */
  trackColumn(index: number, column: KanbanColumn<T>): number | string {
    return column.id;
  }

  /**
   * TrackBy para los items
   */
  trackItem(index: number, item: T): number | string {
    return item.id;
  }

  /**
   * Obtiene el color de fondo para el header de la columna
   */
  getColumnHeaderClass(column: KanbanColumn<T>): string {
    return column.color || 'bg-secondary';
  }
}
