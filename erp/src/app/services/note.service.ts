import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Note,
  NotesResponse,
  NoteResponse,
  CreateNoteDto,
  UpdateNoteDto,
} from '../models/note.model';

/**
 * Servicio para gestionar notas del sistema ERP
 */
@Injectable({
  providedIn: 'root',
})
export class NoteService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/notes`;

  /**
   * Obtiene todas las notas de una entidad
   * @param entityId ID del tipo de entidad
   * @param foreignId ID del registro
   */
  getNotes(entityId: number, foreignId: number): Observable<NotesResponse> {
    return this.http.get<NotesResponse>(`${this.baseUrl}/${entityId}/${foreignId}`);
  }

  /**
   * Obtiene una nota por ID
   * @param noteId ID de la nota
   */
  getNoteById(noteId: number): Observable<NoteResponse> {
    return this.http.get<NoteResponse>(`${this.baseUrl}/${noteId}`);
  }

  /**
   * Crea una nueva nota
   * @param data Datos de la nota
   */
  createNote(data: CreateNoteDto): Observable<NoteResponse> {
    return this.http.post<NoteResponse>(this.baseUrl, data);
  }

  /**
   * Actualiza una nota existente
   * @param noteId ID de la nota
   * @param data Datos a actualizar
   */
  updateNote(noteId: number, data: UpdateNoteDto): Observable<NoteResponse> {
    return this.http.put<NoteResponse>(`${this.baseUrl}/${noteId}`, data);
  }

  /**
   * Archiva una nota (soft delete)
   * @param noteId ID de la nota
   */
  archiveNote(noteId: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.baseUrl}/${noteId}`
    );
  }
}
