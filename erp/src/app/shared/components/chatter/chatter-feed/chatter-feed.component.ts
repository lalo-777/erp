import {
  Component,
  ChangeDetectionStrategy,
  input,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { ChatterService } from '../../../../services/chatter.service';
import {
  ChatterPost,
  ChatterPagination,
} from '../../../../models/chatter.model';
import { ChatterFormComponent } from '../chatter-form/chatter-form.component';
import { ChatterPostItemComponent } from '../chatter-post-item/chatter-post-item.component';

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
 * Componente principal del chatter que muestra el feed de comentarios
 *
 * @example
 * ```html
 * <app-chatter-feed
 *   [entityId]="recordId"
 *   entityType="invoice"
 * />
 * ```
 */
@Component({
  selector: 'app-chatter-feed',
  imports: [
    CommonModule,
    MatIconModule,
    ChatterFormComponent,
    ChatterPostItemComponent,
  ],
  templateUrl: './chatter-feed.component.html',
  styleUrl: './chatter-feed.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatterFeedComponent implements OnInit {
  private chatterService = inject(ChatterService);

  /** ID de la entidad */
  entityId = input.required<number>();

  /** Tipo de entidad */
  entityType = input.required<string>();

  // Estado
  posts = signal<ChatterPost[]>([]);
  pagination = signal<ChatterPagination | null>(null);
  loading = signal(false);
  loadingMore = signal(false);
  error = signal<string | null>(null);

  /** entity_id numérico para las llamadas API */
  get entityIdNum(): number {
    return ENTITY_TYPE_MAP[this.entityType()] || 0;
  }

  ngOnInit(): void {
    this.loadPosts();
  }

  /**
   * Carga los posts iniciales
   */
  loadPosts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.chatterService.getPosts(this.entityIdNum, this.entityId(), 1, 10).subscribe({
      next: (response) => {
        this.posts.set(response.data);
        this.pagination.set(response.pagination);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading posts:', err);
        this.error.set('Error al cargar los comentarios');
        this.loading.set(false);
      },
    });
  }

  /**
   * Carga más posts (paginación)
   */
  loadMore(): void {
    const currentPagination = this.pagination();
    if (!currentPagination || !currentPagination.hasMore) return;

    this.loadingMore.set(true);
    const nextPage = currentPagination.currentPage + 1;

    this.chatterService
      .getPosts(this.entityIdNum, this.entityId(), nextPage, 10)
      .subscribe({
        next: (response) => {
          this.posts.update((current) => [...current, ...response.data]);
          this.pagination.set(response.pagination);
          this.loadingMore.set(false);
        },
        error: (err) => {
          console.error('Error loading more posts:', err);
          this.loadingMore.set(false);
        },
      });
  }

  /**
   * Callback cuando se crea un nuevo post
   */
  onPostCreated(): void {
    this.loadPosts();
  }

  /**
   * Callback cuando se actualiza un post
   */
  onPostUpdated(): void {
    this.loadPosts();
  }

  /**
   * Callback cuando se elimina un post
   */
  onPostDeleted(): void {
    this.loadPosts();
  }
}
