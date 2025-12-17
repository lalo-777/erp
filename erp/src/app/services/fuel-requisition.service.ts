import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  FuelRequisition,
  FuelStats,
  PaginatedFuelRequisitions,
  CreateFuelRequisitionRequest,
  UpdateFuelRequisitionRequest,
  ConsumptionReportResponse,
} from '../models/fuel-requisition.model';

@Injectable({
  providedIn: 'root',
})
export class FuelRequisitionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/fuel-requisitions`;

  getAllRequisitions(
    page: number = 1,
    limit: number = 10,
    search?: string,
    projectId?: number,
    requisitionStatus?: string,
    fuelType?: string,
    startDate?: string,
    endDate?: string
  ): Observable<PaginatedFuelRequisitions> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    if (projectId) {
      params = params.set('project_id', projectId.toString());
    }

    if (requisitionStatus && requisitionStatus !== 'all') {
      params = params.set('requisition_status', requisitionStatus);
    }

    if (fuelType && fuelType !== 'all') {
      params = params.set('fuel_type', fuelType);
    }

    if (startDate) {
      params = params.set('start_date', startDate);
    }

    if (endDate) {
      params = params.set('end_date', endDate);
    }

    return this.http.get<PaginatedFuelRequisitions>(this.apiUrl, { params });
  }

  getRequisitionById(id: number): Observable<{ success: boolean; data: FuelRequisition }> {
    return this.http.get<{ success: boolean; data: FuelRequisition }>(`${this.apiUrl}/${id}`);
  }

  getFuelStats(): Observable<{ success: boolean; data: FuelStats }> {
    return this.http.get<{ success: boolean; data: FuelStats }>(`${this.apiUrl}/stats`);
  }

  getConsumptionReport(
    startDate: string,
    endDate: string,
    fuelType?: string,
    projectId?: number
  ): Observable<ConsumptionReportResponse> {
    let params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate);

    if (fuelType && fuelType !== 'all') {
      params = params.set('fuel_type', fuelType);
    }

    if (projectId) {
      params = params.set('project_id', projectId.toString());
    }

    return this.http.get<ConsumptionReportResponse>(`${this.apiUrl}/consumption-report`, { params });
  }

  createRequisition(data: CreateFuelRequisitionRequest): Observable<{ success: boolean; data: FuelRequisition }> {
    return this.http.post<{ success: boolean; data: FuelRequisition }>(this.apiUrl, data);
  }

  updateRequisition(
    id: number,
    data: UpdateFuelRequisitionRequest
  ): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`, data);
  }

  updateRequisitionStatus(
    id: number,
    requisitionStatus: 'pending' | 'approved' | 'delivered' | 'cancelled'
  ): Observable<{ success: boolean; message: string }> {
    return this.http.patch<{ success: boolean; message: string }>(
      `${this.apiUrl}/${id}/status`,
      { requisition_status: requisitionStatus }
    );
  }

  deleteRequisition(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}
