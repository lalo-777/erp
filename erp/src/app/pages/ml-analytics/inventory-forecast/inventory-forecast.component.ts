import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MLAnalyticsService } from '../../../services/ml-analytics.service';
import {
  InventoryForecast,
  InventoryOverview,
  MATERIALS,
} from '../../../models/ml-analytics.model';
import { ChartWrapperComponent } from '../../../shared/components/chart-wrapper/chart-wrapper.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-inventory-forecast',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ChartWrapperComponent,
    LoadingSpinnerComponent,
  ],
  template: `
    <div class="container-fluid py-4">
      <!-- Header -->
      <div class="d-flex align-items-center mb-4">
        <a routerLink="/ml-analytics" class="btn btn-link text-muted p-0 me-3">
          <span class="material-icons">arrow_back</span>
        </a>
        <div>
          <h1 class="h3 mb-1">Forecast de Inventario</h1>
          <p class="text-muted mb-0">ARIMA Time Series</p>
        </div>
      </div>

      <!-- Alerts -->
      @if (overview()?.alerts?.length) {
        <div class="row g-3 mb-4">
          @for (alert of overview()!.alerts; track alert.material_id) {
            <div class="col-md-6 col-lg-4">
              <div class="alert mb-0"
                [class.alert-danger]="alert.alert_type === 'stockout_imminent'"
                [class.alert-warning]="alert.alert_type === 'low_stock'">
                <div class="d-flex align-items-start">
                  <span class="material-icons me-2">
                    {{ alert.alert_type === 'stockout_imminent' ? 'error' : 'warning' }}
                  </span>
                  <div>
                    <strong>{{ alert.material_name }}</strong>
                    <p class="mb-0 small">{{ alert.recommended_action }}</p>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <div class="row g-4">
        <!-- Form -->
        <div class="col-lg-4">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-transparent border-0">
              <h6 class="mb-0">
                <span class="material-icons me-2 text-cyan" style="font-size: 20px;">inventory_2</span>
                Parametros de Forecast
              </h6>
            </div>
            <div class="card-body">
              <form [formGroup]="form" (ngSubmit)="forecast()">
                <div class="mb-3">
                  <label class="form-label">Material</label>
                  <select class="form-select" formControlName="material_id" (change)="onMaterialChange()">
                    @for (material of materials; track material.id) {
                      <option [value]="material.id">{{ material.name }}</option>
                    }
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label">Dias a Pronosticar</label>
                  <input type="number" class="form-control" formControlName="forecast_days" min="7" max="90" />
                </div>
                <div class="mb-3">
                  <label class="form-label">Stock Actual</label>
                  <input type="number" class="form-control" formControlName="current_stock" min="0" />
                </div>
                <div class="mb-3">
                  <label class="form-label">Punto de Reorden</label>
                  <input type="number" class="form-control" formControlName="reorder_point" min="0" />
                </div>
                <div class="mb-3">
                  <label class="form-label">Tiempo de Entrega (dias)</label>
                  <input type="number" class="form-control" formControlName="lead_time_days" min="1" max="30" />
                </div>

                <div class="d-grid">
                  <button type="submit" class="btn btn-cyan btn-lg" [disabled]="isLoading() || form.invalid"
                    style="background-color: #00BCD4; border-color: #00BCD4; color: white;">
                    @if (isLoading()) {
                      <span class="spinner-border spinner-border-sm me-2"></span>
                    } @else {
                      <span class="material-icons me-2" style="font-size: 20px;">trending_up</span>
                    }
                    Generar Forecast
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Materials Overview -->
          @if (overview()?.materials) {
            <div class="card border-0 shadow-sm mt-4">
              <div class="card-header bg-transparent border-0">
                <h6 class="mb-0">Estado de Materiales</h6>
              </div>
              <div class="card-body p-0">
                <div class="list-group list-group-flush">
                  @for (mat of overview()!.materials; track mat.material_id) {
                    <div class="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <div class="fw-medium">{{ mat.name }}</div>
                        <small class="text-muted">Stock: {{ mat.current_stock | number:'1.0-0' }}</small>
                      </div>
                      <span class="badge"
                        [class.bg-danger]="mat.stock_days < 5"
                        [class.bg-warning]="mat.stock_days >= 5 && mat.stock_days < 15"
                        [class.bg-success]="mat.stock_days >= 15">
                        {{ mat.stock_days | number:'1.0-0' }} dias
                      </span>
                    </div>
                  }
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Results -->
        <div class="col-lg-8">
          @if (forecast_result()) {
            <!-- Forecast Summary -->
            <div class="row g-3 mb-4">
              <div class="col-md-3">
                <div class="card border-0 shadow-sm h-100">
                  <div class="card-body text-center py-3">
                    <small class="text-muted">Demanda Total</small>
                    <h4 class="mb-0">{{ forecast_result()!.forecast.predicted_demand_total | number:'1.0-0' }}</h4>
                    <small class="text-muted">{{ forecast_result()!.material.unit }}</small>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card border-0 shadow-sm h-100"
                  [class.border-danger]="forecast_result()!.forecast.days_until_stockout && forecast_result()!.forecast.days_until_stockout! < 10"
                  style="border-width: 2px !important;">
                  <div class="card-body text-center py-3">
                    <small class="text-muted">Dias hasta Agotamiento</small>
                    <h4 class="mb-0" [class.text-danger]="forecast_result()!.forecast.days_until_stockout && forecast_result()!.forecast.days_until_stockout! < 10">
                      {{ forecast_result()!.forecast.days_until_stockout || 'N/A' }}
                    </h4>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card border-0 shadow-sm h-100">
                  <div class="card-body text-center py-3">
                    <small class="text-muted">Ordenar</small>
                    <h4 class="mb-0 text-success">{{ forecast_result()!.forecast.recommended_order_quantity | number:'1.0-0' }}</h4>
                    <small class="text-muted">{{ forecast_result()!.material.unit }}</small>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card border-0 shadow-sm h-100">
                  <div class="card-body text-center py-3">
                    <small class="text-muted">Stock Seguridad</small>
                    <h4 class="mb-0">{{ forecast_result()!.forecast.safety_stock | number:'1.0-0' }}</h4>
                    <small class="text-muted">{{ forecast_result()!.material.unit }}</small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recommendation Alert -->
            @if (forecast_result()!.forecast.recommended_order_date) {
              <div class="alert alert-info d-flex align-items-center mb-4">
                <span class="material-icons me-2">info</span>
                <div>
                  <strong>Recomendacion:</strong> Realizar orden de
                  {{ forecast_result()!.forecast.recommended_order_quantity | number:'1.0-0' }}
                  {{ forecast_result()!.material.unit }} antes del
                  {{ forecast_result()!.forecast.recommended_order_date }}
                </div>
              </div>
            }

            <!-- Charts -->
            <div class="row g-4">
              <div class="col-12">
                <div class="card border-0 shadow-sm">
                  <div class="card-header bg-transparent border-0">
                    <h6 class="mb-0">Pronostico de Demanda</h6>
                  </div>
                  <div class="card-body">
                    <app-chart-wrapper
                      [chartConfig]="forecast_result()!.chart_data.demand_forecast"
                      height="300px"
                    ></app-chart-wrapper>
                  </div>
                </div>
              </div>
              <div class="col-lg-6">
                <div class="card border-0 shadow-sm h-100">
                  <div class="card-header bg-transparent border-0">
                    <h6 class="mb-0">Proyeccion de Stock</h6>
                  </div>
                  <div class="card-body">
                    <app-chart-wrapper
                      [chartConfig]="forecast_result()!.chart_data.stock_projection"
                      height="250px"
                    ></app-chart-wrapper>
                  </div>
                </div>
              </div>
              <div class="col-lg-6">
                <div class="card border-0 shadow-sm h-100">
                  <div class="card-header bg-transparent border-0">
                    <h6 class="mb-0">Patron Estacional</h6>
                  </div>
                  <div class="card-body">
                    <app-chart-wrapper
                      [chartConfig]="forecast_result()!.chart_data.seasonality_pattern"
                      height="250px"
                    ></app-chart-wrapper>
                  </div>
                </div>
              </div>
            </div>

            <!-- Model Info -->
            <div class="row g-3 mt-2">
              <div class="col-md-4">
                <div class="card border-0 bg-light">
                  <div class="card-body text-center py-2">
                    <small class="text-muted">Modelo</small>
                    <div class="fw-medium">{{ forecast_result()!.model_info.name }}</div>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card border-0 bg-light">
                  <div class="card-body text-center py-2">
                    <small class="text-muted">MAPE</small>
                    <div class="fw-medium">{{ forecast_result()!.model_info.mape }}%</div>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card border-0 bg-light">
                  <div class="card-body text-center py-2">
                    <small class="text-muted">MAE</small>
                    <div class="fw-medium">{{ forecast_result()!.model_info.mae | number:'1.1-1' }}</div>
                  </div>
                </div>
              </div>
            </div>
          } @else {
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body d-flex flex-column align-items-center justify-content-center text-center py-5">
                <span class="material-icons text-muted mb-3" style="font-size: 64px;">trending_up</span>
                <h5 class="text-muted">Selecciona un material y genera el forecast</h5>
                <p class="text-muted">
                  El modelo ARIMA analizara patrones historicos para predecir la demanda futura.
                </p>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class InventoryForecastComponent implements OnInit {
  private fb = inject(FormBuilder);
  private mlService = inject(MLAnalyticsService);

  form!: FormGroup;
  isLoading = signal(false);
  forecast_result = signal<InventoryForecast | null>(null);
  overview = signal<InventoryOverview | null>(null);

  materials = MATERIALS;

  ngOnInit(): void {
    const defaultMaterial = this.materials[0];

    this.form = this.fb.group({
      material_id: [defaultMaterial.id, Validators.required],
      forecast_days: [30, [Validators.required, Validators.min(7), Validators.max(90)]],
      current_stock: [450, [Validators.required, Validators.min(0)]],
      reorder_point: [defaultMaterial.reorder_point, [Validators.required, Validators.min(0)]],
      lead_time_days: [defaultMaterial.lead_time_days, [Validators.required, Validators.min(1)]],
    });

    this.loadOverview();
  }

  loadOverview(): void {
    this.mlService.getInventoryOverview().subscribe({
      next: (response) => {
        this.overview.set(response);
      },
      error: (err) => {
        console.error('Overview failed:', err);
      },
    });
  }

  onMaterialChange(): void {
    const materialId = this.form.get('material_id')?.value;
    const material = this.materials.find((m) => m.id === +materialId);
    if (material) {
      this.form.patchValue({
        reorder_point: material.reorder_point,
        lead_time_days: material.lead_time_days,
      });
    }
  }

  forecast(): void {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    const data = this.form.value;

    this.mlService.getInventoryForecast(data).subscribe({
      next: (response) => {
        this.forecast_result.set(response);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Forecast failed:', err);
        this.isLoading.set(false);
      },
    });
  }
}
