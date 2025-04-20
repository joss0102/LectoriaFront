import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth/auth.service';

interface MenuItem {
  icon: string;
  label: string;
  link: string;
  active?: boolean;
  subItems?: MenuItem[];
  action?: () => void;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, NgIf, NgFor],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  @Output() openThemeModal = new EventEmitter<void>();

  menuItems: MenuItem[] = [
    {
      icon: 'dashboard',
      label: 'Inicio',
      link: '/app/dashboard'
    },
    {
      icon: 'people',
      label: 'Usuarios',
      link: '/app/users'
    },
    {
      icon: 'menu_book',
      label: 'Libros',
      link: '/app/books'
    },
    {
      icon: 'person',
      label: 'Autores',
      link: '/app/authors'
    },
    {
      icon: 'settings',
      label: 'Más ajustes',
      link: '/app/settings',
      subItems: [
        {
          icon: 'person',
          label: 'Perfil',
          link: '/app/dashboard'
        },
        {
          icon: 'security',
          label: 'Seguridad',
          link: '/app/dashboard'
        },
        {
          icon: 'notifications',
          label: 'Notificaciones',
          link: '/app/dashboard'
        },
        {
          icon: 'palette',
          label: 'Temas de colores',
          link: '/settings/theme',
          action: () => this.onOpenThemeModal()
        }
      ]
    }
  ];

  expandedItem: MenuItem | null = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.setActiveMenuItem(this.router.url);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.setActiveMenuItem(event.url);
    });
  }

  setActiveMenuItem(url: string): void {
    this.menuItems.forEach(item => {
      item.active = false;
      if (item.subItems) {
        item.subItems.forEach(subItem => {
          subItem.active = false;
        });
      }
    });

    const setActive = (items: MenuItem[]): boolean => {
      for (const item of items) {
        if (url.startsWith(item.link) && item.link !== '/') {
          item.active = true;
          if (item.subItems && item.subItems.length > 0) {
            this.expandedItem = item;
            for (const subItem of item.subItems) {
              if (url.startsWith(subItem.link)) {
                subItem.active = true;
                return true;
              }
            }
          }
          return true;
        }
      }
      return false;
    };

    setActive(this.menuItems);
  }

  toggleSubItems(item: MenuItem): void {
    if (this.expandedItem === item) {
      this.expandedItem = null;
    } else {
      this.expandedItem = item;
    }
  }

  hasSubItems(item: MenuItem): boolean {
    return !!item.subItems && item.subItems.length > 0;
  }
  
  onOpenThemeModal(): void {
    this.openThemeModal.emit();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Error al cerrar sesión:', error);
        // Incluso si hay un error, intentamos navegar al login
        this.router.navigate(['/login']);
      }
    });
  }
}