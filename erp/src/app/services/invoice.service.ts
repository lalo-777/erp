import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Invoice,
  InvoiceListItem,
  InvoiceStats,
  PaginatedInvoices,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  InvoiceFilters,
  InvoiceHistoryEntry,
} from '../models/invoice.model';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/invoices`;

  getAllInvoices(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Observable<PaginatedInvoices> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PaginatedInvoices>(this.apiUrl, { params });
  }

  getInvoiceById(id: number): Observable<{ success: boolean; data: Invoice }> {
    return this.http.get<{ success: boolean; data: Invoice }>(`${this.apiUrl}/${id}`);
  }

  getInvoiceStats(): Observable<{ success: boolean; data: InvoiceStats }> {
    return this.http.get<{ success: boolean; data: InvoiceStats }>(`${this.apiUrl}/stats`);
  }

  getInvoiceHistory(
    id: number,
    params: { page?: string; limit?: string; dateFrom?: string; dateTo?: string }
  ): Observable<any> {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page);
    if (params.limit) httpParams = httpParams.set('limit', params.limit);
    if (params.dateFrom) httpParams = httpParams.set('dateFrom', params.dateFrom);
    if (params.dateTo) httpParams = httpParams.set('dateTo', params.dateTo);

    return this.http.get(`${this.apiUrl}/${id}/history`, { params: httpParams });
  }

  createInvoice(data: CreateInvoiceRequest): Observable<{ success: boolean; data: Invoice }> {
    return this.http.post<{ success: boolean; data: Invoice }>(this.apiUrl, data);
  }

  updateInvoice(
    id: number,
    data: UpdateInvoiceRequest
  ): Observable<{ success: boolean; data: Invoice }> {
    return this.http.put<{ success: boolean; data: Invoice }>(`${this.apiUrl}/${id}`, data);
  }

  deleteInvoice(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }

  getInvoicesByCustomer(customerId: number): Observable<PaginatedInvoices> {
    const params = new HttpParams().set('customer_id', customerId.toString());
    return this.http.get<PaginatedInvoices>(this.apiUrl, { params });
  }
}
