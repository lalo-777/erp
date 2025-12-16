import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  PreInventory,
  PreInventoryStatus,
  CreatePreInventoryRequest,
  UpdatePhysicalCountRequest,
  DiscrepancyReport,
  PreInventoryStats,
  PreInventoryFilters,
  DiscrepancyReportFilters,
  PaginatedPreInventory,
} from '../models/pre-inventory.model';

@Injectable({
  providedIn: 'root',
})
export class PreInventoryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/pre-inventory`;

  // CRUD operations
  createPreInventory(data: CreatePreInventoryRequest): Observable<{ success: boolean; message: string; data: PreInventory }> {
    return this.http.post<{ success: boolean; message: string; data: PreInventory }>(this.apiUrl, data);
  }

  getAllPreInventory(filters: PreInventoryFilters = {}): Observable<PaginatedPreInventory> {
    let params = new HttpParams();

    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.materialId) params = params.set('materialId', filters.materialId.toString());
    if (filters.locationId) params = params.set('locationId', filters.locationId.toString());
    if (filters.statusId) params = params.set('statusId', filters.statusId.toString());
    if (filters.adjusted !== undefined) params = params.set('adjusted', filters.adjusted.toString());
    if (filters.startDate) params = params.set('startDate', filters.startDate);
    if (filters.endDate) params = params.set('endDate', filters.endDate);

    return this.http.get<PaginatedPreInventory>(this.apiUrl, { params });
  }

  getPreInventoryById(id: number): Observable<{ success: boolean; data: PreInventory }> {
    return this.http.get<{ success: boolean; data: PreInventory }>(`${this.apiUrl}/${id}`);
  }

  deletePreInventory(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }

  // Physical count operations
  updatePhysicalCount(id: number, data: UpdatePhysicalCountRequest): Observable<{ success: boolean; message: string; data: any }> {
    return this.http.put<{ success: boolean; message: string; data: any }>(`${this.apiUrl}/${id}/count`, data);
  }

  processAdjustment(id: number): Observable<{ success: boolean; message: string; data: any }> {
    return this.http.post<{ success: boolean; message: string; data: any }>(`${this.apiUrl}/${id}/adjust`, {});
  }

  // Reports and statistics
  getDiscrepancyReport(filters: DiscrepancyReportFilters = {}): Observable<{ success: boolean; data: DiscrepancyReport }> {
    let params = new HttpParams();

    if (filters.locationId) params = params.set('locationId', filters.locationId.toString());
    if (filters.startDate) params = params.set('startDate', filters.startDate);
    if (filters.endDate) params = params.set('endDate', filters.endDate);
    if (filters.onlyDiscrepancies !== undefined) params = params.set('onlyDiscrepancies', filters.onlyDiscrepancies.toString());

    return this.http.get<{ success: boolean; data: DiscrepancyReport }>(`${this.apiUrl}/reports/discrepancy`, { params });
  }

  getPreInventoryStats(): Observable<{ success: boolean; data: PreInventoryStats }> {
    return this.http.get<{ success: boolean; data: PreInventoryStats }>(`${this.apiUrl}/reports/stats`);
  }
}
