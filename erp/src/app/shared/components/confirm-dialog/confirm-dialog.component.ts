import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

declare var bootstrap: any;

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {
  @Input() title = 'Confirmar acción';
  @Input() message = '¿Está seguro de que desea continuar?';
  @Input() confirmText = 'Confirmar';
  @Input() cancelText = 'Cancelar';
  @Input() variant: 'danger' | 'warning' | 'info' | 'primary' = 'warning';
  @Input() icon = 'warning';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  @ViewChild('modalElement') modalElement!: ElementRef;

  private modalInstance: any;
  private confirmCallback?: () => void;

  get variantClass(): string {
    const classMap = {
      danger: 'text-danger',
      warning: 'text-warning',
      info: 'text-info',
      primary: 'text-primary'
    };
    return classMap[this.variant];
  }

  get iconName(): string {
    const iconMap = {
      danger: 'error',
      warning: 'warning',
      info: 'info',
      primary: 'help'
    };
    return iconMap[this.variant] || this.icon;
  }

  open(title: string, message: string, confirmCallback: () => void, variant: 'danger' | 'warning' | 'info' | 'primary' = 'warning'): void {
    this.title = title;
    this.message = message;
    this.confirmCallback = confirmCallback;
    this.variant = variant;
    this.openDialog();
  }

  openDialog(): void {
    if (!this.modalInstance) {
      this.modalInstance = new bootstrap.Modal(this.modalElement.nativeElement, {
        backdrop: 'static',
        keyboard: true
      });
    }
    this.modalInstance.show();
  }

  closeDialog(): void {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
  }

  onConfirm(): void {
    if (this.confirmCallback) {
      this.confirmCallback();
    }
    this.confirm.emit();
    this.closeDialog();
  }

  onCancel(): void {
    this.cancel.emit();
    this.closeDialog();
  }

  ngOnDestroy(): void {
    if (this.modalInstance) {
      this.modalInstance.dispose();
    }
  }
}
