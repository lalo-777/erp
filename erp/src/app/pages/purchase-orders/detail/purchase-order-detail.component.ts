import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PurchaseOrderService } from '../../../services/purchase-order.service';
import { ToastService } from '../../../services/toast.service';
import {
  PurchaseOrder,
  PurchaseOrderItem,
  getPurchaseOrderStatusLabel,
  getPurchaseOrderStatusColor,
  formatCurrency,
  canEditPurchaseOrder,
  canApprovePurchaseOrder,
  canReceiveMaterials,
  isItemFullyReceived,
} from '../../../models/purchase-order.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-purchase-order-detail',
  imports: [CommonModule, RouterLink, FormsModule, LoadingSpinnerComponent, BadgeComponent],
  templateUrl: './purchase-order-detail.component.html',
  styleUrl: './purchase-order-detail.component.scss',
})
export class PurchaseOrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private purchaseOrderService = inject(PurchaseOrderService);
  private toastService = inject(ToastService);

  // Signals
  purchaseOrder = signal<PurchaseOrder | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);
  purchaseOrderId = signal<number | null>(null);
  isUpdatingStatus = signal(false);
  isReceiving = signal(false);

  // Receiving quantities
  receivingQuantities = signal<Map<number, number>>(new Map());

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = parseInt(params['id']);
      if (id) {
        this.purchaseOrderId.set(id);
        this.loadPurchaseOrder(id);
      }
    });
  }

  loadPurchaseOrder(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.purchaseOrderService.getPurchaseOrderById(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.purchaseOrder.set(response.data);
          // Initialize receiving quantities
          this.initializeReceivingQuantities();
        } else {
          this.error.set('No se pudo cargar la orden de compra');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading purchase order:', err);
        this.error.set('Error al cargar la orden de compra');
        this.toastService.showError('Error al cargar la orden de compra');
        this.isLoading.set(false);
      },
    });
  }

  initializeReceivingQuantities(): void {
    const quantities = new Map<number, number>();
    this.purchaseOrder()?.items?.forEach((item) => {
      const remainingQty = item.quantity - item.received_quantity;
      quantities.set(item.id, remainingQty);
    });
    this.receivingQuantities.set(quantities);
  }

  goBack(): void {
    this.router.navigate(['/purchase-orders']);
  }

  getStatusLabel(): string {
    if (!this.purchaseOrder()) return 'Desconocido';
    return getPurchaseOrderStatusLabel(this.purchaseOrder()!.status_alias || '');
  }

  getStatusBadgeClass(): 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'dark' {
    if (!this.purchaseOrder()) return 'secondary';
    const color = getPurchaseOrderStatusColor(this.purchaseOrder()!.status_alias || '');
    if (color === 'success') return 'success';
    if (color === 'warning') return 'warning';
    if (color === 'info') return 'info';
    if (color === 'primary') return 'primary';
    if (color === 'danger') return 'danger';
    return 'secondary';
  }

  formatCurrency(amount: number): string {
    return formatCurrency(amount);
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  canEdit(): boolean {
    return canEditPurchaseOrder(this.purchaseOrder()?.po_status_id || 0);
  }

  canApprove(): boolean {
    return canApprovePurchaseOrder(this.purchaseOrder()?.po_status_id || 0);
  }

  canReceive(): boolean {
    return canReceiveMaterials(this.purchaseOrder()?.po_status_id || 0);
  }

  canCancel(): boolean {
    const statusId = this.purchaseOrder()?.po_status_id || 0;
    return statusId < 5; // Can cancel if not already received or cancelled
  }

  isItemFullyReceived(item: PurchaseOrderItem): boolean {
    return isItemFullyReceived(item);
  }

  getReceivingQuantity(itemId: number): number {
    return this.receivingQuantities().get(itemId) || 0;
  }

  setReceivingQuantity(itemId: number, quantity: number): void {
    const quantities = new Map(this.receivingQuantities());
    quantities.set(itemId, quantity);
    this.receivingQuantities.set(quantities);
  }

  getRemainingQuantity(item: PurchaseOrderItem): number {
    return item.quantity - item.received_quantity;
  }

  onEdit(): void {
    this.router.navigate(['/purchase-orders', this.purchaseOrderId(), 'edit']);
  }

  onApprove(): void {
    if (!this.purchaseOrderId()) return;

    if (confirm('¿Confirma que desea aprobar esta orden de compra?')) {
      this.isUpdatingStatus.set(true);
      this.purchaseOrderService.updatePurchaseOrderStatus(this.purchaseOrderId()!, 3).subscribe({
        next: (response) => {
          if (response.success) {
            this.toastService.showSuccess('Orden de compra aprobada exitosamente');
            this.loadPurchaseOrder(this.purchaseOrderId()!);
          }
          this.isUpdatingStatus.set(false);
        },
        error: (err) => {
          console.error('Error approving purchase order:', err);
          this.toastService.showError('Error al aprobar la orden de compra');
          this.isUpdatingStatus.set(false);
        },
      });
    }
  }

  onCancel(): void {
    if (!this.purchaseOrderId()) return;

    if (confirm('¿Confirma que desea cancelar esta orden de compra? Esta acción no se puede deshacer.')) {
      this.isUpdatingStatus.set(true);
      this.purchaseOrderService.updatePurchaseOrderStatus(this.purchaseOrderId()!, 6).subscribe({
        next: (response) => {
          if (response.success) {
            this.toastService.showSuccess('Orden de compra cancelada');
            this.loadPurchaseOrder(this.purchaseOrderId()!);
          }
          this.isUpdatingStatus.set(false);
        },
        error: (err) => {
          console.error('Error cancelling purchase order:', err);
          this.toastService.showError('Error al cancelar la orden de compra');
          this.isUpdatingStatus.set(false);
        },
      });
    }
  }

  onReceiveMaterials(): void {
    if (!this.purchaseOrderId()) return;

    // Validate that at least one item has receiving quantity > 0
    const items: Array<{ item_id: number; received_quantity: number }> = [];
    this.purchaseOrder()?.items?.forEach((item) => {
      const qty = this.getReceivingQuantity(item.id);
      if (qty > 0) {
        items.push({
          item_id: item.id,
          received_quantity: qty,
        });
      }
    });

    if (items.length === 0) {
      this.toastService.showWarning('Debe ingresar al menos una cantidad a recibir');
      return;
    }

    // Validate quantities don't exceed remaining
    let hasErrors = false;
    for (const item of items) {
      const poItem = this.purchaseOrder()?.items?.find((i) => i.id === item.item_id);
      if (poItem) {
        const remaining = this.getRemainingQuantity(poItem);
        if (item.received_quantity > remaining) {
          this.toastService.showError(
            `La cantidad a recibir de "${poItem.material_name}" excede la cantidad pendiente`
          );
          hasErrors = true;
          break;
        }
      }
    }

    if (hasErrors) return;

    if (confirm(`¿Confirma la recepción de ${items.length} material(es)?`)) {
      this.isReceiving.set(true);
      this.purchaseOrderService.receiveMaterials(this.purchaseOrderId()!, { items }).subscribe({
        next: (response) => {
          if (response.success) {
            this.toastService.showSuccess('Materiales recibidos exitosamente');
            this.loadPurchaseOrder(this.purchaseOrderId()!);
          }
          this.isReceiving.set(false);
        },
        error: (err) => {
          console.error('Error receiving materials:', err);
          this.toastService.showError('Error al recibir materiales');
          this.isReceiving.set(false);
        },
      });
    }
  }

  getReceivedPercentage(item: PurchaseOrderItem): number {
    return (item.received_quantity / item.quantity) * 100;
  }
}
