import { Component, signal, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InvoiceService } from '../../../services/invoice.service';
import { ToastService } from '../../../services/toast.service';
import { Invoice, InvoiceHistoryEntry } from '../../../models/invoice.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { NewInvoiceModalComponent } from '../../../components/new-invoice-modal/new-invoice-modal.component';

@Component({
  selector: 'app-invoices-tracking',
  imports: [
    CommonModule,
    RouterLink,
    LoadingSpinnerComponent,
    ErrorAlertComponent,
    BadgeComponent,
    ConfirmDialogComponent,
    NewInvoiceModalComponent,
  ],
  templateUrl: './invoices-tracking.component.html',
  styleUrl: './invoices-tracking.component.scss',
})
export class InvoicesTrackingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private invoiceService = inject(InvoiceService);
  private toastService = inject(ToastService);

  @ViewChild(NewInvoiceModalComponent) newInvoiceModal!: NewInvoiceModalComponent;
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  // Signals
  invoice = signal<Invoice | null>(null);
  invoiceId = signal<number | null>(null);
  history = signal<InvoiceHistoryEntry[]>([]);
  isLoading = signal(false);
  isLoadingHistory = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = Number(params['id']);
      if (id) {
        this.invoiceId.set(id);
        this.loadInvoice(id);
        this.loadHistory(id);
      }
    });
  }

  loadInvoice(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.invoiceService.getInvoiceById(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.invoice.set(response.data);
        } else {
          this.error.set('Factura no encontrada');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading invoice:', err);
        this.error.set('Error al cargar los datos de la factura');
        this.isLoading.set(false);
      },
    });
  }

  loadHistory(id: number): void {
    this.isLoadingHistory.set(true);

    this.invoiceService.getInvoiceHistory(id, {}).subscribe({
      next: (response) => {
        if (response.success) {
          this.history.set(response.data);
        }
        this.isLoadingHistory.set(false);
      },
      error: (err) => {
        console.error('Error loading history:', err);
        this.isLoadingHistory.set(false);
      },
    });
  }

  onEdit(): void {
    if (this.invoiceId()) {
      setTimeout(() => {
        this.newInvoiceModal.openModal();
      }, 0);
    }
  }

  onDelete(): void {
    const invoice = this.invoice();
    if (!invoice) return;

    this.confirmDialog.open(
      '¿Eliminar Factura?',
      `¿Está seguro que desea eliminar la factura "${invoice.invoice_number}"? Esta acción no se puede deshacer.`,
      () => {
        this.deleteInvoice();
      }
    );
  }

  deleteInvoice(): void {
    const id = this.invoiceId();
    if (!id) return;

    this.invoiceService.deleteInvoice(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.showSuccess('Factura eliminada exitosamente');
          this.router.navigate(['/invoices']);
        }
      },
      error: (err) => {
        console.error('Error deleting invoice:', err);
        this.toastService.showError('Error al eliminar la factura');
      },
    });
  }

  onInvoiceSaved(): void {
    this.toastService.showSuccess('Factura actualizada exitosamente');
    if (this.invoiceId()) {
      this.loadInvoice(this.invoiceId()!);
      this.loadHistory(this.invoiceId()!);
    }
  }

  getStatusBadgeVariant(
    status: string
  ): 'success' | 'danger' | 'primary' | 'warning' | 'info' | 'secondary' | 'dark' {
    const statusMap: {
      [key: string]: 'success' | 'danger' | 'primary' | 'warning' | 'info' | 'secondary' | 'dark';
    } = {
      paid: 'success',
      pending: 'warning',
      overdue: 'danger',
      cancelled: 'secondary',
    };
    return statusMap[status.toLowerCase()] || 'secondary';
  }

  getStatusBadgeText(status: string): string {
    const statusMap: { [key: string]: string } = {
      paid: 'Pagada',
      pending: 'Pendiente',
      overdue: 'Vencida',
      cancelled: 'Cancelada',
    };
    return statusMap[status.toLowerCase()] || status;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
  }
}
