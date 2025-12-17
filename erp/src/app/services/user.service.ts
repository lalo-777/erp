import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  UserDetail,
  UserListItem,
  UserStats,
  PaginatedUsers,
  CreateUserRequest,
  UpdateUserRequest,
} from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  getAllUsers(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Observable<PaginatedUsers> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PaginatedUsers>(this.apiUrl, { params });
  }

  getUserById(id: number): Observable<{ success: boolean; data: UserDetail }> {
    return this.http.get<{ success: boolean; data: UserDetail }>(`${this.apiUrl}/${id}`);
  }

  getUserStats(): Observable<{ success: boolean; data: UserStats }> {
    return this.http.get<{ success: boolean; data: UserStats }>(`${this.apiUrl}/stats`);
  }

  createUser(
    data: CreateUserRequest
  ): Observable<{ success: boolean; data: UserDetail; message: string }> {
    return this.http.post<{ success: boolean; data: UserDetail; message: string }>(
      this.apiUrl,
      data
    );
  }

  updateUser(
    id: number,
    data: UpdateUserRequest
  ): Observable<{ success: boolean; data: UserDetail; message: string }> {
    return this.http.put<{ success: boolean; data: UserDetail; message: string }>(
      `${this.apiUrl}/${id}`,
      data
    );
  }

  deleteUser(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}
