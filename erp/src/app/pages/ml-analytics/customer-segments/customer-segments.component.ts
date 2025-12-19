import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MLAnalyticsService } from '../../../services/ml-analytics.service';
import { CustomerSegmentsAnalysis, CustomerSegment } from '../../../models/ml-analytics.model';
import { ChartWrapperComponent } from '../../../shared/components/chart-wrapper/chart-wrapper.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-customer-segments',
  standalone: true,
  imports: [CommonModule, RouterModule, ChartWrapperComponent, LoadingSpinnerComponent],
  template: `
    <div class="container-fluid py-4">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div class="d-flex align-items-center">
          <a routerLink="/ml-analytics" class="btn btn-link text-muted p-0 me-3">
            <span class="material-icons">arrow_back</span>
          </a>
          <div>
            <h1 class="h3 mb-1">Segmentacion de Clientes</h1>
            <p class="text-muted mb-0">K-Means Clustering</p>
          </div>
        </div>
        <button class="btn btn-outline-warning" (click)="loadData()" [disabled]="isLoading()">
          <span class="material-icons me-1" style="font-size: 18px;">refresh</span>
          Actualizar Analisis
        </button>
      </div>

      @if (isLoading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else if (analysis()) {
        <!-- Stats -->
        <div class="row g-4 mb-4">
          <div class="col-md-4">
            <div class="card border-0 shadow-sm">
              <div class="card-body text-center">
                <h6 class="text-muted small mb-1">Total Clientes</h6>
                <h3 class="mb-0">{{ analysis()!.analysis.total_customers }}</h3>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card border-0 shadow-sm">
              <div class="card-body text-center">
                <h6 class="text-muted small mb-1">Clusters</h6>
                <h3 class="mb-0">{{ analysis()!.analysis.num_clusters }}</h3>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card border-0 shadow-sm">
              <div class="card-body text-center">
                <h6 class="text-muted small mb-1">Silhouette Score</h6>
                <h3 class="mb-0">{{ analysis()!.analysis.silhouette_score }}</h3>
              </div>
            </div>
          </div>
        </div>

        <!-- Segments Grid -->
        <div class="row g-4 mb-4">
          @for (segment of analysis()!.segments; track segment.segment_id) {
            <div class="col-md-6 col-lg-3">
              <div class="card border-0 shadow-sm h-100">
                <div class="card-body">
                  <div class="d-flex align-items-center mb-3">
                    <div
                      class="rounded-circle d-flex align-items-center justify-content-center me-3"
                      [style.background-color]="segment.color + '20'"
                      style="width: 48px; height: 48px;"
                    >
                      <span class="material-icons" [style.color]="segment.color">
                        {{ segment.icon || 'group' }}
                      </span>
                    </div>
                    <div>
                      <h6 class="mb-0">{{ segment.name }}</h6>
                      <small class="text-muted">{{ segment.percentage }}%</small>
                    </div>
                  </div>
                  <p class="small text-muted mb-3">{{ segment.description }}</p>
                  <div class="border-top pt-3">
                    <div class="row g-2 small">
                      <div class="col-6">
                        <span class="text-muted">Revenue Prom:</span>
                        <div class="fw-medium">{{ formatCurrency(segment.characteristics.avg_revenue) }}</div>
                      </div>
                      <div class="col-6">
                        <span class="text-muted">Proyectos:</span>
                        <div class="fw-medium">{{ segment.characteristics.avg_projects }}</div>
                      </div>
                      <div class="col-6">
                        <span class="text-muted">Antiguedad:</span>
                        <div class="fw-medium">{{ segment.characteristics.avg_tenure_months }} meses</div>
                      </div>
                      <div class="col-6">
                        <span class="text-muted">Satisfaccion:</span>
                        <div class="fw-medium">{{ segment.characteristics.avg_satisfaction }}/10</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Charts -->
        <div class="row g-4">
          <div class="col-lg-4">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-header bg-transparent border-0">
                <h6 class="mb-0">Distribucion de Segmentos</h6>
              </div>
              <div class="card-body">
                <app-chart-wrapper
                  [chartConfig]="analysis()!.chart_data.segment_distribution"
                  height="300px"
                ></app-chart-wrapper>
              </div>
            </div>
          </div>
          <div class="col-lg-4">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-header bg-transparent border-0">
                <h6 class="mb-0">Caracteristicas por Segmento</h6>
              </div>
              <div class="card-body">
                <app-chart-wrapper
                  [chartConfig]="analysis()!.chart_data.segment_radar"
                  height="300px"
                ></app-chart-wrapper>
              </div>
            </div>
          </div>
          <div class="col-lg-4">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-header bg-transparent border-0">
                <h6 class="mb-0">Clusters (Revenue vs Proyectos)</h6>
              </div>
              <div class="card-body">
                <app-chart-wrapper
                  [chartConfig]="analysis()!.chart_data.cluster_scatter"
                  height="300px"
                ></app-chart-wrapper>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center py-5">
            <span class="material-icons text-danger mb-3" style="font-size: 64px;">error_outline</span>
            <h5>Error al cargar el analisis</h5>
            <p class="text-muted">No se pudo conectar con el servidor ML.</p>
            <button class="btn btn-warning" (click)="loadData()">Reintentar</button>
          </div>
        </div>
      }
    </div>
  `,
})
export class CustomerSegmentsComponent implements OnInit {
  private mlService = inject(MLAnalyticsService);

  isLoading = signal(true);
  analysis = signal<CustomerSegmentsAnalysis | null>(null);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);

    this.mlService.getCustomerSegments().subscribe({
      next: (response) => {
        this.analysis.set(response);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Analysis failed:', err);
        this.analysis.set(null);
        this.isLoading.set(false);
      },
    });
  }

  formatCurrency(value: number): string {
    if (value >= 1000000) {
      return '$' + (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return '$' + (value / 1000).toFixed(0) + 'K';
    }
    return '$' + value.toFixed(0);
  }
}
