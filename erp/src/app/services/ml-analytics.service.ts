import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  MLHealthResponse,
  MLDashboard,
  ProjectCostInput,
  ProjectCostPrediction,
  ProjectDurationInput,
  ProjectDurationPrediction,
  CustomerSegmentsAnalysis,
  EmployeeTurnoverInput,
  TurnoverPrediction,
  TurnoverOverview,
  InventoryForecastInput,
  InventoryForecast,
  InventoryOverview,
} from '../models/ml-analytics.model';

@Injectable({
  providedIn: 'root',
})
export class MLAnalyticsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8000/api/ml';

  // Health Check
  getHealth(): Observable<MLHealthResponse> {
    return this.http.get<MLHealthResponse>(`${this.apiUrl}/health/`);
  }

  // Dashboard
  getDashboard(): Observable<MLDashboard> {
    return this.http.get<MLDashboard>(`${this.apiUrl}/dashboard/`);
  }

  // Project Cost Prediction (Random Forest)
  predictProjectCost(data: ProjectCostInput): Observable<ProjectCostPrediction> {
    return this.http.post<ProjectCostPrediction>(
      `${this.apiUrl}/predict/project-cost/`,
      data
    );
  }

  // Project Duration Prediction (Gradient Boosting)
  predictProjectDuration(
    data: ProjectDurationInput
  ): Observable<ProjectDurationPrediction> {
    return this.http.post<ProjectDurationPrediction>(
      `${this.apiUrl}/predict/project-duration/`,
      data
    );
  }

  // Customer Segmentation (K-Means)
  getCustomerSegments(): Observable<CustomerSegmentsAnalysis> {
    return this.http.get<CustomerSegmentsAnalysis>(
      `${this.apiUrl}/analyze/customer-segments/`
    );
  }

  // Employee Turnover Prediction (Logistic Regression)
  predictEmployeeTurnover(
    data: EmployeeTurnoverInput
  ): Observable<TurnoverPrediction> {
    return this.http.post<TurnoverPrediction>(
      `${this.apiUrl}/predict/employee-turnover/`,
      data
    );
  }

  // Turnover Overview
  getTurnoverOverview(): Observable<TurnoverOverview> {
    return this.http.get<TurnoverOverview>(
      `${this.apiUrl}/analyze/turnover-overview/`
    );
  }

  // Inventory Forecast (ARIMA)
  getInventoryForecast(data: InventoryForecastInput): Observable<InventoryForecast> {
    return this.http.post<InventoryForecast>(
      `${this.apiUrl}/forecast/inventory/`,
      data
    );
  }

  // Inventory Overview
  getInventoryOverview(): Observable<InventoryOverview> {
    return this.http.get<InventoryOverview>(
      `${this.apiUrl}/analyze/inventory-overview/`
    );
  }

  // Dataset Management
  regenerateDatasets(): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/datasets/regenerate/`,
      {}
    );
  }

  // Retrain Models
  retrainModels(): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/datasets/retrain/`,
      {}
    );
  }
}
