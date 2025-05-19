import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth.service';
import { UserService } from '../../../core/services/call-api/user.service';

@Component({
  selector: 'app-cards-stadistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cards-stadistics.component.html',
  styleUrl: './cards-stadistics.component.scss',
})
export class CardsStadisticsComponent implements OnInit {
  stats = [
    {
      icon: 'bi-book',
      label: 'Libros leídos',
      value: 0,
      color: 'bg-success',
    },
    {
      icon: 'bi-bookmark',
      label: 'Pendientes',
      value: 0,
      color: 'bg-danger',
    },
    {
      icon: 'bi-file-text',
      label: 'Páginas leídas',
      value: '0',
      color: 'bg-warning',
    },
    {
      icon: 'bi-bookmark-star',
      label: 'Género favorito',
      value: '',
      color: 'bg-purple',
    },
    { 
      icon: 'bi-person-badge', 
      label: 'Autor favorito', 
      value: '', 
      color: 'bg-info' 
    },
  ];

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadUserStats();
  }
  
  /**
   * Carga las estadísticas del usuario desde el servicio
   */
  loadUserStats(): void {
    const actualUser = this.authService.currentUserValue;
    if (actualUser) {
      this.userService.getUserStats(actualUser.nickname).subscribe({
        next: (response) => {
          this.stats = [
            {
              icon: 'bi-book',
              label: 'Libros leídos',
              value: response.completed_books,
              color: 'bg-success',
            },
            {
              icon: 'bi-bookmark',
              label: 'Pendientes',
              value: response.planned_books,
              color: 'bg-danger',
            },
            {
              icon: 'bi-file-text',
              label: 'Páginas leídas',
              value: response.total_pages_read_completed,
              color: 'bg-warning',
            },
            {
              icon: 'bi-bookmark-star',
              label: 'Género favorito',
              value: response.favorite_genre || 'N/A',
              color: 'bg-purple',
            },
            {
              icon: 'bi-person-badge',
              label: 'Autor favorito',
              value: response.favorite_author || 'N/A',
              color: 'bg-info',
            },
          ];
        },
        error: (error) => {
          console.error('Error al cargar estadísticas del usuario:', error);
        },
      });
    } else {
      console.warn('No hay usuario actualmente logueado');
    }
  }
}