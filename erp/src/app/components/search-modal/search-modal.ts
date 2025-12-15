import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
  effect,
  ElementRef,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export interface SearchCategory {
  id: string;
  label: string;
  icon: string;
  items: SearchItem[];
}

export interface SearchItem {
  id: string;
  title: string;
  description?: string;
  url: string;
}

@Component({
  selector: 'app-search-modal',
  imports: [CommonModule, MatIconModule],
  templateUrl: './search-modal.html',
  styleUrl: './search-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchModal {
  isOpen = input.required<boolean>();
  closeModal = output<void>();

  protected readonly searchQuery = signal('');
  protected readonly searchInputRef = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  constructor() {
    // Establece el foco automático en el input al abrir el modal
    effect(() => {
      if (this.isOpen()) {
        // Utiliza setTimeout para asegurar que el DOM esté actualizado
        setTimeout(() => {
          const input = this.searchInputRef()?.nativeElement;
          if (input) {
            input.focus();
          }
        }, 0);
      }
    });
  }

  protected readonly categories: SearchCategory[] = [
    {
      id: 'customers',
      label: 'Clientes',
      icon: 'groups',
      items: [
        { id: '1', title: 'Cliente Ejemplo 1', description: 'cliente1@example.com', url: '/customers/1' },
        { id: '2', title: 'Cliente Ejemplo 2', description: 'cliente2@example.com', url: '/customers/2' },
      ],
    },
    {
      id: 'invoices',
      label: 'Facturas',
      icon: 'receipt_long',
      items: [
        { id: '1', title: 'Factura #001', description: '$5,000', url: '/invoices/1' },
        { id: '2', title: 'Factura #002', description: '$3,500', url: '/invoices/2' },
      ],
    },
    {
      id: 'projects',
      label: 'Proyectos',
      icon: 'apartment',
      items: [
        { id: '1', title: 'Proyecto Alpha', description: 'En progreso', url: '/projects/1' },
        { id: '2', title: 'Proyecto Beta', description: 'Completado', url: '/projects/2' },
      ],
    },
    {
      id: 'materials',
      label: 'Materiales',
      icon: 'inventory_2',
      items: [
        { id: '1', title: 'Material A', description: '100 unidades', url: '/materials/1' },
        { id: '2', title: 'Material B', description: '50 unidades', url: '/materials/2' },
      ],
    },
  ];

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal.emit();
    }
  }

  protected onClose(): void {
    this.closeModal.emit();
  }

  protected onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }
}
