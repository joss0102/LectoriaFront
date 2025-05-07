import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { AuthService } from '../../../core/services/auth/auth.service';
import { BookService } from '../../../core/services/call-api/book.service';

@Component({
  selector: 'app-donut-graphic',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './donut-graphic.component.html',
  styleUrls: ['./donut-graphic.component.scss'],
})
export class DonutGraphicComponent implements OnInit {
  public chartOptions: any = null;

  constructor(
    private authService: AuthService,
    private bookService: BookService
  ) {}

  ngOnInit(): void {
    this.bringData();
  }

  bringData() {
    const actualUser = this.authService.currentUserValue;
    if (actualUser) {
      this.bookService
        .getUserBooks(actualUser.nickname, undefined, 1, 1000)
        .subscribe({
          next: (response) => {
            const books = response.data;
            const detailedBooks: any[] = [];
            // Obtener detalles de cada libro
            books.forEach((book) => {
              this.bookService.getBookById(book.book_id).subscribe({
                next: (bookDetails) => {
                  detailedBooks.push(bookDetails);
                  if (detailedBooks.length === books.length) {
                    this.processBooks(detailedBooks); // Procesar despues de obtener todos los libros
                  }
                },
                error: (err) =>
                  console.error('Error al obtener detalles del libro:', err),
              });
            });
          },
          error: (err) =>
            console.error('Error al obtener libros del usuario:', err),
        });
    }
  }
  processBooks(detailedBooks: any[]) {
    const genreCounts: { [genre: string]: number } = {};
    // Contamos los géneros
    detailedBooks.forEach((book) => {
      if (book.genres) {
        book.genres
          .split(',') // serapamos por que puedne venir mas de uno
          .map((g: string) => g.trim())
          .forEach((genre: any) => {
            genreCounts[genre] = (genreCounts[genre] || 0) + 1; // vamos sumando
          });
      } else {
        genreCounts['Otros'] = (genreCounts['Otros'] || 0) + 1;
      }
    });

    // Ordenamos los generos por cantidad
    const sortedGenres = Object.entries(genreCounts).sort(
      (a, b) => b[1] - a[1]
    );

    const totalBooks = detailedBooks.length;
    const labels = [];
    const series = [];
    let othersCount = 0;

    // Procesamos los generos: agregamos los mas comunes y sumamos los menos frecuentes en "Otros"
    sortedGenres.forEach(([genre, count], index) => {
      const percentage = (count / totalBooks) * 100;

      // Si tiene mmas de 10 lbiros, lo agregamos directamente
      if (percentage >= 10) {
        labels.push(genre);
        series.push(count);
      } else {
        // Si es menor a 10 libros, lo agregamos a "Otros"
        othersCount += count;
      }
    });

    // Agregamos la categoría "Otros" si hay géneros menores al 10%
    if (othersCount > 0) {
      labels.push('Otros');
      series.push(othersCount);
    }

    // grafico
    const isMobile = window.innerWidth < 768;
    this.chartOptions = {
      series: series,
      chart: {
        type: 'donut',
        height: isMobile ? 310 : 280,
        animations: { enabled: true },
        background: 'transparent',
      },
      labels: labels,
      colors: [
        '#3B82F6',
        '#10B981',
        '#FF6347',
        '#FFD700',
        '#8A2BE2',
        '#D2691E',
        '#DC143C',
        '#32CD32',
        '#FF1493',
        '#20B2AA',
        '#0000FF',
        '#FF4500',
        '#4B0082',
        '#7FFF00',
        '#F08080',
        '#2E8B57',
        '#A52A2A',
        '#FFC0CB',
        '#8B0000',
        '#B8860B',
        '#00FA9A',
        '#FF8C00',
        '#00BFFF',
        '#C71585',
        '#FFB6C1',
        '#000080',
        '#ADFF2F',
        '#FF00FF',
        '#98FB98',
      ],
      stroke: { show: false, width: 0 },
      legend: {
        position: isMobile ? 'bottom' : 'right',
        labels: { colors: '#ffffff', useSeriesColors: false },
        markers: { width: isMobile ? 10 : 12, height: isMobile ? 10 : 12 },
      },
      plotOptions: {
        pie: { donut: { size: isMobile ? '50%' : '60%' } },
      },
      dataLabels: {
        enabled: true,
        style: { colors: ['#ffffff'], fontSize: isMobile ? '14px' : '12px' },
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: { height: 350 },
            legend: { position: 'bottom', horizontalAlign: 'center' },
          },
        },
      ],
      tooltip: { enabled: true, style: { fontSize: '14px' } },
    };
  }
}
