import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ChatterPostsResponse,
  ChatterPostResponse,
  CreatePostDto,
  UpdatePostDto,
  UserSuggestionsResponse,
} from '../models/chatter.model';

/**
 * Servicio para gestionar el chatter (comentarios) del sistema ERP
 */
@Injectable({
  providedIn: 'root',
})
export class ChatterService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/chatter`;

  /**
   * Obtiene los posts de una entidad
   * @param entityId ID del tipo de entidad
   * @param foreignId ID del registro
   * @param page Número de página
   * @param limit Items por página
   */
  getPosts(
    entityId: number,
    foreignId: number,
    page: number = 1,
    limit: number = 10
  ): Observable<ChatterPostsResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<ChatterPostsResponse>(
      `${this.baseUrl}/posts/${entityId}/${foreignId}`,
      { params }
    );
  }

  /**
   * Crea un nuevo post
   * @param data Datos del post
   */
  createPost(data: CreatePostDto): Observable<ChatterPostResponse> {
    return this.http.post<ChatterPostResponse>(`${this.baseUrl}/posts`, data);
  }

  /**
   * Actualiza un post existente
   * @param postId ID del post
   * @param data Datos a actualizar
   */
  updatePost(postId: number, data: UpdatePostDto): Observable<ChatterPostResponse> {
    return this.http.put<ChatterPostResponse>(
      `${this.baseUrl}/posts/${postId}`,
      data
    );
  }

  /**
   * Elimina un post
   * @param postId ID del post
   */
  deletePost(postId: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.baseUrl}/posts/${postId}`
    );
  }

  /**
   * Busca usuarios para menciones
   * @param query Término de búsqueda
   */
  searchUsers(query: string): Observable<UserSuggestionsResponse> {
    const params = new HttpParams().set('q', query);
    return this.http.get<UserSuggestionsResponse>(
      `${this.baseUrl}/users/search`,
      { params }
    );
  }
}
