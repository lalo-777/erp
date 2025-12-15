import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Customer,
  CustomerListItem,
  CustomerStats,
  PaginatedCustomers,
  CreateCustomerRequest,
  UpdateCustomerRequest,
} from '../models/customer.model';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/customers`;

  getAllCustomers(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Observable<PaginatedCustomers> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PaginatedCustomers>(this.apiUrl, { params });
  }

  getCustomerById(id: number): Observable<{ success: boolean; data: Customer }> {
    return this.http.get<{ success: boolean; data: Customer }>(`${this.apiUrl}/${id}`);
  }

  getCustomerStats(): Observable<{ success: boolean; data: CustomerStats }> {
    return this.http.get<{ success: boolean; data: CustomerStats }>(`${this.apiUrl}/stats`);
  }

  createCustomer(
    data: CreateCustomerRequest
  ): Observable<{ success: boolean; data: Customer }> {
    return this.http.post<{ success: boolean; data: Customer }>(this.apiUrl, data);
  }

  updateCustomer(
    id: number,
    data: UpdateCustomerRequest
  ): Observable<{ success: boolean; data: Customer }> {
    return this.http.put<{ success: boolean; data: Customer }>(`${this.apiUrl}/${id}`, data);
  }

  deleteCustomer(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}
