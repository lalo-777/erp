import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  PurchaseOrder,
  PurchaseOrderStats,
  PaginatedPurchaseOrders,
  CreatePurchaseOrderRequest,
  UpdatePurchaseOrderRequest,
  ReceiveMaterialsRequest,
  PurchaseOrderStatus,
} from '../models/purchase-order.model';

@Injectable({
  providedIn: 'root',
})
export class PurchaseOrderService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/purchase-orders`;

  getAllPurchaseOrders(
    page: number = 1,
    limit: number = 10,
    search?: string,
    statusId?: number,
    startDate?: string,
    endDate?: string
  ): Observable<PaginatedPurchaseOrders> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    if (statusId) {
      params = params.set('status_id', statusId.toString());
    }

    if (startDate) {
      params = params.set('start_date', startDate);
    }

    if (endDate) {
      params = params.set('end_date', endDate);
    }

    return this.http.get<PaginatedPurchaseOrders>(this.apiUrl, { params });
  }

  getPurchaseOrderById(id: number): Observable<{ success: boolean; data: PurchaseOrder }> {
    return this.http.get<{ success: boolean; data: PurchaseOrder }>(`${this.apiUrl}/${id}`);
  }

  getPurchaseOrderStats(): Observable<{ success: boolean; data: PurchaseOrderStats }> {
    return this.http.get<{ success: boolean; data: PurchaseOrderStats }>(`${this.apiUrl}/stats`);
  }

  createPurchaseOrder(
    data: CreatePurchaseOrderRequest
  ): Observable<{ success: boolean; message: string; data: { id: number; po_number: string } }> {
    return this.http.post<{ success: boolean; message: string; data: { id: number; po_number: string } }>(
      this.apiUrl,
      data
    );
  }

  updatePurchaseOrder(
    id: number,
    data: UpdatePurchaseOrderRequest
  ): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`, data);
  }

  deletePurchaseOrder(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }

  updatePurchaseOrderStatus(
    id: number,
    statusId: number
  ): Observable<{ success: boolean; message: string }> {
    return this.http.patch<{ success: boolean; message: string }>(`${this.apiUrl}/${id}/status`, {
      status_id: statusId,
    });
  }

  receiveMaterials(
    id: number,
    data: ReceiveMaterialsRequest
  ): Observable<{ success: boolean; message: string; data: { new_status_id: number } }> {
    return this.http.post<{ success: boolean; message: string; data: { new_status_id: number } }>(
      `${this.apiUrl}/${id}/receive`,
      data
    );
  }

  // Get all purchase order statuses from catalog
  getPurchaseOrderStatuses(): Observable<{ success: boolean; data: PurchaseOrderStatus[] }> {
    return this.http.get<{ success: boolean; data: PurchaseOrderStatus[] }>(
      `${environment.apiUrl}/catalogs/purchase-order-statuses`
    );
  }

  // Get all suppliers
  getAllSuppliers(): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.apiUrl}/suppliers`);
  }
}
