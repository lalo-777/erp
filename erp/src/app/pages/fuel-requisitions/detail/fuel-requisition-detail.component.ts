import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FuelRequisitionService } from '../../../services/fuel-requisition.service';
import { ToastService } from '../../../services/toast.service';
import {
  FuelRequisition,
  getRequisitionStatusLabel,
  getRequisitionStatusColor,
  getFuelTypeLabel,
  formatCurrency,
  formatLiters,
} from '../../../models/fuel-requisition.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-fuel-requisition-detail',
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, BadgeComponent],
  templateUrl: './fuel-requisition-detail.component.html',
  styleUrl: './fuel-requisition-detail.component.scss',
})
export class FuelRequisitionDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fuelService = inject(FuelRequisitionService);
  private toastService = inject(ToastService);

  // Signals
  requisition = signal<FuelRequisition | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);
  requisitionId = signal<number | null>(null);
  isUpdatingStatus = signal(false);

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = parseInt(params['id']);
      if (id) {
        this.requisitionId.set(id);
        this.loadRequisition(id);
      }
    });
  }

  loadRequisition(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.fuelService.getRequisitionById(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.requisition.set(response.data);
        } else {
          this.error.set('No se pudo cargar la requisición');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading requisition:', err);
        this.error.set('Error al cargar la requisición');
        this.toastService.showError('Error al cargar la requisición');
        this.isLoading.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/fuel-requisitions']);
  }

  getRequisitionStatusLabel(): string {
    if (!this.requisition()) return 'Desconocido';
    return getRequisitionStatusLabel(this.requisition()!.requisition_status);
  }

  getRequisitionStatusBadgeClass(): 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'dark' {
    if (!this.requisition()) return 'secondary';
    const color = getRequisitionStatusColor(this.requisition()!.requisition_status);
    if (color === 'success') return 'success';
    if (color === 'warning') return 'warning';
    if (color === 'info') return 'info';
    if (color === 'danger') return 'danger';
    return 'secondary';
  }

  getFuelTypeLabel(): string {
    if (!this.requisition()) return 'Desconocido';
    return getFuelTypeLabel(this.requisition()!.fuel_type);
  }

  formatCurrency(amount: number): string {
    return formatCurrency(amount);
  }

  formatLiters(liters: number): string {
    return formatLiters(liters);
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatDateTime(dateString: string | undefined): string {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  canApprove(): boolean {
    return this.requisition()?.requisition_status === 'pending';
  }

  canMarkAsDelivered(): boolean {
    return this.requisition()?.requisition_status === 'approved';
  }

  canCancel(): boolean {
    const status = this.requisition()?.requisition_status;
    return status === 'pending' || status === 'approved';
  }

  onApprove(): void {
    if (!this.requisitionId()) return;

    this.isUpdatingStatus.set(true);
    this.fuelService.updateRequisitionStatus(this.requisitionId()!, 'approved').subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.showSuccess('Requisición aprobada exitosamente');
          this.loadRequisition(this.requisitionId()!);
        }
        this.isUpdatingStatus.set(false);
      },
      error: (err) => {
        console.error('Error approving requisition:', err);
        this.toastService.showError('Error al aprobar la requisición');
        this.isUpdatingStatus.set(false);
      },
    });
  }

  onMarkAsDelivered(): void {
    if (!this.requisitionId()) return;

    if (confirm(`¿Confirma que se ha entregado el combustible para "${this.requisition()!.vehicle_equipment_name}"?`)) {
      this.isUpdatingStatus.set(true);
      this.fuelService.updateRequisitionStatus(this.requisitionId()!, 'delivered').subscribe({
        next: (response) => {
          if (response.success) {
            this.toastService.showSuccess('Requisición marcada como entregada');
            this.loadRequisition(this.requisitionId()!);
          }
          this.isUpdatingStatus.set(false);
        },
        error: (err) => {
          console.error('Error marking as delivered:', err);
          this.toastService.showError('Error al marcar como entregada');
          this.isUpdatingStatus.set(false);
        },
      });
    }
  }

  onCancel(): void {
    if (!this.requisitionId()) return;

    if (confirm('¿Está seguro que desea cancelar esta requisición?')) {
      this.isUpdatingStatus.set(true);
      this.fuelService.updateRequisitionStatus(this.requisitionId()!, 'cancelled').subscribe({
        next: (response) => {
          if (response.success) {
            this.toastService.showSuccess('Requisición cancelada exitosamente');
            this.loadRequisition(this.requisitionId()!);
          }
          this.isUpdatingStatus.set(false);
        },
        error: (err) => {
          console.error('Error cancelling requisition:', err);
          this.toastService.showError('Error al cancelar la requisición');
          this.isUpdatingStatus.set(false);
        },
      });
    }
  }

  getUnitPrice(): string {
    if (!this.requisition()) return '-';
    return this.formatCurrency(this.requisition()!.unit_price);
  }

  getOdometerReading(): string {
    const reading = this.requisition()?.odometer_reading;
    return reading ? reading.toLocaleString('es-MX') + ' km' : 'No registrado';
  }
}
