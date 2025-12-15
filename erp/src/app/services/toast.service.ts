import { Injectable } from '@angular/core';

/**
 * Tipo de toast para determinar el estilo y el icono
 */
export type ToastType = 'success' | 'error' | 'info' | 'warning';

/**
 * Configuración para crear un toast
 */
export interface ToastConfig {
  message: string;
  type: ToastType;
  icon?: string;
  duration?: number;
}

/**
 * Servicio centralizado para mostrar notificaciones toast en toda la aplicación.
 * Utiliza Bootstrap Toast API para renderizar notificaciones consistentes.
 *
 * @example
 * ```typescript
 * private toastService = inject(ToastService);
 *
 * // Mostrar toast de éxito
 * this.toastService.showSuccess('Operación completada');
 *
 * // Mostrar toast de error
 * this.toastService.showError('Error al procesar');
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastContainer: HTMLElement | null = null;

  /**
   * Muestra un toast de éxito
   * @param message Mensaje a mostrar
   * @param duration Duración en milisegundos (por defecto 3000)
   */
  showSuccess(message: string, duration: number = 3000): void {
    this.show({
      message,
      type: 'success',
      icon: 'check_circle',
      duration,
    });
  }

  /**
   * Muestra un toast de error
   * @param message Mensaje a mostrar
   * @param duration Duración en milisegundos (por defecto 3000)
   */
  showError(message: string, duration: number = 3000): void {
    this.show({
      message,
      type: 'error',
      icon: 'error',
      duration,
    });
  }

  /**
   * Muestra un toast de información
   * @param message Mensaje a mostrar
   * @param duration Duración en milisegundos (por defecto 3000)
   */
  showInfo(message: string, duration: number = 3000): void {
    this.show({
      message,
      type: 'info',
      icon: 'info',
      duration,
    });
  }

  /**
   * Muestra un toast de advertencia
   * @param message Mensaje a mostrar
   * @param duration Duración en milisegundos (por defecto 3000)
   */
  showWarning(message: string, duration: number = 3000): void {
    this.show({
      message,
      type: 'warning',
      icon: 'warning',
      duration,
    });
  }

  /**
   * Muestra un toast con la configuración especificada
   * @param config Configuración del toast
   */
  private show(config: ToastConfig): void {
    if (!this.toastContainer) {
      this.toastContainer = this.createToastContainer();
    }

    const toastElement = this.createToastElement(config);
    this.toastContainer.appendChild(toastElement);

    // Inicializar y mostrar el toast usando Bootstrap API
    const bsToast = new (window as any).bootstrap.Toast(toastElement, {
      autohide: true,
      delay: config.duration || 3000,
    });

    bsToast.show();

    // Remover el elemento del DOM después de que se oculte
    toastElement.addEventListener('hidden.bs.toast', () => {
      toastElement.remove();
    });
  }

  /**
   * Crea el contenedor de toasts si no existe
   * @returns El elemento contenedor de toasts
   */
  private createToastContainer(): HTMLElement {
    let container = document.querySelector('.toast-container');

    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
      container.setAttribute('style', 'z-index: 9999');
      document.body.appendChild(container);
    }

    return container as HTMLElement;
  }

  /**
   * Crea el elemento toast con la configuración especificada
   * @param config Configuración del toast
   * @returns El elemento toast creado
   */
  private createToastElement(config: ToastConfig): HTMLElement {
    const toast = document.createElement('div');
    toast.className = 'toast align-items-center border-0';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    const bgClass = this.getBackgroundClass(config.type);
    toast.classList.add(bgClass, 'text-white');

    const icon = config.icon || this.getDefaultIcon(config.type);

    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body d-flex align-items-center">
          <span class="material-symbols-outlined me-2">${icon}</span>
          ${config.message}
        </div>
        <button
          type="button"
          class="btn-close btn-close-white me-2 m-auto"
          data-bs-dismiss="toast"
          aria-label="Close"
        ></button>
      </div>
    `;

    return toast;
  }

  /**
   * Obtiene la clase de color de fondo según el tipo de toast
   * @param type Tipo de toast
   * @returns Clase de Bootstrap para el fondo
   */
  private getBackgroundClass(type: ToastType): string {
    const classMap: Record<ToastType, string> = {
      success: 'bg-success',
      error: 'bg-danger',
      info: 'bg-info',
      warning: 'bg-warning',
    };
    return classMap[type];
  }

  /**
   * Obtiene el icono por defecto según el tipo de toast
   * @param type Tipo de toast
   * @returns Nombre del icono de Material Icons
   */
  private getDefaultIcon(type: ToastType): string {
    const iconMap: Record<ToastType, string> = {
      success: 'check_circle',
      error: 'error',
      info: 'info',
      warning: 'warning',
    };
    return iconMap[type];
  }
}
