import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { LaborService } from '../../../services/labor.service';
import { ToastService } from '../../../services/toast.service';
import {
  LaborTimesheet,
  getPaymentStatusLabel,
  getPaymentStatusColor,
  formatCurrency,
  formatHours,
} from '../../../models/labor.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-labor-tracking',
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, BadgeComponent],
  templateUrl: './labor-tracking.component.html',
  styleUrl: './labor-tracking.component.scss',
})
export class LaborTrackingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private laborService = inject(LaborService);
  private toastService = inject(ToastService);

  // Signals
  timesheet = signal<LaborTimesheet | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);
  timesheetId = signal<number | null>(null);
  isUpdatingStatus = signal(false);

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = parseInt(params['id']);
      if (id) {
        this.timesheetId.set(id);
        this.loadTimesheet(id);
      }
    });
  }

  loadTimesheet(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.laborService.getTimesheetById(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.timesheet.set(response.data);
        } else {
          this.error.set('No se pudo cargar la hoja de tiempo');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading timesheet:', err);
        this.error.set('Error al cargar la hoja de tiempo');
        this.toastService.showError('Error al cargar la hoja de tiempo');
        this.isLoading.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/labor']);
  }

  getPaymentStatusLabel(): string {
    if (!this.timesheet()) return 'Desconocido';
    return getPaymentStatusLabel(this.timesheet()!.payment_status);
  }

  getPaymentStatusBadgeClass(): 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'dark' {
    if (!this.timesheet()) return 'secondary';
    const color = getPaymentStatusColor(this.timesheet()!.payment_status);
    if (color === 'success') return 'success';
    if (color === 'warning') return 'warning';
    if (color === 'info') return 'info';
    return 'secondary';
  }

  formatCurrency(amount: number): string {
    return formatCurrency(amount);
  }

  formatHours(hours: number): string {
    return formatHours(hours);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  canApprove(): boolean {
    return this.timesheet()?.payment_status === 'pending';
  }

  canMarkAsPaid(): boolean {
    return this.timesheet()?.payment_status === 'approved';
  }

  onApprove(): void {
    if (!this.timesheetId()) return;

    this.isUpdatingStatus.set(true);
    this.laborService.updatePaymentStatus(this.timesheetId()!, 'approved').subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.showSuccess('Pago aprobado exitosamente');
          this.loadTimesheet(this.timesheetId()!);
        }
        this.isUpdatingStatus.set(false);
      },
      error: (err) => {
        console.error('Error approving payment:', err);
        this.toastService.showError('Error al aprobar el pago');
        this.isUpdatingStatus.set(false);
      },
    });
  }

  onMarkAsPaid(): void {
    if (!this.timesheetId()) return;

    if (confirm(`¿Confirma que se ha realizado el pago de ${this.formatCurrency(this.timesheet()!.payment_amount)}?`)) {
      this.isUpdatingStatus.set(true);
      this.laborService.updatePaymentStatus(this.timesheetId()!, 'paid').subscribe({
        next: (response) => {
          if (response.success) {
            this.toastService.showSuccess('Pago registrado exitosamente');
            this.loadTimesheet(this.timesheetId()!);
          }
          this.isUpdatingStatus.set(false);
        },
        error: (err) => {
          console.error('Error marking as paid:', err);
          this.toastService.showError('Error al registrar el pago');
          this.isUpdatingStatus.set(false);
        },
      });
    }
  }

  getPerformanceLabel(): string {
    const score = this.timesheet()?.performance_score;
    if (!score) return 'No evaluado';
    if (score >= 9) return 'Excelente';
    if (score >= 7) return 'Muy Bueno';
    if (score >= 5) return 'Bueno';
    if (score >= 3) return 'Regular';
    return 'Deficiente';
  }

  getPerformanceColor(): string {
    const score = this.timesheet()?.performance_score;
    if (!score) return 'secondary';
    if (score >= 9) return 'success';
    if (score >= 7) return 'info';
    if (score >= 5) return 'primary';
    if (score >= 3) return 'warning';
    return 'danger';
  }
}
