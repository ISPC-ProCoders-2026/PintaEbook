
import { HostListener, Component, EventEmitter, Input, Output } from '@angular/core';
import { ThemeToggle } from '../../components/theme-toggle/theme-toggle';

type NavigationItem = {
  id: string;
  label: string;
  icon: string[];
};

@Component({
  selector: 'app-private-navbar',
  standalone: true,
  imports: [ThemeToggle],
  templateUrl: './navbar-privado.html',
  styleUrl: './navbar-privado.css'
})
export class NavbarPrivado {
  @Input() isAdmin = false;
  @Input() sectionName: string = 'Dashboard';
  @Input() creditsAvailable: number | null = null;
  @Output() navigationEvent = new EventEmitter<string>();
  @Output() logoutEvent = new EventEmitter<void>();
  @Output() brandClickEvent = new EventEmitter<void>();

  isSidebarOpen = false;
  isMobile = typeof window !== 'undefined' && window.innerWidth <= 860;
  get sectionLabel(): string {
    return [...this.libraryNavigation, ...this.writingNavigation, ...this.resourceNavigation, ...this.accountNavigation]
      .find(item => item.id === this.sectionName)?.label
      ?? ({ purchases: 'Compras', metrics: 'MÈtricas' } as Record<string, string>)[this.sectionName]
      ?? this.sectionName;
  }
  @HostListener('window:resize')
  onResize(): void { this.isMobile = window.innerWidth <= 860; }
  @HostListener('document:keydown.escape')
  closeSidebar(): void {
    if (!this.isSidebarOpen) return;
    this.isSidebarOpen = false;
    document.querySelector<HTMLElement>('.menu-toggle')?.focus();
  }

  readonly libraryNavigation: NavigationItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: ['M3 10.8 12 3l9 7.8v9.7a.5.5 0 0 1-.5.5H3.5a.5.5 0 0 1-.5-.5z', 'M9 20v-6h6v6'] },
    { id: 'ebooks', label: 'Mis Ebooks', icon: ['M5 4.5A2.5 2.5 0 0 1 7.5 2H19v16H7.5A2.5 2.5 0 0 0 5 20.5z', 'M5 4.5V20.5', 'M8.5 6H15'] },
  ];

  readonly writingNavigation: NavigationItem[] = [
    { id: 'new-ebook', label: 'Nuevo Ebook', icon: ['m4 20 4.2-1 10.4-10.4a2.1 2.1 0 0 0-3-3L5.2 15.9z', 'm13.8 7.4 2.8 2.8'] },
  ];

  readonly resourceNavigation: NavigationItem[] = [
    { id: 'buy-credits', label: 'Comprar planes', icon: ['M4 4h16v16H4z', 'M8 8h8M8 12h8M8 16h5'] },
    { id: 'credits', label: 'Comprar cr√©ditos', icon: ['M3 3h2l2.2 12.2a2 2 0 0 0 2 1.7h7.6a2 2 0 0 0 1.9-1.4L20 8H6.2', 'M10 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM18 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2z'] },
    { id: 'purchase-history', label: 'Historial de compras', icon: ['M4 4h16v16H4z', 'M8 8h8M8 12h8M8 16h5'] },
  ];

  readonly accountNavigation: NavigationItem[] = [
    { id: 'profile', label: 'Perfil', icon: ['M20 21a8 8 0 0 0-16 0', 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'] },
  ];

  setActiveSection(section: string): void {
    this.sectionName = section;
    this.isSidebarOpen = false;
    this.navigationEvent.emit(section);
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  onBrandClick(): void {
    this.brandClickEvent.emit();
  }

  onLogout(): void {
    this.logoutEvent.emit();
  }

  openAdminMetrics(): void {
    this.setActiveSection('metrics');
  }

  openAdminPurchases(): void {
    this.setActiveSection('purchases');
  }
}
