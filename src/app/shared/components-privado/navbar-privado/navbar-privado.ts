
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-private-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar-privado.html',
  styleUrl: './navbar-privado.css'
})
export class NavbarPrivado {
  @Input() isSidebarOpen: boolean = false;
  @Input() sectionName: string = 'Dashboard';
  @Output() toggleSidebarEvent = new EventEmitter<void>();

  onToggleSidebar(): void {
    this.toggleSidebarEvent.emit();
  }
}