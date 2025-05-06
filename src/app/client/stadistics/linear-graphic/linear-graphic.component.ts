import { Component, ViewChild } from '@angular/core';
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
import { UserService } from '../../../core/services/call-api/user.service';
import { AuthService } from '../../../core/services/auth/auth.service';

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
export class LinearGraphicComponent {
  @ViewChild('chart') chartComponent?: ChartComponent;

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const actualUser = this.authService.currentUserValue;
    if (actualUser) {
      this.userService.getUserStats(actualUser.nickname).subscribe({
        next: (data) => {
          const avgPagesPerDay = data.avg_pages_per_day;
          const monthly = this.generateMonthlyFromAvg(
            avgPagesPerDay,
            data.total_pages_read_completed
          );

          this.chartOptions.series = [
            {
              name: 'Páginas Leídas',
              data: monthly,
              color: '#dc3e3e',
            },
          ];
        },
        error: (err) => {
          console.error('Error al cargar las stats del usuario:', err);
        },
      });
    }
  }

  private generateMonthlyFromAvg(
    avgPerDay: number,
    totalPages: number
  ): number[] {
    const daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const totalDaysInYear = daysPerMonth.reduce((a, b) => a + b, 0); // Total de días en el año
    const adjustedAvgPerDay = totalPages / totalDaysInYear; // Calcular el promedio diario necesario
    // Generar datos mensuales ajustados
    const monthly = daysPerMonth.map((days) =>
      Math.round(adjustedAvgPerDay * days)
    );
    return monthly;
  }

  public chartOptions: ChartOptions = {
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
