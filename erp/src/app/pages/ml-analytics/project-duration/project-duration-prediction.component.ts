import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MLAnalyticsService } from '../../../services/ml-analytics.service';
import {
  ProjectDurationPrediction,
  PROJECT_TYPES,
  SEASONS,
} from '../../../models/ml-analytics.model';
import { ChartWrapperComponent } from '../../../shared/components/chart-wrapper/chart-wrapper.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-project-duration-prediction',
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
          <h1 class="h3 mb-1">Prediccion de Duracion de Proyecto</h1>
          <p class="text-muted mb-0">Gradient Boosting Regressor</p>
        </div>
      </div>

      <div class="row g-4">
        <!-- Form -->
        <div class="col-lg-5">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-transparent border-0">
              <h6 class="mb-0">
                <span class="material-icons me-2 text-info" style="font-size: 20px;">tune</span>
                Parametros del Proyecto
              </h6>
            </div>
            <div class="card-body">
              <form [formGroup]="form" (ngSubmit)="predict()">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Tipo de Proyecto</label>
                    <select class="form-select" formControlName="project_type_id">
                      @for (type of projectTypes; track type.id) {
                        <option [value]="type.id">{{ type.name }}</option>
                      }
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Trimestre Inicio</label>
                    <select class="form-select" formControlName="season_start">
                      @for (season of seasons; track season.id) {
                        <option [value]="season.id">{{ season.name }}</option>
                      }
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Area (m²)</label>
                    <input type="number" class="form-control" formControlName="area_m2" min="50" max="50000" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Num. Pisos</label>
                    <input type="number" class="form-control" formControlName="num_floors" min="1" max="100" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Complejidad (1-10)</label>
                    <input type="number" class="form-control" formControlName="complexity_score" min="1" max="10" step="0.1" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Tamano Equipo</label>
                    <input type="number" class="form-control" formControlName="team_size" min="3" max="100" />
                  </div>
                  <div class="col-12">
                    <label class="form-label">Experiencia Gerente (anos)</label>
                    <input type="number" class="form-control" formControlName="manager_experience_years" min="0" max="40" step="0.5" />
                  </div>
                </div>

                <div class="d-grid mt-4">
                  <button type="submit" class="btn btn-info btn-lg" [disabled]="isLoading() || form.invalid">
                    @if (isLoading()) {
                      <span class="spinner-border spinner-border-sm me-2"></span>
                    } @else {
                      <span class="material-icons me-2" style="font-size: 20px;">schedule</span>
                    }
                    Predecir Duracion
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Results -->
        <div class="col-lg-7">
          @if (prediction()) {
            <!-- Prediction Result -->
            <div class="card border-0 shadow-sm mb-4">
              <div class="card-body text-center py-4">
                <h6 class="text-muted mb-2">Duracion Estimada</h6>
                <h2 class="display-5 text-info mb-2">
                  {{ prediction()!.prediction.predicted_days }} dias
                </h2>
                <p class="text-muted mb-0">
                  (~{{ prediction()!.prediction.predicted_months }} meses)
                </p>
                <p class="text-muted small mt-2">
                  Intervalo: {{ prediction()!.prediction.confidence_interval.lower_days }} -
                  {{ prediction()!.prediction.confidence_interval.upper_days }} dias
                </p>
                <div class="mt-3">
                  <span class="badge bg-info bg-opacity-10 text-info me-2">
                    Fecha estimada: {{ prediction()!.prediction.estimated_end_date }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Model Info -->
            <div class="row g-4 mb-4">
              <div class="col-md-4">
                <div class="card border-0 bg-light h-100">
                  <div class="card-body text-center">
                    <h6 class="text-muted small mb-1">R² Score</h6>
                    <h4 class="mb-0">{{ prediction()!.model_info.r2_score }}</h4>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card border-0 bg-light h-100">
                  <div class="card-body text-center">
                    <h6 class="text-muted small mb-1">MAE</h6>
                    <h4 class="mb-0">{{ prediction()!.model_info.mae_days }} dias</h4>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card border-0 bg-light h-100">
                  <div class="card-body text-center">
                    <h6 class="text-muted small mb-1">RMSE</h6>
                    <h4 class="mb-0">{{ prediction()!.model_info.rmse_days }} dias</h4>
                  </div>
                </div>
              </div>
            </div>

            <!-- Charts -->
            <div class="row g-4">
              <div class="col-12">
                <div class="card border-0 shadow-sm">
                  <div class="card-header bg-transparent border-0">
                    <h6 class="mb-0">Importancia de Variables</h6>
                  </div>
                  <div class="card-body">
                    <app-chart-wrapper
                      [chartConfig]="prediction()!.chart_data.feature_importance"
                      height="300px"
                    ></app-chart-wrapper>
                  </div>
                </div>
              </div>
            </div>
          } @else {
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body d-flex flex-column align-items-center justify-content-center text-center py-5">
                <span class="material-icons text-muted mb-3" style="font-size: 64px;">
                  schedule
                </span>
                <h5 class="text-muted">Ingresa los parametros del proyecto</h5>
                <p class="text-muted">
                  El modelo Gradient Boosting analizara las caracteristicas para predecir la duracion.
                </p>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class ProjectDurationPredictionComponent implements OnInit {
  private fb = inject(FormBuilder);
  private mlService = inject(MLAnalyticsService);

  form!: FormGroup;
  isLoading = signal(false);
  prediction = signal<ProjectDurationPrediction | null>(null);

  projectTypes = PROJECT_TYPES;
  seasons = SEASONS;

  ngOnInit(): void {
    this.form = this.fb.group({
      project_type_id: [2, Validators.required],
      area_m2: [2500, [Validators.required, Validators.min(50)]],
      num_floors: [3, [Validators.required, Validators.min(1)]],
      complexity_score: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
      team_size: [12, [Validators.required, Validators.min(3)]],
      manager_experience_years: [5, [Validators.required, Validators.min(0)]],
      season_start: [1, Validators.required],
    });
  }

  predict(): void {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    const data = this.form.value;

    this.mlService.predictProjectDuration(data).subscribe({
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
}
