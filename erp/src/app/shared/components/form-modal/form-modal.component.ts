import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

declare var bootstrap: any;

@Component({
  selector: 'app-form-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-modal.component.html',
  styleUrls: ['./form-modal.component.scss']
})
export class FormModalComponent {
  @Input() title = 'Formulario';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() confirmText = 'Guardar';
  @Input() cancelText = 'Cancelar';
  @Input() confirmVariant: 'primary' | 'success' | 'warning' | 'danger' = 'primary';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() modalClosed = new EventEmitter<void>();

  @ViewChild('modalElement') modalElement!: ElementRef;

  isLoading = signal(false);
  error = signal<string | null>(null);

  private modalInstance: any;

  get sizeClass(): string {
    const sizeMap = {
      sm: 'modal-sm',
      md: '',
      lg: 'modal-lg',
      xl: 'modal-xl'
    };
    return sizeMap[this.size];
  }

  openModal(): void {
    this.error.set(null);
    if (!this.modalInstance) {
      this.modalInstance = new bootstrap.Modal(this.modalElement.nativeElement, {
        backdrop: 'static',
        keyboard: false
      });
    }
    this.modalInstance.show();
  }

  closeModal(): void {
    if (this.modalInstance) {
      this.modalInstance.hide();
      this.modalClosed.emit();
    }
  }

  setLoading(loading: boolean): void {
    this.isLoading.set(loading);
  }

  setError(error: string | null): void {
    this.error.set(error);
  }

  clearError(): void {
    this.error.set(null);
  }

  onConfirm(): void {
    if (this.isLoading()) return;
    this.clearError();
    this.confirm.emit();
  }

  onCancel(): void {
    if (this.isLoading()) return;
    this.clearError();
    this.cancel.emit();
    this.closeModal();
  }

  ngOnDestroy(): void {
    if (this.modalInstance) {
      this.modalInstance.dispose();
    }
  }
}
