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
  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadUserStats();
  }
  loadUserStats(): void {
    const actualUser = this.authService.currentUserValue;
    if (actualUser) {
      this.userService.getUserStats(actualUser.nickname).subscribe({
        next: (response) => {
          // actualizamos los datos de stats abajo con la API  y de cada USER
          this.stats = [
            {
              icon: 'bi-check2-square',
              label: 'Libros leídos',
              value: response.completed_books,
              color: 'bg-success',
            },
            {
              icon: 'bi-journal-x',
              label: 'Pendientes',
              value: response.planned_books,
              color: 'bg-danger',
            },
            {
              icon: 'bi-journal-text',
              label: 'Páginas leídas',
              value: response.total_pages_read_completed,
              color: 'bg-warning',
            },
            {
              icon: 'bi-person',
              label: 'Género favorito',
              value: response.favorite_genre || '0',
              color: 'bg-purple',
            },
            {
              icon: 'bi-globe',
              label: 'Autor favorito',
              value: response.favorite_author || '0',
              color: 'bg-info',
            },
          ];
        },
        error: (error) => {
          console.error('Error trayendo datos :', error);
        },
      });
    } else {
      console.warn('No hay user actualmente logeado');
    }
  }
  stats = [
    {
      icon: 'bi-check2-square',
      label: 'Libros leídos',
      value: 0,
      color: 'bg-success',
    },
    {
      icon: 'bi-journal-x',
      label: 'Pendientes',
      value: 0,
      color: 'bg-danger',
    },
    {
      icon: 'bi-journal-text',
      label: 'Páginas leídas',
      value: '0',
      color: 'bg-warning',
    },
    {
      icon: 'bi-person',
      label: 'Género favorito',
      value: '',
      color: 'bg-purple',
    },
    { icon: 'bi-globe', label: 'Autor favorito', value: '', color: 'bg-info' },
  ];
}
