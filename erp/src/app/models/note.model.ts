/**
 * Modelo para notas del sistema ERP
 */
export interface Note {
  id: number;
  entity_id: number;
  foreign_id: number;
  title: string;
  body: string;
  created_by: number;
  created_by_name: string;
  created_date: string;
  updated_date?: string;
  archived: boolean;
}

/**
 * DTO para crear una nota
 */
export interface CreateNoteDto {
  entity_id: number;
  foreign_id: number;
  title: string;
  body: string;
}

/**
 * DTO para actualizar una nota
 */
export interface UpdateNoteDto {
  title: string;
  body: string;
}

/**
 * Respuesta de la API para notas
 */
export interface NotesResponse {
  success: boolean;
  data: Note[];
  message?: string;
}

/**
 * Respuesta de la API para una nota
 */
export interface NoteResponse {
  success: boolean;
  data: Note;
  message?: string;
}
