import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

/**
 * Configuración para cada tab del TrackingCard
 */
export interface TabConfig {
  id: string;
  label: string;
  icon?: string;
}

/**
 * Componente reutilizable que proporciona un card con sistema de tabs configurable.
 * Utiliza content projection para permitir que cada página defina el contenido de sus tabs.
 *
 * @example
 * ```html
 * <app-tracking-card
 *   [tabs]="mainTabs()"
 *   [activeTabId]="activeTab()"
 *   (tabChange)="onTabChange($event)"
 * >
 *   <div tab-details>
 *     <!-- Contenido del tab Details -->
 *   </div>
 *   <div tab-history>
 *     <!-- Contenido del tab History -->
 *   </div>
 *   <div tab-chatter>
 *     <!-- Contenido del tab Chatter -->
 *   </div>
 *   <div tab-notes-files>
 *     <!-- Contenido del tab Notes & Files -->
 *   </div>
 * </app-tracking-card>
 * ```
 */
@Component({
  selector: 'app-tracking-card',
  imports: [CommonModule, MatIconModule],
  templateUrl: './tracking-card.component.html',
  styleUrl: './tracking-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrackingCardComponent {
  /**
   * Configuración de tabs a mostrar
   */
  tabs = input.required<TabConfig[]>();

  /**
   * ID del tab activo (controlado desde el padre)
   */
  activeTabId = input<string>('');

  /**
   * Clase CSS adicional para el card
   */
  cardClass = input<string>('');

  /**
   * Evento emitido cuando se cambia de tab
   */
  tabChange = output<string>();

  /**
   * Tab activo actual (estado interno)
   */
  protected currentTabId = signal<string>('');

  constructor() {
    // Sincronizar el tab activo desde el input
    effect(() => {
      const activeId = this.activeTabId();
      if (activeId && activeId !== this.currentTabId()) {
        this.currentTabId.set(activeId);
      }
    });

    // Establecer el primer tab como activo por defecto
    effect(() => {
      const tabs = this.tabs();
      if (tabs.length > 0 && !this.currentTabId()) {
        this.currentTabId.set(tabs[0].id);
      }
    });
  }

  /**
   * Maneja el click en un tab
   * @param tabId ID del tab clickeado
   */
  protected onTabClick(tabId: string): void {
    if (this.currentTabId() !== tabId) {
      this.currentTabId.set(tabId);
      this.tabChange.emit(tabId);
    }
  }
}
