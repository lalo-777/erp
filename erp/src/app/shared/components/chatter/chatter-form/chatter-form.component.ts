import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  inject,
  signal,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { ChatterService } from '../../../../services/chatter.service';
import { UserSuggestion } from '../../../../models/chatter.model';
import { MentionAutocompleteComponent } from '../mention-autocomplete/mention-autocomplete.component';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

/**
 * Mapeo de entityType a entity_id
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
 * Componente de formulario para crear nuevos posts en el chatter
 */
@Component({
  selector: 'app-chatter-form',
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MentionAutocompleteComponent,
  ],
  templateUrl: './chatter-form.component.html',
  styleUrl: './chatter-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatterFormComponent {
  private chatterService = inject(ChatterService);

  @ViewChild('textarea') textarea!: ElementRef<HTMLTextAreaElement>;

  /** ID de la entidad */
  entityId = input.required<number>();

  /** Tipo de entidad */
  entityType = input.required<string>();

  /** Post a editar (opcional) */
  editingPost = input<{ id: number; body: string } | null>(null);

  /** Evento emitido cuando se crea un post */
  postCreated = output<void>();

  /** Evento emitido cuando se actualiza un post */
  postUpdated = output<void>();

  /** Evento para cancelar la edición */
  cancelEdit = output<void>();

  // Estado
  body = signal('');
  submitting = signal(false);
  showMentions = signal(false);
  mentionSearch = signal('');
  mentionPosition = signal({ top: 0, left: 0 });
  selectedMentions = signal<UserSuggestion[]>([]);

  // Subject para debounce de búsqueda de menciones
  private mentionSearchSubject = new Subject<string>();

  /** entity_id numérico para las llamadas API */
  get entityIdNum(): number {
    return ENTITY_TYPE_MAP[this.entityType()] || 0;
  }

  constructor() {
    // Configurar debounce para búsqueda de menciones
    this.mentionSearchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((search) => {
        this.mentionSearch.set(search);
      });
  }

  /**
   * Maneja el input del textarea
   */
  onInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    const value = textarea.value;
    this.body.set(value);

    // Detectar si se está escribiendo una mención
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      const searchTerm = mentionMatch[1];
      this.mentionSearchSubject.next(searchTerm);
      this.showMentions.set(true);

      // Calcular posición del autocomplete
      this.calculateMentionPosition(textarea, mentionMatch.index!);
    } else {
      this.showMentions.set(false);
    }
  }

  /**
   * Calcula la posición del autocomplete de menciones
   */
  private calculateMentionPosition(
    textarea: HTMLTextAreaElement,
    mentionStart: number
  ): void {
    // Posición aproximada basada en el textarea
    const rect = textarea.getBoundingClientRect();
    this.mentionPosition.set({
      top: rect.height + 5,
      left: 0,
    });
  }

  /**
   * Selecciona un usuario de las sugerencias
   */
  onMentionSelect(user: UserSuggestion): void {
    const currentBody = this.body();
    const textarea = this.textarea.nativeElement;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = currentBody.substring(0, cursorPos);
    const textAfterCursor = currentBody.substring(cursorPos);

    // Reemplazar el @parcial con la mención completa
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    if (mentionMatch) {
      const newTextBefore =
        textBeforeCursor.substring(0, mentionMatch.index) + `@${user.name} `;
      const newBody = newTextBefore + textAfterCursor;
      this.body.set(newBody);

      // Agregar a la lista de menciones seleccionadas
      this.selectedMentions.update((current) => {
        if (!current.find((m) => m.id === user.id)) {
          return [...current, user];
        }
        return current;
      });

      // Mover el cursor después de la mención
      setTimeout(() => {
        const newCursorPos = newTextBefore.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      });
    }

    this.showMentions.set(false);
  }

  /**
   * Cierra el autocomplete de menciones
   */
  onMentionClose(): void {
    this.showMentions.set(false);
  }

  /**
   * Envía el formulario
   */
  submit(): void {
    const bodyText = this.body().trim();
    if (!bodyText) return;

    this.submitting.set(true);
    const mentionIds = this.selectedMentions().map((m) => m.id);
    const editing = this.editingPost();

    if (editing) {
      this.chatterService
        .updatePost(editing.id, { body: bodyText, mentions: mentionIds })
        .subscribe({
          next: () => {
            this.resetForm();
            this.postUpdated.emit();
          },
          error: (err) => {
            console.error('Error updating post:', err);
            this.submitting.set(false);
          },
        });
    } else {
      this.chatterService
        .createPost({
          entity_id: this.entityIdNum,
          foreign_id: this.entityId(),
          body: bodyText,
          mentions: mentionIds,
        })
        .subscribe({
          next: () => {
            this.resetForm();
            this.postCreated.emit();
          },
          error: (err) => {
            console.error('Error creating post:', err);
            this.submitting.set(false);
          },
        });
    }
  }

  /**
   * Resetea el formulario
   */
  private resetForm(): void {
    this.body.set('');
    this.selectedMentions.set([]);
    this.submitting.set(false);
    this.showMentions.set(false);
  }

  /**
   * Cancela la edición
   */
  onCancel(): void {
    this.resetForm();
    this.cancelEdit.emit();
  }

  /**
   * Maneja el keydown para enviar con Ctrl+Enter
   */
  onKeydown(event: KeyboardEvent): void {
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      this.submit();
    }
  }
}
