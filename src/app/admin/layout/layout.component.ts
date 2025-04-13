import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { ThemeColorComponent } from '../theme-color/theme-color.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, HeaderComponent,ThemeColorComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponentAdmin implements OnInit {
  isSidebarOpen = false;
  isSmallScreen = false;
  isThemeModalOpen = false;

  constructor() {}

  ngOnInit() {
    this.checkScreenSize();
    this.loadSavedTheme();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    const wasSmallScreen = this.isSmallScreen;
    this.isSmallScreen = window.innerWidth < 1300;
    
    if (wasSmallScreen && !this.isSmallScreen) {
      this.isSidebarOpen = false;
    } 
    else if (!wasSmallScreen && this.isSmallScreen) {
      this.isSidebarOpen = false;
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  openThemeModal() {
    this.isThemeModalOpen = true;
    if (this.isSmallScreen && this.isSidebarOpen) {
      this.isSidebarOpen = false;
    }
  }

  closeThemeModal() {
    this.isThemeModalOpen = false;
  }

  handleThemeChanged(event: {theme: string, accent: string}) {
    document.body.classList.remove(...this.getThemeClasses());
    document.body.classList.add(`tema-${event.theme}`);
    document.documentElement.style.setProperty('--accent-color', event.accent);
  }

  loadSavedTheme(): void {
    const savedTheme = localStorage.getItem('appTheme');
    if (savedTheme) {
      document.body.classList.remove(...this.getThemeClasses());
      document.body.classList.add(`tema-${savedTheme}`);
    } else {
      document.body.classList.add('tema-noche');
    }
    
    const savedAccent = localStorage.getItem('accentColor');
    if (savedAccent) {
      document.documentElement.style.setProperty('--accent-color', savedAccent);
    }
  }

  getThemeClasses(): string[] {
    return ['tema-noche', 'tema-dia', 'tema-artico', 'tema-bosque', 'tema-atardecer'];
  }
}