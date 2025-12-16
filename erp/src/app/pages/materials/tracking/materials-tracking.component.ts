import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MaterialService } from '../../../services/material.service';
import { ToastService } from '../../../services/toast.service';
import { Material, getStockStatus, getStockStatusLabel, getStockStatusColor } from '../../../models/material.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-materials-tracking',
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, BadgeComponent],
  templateUrl: './materials-tracking.component.html',
  styleUrl: './materials-tracking.component.scss',
})
export class MaterialsTrackingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private materialService = inject(MaterialService);
  private toastService = inject(ToastService);

  // Signals
  material = signal<Material | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);
  materialId = signal<number | null>(null);

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = parseInt(params['id']);
      if (id) {
        this.materialId.set(id);
        this.loadMaterial(id);
      }
    });
  }

  loadMaterial(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.materialService.getMaterialById(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.material.set(response.data);
        } else {
          this.error.set('No se pudo cargar el material');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading material:', err);
        this.error.set('Error al cargar el material');
        this.toastService.showError('Error al cargar el material');
        this.isLoading.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/materials']);
  }

  getStockStatus(): string {
    if (!this.material()) return 'unknown';
    const m = this.material()!;
    return getStockStatus(m.current_stock, m.minimum_stock);
  }

  getStockStatusLabel(): string {
    return getStockStatusLabel(this.getStockStatus());
  }

  getStockStatusBadgeClass(): 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'dark' {
    const color = getStockStatusColor(this.getStockStatus());
    // Map to valid badge colors
    if (color === 'danger') return 'danger';
    if (color === 'warning') return 'warning';
    if (color === 'success') return 'success';
    return 'secondary';
  }

  getTotalValue(): number {
    if (!this.material()) return 0;
    const m = this.material()!;
    return m.current_stock * m.unit_cost;
  }

  getReorderQuantity(): number {
    if (!this.material()) return 0;
    const m = this.material()!;
    return Math.max(0, m.reorder_point - m.current_stock);
  }

  getStockPercentage(): number {
    if (!this.material()) return 0;
    const m = this.material()!;
    if (m.minimum_stock === 0) return 100;
    return Math.min(100, (m.current_stock / m.minimum_stock) * 100);
  }

  shouldShowReorderAlert(): boolean {
    return this.getStockStatus() === 'critical' || this.getStockStatus() === 'out_of_stock';
  }
}
