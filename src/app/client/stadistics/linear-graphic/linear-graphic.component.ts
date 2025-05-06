import { Component, ViewChild, ElementRef } from '@angular/core';
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

  public chartOptions: ChartOptions = {
    series: [
      {
        name: 'Páginas Leidas',
        data: [250, 250, 315, 251, 429, 623, 633, 391, 148, 700, 123, 600],
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

  constructor() {}
}
