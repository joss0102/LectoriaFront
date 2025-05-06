import { Component, OnInit, ViewChild } from '@angular/core';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexStroke,
  ApexGrid,
  ApexTheme,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ReadingService } from '../../../core/services/call-api/reading.service';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
  theme: ApexTheme;
};

@Component({
  selector: 'app-linear-graphic',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './linear-graphic.component.html',
  styleUrls: ['./linear-graphic.component.scss'],
})
export class LinearGraphicComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private readingService: ReadingService
  ) {}

  ngOnInit(): void {
    const actualUser = this.authService.currentUserValue;
    if (actualUser) {
      this.readingService
        .getReadingProgress(actualUser.nickname, undefined, 1, 1000)
        .subscribe({
          next: (progressData) => {
            const filteredData = progressData.data;
            const monthlyPagesRead = this.generateMonthlyFromProgress(
              filteredData,
              2025 // Filtramos para el año 2025
            );
            this.chartOptions.series = [
              {
                name: 'Páginas Leídas',
                data: monthlyPagesRead,
                color: '#dc3e3e',
              },
            ];
          },
          error: (err) => {
            console.error('Error al obtener el progreso de lectura:', err);
          },
        });
    }
  }

  private generateMonthlyFromProgress(
    progressData: any[],
    year: number
  ): number[] {
    const monthlyPages: number[] = new Array(12).fill(0); // Inicializamos un arreglo para los 12 meses

    progressData.forEach((progress) => {
      const readingDate = new Date(progress.reading_date);
      const progressYear = readingDate.getFullYear(); // Obtiene el año de la lectura
      const monthIndex = readingDate.getMonth(); // Obtiene el índice del mes (0 para Enero, 1 para Febrero, etc.)
      // Solo procesamos las lecturas del año seleccionado (por ejemplo, 2025)
      if (progressYear === year) {
        const pagesRead = Number(progress.pages_read_session); // Páginas leídas en esa sesión
        // Sumamos las páginas leídas a su respectivo mes
        monthlyPages[monthIndex] += pagesRead;
      }
    });

    return monthlyPages;
  }
  @ViewChild('chart') chartComponent?: ChartComponent;
  chartOptions: ChartOptions = {
    series: [
      {
        name: 'Páginas Leídas',
        data: [],
        color: '#dc3e3e',
      },
    ],
    chart: {
      height: '100%',
      width: '100%',
      type: 'line',
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: true,
      },
      fontFamily: 'inherit',
      background: 'transparent',
      foreColor: '#e0e0e0',
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: 4,
    },
    title: {
      text: undefined,
    },
    grid: {
      row: {
        colors: ['transparent', 'transparent'],
        opacity: 0.1,
      },
      borderColor: 'white',
    },
    xaxis: {
      categories: [
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre',
      ],
      labels: {
        style: {
          colors: '#bdbdbd',
        },
      },
    },
    theme: {
      mode: 'dark',
      palette: 'palette1',
    },
  };
}
