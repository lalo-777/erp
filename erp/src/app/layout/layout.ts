import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SearchModal } from '../components/search-modal/search-modal';
import { AuthService } from '../services/auth.service';

/**
 * Sidebar state modes:
 * - collapsed: Default state, sidebar is collapsed (icon-only)
 * - expanded: Sidebar is expanded on hover
 * - pinned: Sidebar is permanently expanded and adjusts layout
 * - modal: Sidebar shown as modal overlay (mobile mode)
 */
type SidebarMode = 'collapsed' | 'expanded' | 'pinned' | 'modal';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, SearchModal, MatIconModule, MatTooltipModule],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Layout {
  private readonly authService = inject(AuthService);

  // Sidebar state management
  protected readonly isPinned = signal(false);
  protected readonly isHovered = signal(false);
  protected readonly isModalOpen = signal(false);
  protected readonly isMobileView = signal(false);
  protected readonly expandedMenuItems = signal<Set<string>>(new Set());

  // Search modal state
  protected readonly isSearchModalOpen = signal(false);

  // Full screen state
  protected readonly isFullScreen = signal(false);

  // Computed sidebar mode based on state
  protected readonly sidebarMode = computed<SidebarMode>(() => {
    if (this.isMobileView()) {
      return this.isModalOpen() ? 'modal' : 'collapsed';
    }
    if (this.isPinned()) {
      return 'pinned';
    }
    if (this.isHovered()) {
      return 'expanded';
    }
    return 'collapsed';
  });

  // Check if sidebar should show expanded content
  protected readonly isExpanded = computed(() => {
    const mode = this.sidebarMode();
    return mode === 'expanded' || mode === 'pinned' || mode === 'modal';
  });

  // Check if toggle buttons should be visible
  protected readonly showToggleButtons = computed(() => {
    return !this.isMobileView() && this.isHovered();
  });

  // Expose auth signals to template
  protected readonly currentUser = this.authService.currentUser;
  protected readonly isAuthenticated = this.authService.isAuthenticated;

  constructor() {
    this.checkMobileView();
  }

  /**
   * Check if current viewport is mobile size
   */
  @HostListener('window:resize')
  protected checkMobileView(): void {
    this.isMobileView.set(window.innerWidth <= 768);

    if (this.isMobileView()) {
      // When switching to mobile, unpin sidebar and close modal
      if (this.isPinned()) {
        this.isPinned.set(false);
      }
    } else {
      // When switching to desktop, close modal if open
      if (this.isModalOpen()) {
        this.isModalOpen.set(false);
      }
    }
  }

  /**
   * Handle sidebar mouse enter (desktop only)
   */
  protected onSidebarMouseEnter(): void {
    if (!this.isMobileView()) {
      this.isHovered.set(true);
    }
  }

  /**
   * Handle sidebar mouse leave (desktop only)
   */
  protected onSidebarMouseLeave(): void {
    if (!this.isMobileView()) {
      this.isHovered.set(false);
    }
  }

  /**
   * Toggle sidebar pin state
   */
  protected togglePin(): void {
    this.isPinned.update((value) => !value);
  }

  /**
   * Toggle modal sidebar (mobile only)
   */
  protected toggleModal(): void {
    if (this.isMobileView()) {
      this.isModalOpen.update((value) => !value);
    }
  }

  /**
   * Handle click outside sidebar in modal mode
   */
  protected onBackdropClick(): void {
    if (this.isMobileView() && this.isModalOpen()) {
      this.isModalOpen.set(false);
    }
  }

  /**
   * Handle sidebar link click in modal mode
   * Only closes modal on mobile, does NOT reload page
   */
  protected onSidebarLinkClick(): void {
    // Only close modal on mobile, navigation is handled by routerLink
    if (this.isMobileView() && this.isModalOpen()) {
      this.isModalOpen.set(false);
    }
    // Sidebar state (pinned/collapsed) is preserved during navigation
  }

  /**
   * Toggle submenu expansion
   */
  protected toggleSubmenu(menuId: string): void {
    this.expandedMenuItems.update((items) => {
      const newSet = new Set(items);
      if (newSet.has(menuId)) {
        newSet.delete(menuId);
      } else {
        newSet.add(menuId);
      }
      return newSet;
    });
  }

  /**
   * Check if submenu is expanded
   */
  protected isSubmenuExpanded(menuId: string): boolean {
    return this.expandedMenuItems().has(menuId);
  }

  /**
   * Logout user
   */
  protected logout(): void {
    this.authService.logout().subscribe();
  }

  /**
   * Open search modal
   */
  protected openSearchModal(): void {
    this.isSearchModalOpen.set(true);
  }

  /**
   * Close search modal
   */
  protected closeSearchModal(): void {
    this.isSearchModalOpen.set(false);
  }

  /**
   * Toggle full screen mode
   */
  protected toggleFullScreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  /**
   * Sync full screen state when changed externally (F11, ESC, etc.)
   */
  @HostListener('document:fullscreenchange')
  protected onFullscreenChange(): void {
    this.isFullScreen.set(!!document.fullscreenElement);
  }

  /**
   * Handle keyboard shortcuts
   */
  @HostListener('window:keydown', ['$event'])
  protected handleKeyboardShortcuts(event: KeyboardEvent): void {
    // Open search modal with '/' key
    if (event.key === '/' && !this.isSearchModalOpen()) {
      event.preventDefault();
      this.openSearchModal();
    }
    // Close search modal with 'Escape' key
    if (event.key === 'Escape' && this.isSearchModalOpen()) {
      this.closeSearchModal();
    }
  }
}
