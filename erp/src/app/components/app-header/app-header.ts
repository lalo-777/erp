import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  Signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
} from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface Breadcrumb {
  label: string;
  url: string;
  isActive: boolean;
}

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule, MatIconModule, MatTooltipModule],
  templateUrl: './app-header.html',
  styleUrl: './app-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppHeader implements AfterViewInit {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  // Referencias a las secciones de contenido proyectado
  protected readonly actionButtonsSection = viewChild<ElementRef>('actionButtonsSection');
  protected readonly searchFiltersSection = viewChild<ElementRef>('searchFiltersSection');

  // Estado de colapso de las secciones actions/filters
  protected readonly isCollapsed = signal(false);

  // Indica si hay contenido en las secciones de actions o filters
  protected readonly hasOptionalContent = signal(false);

  // Observable que detecta eventos de navegación del router
  private readonly navigationEnd$ = this.router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
    startWith(null), // Emite el valor inicial para la ruta actual
    map(() => this.buildBreadcrumbs())
  );

  // Convierte el observable a señal reactiva
  protected readonly breadcrumbs: Signal<Breadcrumb[]> = toSignal(this.navigationEnd$, {
    initialValue: this.buildBreadcrumbs(),
  });

  ngAfterViewInit(): void {
    // Verifica si hay contenido proyectado en las secciones opcionales
    this.checkForOptionalContent();
  }

  /**
   * Alterna el estado de colapso de las secciones de actions y filters
   */
  protected toggleCollapse(): void {
    this.isCollapsed.update((collapsed) => !collapsed);
  }

  /**
   * Verifica si hay contenido proyectado en las secciones de actions o filters
   */
  private checkForOptionalContent(): void {
    const actionsEl = this.actionButtonsSection()?.nativeElement;
    const filtersEl = this.searchFiltersSection()?.nativeElement;

    const hasActions = actionsEl && actionsEl.children.length > 0;
    const hasFilters = filtersEl && filtersEl.children.length > 0;

    this.hasOptionalContent.set(hasActions || hasFilters);
  }

  /**
   * Construye el array de breadcrumbs basándose en la ruta activa actual
   */
  private buildBreadcrumbs(): Breadcrumb[] {
    const breadcrumbs: Breadcrumb[] = [];
    let currentRoute: ActivatedRoute | null = this.activatedRoute.root;
    let url = '';

    // Agrega "ERP" como elemento raíz del breadcrumb
    breadcrumbs.push({
      label: 'ERP',
      url: '/',
      isActive: false,
    });

    // Recorre el árbol de rutas activas
    while (currentRoute) {
      // Verifica que snapshot exista (compatibilidad con SSR)
      if (currentRoute.snapshot) {
        const routeConfig = currentRoute.snapshot.routeConfig;

        if (routeConfig?.path) {
          const routePath = routeConfig.path;

          // Construye la URL acumulativa
          if (routePath) {
            url += `/${routePath}`;
          }

          // Obtiene la etiqueta del breadcrumb desde route.data
          const breadcrumbLabel = currentRoute.snapshot.data['breadcrumb'];

          if (breadcrumbLabel) {
            breadcrumbs.push({
              label: breadcrumbLabel,
              url: url,
              isActive: false,
            });
          }
        }
      }

      currentRoute = currentRoute.firstChild;
    }

    // Marca el último elemento como activo (sin enlace)
    if (breadcrumbs.length > 0) {
      breadcrumbs[breadcrumbs.length - 1].isActive = true;
    }

    return breadcrumbs;
  }
}
