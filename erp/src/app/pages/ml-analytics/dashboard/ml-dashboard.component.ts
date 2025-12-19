import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MLAnalyticsService } from '../../../services/ml-analytics.service';
import { MLDashboard, MLModelStatus, MLHealthResponse } from '../../../models/ml-analytics.model';
import { ChartWrapperComponent } from '../../../shared/components/chart-wrapper/chart-wrapper.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-ml-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ChartWrapperComponent, LoadingSpinnerComponent],
  template: `
    <div class="container-fluid py-4">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h3 mb-1">ML Analytics</h1>
          <p class="text-muted mb-0">Panel de control de modelos de Machine Learning</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary" (click)="refreshData()">
            <span class="material-icons me-1" style="font-size: 18px;">refresh</span>
            Actualizar
          </button>
        </div>
      </div>

      @if (isLoading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else {
        <!-- Service Status -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card border-0 shadow-sm">
              <div class="card-body">
                <div class="d-flex align-items-center">
                  <div
                    class="rounded-circle d-flex align-items-center justify-content-center me-3"
                    [class.bg-success]="health()?.status === 'operational'"
                    [class.bg-danger]="health()?.status !== 'operational'"
                    style="width: 48px; height: 48px;"
                  >
                    <span class="material-icons text-white">
                      {{ health()?.status === 'operational' ? 'check_circle' : 'error' }}
                    </span>
                  </div>
                  <div>
                    <h6 class="mb-0">{{ health()?.service || 'Django ML Server' }}</h6>
                    <small class="text-muted">
                      Version {{ health()?.version || '1.0.0' }} -
                      {{ health()?.status === 'operational' ? 'Operacional' : 'No disponible' }}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Models Grid -->
        <div class="row g-4 mb-4">
          @for (model of dashboard()?.models_status || []; track model.name) {
            <div class="col-md-6 col-lg-4">
              <div class="card border-0 shadow-sm h-100 model-card" [routerLink]="getModelRoute(model.name)">
                <div class="card-body">
                  <div class="d-flex align-items-start justify-content-between mb-3">
                    <div
                      class="rounded d-flex align-items-center justify-content-center"
                      [style.background-color]="getModelColor(model.name) + '20'"
                      style="width: 48px; height: 48px;"
                    >
                      <span
                        class="material-icons"
                        [style.color]="getModelColor(model.name)"
                      >
                        {{ getModelIcon(model.name) }}
                      </span>
                    </div>
                    <span
                      class="badge"
                      [class.bg-success]="model.status === 'active'"
                      [class.bg-secondary]="model.status !== 'active'"
                    >
                      {{ model.status === 'active' ? 'Activo' : 'Inactivo' }}
                    </span>
                  </div>
                  <h6 class="mb-1">{{ model.name }}</h6>
                  <p class="text-muted small mb-2">{{ model.model }}</p>
                  <div class="d-flex align-items-center">
                    <span class="material-icons text-success me-1" style="font-size: 16px;">
                      analytics
                    </span>
                    <small class="text-muted">{{ model.accuracy }}</small>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Charts Section -->
        <div class="row g-4">
          <div class="col-lg-8">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-transparent border-0">
                <h6 class="mb-0">Comparacion de Modelos</h6>
              </div>
              <div class="card-body">
                @if (dashboard()?.chart_data?.model_accuracy) {
                  <app-chart-wrapper
                    [chartConfig]="dashboard()?.chart_data?.model_accuracy"
                    height="350px"
                  ></app-chart-wrapper>
                }
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-header bg-transparent border-0">
                <h6 class="mb-0">Accesos Rapidos</h6>
              </div>
              <div class="card-body">
                <div class="d-grid gap-2">
                  <a routerLink="/ml-analytics/project-cost" class="btn btn-outline-primary text-start">
                    <span class="material-icons me-2" style="font-size: 20px;">attach_money</span>
                    Prediccion de Costos
                  </a>
                  <a routerLink="/ml-analytics/project-duration" class="btn btn-outline-info text-start">
                    <span class="material-icons me-2" style="font-size: 20px;">schedule</span>
                    Prediccion de Duracion
                  </a>
                  <a routerLink="/ml-analytics/customer-segments" class="btn btn-outline-warning text-start">
                    <span class="material-icons me-2" style="font-size: 20px;">pie_chart</span>
                    Segmentacion de Clientes
                  </a>
                  <a routerLink="/ml-analytics/employee-turnover" class="btn btn-outline-danger text-start">
                    <span class="material-icons me-2" style="font-size: 20px;">person_off</span>
                    Rotacion de Personal
                  </a>
                  <a routerLink="/ml-analytics/inventory-forecast" class="btn btn-outline-success text-start">
                    <span class="material-icons me-2" style="font-size: 20px;">trending_up</span>
                    Forecast de Inventario
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .model-card {
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .model-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
      }
    `,
  ],
})
export class MLDashboardComponent implements OnInit {
  private mlService = inject(MLAnalyticsService);

  isLoading = signal(true);
  dashboard = signal<MLDashboard | null>(null);
  health = signal<MLHealthResponse | null>(null);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);

    this.mlService.getHealth().subscribe({
      next: (response) => {
        this.health.set(response);
      },
      error: (err) => {
        console.error('Health check failed:', err);
        this.health.set(null);
      },
    });

    this.mlService.getDashboard().subscribe({
      next: (response) => {
        this.dashboard.set(response);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Dashboard load failed:', err);
        this.isLoading.set(false);
      },
    });
  }

  refreshData(): void {
    this.loadData();
  }

  getModelIcon(name: string): string {
    const icons: Record<string, string> = {
      'Prediccion de Costos': 'attach_money',
      'Prediccion de Duracion': 'schedule',
      'Segmentacion Clientes': 'pie_chart',
      'Rotacion Personal': 'person_off',
      'Forecast Inventario': 'trending_up',
    };
    return icons[name] || 'psychology';
  }

  getModelColor(name: string): string {
    const colors: Record<string, string> = {
      'Prediccion de Costos': '#4CAF50',
      'Prediccion de Duracion': '#2196F3',
      'Segmentacion Clientes': '#FF9800',
      'Rotacion Personal': '#9C27B0',
      'Forecast Inventario': '#00BCD4',
    };
    return colors[name] || '#607D8B';
  }

  getModelRoute(name: string): string {
    const routes: Record<string, string> = {
      'Prediccion de Costos': '/ml-analytics/project-cost',
      'Prediccion de Duracion': '/ml-analytics/project-duration',
      'Segmentacion Clientes': '/ml-analytics/customer-segments',
      'Rotacion Personal': '/ml-analytics/employee-turnover',
      'Forecast Inventario': '/ml-analytics/inventory-forecast',
    };
    return routes[name] || '/ml-analytics';
  }
}
