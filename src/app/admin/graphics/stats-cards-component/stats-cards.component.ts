import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StatsData {
  totalBooks: number;
  activeUsers: number;
  totalAuthors: number;
  averageRating: number;
  totalPages: number;
  completedBooks: number;
}

@Component({
  selector: 'app-stats-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-cards.component.html',
  styleUrl: './stats-cards.component.scss'
})
export class StatsCardsComponent {
  @Input() stats: StatsData = {
    totalBooks: 0,
    activeUsers: 0,
    totalAuthors: 0,
    averageRating: 0,
    totalPages: 0,
    completedBooks: 0
  };
  
  @Input() isLoading = false;

  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  formatLargeNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toLocaleString();
  }
}