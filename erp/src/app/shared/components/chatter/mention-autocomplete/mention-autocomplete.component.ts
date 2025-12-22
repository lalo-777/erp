import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  inject,
  signal,
  effect,
  ElementRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { ChatterService } from '../../../../services/chatter.service';
import { UserSuggestion } from '../../../../models/chatter.model';

/**
 * Componente de autocompletado para menciones @usuario
 */
@Component({
  selector: 'app-mention-autocomplete',
  imports: [CommonModule, MatIconModule],
  templateUrl: './mention-autocomplete.component.html',
  styleUrl: './mention-autocomplete.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MentionAutocompleteComponent {
  private chatterService = inject(ChatterService);
  private elementRef = inject(ElementRef);

  /** Término de búsqueda */
  search = input<string>('');

  /** Evento cuando se selecciona un usuario */
  selectUser = output<UserSuggestion>();

  /** Evento para cerrar el autocomplete */
  close = output<void>();

  // Estado
  suggestions = signal<UserSuggestion[]>([]);
  loading = signal(false);
  selectedIndex = signal(0);

  constructor() {
    // Buscar usuarios cuando cambia el término de búsqueda
    effect(() => {
      const searchTerm = this.search();
      this.searchUsers(searchTerm);
    });
  }

  /**
   * Busca usuarios
   */
  private searchUsers(query: string): void {
    this.loading.set(true);
    this.selectedIndex.set(0);

    this.chatterService.searchUsers(query).subscribe({
      next: (response) => {
        this.suggestions.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error searching users:', err);
        this.suggestions.set([]);
        this.loading.set(false);
      },
    });
  }

  /**
   * Selecciona un usuario
   */
  onSelect(user: UserSuggestion): void {
    this.selectUser.emit(user);
  }

  /**
   * Maneja las teclas del teclado
   */
  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    const suggestions = this.suggestions();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex.update((i) =>
          i < suggestions.length - 1 ? i + 1 : 0
        );
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex.update((i) =>
          i > 0 ? i - 1 : suggestions.length - 1
        );
        break;

      case 'Enter':
        event.preventDefault();
        const selected = suggestions[this.selectedIndex()];
        if (selected) {
          this.onSelect(selected);
        }
        break;

      case 'Escape':
        event.preventDefault();
        this.close.emit();
        break;
    }
  }

  /**
   * Cierra al hacer click fuera
   */
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.close.emit();
    }
  }
}
