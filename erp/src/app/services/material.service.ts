import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Material,
  MaterialListItem,
  MaterialStats,
  PaginatedMaterials,
  CreateMaterialRequest,
  UpdateMaterialRequest,
} from '../models/material.model';

@Injectable({
  providedIn: 'root',
})
export class MaterialService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/materials`;

  getAllMaterials(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Observable<PaginatedMaterials> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PaginatedMaterials>(this.apiUrl, { params });
  }

  getMaterialById(id: number): Observable<{ success: boolean; data: Material }> {
    return this.http.get<{ success: boolean; data: Material }>(`${this.apiUrl}/${id}`);
  }

  getMaterialStats(): Observable<{ success: boolean; data: MaterialStats }> {
    return this.http.get<{ success: boolean; data: MaterialStats }>(`${this.apiUrl}/stats`);
  }

  getLowStockMaterials(): Observable<{ success: boolean; data: MaterialListItem[] }> {
    return this.http.get<{ success: boolean; data: MaterialListItem[] }>(`${this.apiUrl}/low-stock`);
  }

  createMaterial(data: CreateMaterialRequest): Observable<{ success: boolean; data: Material }> {
    return this.http.post<{ success: boolean; data: Material }>(this.apiUrl, data);
  }

  updateMaterial(
    id: number,
    data: UpdateMaterialRequest
  ): Observable<{ success: boolean; data: Material }> {
    return this.http.put<{ success: boolean; data: Material }>(`${this.apiUrl}/${id}`, data);
  }

  deleteMaterial(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}
