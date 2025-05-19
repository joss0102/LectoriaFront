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
  ApexTooltip,
  ApexYAxis,
  ApexFill,
  ApexMarkers,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ReadingService } from '../../../core/services/call-api/reading.service';
import { NgIf } from '@angular/common';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
  theme: ApexTheme;
  tooltip: ApexTooltip;
  yaxis: ApexYAxis;
  fill: ApexFill;
  markers: ApexMarkers;
};

@Component({
  selector: 'app-linear-graphic',
  standalone: true,
  imports: [NgApexchartsModule,NgIf],
  templateUrl: './linear-graphic.component.html',
  styleUrls: ['./linear-graphic.component.scss'],
})
export class LinearGraphicComponent implements OnInit {
  @ViewChild('chart') chartComponent?: ChartComponent;
  isLoading: boolean = true;
  noData: boolean = false;
  currentYear: number = new Date().getFullYear();
  selectedYear: number = new Date().getFullYear();
  progressData: any[] = [];
  
  chartOptions: ChartOptions = {
    series: [
      {
        name: 'Páginas Leídas',
        data: [],
        color: 'var(--bs-btn)',
      },
    ],
    chart: {
      height: '100%',
      width: '100%',
      type: 'area',
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false,
        },
      },
      fontFamily: 'inherit',
      background: 'transparent',
      foreColor: 'var(--text-color)',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150,
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    title: {
      text: undefined,
    },
    grid: {
      row: {
        colors: ['transparent', 'transparent'],
        opacity: 0.1,
      },
      borderColor: 'rgba(255, 255, 255, 0.1)',
      show: true,
      strokeDashArray: 3,
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
          colors: 'var(--text-color)',
          fontSize: '12px',
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    theme: {
      mode: 'dark',
    },
    tooltip: {
      theme: 'dark',
      x: {
        show: true,
      },
      y: {
        title: {
          formatter: () => 'Páginas:',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: 'var(--text-color)',
          fontSize: '12px',
        },
        formatter: (value) => {
          return Math.round(value).toString();
        },
      },
      min: 0,
      tickAmount: 5,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'vertical',
        shadeIntensity: 0.4,
        gradientToColors: undefined,
        inverseColors: false,
        opacityFrom: 0.8,
        opacityTo: 0.2,
        stops: [0, 90, 100],
      },
    },
    markers: {
      size: 5,
      colors: ['var(--bs-btn)'],
      strokeColors: '#fff',
      strokeWidth: 2,
      hover: {
        size: 7,
      },
    },
  };

  constructor(
    private authService: AuthService,
    private readingService: ReadingService
  ) {}

  ngOnInit(): void {
    this.loadReadingProgressData();
  }

  /**
   * Cambia el año seleccionado y actualiza el gráfico
   */
  changeYear(delta: number): void {
    this.selectedYear += delta;
    this.updateChartForYear();
  }

  /**
   * Carga los datos de progreso de lectura del usuario
   */
  loadReadingProgressData(): void {
    this.isLoading = true;
    const actualUser = this.authService.currentUserValue;
    
    if (actualUser) {
      this.readingService
        .getReadingProgress(actualUser.nickname, undefined, 1, 1000)
        .subscribe({
          next: (progressData) => {
            this.progressData = progressData.data;
            this.updateChartForYear();
          },
          error: (err) => {
            console.error('Error al obtener el progreso de lectura:', err);
            this.isLoading = false;
            this.noData = true;
          },
        });
    } else {
      this.isLoading = false;
      this.noData = true;
    }
  }

  /**
   * Actualiza el gráfico con los datos del año seleccionado
   */
  updateChartForYear(): void {
    this.isLoading = true;
    
    setTimeout(() => {
      const monthlyPagesRead = this.generateMonthlyFromProgress(
        this.progressData,
        this.selectedYear
      );
      
      this.chartOptions.series = [
        {
          name: 'Páginas Leídas',
          data: monthlyPagesRead,
          color: 'var(--bs-btn)',
        },
      ];
      
      // Verificar si hay datos para mostrar
      this.noData = monthlyPagesRead.every(value => value === 0);
      this.isLoading = false;
    }, 300); // Pequeño retraso para mostrar la animación de carga
  }

  /**
   * Genera los datos mensuales de páginas leídas a partir del progreso de lectura
   */
  private generateMonthlyFromProgress(
    progressData: any[],
    year: number
  ): number[] {
    const monthlyPages: number[] = new Array(12).fill(0);

    if (!progressData || progressData.length === 0) {
      return monthlyPages;
    }

    progressData.forEach((progress) => {
      const readingDate = new Date(progress.reading_date);
      const progressYear = readingDate.getFullYear();
      const monthIndex = readingDate.getMonth();
      
      if (progressYear === year) {
        const pagesRead = Number(progress.pages_read_session);
        monthlyPages[monthIndex] += pagesRead;
      }
    });

    return monthlyPages;
  }
}