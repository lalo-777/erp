import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PreInventoryService } from '../../../services/pre-inventory.service';
import { ToastService } from '../../../services/toast.service';
import {
  PreInventory,
  getPreInventoryStatusColor,
  getPreInventoryStatusIcon,
  getDiscrepancyColor,
  getDiscrepancyLabel,
} from '../../../models/pre-inventory.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-pre-inventory-detail',
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    LoadingSpinnerComponent,
    BadgeComponent,
  ],
  templateUrl: './pre-inventory-detail.component.html',
  styleUrl: './pre-inventory-detail.component.scss',
})
export class PreInventoryDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private preInventoryService = inject(PreInventoryService);
  private toastService = inject(ToastService);

  // Signals
  record = signal<PreInventory | null>(null);
  isLoading = signal(false);
  isUpdating = signal(false);
  isProcessing = signal(false);
  showCountForm = signal(false);

  // Form
  countForm: FormGroup;

  constructor() {
    this.countForm = this.fb.group({
      counted_quantity: [null, [Validators.required, Validators.min(0)]],
      notes: [''],
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadRecord(parseInt(id));
    }
  }

  loadRecord(id: number): void {
    this.isLoading.set(true);

    this.preInventoryService.getPreInventoryById(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.record.set(response.data);
          // Pre-fill form if already counted
          if (response.data.counted_quantity !== null && response.data.counted_quantity !== undefined) {
            this.countForm.patchValue({
              counted_quantity: response.data.counted_quantity,
              notes: response.data.notes || '',
            });
          }
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading record:', err);
        this.toastService.showError('Error al cargar registro de pre-inventario');
        this.isLoading.set(false);
        this.router.navigate(['/pre-inventory']);
      },
    });
  }

  onToggleCountForm(): void {
    this.showCountForm.set(!this.showCountForm());
  }

  onUpdateCount(): void {
    if (this.countForm.invalid) {
      this.toastService.showError('Por favor complete todos los campos requeridos');
      return;
    }

    const record = this.record();
    if (!record) return;

    this.isUpdating.set(true);

    this.preInventoryService
      .updatePhysicalCount(record.id, this.countForm.value)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.toastService.showSuccess('Conteo físico actualizado correctamente');
            this.loadRecord(record.id);
            this.showCountForm.set(false);
          }
          this.isUpdating.set(false);
        },
        error: (err) => {
          console.error('Error updating count:', err);
          this.toastService.showError(err.error?.message || 'Error al actualizar conteo físico');
          this.isUpdating.set(false);
        },
      });
  }

  onProcessAdjustment(): void {
    const record = this.record();
    if (!record) return;

    if (!confirm('¿Está seguro de que desea procesar este ajuste? Esta acción creará una transacción de inventario y actualizará el stock.')) {
      return;
    }

    this.isProcessing.set(true);

    this.preInventoryService.processAdjustment(record.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.showSuccess('Ajuste procesado correctamente');
          this.loadRecord(record.id);
        }
        this.isProcessing.set(false);
      },
      error: (err) => {
        console.error('Error processing adjustment:', err);
        this.toastService.showError(err.error?.message || 'Error al procesar ajuste');
        this.isProcessing.set(false);
      },
    });
  }

  onCancel(): void {
    const record = this.record();
    if (!record) return;

    if (!confirm('¿Está seguro de que desea cancelar este registro?')) {
      return;
    }

    this.preInventoryService.deletePreInventory(record.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.showSuccess('Registro cancelado correctamente');
          this.router.navigate(['/pre-inventory']);
        }
      },
      error: (err) => {
        console.error('Error cancelling record:', err);
        this.toastService.showError(err.error?.message || 'Error al cancelar registro');
      },
    });
  }

  getStatusColor(statusId: number): 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'dark' {
    return getPreInventoryStatusColor(statusId);
  }

  getStatusIcon(statusId: number): string {
    return getPreInventoryStatusIcon(statusId);
  }

  getDiscrepancyColor(discrepancy: number | undefined): 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'dark' {
    if (discrepancy === undefined || discrepancy === null) return 'secondary';
    return getDiscrepancyColor(discrepancy);
  }

  getDiscrepancyLabel(discrepancy: number | undefined): string {
    if (discrepancy === undefined || discrepancy === null) return '-';
    return getDiscrepancyLabel(discrepancy);
  }

  formatCurrency(amount: number | undefined): string {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  }

  formatNumber(value: number | undefined): string {
    if (value === undefined || value === null) return '-';
    return new Intl.NumberFormat('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  canUpdateCount(): boolean {
    const record = this.record();
    return record !== null && !record.adjusted && record.status_id !== 4;
  }

  canProcessAdjustment(): boolean {
    const record = this.record();
    return (
      record !== null &&
      !record.adjusted &&
      record.status_id === 2 &&
      record.discrepancy !== undefined &&
      record.discrepancy !== null &&
      record.discrepancy !== 0
    );
  }

  canCancel(): boolean {
    const record = this.record();
    return record !== null && !record.adjusted && record.status_id !== 4;
  }
}
