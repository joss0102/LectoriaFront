import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-cards-stadistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cards-stadistics.component.html',
  styleUrl: './cards-stadistics.component.scss',
})
export class CardsStadisticsComponent {
  stats = [
    {
      icon: 'bi-check2-square',
      label: 'Libros leídos',
      value: 45,
      color: 'bg-success',
    },
    {
      icon: 'bi-journal-x',
      label: 'Pendientes',
      value: 12,
      color: 'bg-danger',
    },
    {
      icon: 'bi-journal-text',
      label: 'Páginas leídas',
      value: '20.000',
      color: 'bg-warning',
    },
    { icon: 'bi-person', label: 'Autores', value: 12, color: 'bg-purple' },
    { icon: 'bi-globe', label: 'Sagas', value: 18, color: 'bg-info' },
  ];
}
