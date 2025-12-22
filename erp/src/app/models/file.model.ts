/**
 * Modelo para archivos del sistema ERP
 */
export interface ErpFile {
  id: number;
  entity_id: number;
  foreign_id: number;
  original_name: string;
  stored_name: string;
  mime_type: string;
  file_size: number;
  created_by: number;
  created_by_name: string;
  created_date: string;
  archived: boolean;
}

/**
 * Respuesta de la API para archivos
 */
export interface FilesResponse {
  success: boolean;
  data: ErpFile[];
  message?: string;
}

/**
 * Respuesta de la API para un archivo
 */
export interface FileResponse {
  success: boolean;
  data: ErpFile;
  message?: string;
}

/**
 * Tipos MIME comunes y sus iconos
 */
export const FILE_ICON_MAP: Record<string, string> = {
  'application/pdf': 'picture_as_pdf',
  'application/msword': 'description',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'description',
  'application/vnd.ms-excel': 'table_chart',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'table_chart',
  'application/vnd.ms-powerpoint': 'slideshow',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'slideshow',
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
  'image/svg+xml': 'image',
  'text/plain': 'article',
  'text/csv': 'table_chart',
  'application/zip': 'folder_zip',
  'application/x-rar-compressed': 'folder_zip',
  'application/x-7z-compressed': 'folder_zip',
};

/**
 * Obtiene el icono correspondiente a un tipo MIME
 */
export function getFileIcon(mimeType: string): string {
  return FILE_ICON_MAP[mimeType] || 'insert_drive_file';
}

/**
 * Formatea el tamaño de archivo a una cadena legible
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
