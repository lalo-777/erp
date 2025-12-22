import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { ChatterService } from '../../../../services/chatter.service';
import { ChatterPost, formatMentions } from '../../../../models/chatter.model';

/**
 * Componente para mostrar un post individual del chatter
 */
@Component({
  selector: 'app-chatter-post-item',
  imports: [CommonModule, MatIconModule],
  templateUrl: './chatter-post-item.component.html',
  styleUrl: './chatter-post-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatterPostItemComponent {
  private chatterService = inject(ChatterService);

  /** Post a mostrar */
  post = input.required<ChatterPost>();

  /** Evento emitido cuando se actualiza el post */
  postUpdated = output<void>();

  /** Evento emitido cuando se elimina el post */
  postDeleted = output<void>();

  // Estado
  deleting = signal(false);
  showDropdown = signal(false);

  /** Cuerpo del post con menciones formateadas */
  formattedBody = computed(() => {
    const p = this.post();
    return formatMentions(p.body, p.mentions);
  });

  /** Iniciales del autor */
  authorInitials = computed(() => {
    const p = this.post();
    return p.created_by_initials || this.getInitials(p.created_by_name);
  });

  /**
   * Genera iniciales a partir de un nombre
   */
  private getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  /**
   * Toggle del dropdown de acciones
   */
  toggleDropdown(): void {
    this.showDropdown.update((v) => !v);
  }

  /**
   * Cierra el dropdown
   */
  closeDropdown(): void {
    this.showDropdown.set(false);
  }

  /**
   * Elimina el post
   */
  deletePost(): void {
    if (!confirm('¿Está seguro de eliminar este comentario?')) return;

    this.deleting.set(true);
    this.closeDropdown();

    this.chatterService.deletePost(this.post().id).subscribe({
      next: () => {
        this.postDeleted.emit();
      },
      error: (err) => {
        console.error('Error deleting post:', err);
        this.deleting.set(false);
      },
    });
  }
}
