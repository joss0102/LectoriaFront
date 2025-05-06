import { Component } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-donut-graphic',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './donut-graphic.component.html',
  styleUrls: ['./donut-graphic.component.scss'],
})
export class DonutGraphicComponent {
  public chartOptions: any;

  constructor() {
    const isMobile = window.innerWidth < 768; // Detecta móviles

    this.chartOptions = {
      series: [35, 25, 20, 15, 5],
      chart: {
        type: 'donut',
        height: isMobile ? 310 : 280, // Mayor altura en móviles
        animations: {
          enabled: true,
        },
        background: 'transparent',
      },
      labels: ['Fantasía', 'Ciencia Ficción', 'Romance', 'Misterio', 'Otros'],
      colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
      stroke: {
        show: false,
        width: 0,
      },
      legend: {
        position: isMobile ? 'bottom' : 'right', // Leyenda abajo en móviles
        labels: {
          colors: '#ffffff',
          useSeriesColors: false,
        },
        markers: {
          width: isMobile ? 10 : 12,
          height: isMobile ? 10 : 12,
        },
      },
      plotOptions: {
        pie: {
          donut: {
            size: isMobile ? '50%' : '60%', // Agujero más pequeño en móviles
          },
        },
      },
      dataLabels: {
        enabled: true,
        style: {
          colors: ['#ffffff'],
          fontSize: isMobile ? '14px' : '12px', // Texto más grande en móviles
        },
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: {
              height: 350,
            },
            legend: {
              position: 'bottom',
              horizontalAlign: 'center',
            },
          },
        },
      ],
      tooltip: {
        enabled: true,
        style: {
          fontSize: '14px',
        },
      },
    };
  }
}
