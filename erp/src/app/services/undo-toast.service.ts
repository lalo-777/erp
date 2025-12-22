import { Injectable, signal } from '@angular/core';

/**
 * Configuración del toast de undo
 */
export interface UndoToastConfig {
  title: string;
  message: string;
  duration: number; // en milisegundos
  onUndo: () => void;
}

/**
 * Estado del toast activo
 */
export interface UndoToastState extends UndoToastConfig {
  id: string;
  remainingTime: number;
  intervalId: number;
}

/**
 * Servicio para mostrar toasts con opción de deshacer
 * Usado principalmente por el componente Kanban para permitir
 * deshacer movimientos de elementos entre columnas.
 */
@Injectable({
  providedIn: 'root',
})
export class UndoToastService {
  /** Estado del toast activo */
  activeToast = signal<UndoToastState | null>(null);

  /** Contenedor de toasts en el DOM */
  private container: HTMLElement | null = null;

  /**
   * Muestra un toast con opción de deshacer
   */
  show(config: UndoToastConfig): void {
    // Cerrar toast anterior si existe
    this.dismiss();

    const id = `undo-toast-${Date.now()}`;
    const remainingTime = Math.floor(config.duration / 1000);

    // Crear el contenedor si no existe
    this.ensureContainer();

    // Crear el elemento del toast
    const toastEl = this.createToastElement(id, config.title, config.message, remainingTime);
    this.container!.appendChild(toastEl);

    // Iniciar countdown
    const intervalId = window.setInterval(() => {
      const current = this.activeToast();
      if (current) {
        const newRemaining = current.remainingTime - 1;
        if (newRemaining <= 0) {
          this.dismiss();
        } else {
          this.activeToast.update((state) =>
            state ? { ...state, remainingTime: newRemaining } : null
          );
          // Actualizar el badge de countdown
          const badge = toastEl.querySelector('.countdown-badge');
          if (badge) {
            badge.textContent = `${newRemaining}s`;
          }
        }
      }
    }, 1000);

    // Configurar el estado
    this.activeToast.set({
      ...config,
      id,
      remainingTime,
      intervalId,
    });

    // Configurar event listener para el botón undo
    const undoBtn = toastEl.querySelector('.undo-btn');
    if (undoBtn) {
      undoBtn.addEventListener('click', () => {
        config.onUndo();
        this.dismiss();
      });
    }

    // Configurar auto-dismiss
    window.setTimeout(() => {
      if (this.activeToast()?.id === id) {
        this.dismiss();
      }
    }, config.duration);
  }

  /**
   * Cierra el toast activo
   */
  dismiss(): void {
    const current = this.activeToast();
    if (current) {
      clearInterval(current.intervalId);

      // Remover el elemento del DOM
      const toastEl = document.getElementById(current.id);
      if (toastEl) {
        toastEl.classList.add('hiding');
        setTimeout(() => toastEl.remove(), 300);
      }

      this.activeToast.set(null);
    }
  }

  /**
   * Asegura que el contenedor de toasts exista en el DOM
   */
  private ensureContainer(): void {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'undo-toast-container';
      document.body.appendChild(this.container);
    }
  }

  /**
   * Crea el elemento HTML del toast
   */
  private createToastElement(
    id: string,
    title: string,
    message: string,
    countdown: number
  ): HTMLElement {
    const toast = document.createElement('div');
    toast.id = id;
    toast.className = 'toast show';
    toast.innerHTML = `
      <div class="toast-header">
        <strong>${title}</strong>
        <span class="countdown-badge">${countdown}s</span>
      </div>
      <div class="toast-body">
        <span>${message}</span>
        <button type="button" class="btn btn-warning btn-sm undo-btn">
          Deshacer
        </button>
      </div>
    `;
    return toast;
  }
}
