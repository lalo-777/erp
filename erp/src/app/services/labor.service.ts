import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  LaborTimesheet,
  LaborStats,
  PaginatedTimesheets,
  CreateTimesheetRequest,
  UpdateTimesheetRequest,
  PayrollReportResponse,
} from '../models/labor.model';

@Injectable({
  providedIn: 'root',
})
export class LaborService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/labor`;

  getAllTimesheets(
    page: number = 1,
    limit: number = 10,
    search?: string,
    projectId?: number,
    paymentStatus?: string,
    startDate?: string,
    endDate?: string
  ): Observable<PaginatedTimesheets> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    if (projectId) {
      params = params.set('project_id', projectId.toString());
    }

    if (paymentStatus && paymentStatus !== 'all') {
      params = params.set('payment_status', paymentStatus);
    }

    if (startDate) {
      params = params.set('start_date', startDate);
    }

    if (endDate) {
      params = params.set('end_date', endDate);
    }

    return this.http.get<PaginatedTimesheets>(this.apiUrl, { params });
  }

  getTimesheetById(id: number): Observable<{ success: boolean; data: LaborTimesheet }> {
    return this.http.get<{ success: boolean; data: LaborTimesheet }>(`${this.apiUrl}/${id}`);
  }

  getLaborStats(): Observable<{ success: boolean; data: LaborStats }> {
    return this.http.get<{ success: boolean; data: LaborStats }>(`${this.apiUrl}/stats`);
  }

  getPayrollReport(
    startDate: string,
    endDate: string,
    paymentStatus?: string
  ): Observable<PayrollReportResponse> {
    let params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate);

    if (paymentStatus && paymentStatus !== 'all') {
      params = params.set('payment_status', paymentStatus);
    }

    return this.http.get<PayrollReportResponse>(`${this.apiUrl}/payroll-report`, { params });
  }

  createTimesheet(data: CreateTimesheetRequest): Observable<{ success: boolean; data: LaborTimesheet }> {
    return this.http.post<{ success: boolean; data: LaborTimesheet }>(this.apiUrl, data);
  }

  updateTimesheet(
    id: number,
    data: UpdateTimesheetRequest
  ): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`, data);
  }

  updatePaymentStatus(
    id: number,
    paymentStatus: 'pending' | 'approved' | 'paid'
  ): Observable<{ success: boolean; message: string }> {
    return this.http.patch<{ success: boolean; message: string }>(
      `${this.apiUrl}/${id}/payment-status`,
      { payment_status: paymentStatus }
    );
  }

  deleteTimesheet(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}
