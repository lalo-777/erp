import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  HistoryItem,
  HistoryPagination,
  HistoryFilters,
} from '../shared/components/history-tab/history-tab.component';

/**
 * Respuesta de la API para el historial
 */
export interface HistoryResponse {
  success: boolean;
  data: HistoryItem[];
  pagination: HistoryPagination;
  message?: string;
}

/**
 * Servicio para gestionar el historial de cambios del sistema ERP
 */
@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/history`;

  /**
   * Obtiene el historial de cambios de una entidad
   * @param entityId ID del tipo de entidad
   * @param foreignId ID del registro
   * @param page Número de página
   * @param filters Filtros opcionales
   */
  getHistory(
    entityId: number,
    foreignId: number,
    page: number = 1,
    filters?: Partial<HistoryFilters>
  ): Observable<HistoryResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', (filters?.limit || 10).toString());

    if (filters?.dateFrom) {
      params = params.set('dateFrom', filters.dateFrom);
    }

    if (filters?.dateTo) {
      params = params.set('dateTo', filters.dateTo);
    }

    return this.http.get<HistoryResponse>(
      `${this.baseUrl}/${entityId}/${foreignId}`,
      { params }
    );
  }
}
