import { Component } from '@angular/core';

type NavigationItem = {
  id: string;
  label: string;
  icon: string[];
};

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  isSidebarOpen = false;
  activeSection = 'dashboard';

  readonly libraryNavigation: NavigationItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: ['M3 10.8 12 3l9 7.8v9.7a.5.5 0 0 1-.5.5H3.5a.5.5 0 0 1-.5-.5z', 'M9 20v-6h6v6'] },
    { id: 'ebooks', label: 'Mis Ebooks', icon: ['M5 4.5A2.5 2.5 0 0 1 7.5 2H19v16H7.5A2.5 2.5 0 0 0 5 20.5z', 'M5 4.5V20.5', 'M8.5 6H15'] },
  ];

  readonly writingNavigation: NavigationItem[] = [
    { id: 'new-ebook', label: 'Nuevo Ebook', icon: ['M12 5v14M5 12h14', 'M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z'] },
    { id: 'editor', label: 'Editor', icon: ['m4 20 4.2-1 10.4-10.4a2.1 2.1 0 0 0-3-3L5.2 15.9z', 'm13.8 7.4 2.8 2.8'] },
  ];

  readonly resourceNavigation: NavigationItem[] = [
    { id: 'credits', label: 'Créditos', icon: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z', 'm9 12 2 2 4-4'] },
    { id: 'buy-credits', label: 'Comprar Créditos', icon: ['M3 3h2l2.2 12.2a2 2 0 0 0 2 1.7h7.6a2 2 0 0 0 1.9-1.4L20 8H6.2', 'M10 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM18 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2z'] },
  ];

  readonly accountNavigation: NavigationItem[] = [
    { id: 'profile', label: 'Perfil', icon: ['M20 21a8 8 0 0 0-16 0', 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'] },
    { id: 'settings', label: 'Configuración', icon: ['M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z', 'M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.1 2.1-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-3v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1L6.6 17l.1-.1A1.7 1.7 0 0 0 7 15a1.7 1.7 0 0 0-1.5-1H5.3v-3h.2A1.7 1.7 0 0 0 7 10a1.7 1.7 0 0 0-.3-1.9l-.1-.1 2.1-2.1.1.1A1.7 1.7 0 0 0 10.7 6a1.7 1.7 0 0 0 1-1.5v-.2h3v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 8l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2v3h-.2a1.7 1.7 0 0 0-1.5 1z'] },
  ];

  setActiveSection(section: string): void {
    this.activeSection = section;
    this.isSidebarOpen = false;
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
