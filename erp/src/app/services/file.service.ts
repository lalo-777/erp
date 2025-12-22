import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ErpFile,
  FilesResponse,
  FileResponse,
  getFileIcon,
  formatFileSize,
} from '../models/file.model';

/**
 * Servicio para gestionar archivos del sistema ERP
 */
@Injectable({
  providedIn: 'root',
})
export class FileService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/files`;

  /**
   * Obtiene todos los archivos de una entidad
   * @param entityId ID del tipo de entidad
   * @param foreignId ID del registro
   */
  getFiles(entityId: number, foreignId: number): Observable<FilesResponse> {
    return this.http.get<FilesResponse>(`${this.baseUrl}/${entityId}/${foreignId}`);
  }

  /**
   * Sube un archivo
   * @param entityId ID del tipo de entidad
   * @param foreignId ID del registro
   * @param file Archivo a subir
   */
  uploadFile(
    entityId: number,
    foreignId: number,
    file: File
  ): Observable<HttpEvent<FileResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entity_id', entityId.toString());
    formData.append('foreign_id', foreignId.toString());

    const req = new HttpRequest('POST', this.baseUrl, formData, {
      reportProgress: true,
    });

    return this.http.request<FileResponse>(req);
  }

  /**
   * Descarga un archivo
   * @param fileId ID del archivo
   */
  downloadFile(fileId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${fileId}/download`, {
      responseType: 'blob',
    });
  }

  /**
   * Archiva un archivo (soft delete)
   * @param fileId ID del archivo
   */
  archiveFile(fileId: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.baseUrl}/${fileId}`
    );
  }

  /**
   * Obtiene el icono correspondiente a un tipo MIME
   * @param mimeType Tipo MIME del archivo
   */
  getFileIcon(mimeType: string): string {
    return getFileIcon(mimeType);
  }

  /**
   * Formatea el tamaño de archivo a una cadena legible
   * @param bytes Tamaño en bytes
   */
  formatFileSize(bytes: number): string {
    return formatFileSize(bytes);
  }
}
