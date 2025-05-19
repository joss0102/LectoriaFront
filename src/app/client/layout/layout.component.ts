import { Component } from '@angular/core';
import { NavHorizontalComponent } from '../header/nav-horizontal/nav-horizontal.component';
import { NavVerticalComponent } from '../header/nav-vertical/nav-vertical.component';
import { RouterOutlet } from '@angular/router';

import { ChatComponent } from '../chat/chat.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    NavHorizontalComponent, NavVerticalComponent, RouterOutlet,ChatComponent
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  isChatOpen = false; 
  
  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;
  }
}