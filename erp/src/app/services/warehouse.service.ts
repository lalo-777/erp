import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  WarehouseLocation,
  InventoryTransaction,
  WarehouseReorganization,
  StockByLocation,
  WarehouseStats,
  StockReportItem,
  TransferMaterialRequest,
  AdjustInventoryRequest,
  PaginatedTransactions,
  PaginatedTransfers,
  TransactionFilters,
  StockReportFilters,
} from '../models/warehouse.model';

@Injectable({
  providedIn: 'root',
})
export class WarehouseService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/warehouse`;

  // Warehouse locations
  getAllLocations(): Observable<{ success: boolean; data: WarehouseLocation[] }> {
    return this.http.get<{ success: boolean; data: WarehouseLocation[] }>(`${this.apiUrl}/locations`);
  }

  // Stock by location
  getStockByLocation(locationId: number, search?: string): Observable<{ success: boolean; data: StockByLocation[] }> {
    let params = new HttpParams();
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<{ success: boolean; data: StockByLocation[] }>(`${this.apiUrl}/stock/${locationId}`, { params });
  }

  // Transfer material
  transferMaterial(data: TransferMaterialRequest): Observable<{ success: boolean; message: string; data: any }> {
    return this.http.post<{ success: boolean; message: string; data: any }>(`${this.apiUrl}/transfer`, data);
  }

  // Adjust inventory
  adjustInventory(data: AdjustInventoryRequest): Observable<{ success: boolean; message: string; data: any }> {
    return this.http.post<{ success: boolean; message: string; data: any }>(`${this.apiUrl}/adjust`, data);
  }

  // Transaction history
  getTransactionHistory(filters: TransactionFilters = {}): Observable<PaginatedTransactions> {
    let params = new HttpParams();

    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.materialId) params = params.set('materialId', filters.materialId.toString());
    if (filters.locationId) params = params.set('locationId', filters.locationId.toString());
    if (filters.transactionType) params = params.set('transactionType', filters.transactionType);
    if (filters.startDate) params = params.set('startDate', filters.startDate);
    if (filters.endDate) params = params.set('endDate', filters.endDate);

    return this.http.get<PaginatedTransactions>(`${this.apiUrl}/transactions`, { params });
  }

  // Transfer history
  getTransferHistory(
    page: number = 1,
    limit: number = 20,
    materialId?: number,
    startDate?: string,
    endDate?: string
  ): Observable<PaginatedTransfers> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (materialId) params = params.set('materialId', materialId.toString());
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<PaginatedTransfers>(`${this.apiUrl}/transfers`, { params });
  }

  // Warehouse statistics
  getWarehouseStats(): Observable<{ success: boolean; data: WarehouseStats }> {
    return this.http.get<{ success: boolean; data: WarehouseStats }>(`${this.apiUrl}/stats`);
  }

  // Stock report
  getStockReport(filters: StockReportFilters = {}): Observable<{ success: boolean; data: StockReportItem[] }> {
    let params = new HttpParams();

    if (filters.locationId) params = params.set('locationId', filters.locationId.toString());
    if (filters.categoryId) params = params.set('categoryId', filters.categoryId.toString());
    if (filters.lowStock !== undefined) params = params.set('lowStock', filters.lowStock.toString());

    return this.http.get<{ success: boolean; data: StockReportItem[] }>(`${this.apiUrl}/report`, { params });
  }
}
