import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Dashboard statistics response structure
 */
export interface DashboardStats {
  customers: CustomerStats;
  invoices: InvoiceStats;
  projects: ProjectStats;
  materials: MaterialStats;
}

export interface CustomerStats {
  total: number;
  active: number;
  new_this_month: number;
}

export interface InvoiceStats {
  total: number;
  paid: number;
  pending: number;
  overdue: number;
  total_amount: number;
}

export interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  in_progress: number;
}

export interface MaterialStats {
  total_items: number;
  low_stock_count: number;
  total_value: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Dashboard service to fetch aggregated statistics
 */
@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/dashboard`;

  /**
   * Get dashboard statistics
   * @returns Observable with dashboard stats
   */
  getDashboardStats(): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.apiUrl}/stats`);
  }
}
