import { Component } from '@angular/core';

@Component({
  selector: 'app-mini-graphic',
  standalone: true,
  imports: [],
  templateUrl: './mini-graphic.component.html',
  styleUrls: ['./mini-graphic.component.scss'],
})
export class MiniGraphicComponent {
  avg_pages_per_day: string = '73.02';
  avg_reading_days_per_book: string = '7.6897';
  getFormattedNumber(value: string): string {
    const num = parseFloat(value);
    return num.toFixed(2);
  }
}
