import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MLAnalyticsService } from '../../../services/ml-analytics.service';
import {
  TurnoverPrediction,
  TurnoverOverview,
  DEPARTMENTS,
  SALARY_LEVELS,
} from '../../../models/ml-analytics.model';
import { ChartWrapperComponent } from '../../../shared/components/chart-wrapper/chart-wrapper.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-employee-turnover',
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
          <h1 class="h3 mb-1">Prediccion de Rotacion de Personal</h1>
          <p class="text-muted mb-0">Logistic Regression</p>
        </div>
      </div>

      <!-- Overview Stats -->
      @if (overview()) {
        <div class="row g-4 mb-4">
          <div class="col-md-3">
            <div class="card border-0 shadow-sm">
              <div class="card-body text-center">
                <h6 class="text-muted small mb-1">Total Empleados</h6>
                <h3 class="mb-0">{{ overview()!.overview.total_employees }}</h3>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card border-0 shadow-sm border-start border-danger border-3">
              <div class="card-body text-center">
                <h6 class="text-muted small mb-1">Alto Riesgo</h6>
                <h3 class="mb-0 text-danger">{{ overview()!.overview.high_risk }}</h3>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card border-0 shadow-sm border-start border-warning border-3">
              <div class="card-body text-center">
                <h6 class="text-muted small mb-1">Riesgo Medio</h6>
                <h3 class="mb-0 text-warning">{{ overview()!.overview.medium_risk }}</h3>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card border-0 shadow-sm border-start border-success border-3">
              <div class="card-body text-center">
                <h6 class="text-muted small mb-1">Bajo Riesgo</h6>
                <h3 class="mb-0 text-success">{{ overview()!.overview.low_risk }}</h3>
              </div>
            </div>
          </div>
        </div>
      }

      <div class="row g-4">
        <!-- Form -->
        <div class="col-lg-5">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-transparent border-0">
              <h6 class="mb-0">
                <span class="material-icons me-2 text-purple" style="font-size: 20px;">person</span>
                Datos del Empleado
              </h6>
            </div>
            <div class="card-body">
              <form [formGroup]="form" (ngSubmit)="predict()">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Departamento</label>
                    <select class="form-select" formControlName="department">
                      @for (dept of departments; track dept.id) {
                        <option [value]="dept.id">{{ dept.name }}</option>
                      }
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Nivel Salarial</label>
                    <select class="form-select" formControlName="salary_level">
                      @for (level of salaryLevels; track level.id) {
                        <option [value]="level.id">{{ level.name }}</option>
                      }
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Antiguedad (meses)</label>
                    <input type="number" class="form-control" formControlName="tenure_months" min="1" max="360" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Edad</label>
                    <input type="number" class="form-control" formControlName="age" min="18" max="70" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Desempeno (1-10)</label>
                    <input type="number" class="form-control" formControlName="performance_score" min="1" max="10" step="0.1" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Satisfaccion (1-10)</label>
                    <input type="number" class="form-control" formControlName="satisfaction_score" min="1" max="10" step="0.1" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Horas Extra/Mes</label>
                    <input type="number" class="form-control" formControlName="overtime_hours_monthly" min="0" max="100" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Distancia Casa (km)</label>
                    <input type="number" class="form-control" formControlName="distance_from_home_km" min="0" max="200" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Num. Promociones</label>
                    <input type="number" class="form-control" formControlName="num_promotions" min="0" max="10" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Capacitacion (hrs/ano)</label>
                    <input type="number" class="form-control" formControlName="training_hours_yearly" min="0" max="200" />
                  </div>
                  <div class="col-12">
                    <label class="form-label">Proyectos Asignados</label>
                    <input type="number" class="form-control" formControlName="num_projects_assigned" min="1" max="20" />
                  </div>
                </div>

                <div class="d-grid mt-4">
                  <button type="submit" class="btn btn-purple btn-lg" [disabled]="isLoading() || form.invalid"
                    style="background-color: #9C27B0; border-color: #9C27B0; color: white;">
                    @if (isLoading()) {
                      <span class="spinner-border spinner-border-sm me-2"></span>
                    } @else {
                      <span class="material-icons me-2" style="font-size: 20px;">person_search</span>
                    }
                    Evaluar Riesgo
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Results -->
        <div class="col-lg-7">
          @if (prediction()) {
            <!-- Risk Result -->
            <div class="card border-0 shadow-sm mb-4"
              [class.border-danger]="prediction()!.prediction.risk_level === 'high'"
              [class.border-warning]="prediction()!.prediction.risk_level === 'medium'"
              [class.border-success]="prediction()!.prediction.risk_level === 'low'"
              style="border-width: 3px !important; border-style: solid !important;">
              <div class="card-body text-center py-4">
                <h6 class="text-muted mb-2">Probabilidad de Rotacion</h6>
                <h2 class="display-4 mb-2" [style.color]="prediction()!.prediction.risk_color">
                  {{ (prediction()!.prediction.turnover_probability * 100).toFixed(1) }}%
                </h2>
                <span class="badge fs-6 px-3 py-2" [style.background-color]="prediction()!.prediction.risk_color">
                  Riesgo {{ getRiskLabel(prediction()!.prediction.risk_level) }}
                </span>
                <p class="text-muted mt-3 mb-0">{{ prediction()!.prediction.recommendation }}</p>
              </div>
            </div>

            <!-- Risk Factors -->
            @if (prediction()!.risk_factors.length > 0) {
              <div class="card border-0 shadow-sm mb-4">
                <div class="card-header bg-transparent border-0">
                  <h6 class="mb-0">Factores de Riesgo</h6>
                </div>
                <div class="card-body">
                  @for (factor of prediction()!.risk_factors; track factor.factor) {
                    <div class="d-flex align-items-center mb-3">
                      <span class="material-icons me-2"
                        [class.text-danger]="factor.impact === 'high'"
                        [class.text-warning]="factor.impact === 'medium'"
                        [class.text-success]="factor.impact === 'low'">
                        {{ factor.impact === 'high' ? 'warning' : (factor.impact === 'medium' ? 'info' : 'check_circle') }}
                      </span>
                      <div class="flex-grow-1">
                        <div class="fw-medium">{{ getFactorLabel(factor.factor) }}</div>
                        <small class="text-muted">Valor: {{ factor.value }}</small>
                      </div>
                      <span class="badge" [class.bg-danger]="factor.impact === 'high'"
                        [class.bg-warning]="factor.impact === 'medium'"
                        [class.bg-success]="factor.impact === 'low'">
                        {{ factor.impact }}
                      </span>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Model Metrics -->
            <div class="row g-3 mb-4">
              <div class="col-md-4">
                <div class="card border-0 bg-light">
                  <div class="card-body text-center py-2">
                    <small class="text-muted">Accuracy</small>
                    <h5 class="mb-0">{{ (prediction()!.model_info.accuracy * 100).toFixed(1) }}%</h5>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card border-0 bg-light">
                  <div class="card-body text-center py-2">
                    <small class="text-muted">F1 Score</small>
                    <h5 class="mb-0">{{ prediction()!.model_info.f1_score.toFixed(3) }}</h5>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card border-0 bg-light">
                  <div class="card-body text-center py-2">
                    <small class="text-muted">AUC-ROC</small>
                    <h5 class="mb-0">{{ prediction()!.model_info.auc_roc.toFixed(3) }}</h5>
                  </div>
                </div>
              </div>
            </div>

            <!-- Chart -->
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-transparent border-0">
                <h6 class="mb-0">Contribucion de Factores</h6>
              </div>
              <div class="card-body">
                <app-chart-wrapper
                  [chartConfig]="prediction()!.chart_data.factor_contribution"
                  height="250px"
                ></app-chart-wrapper>
              </div>
            </div>
          } @else {
            <!-- Overview Charts when no prediction -->
            @if (overview()) {
              <div class="row g-4">
                <div class="col-12">
                  <div class="card border-0 shadow-sm">
                    <div class="card-header bg-transparent border-0">
                      <h6 class="mb-0">Distribucion de Riesgo</h6>
                    </div>
                    <div class="card-body">
                      <app-chart-wrapper
                        [chartConfig]="overview()!.chart_data.risk_distribution"
                        height="300px"
                      ></app-chart-wrapper>
                    </div>
                  </div>
                </div>
              </div>
            } @else {
              <div class="card border-0 shadow-sm h-100">
                <div class="card-body d-flex flex-column align-items-center justify-content-center text-center py-5">
                  <span class="material-icons text-muted mb-3" style="font-size: 64px;">person_off</span>
                  <h5 class="text-muted">Ingresa los datos del empleado</h5>
                  <p class="text-muted">
                    El modelo de Regresion Logistica evaluara el riesgo de rotacion.
                  </p>
                </div>
              </div>
            }
          }
        </div>
      </div>
    </div>
  `,
})
export class EmployeeTurnoverComponent implements OnInit {
  private fb = inject(FormBuilder);
  private mlService = inject(MLAnalyticsService);

  form!: FormGroup;
  isLoading = signal(false);
  prediction = signal<TurnoverPrediction | null>(null);
  overview = signal<TurnoverOverview | null>(null);

  departments = DEPARTMENTS;
  salaryLevels = SALARY_LEVELS;

  ngOnInit(): void {
    this.form = this.fb.group({
      tenure_months: [24, [Validators.required, Validators.min(1)]],
      age: [30, [Validators.required, Validators.min(18), Validators.max(70)]],
      salary_level: [2, Validators.required],
      department: [1, Validators.required],
      performance_score: [7, [Validators.required, Validators.min(1), Validators.max(10)]],
      overtime_hours_monthly: [10, [Validators.required, Validators.min(0)]],
      distance_from_home_km: [15, [Validators.required, Validators.min(0)]],
      num_promotions: [0, [Validators.required, Validators.min(0)]],
      training_hours_yearly: [40, [Validators.required, Validators.min(0)]],
      satisfaction_score: [7, [Validators.required, Validators.min(1), Validators.max(10)]],
      num_projects_assigned: [3, [Validators.required, Validators.min(1)]],
    });

    this.loadOverview();
  }

  loadOverview(): void {
    this.mlService.getTurnoverOverview().subscribe({
      next: (response) => {
        this.overview.set(response);
      },
      error: (err) => {
        console.error('Overview failed:', err);
      },
    });
  }

  predict(): void {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    const data = this.form.value;

    this.mlService.predictEmployeeTurnover(data).subscribe({
      next: (response) => {
        this.prediction.set(response);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Prediction failed:', err);
        this.isLoading.set(false);
      },
    });
  }

  getRiskLabel(level: string): string {
    const labels: Record<string, string> = {
      low: 'Bajo',
      medium: 'Medio',
      high: 'Alto',
    };
    return labels[level] || level;
  }

  getFactorLabel(factor: string): string {
    const labels: Record<string, string> = {
      tenure_months: 'Antiguedad',
      age: 'Edad',
      salary_level: 'Nivel Salarial',
      department: 'Departamento',
      performance_score: 'Desempeno',
      overtime_hours_monthly: 'Horas Extra',
      distance_from_home_km: 'Distancia al Trabajo',
      num_promotions: 'Promociones',
      training_hours_yearly: 'Capacitacion',
      satisfaction_score: 'Satisfaccion',
      num_projects_assigned: 'Proyectos Asignados',
    };
    return labels[factor] || factor;
  }
}
