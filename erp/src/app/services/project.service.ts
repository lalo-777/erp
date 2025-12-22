import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Project,
  ProjectListItem,
  ProjectStats,
  PaginatedProjects,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectHistoryEntry,
} from '../models/project.model';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/projects`;

  getAllProjects(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Observable<PaginatedProjects> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PaginatedProjects>(this.apiUrl, { params });
  }

  getProjectById(id: number): Observable<{ success: boolean; data: Project }> {
    return this.http.get<{ success: boolean; data: Project }>(`${this.apiUrl}/${id}`);
  }

  getProjectStats(): Observable<{ success: boolean; data: ProjectStats }> {
    return this.http.get<{ success: boolean; data: ProjectStats }>(`${this.apiUrl}/stats`);
  }

  getProjectHistory(id: number): Observable<{ success: boolean; data: ProjectHistoryEntry[] }> {
    return this.http.get<{ success: boolean; data: ProjectHistoryEntry[] }>(`${this.apiUrl}/${id}/history`);
  }

  getProjectsByCustomer(customerId: number, page: number = 1, limit: number = 10): Observable<PaginatedProjects> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('customer_id', customerId.toString());

    return this.http.get<PaginatedProjects>(this.apiUrl, { params });
  }

  createProject(data: CreateProjectRequest): Observable<{ success: boolean; data: Project }> {
    return this.http.post<{ success: boolean; data: Project }>(this.apiUrl, data);
  }

  updateProject(
    id: number,
    data: UpdateProjectRequest
  ): Observable<{ success: boolean; data: Project }> {
    return this.http.put<{ success: boolean; data: Project }>(`${this.apiUrl}/${id}`, data);
  }

  deleteProject(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }

  updateProjectStatus(
    id: number,
    statusId: number
  ): Observable<{ success: boolean; message: string }> {
    return this.http.patch<{ success: boolean; message: string }>(`${this.apiUrl}/${id}/status`, {
      project_status_id: statusId,
    });
  }
}
