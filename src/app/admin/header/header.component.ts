import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Input() showMenuButton = false;
  @Output() toggleSidebar = new EventEmitter<void>();
  
  onToggleSidebar() {
    this.toggleSidebar.emit();
  }
}