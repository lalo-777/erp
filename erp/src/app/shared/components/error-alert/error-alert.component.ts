import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-alert.component.html',
  styleUrls: ['./error-alert.component.scss']
})
export class ErrorAlertComponent {
  @Input() message = '';
  @Input() severity: 'error' | 'warning' | 'info' | 'success' = 'error';
  @Input() dismissible = true;
  @Input() icon?: string;

  @Output() dismissed = new EventEmitter<void>();

  isVisible = signal(true);

  get alertClass(): string {
    const classMap = {
      error: 'alert-danger',
      warning: 'alert-warning',
      info: 'alert-info',
      success: 'alert-success'
    };
    return classMap[this.severity];
  }

  get iconName(): string {
    if (this.icon) return this.icon;

    const iconMap = {
      error: 'error',
      warning: 'warning',
      info: 'info',
      success: 'check_circle'
    };
    return iconMap[this.severity];
  }

  dismiss(): void {
    this.isVisible.set(false);
    this.dismissed.emit();
  }

  show(): void {
    this.isVisible.set(true);
  }
}
