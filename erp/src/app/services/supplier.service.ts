import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Supplier,
  SupplierStats,
  SupplierCategory,
  PaginatedSuppliers,
  CreateSupplierRequest,
  UpdateSupplierRequest,
} from '../models/supplier.model';
import { PurchaseOrder } from '../models/purchase-order.model';

@Injectable({
  providedIn: 'root',
})
export class SupplierService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/suppliers`;

  getAllSuppliers(
    page: number = 1,
    limit: number = 10,
    search?: string,
    categoryId?: number
  ): Observable<PaginatedSuppliers> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    if (categoryId) {
      params = params.set('category_id', categoryId.toString());
    }

    return this.http.get<PaginatedSuppliers>(this.apiUrl, { params });
  }

  getSupplierById(id: number): Observable<{ success: boolean; data: Supplier }> {
    return this.http.get<{ success: boolean; data: Supplier }>(`${this.apiUrl}/${id}`);
  }

  getSupplierStats(): Observable<{ success: boolean; data: SupplierStats }> {
    return this.http.get<{ success: boolean; data: SupplierStats }>(`${this.apiUrl}/stats`);
  }

  getSupplierCategories(): Observable<{ success: boolean; data: SupplierCategory[] }> {
    return this.http.get<{ success: boolean; data: SupplierCategory[] }>(`${this.apiUrl}/categories`);
  }

  getSupplierPurchaseOrders(
    supplierId: number,
    page: number = 1,
    limit: number = 10
  ): Observable<{
    success: boolean;
    data: PurchaseOrder[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }> {
    const params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());

    return this.http.get<{
      success: boolean;
      data: PurchaseOrder[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
      };
    }>(`${this.apiUrl}/${supplierId}/purchase-orders`, { params });
  }

  createSupplier(data: CreateSupplierRequest): Observable<{ success: boolean; data: Supplier }> {
    return this.http.post<{ success: boolean; data: Supplier }>(this.apiUrl, data);
  }

  updateSupplier(
    id: number,
    data: UpdateSupplierRequest
  ): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`, data);
  }

  deleteSupplier(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}
