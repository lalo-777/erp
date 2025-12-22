import {
  Component,
  ChangeDetectionStrategy,
  input,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { HttpEventType } from '@angular/common/http';

import { NoteService } from '../../../services/note.service';
import { FileService } from '../../../services/file.service';
import { Note } from '../../../models/note.model';
import { ErpFile, getFileIcon, formatFileSize } from '../../../models/file.model';

/**
 * Mapeo de entityType a entity_id (según tabla entities)
 */
const ENTITY_TYPE_MAP: Record<string, number> = {
  customer: 1,
  invoice: 2,
  project: 3,
  material: 4,
  labor: 5,
  warehouse: 6,
  'pre-inventory': 7,
  'purchase-order': 8,
  supplier: 9,
  'fuel-requisition': 10,
};

/**
 * Componente de tab para gestionar notas y archivos relacionados a una entidad.
 * Se utiliza en las páginas de tracking de diferentes módulos del ERP.
 *
 * @example
 * ```html
 * <app-notes-files-tab
 *   [entityId]="recordId"
 *   entityType="invoice"
 * />
 * ```
 */
@Component({
  selector: 'app-notes-files-tab',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
  ],
  templateUrl: './notes-files-tab.component.html',
  styleUrl: './notes-files-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesFilesTabComponent implements OnInit {
  private noteService = inject(NoteService);
  private fileService = inject(FileService);
  private fb = inject(FormBuilder);

  /** ID de la entidad */
  entityId = input.required<number>();

  /** Tipo de entidad */
  entityType = input.required<string>();

  // Estado
  notes = signal<Note[]>([]);
  files = signal<ErpFile[]>([]);
  loading = signal(false);
  uploadProgress = signal<number | null>(null);
  showNoteForm = signal(false);
  editingNote = signal<Note | null>(null);
  activeTab = signal<'notes' | 'files'>('notes');
  error = signal<string | null>(null);

  // Formulario de nota
  noteForm = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    body: ['', [Validators.required]],
  });

  /** entity_id numérico para las llamadas API */
  entityIdNum = computed(() => ENTITY_TYPE_MAP[this.entityType()] || 0);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loadNotes();
    this.loadFiles();
  }

  loadNotes(): void {
    this.loading.set(true);
    this.error.set(null);
    this.noteService.getNotes(this.entityIdNum(), this.entityId()).subscribe({
      next: (response) => {
        this.notes.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading notes:', err);
        this.error.set('Error al cargar las notas');
        this.loading.set(false);
      },
    });
  }

  loadFiles(): void {
    this.fileService.getFiles(this.entityIdNum(), this.entityId()).subscribe({
      next: (response) => {
        this.files.set(response.data);
      },
      error: (err) => {
        console.error('Error loading files:', err);
      },
    });
  }

  // ========== TABS ==========

  setActiveTab(tab: 'notes' | 'files'): void {
    this.activeTab.set(tab);
  }

  // ========== NOTAS ==========

  openNoteForm(note?: Note): void {
    if (note) {
      this.editingNote.set(note);
      this.noteForm.patchValue({
        title: note.title,
        body: note.body,
      });
    } else {
      this.editingNote.set(null);
      this.noteForm.reset();
    }
    this.showNoteForm.set(true);
  }

  closeNoteForm(): void {
    this.showNoteForm.set(false);
    this.editingNote.set(null);
    this.noteForm.reset();
  }

  saveNote(): void {
    if (this.noteForm.invalid) {
      this.noteForm.markAllAsTouched();
      return;
    }

    const formValue = this.noteForm.value;
    const editing = this.editingNote();

    if (editing) {
      this.noteService
        .updateNote(editing.id, {
          title: formValue.title!,
          body: formValue.body!,
        })
        .subscribe({
          next: () => {
            this.closeNoteForm();
            this.loadNotes();
          },
          error: (err) => {
            console.error('Error updating note:', err);
            this.error.set('Error al actualizar la nota');
          },
        });
    } else {
      this.noteService
        .createNote({
          entity_id: this.entityIdNum(),
          foreign_id: this.entityId(),
          title: formValue.title!,
          body: formValue.body!,
        })
        .subscribe({
          next: () => {
            this.closeNoteForm();
            this.loadNotes();
          },
          error: (err) => {
            console.error('Error creating note:', err);
            this.error.set('Error al crear la nota');
          },
        });
    }
  }

  archiveNote(note: Note): void {
    if (!confirm('¿Está seguro de archivar esta nota?')) return;

    this.noteService.archiveNote(note.id).subscribe({
      next: () => {
        this.loadNotes();
      },
      error: (err) => {
        console.error('Error archiving note:', err);
        this.error.set('Error al archivar la nota');
      },
    });
  }

  // ========== ARCHIVOS ==========

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Validar tamaño (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      this.error.set('El archivo excede el límite de 10MB');
      input.value = '';
      return;
    }

    this.uploadProgress.set(0);
    this.error.set(null);

    this.fileService.uploadFile(this.entityIdNum(), this.entityId(), file).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress.set(Math.round((100 * event.loaded) / event.total));
        } else if (event.type === HttpEventType.Response) {
          this.uploadProgress.set(null);
          this.loadFiles();
        }
      },
      error: (err) => {
        this.uploadProgress.set(null);
        console.error('Error uploading file:', err);
        this.error.set(err.error?.message || 'Error al subir el archivo');
      },
    });

    // Limpiar input para permitir subir el mismo archivo de nuevo
    input.value = '';
  }

  downloadFile(file: ErpFile): void {
    this.fileService.downloadFile(file.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.original_name;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error downloading file:', err);
        this.error.set('Error al descargar el archivo');
      },
    });
  }

  archiveFile(file: ErpFile): void {
    if (!confirm('¿Está seguro de archivar este archivo?')) return;

    this.fileService.archiveFile(file.id).subscribe({
      next: () => {
        this.loadFiles();
      },
      error: (err) => {
        console.error('Error archiving file:', err);
        this.error.set('Error al archivar el archivo');
      },
    });
  }

  formatFileSize(bytes: number): string {
    return formatFileSize(bytes);
  }

  getFileIcon(mimeType: string): string {
    return getFileIcon(mimeType);
  }
}
