import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { CatalogItem, CatalogResponse } from '../models/catalog.model';

@Injectable({
  providedIn: 'root',
})
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/catalogs`;

  getAllCatalogs(): Observable<{ success: boolean; data: { name: string; table: string }[] }> {
    return this.http.get<{ success: boolean; data: { name: string; table: string }[] }>(
      this.apiUrl
    );
  }

  getCatalog(catalogName: string): Observable<CatalogItem[]> {
    return this.http
      .get<CatalogResponse>(`${this.apiUrl}/${catalogName}`)
      .pipe(map((response) => response.data));
  }

  getCatalogItem(catalogName: string, id: number): Observable<CatalogItem> {
    return this.http
      .get<{ success: boolean; data: CatalogItem }>(`${this.apiUrl}/${catalogName}/${id}`)
      .pipe(map((response) => response.data));
  }

  createCatalogItem(catalogName: string, item: Partial<CatalogItem>): Observable<CatalogItem> {
    return this.http
      .post<{ success: boolean; data: CatalogItem }>(`${this.apiUrl}/${catalogName}`, item)
      .pipe(map((response) => response.data));
  }

  updateCatalogItem(
    catalogName: string,
    id: number,
    item: Partial<CatalogItem>
  ): Observable<CatalogItem> {
    return this.http
      .put<{ success: boolean; data: CatalogItem }>(`${this.apiUrl}/${catalogName}/${id}`, item)
      .pipe(map((response) => response.data));
  }

  deleteCatalogItem(catalogName: string, id: number): Observable<void> {
    return this.http
      .delete<{ success: boolean }>(`${this.apiUrl}/${catalogName}/${id}`)
      .pipe(map(() => undefined));
  }

  // Convenience methods for specific catalogs
  getInvoiceTypes(): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.apiUrl}/invoice-types`);
  }

  getInvoiceStatuses(): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.apiUrl}/invoice-statuses`);
  }

  getProjectTypes(): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.apiUrl}/project-types`);
  }

  getProjectAreas(): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.apiUrl}/project-areas`);
  }

  getProjectStatuses(): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.apiUrl}/project-statuses`);
  }

  getUsers(): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(`${environment.apiUrl}/users`);
  }

  getMaterialCategories(): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.apiUrl}/material-categories`);
  }

  getUnitsOfMeasure(): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.apiUrl}/units-of-measure`);
  }
}
