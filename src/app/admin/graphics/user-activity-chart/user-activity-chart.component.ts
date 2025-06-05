import { Component, Input, OnChanges, SimpleChanges, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import {ApexChart, ApexDataLabels, ApexStroke, ApexXAxis, ApexYAxis, ApexTooltip, ApexFill, ApexMarkers, ApexGrid, ApexLegend, ChartComponent} from 'ng-apexcharts';

  export interface UserActivityData {
  month: string;
  newUsers: number;
  activeUsers: number;
  }

  export type ChartOptions = {
  series: any[];
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  tooltip: ApexTooltip;
  fill: ApexFill;
  markers: ApexMarkers;
  grid: ApexGrid;
  legend: ApexLegend;
  colors: string[];
  };

  @Component({
  selector: 'app-user-activity-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './user-activity-chart.component.html',
  styleUrl: './user-activity-chart.component.scss'
  })
  export class UserActivityChartComponent implements OnChanges, AfterViewInit {
  @ViewChild('chart') chart!: ChartComponent;
  @Input() data: UserActivityData[] = [];
  @Input() isLoading = false;

  chartOptions: ChartOptions = this.getDefaultChartOptions();
  viewMode: 'combined' | 'new' | 'active' = 'combined';

  ngAfterViewInit() {
    this.updateChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && !changes['data'].firstChange) {
      this.updateChart();
    }
  }

  private getDefaultChartOptions(): ChartOptions {
    return {
      series: [],
      chart: {
        type: 'area',
        height: 320,
        stacked: false,
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        },
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: false,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true
          }
        },
        zoom: {
          enabled: true,
          type: 'x',
          autoScaleYaxis: true
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth',
        width: [3, 2]
      },
      xaxis: {
        categories: [],
        labels: {
          style: {
            colors: 'var(--text-color)',
            fontSize: '12px'
          }
        },
        axisBorder: {
          show: true,
          color: 'rgba(var(--border-color-rgb), 0.2)'
        },
        axisTicks: {
          show: true,
          color: 'rgba(var(--border-color-rgb), 0.2)'
        }
      },
      yaxis: {
        title: {
          text: 'Número de Usuarios',
          style: {
            color: 'var(--text-color)',
            fontSize: '12px',
            fontWeight: 500
          }
        },
        labels: {
          style: {
            colors: 'var(--text-color)',
            fontSize: '12px'
          }
        }
      },
      tooltip: {
        shared: true,
        intersect: false,
        theme: 'dark',
        style: {
          fontSize: '12px'
        },
        y: {
          formatter: function (val: number) {
            return val + ' usuarios';
          }
        }
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.2,
          stops: [0, 100]
        }
      },
      markers: {
        size: 4,
        colors: ['#fff'],
        strokeColors: ['#10b981', 'var(--bs-btn)'],
        strokeWidth: 2,
        hover: {
          size: 6
        }
      },
      grid: {
        show: true,
        borderColor: 'rgba(var(--border-color-rgb), 0.1)',
        strokeDashArray: 3,
        xaxis: {
          lines: {
            show: false
          }
        },
        yaxis: {
          lines: {
            show: true
          }
        }
      },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'center',
        fontSize: '12px',
        fontWeight: 500,
        labels: {
          colors: 'var(--text-color)'
        },
        markers: {
          width: 8,
          height: 8,
          radius: 4
        }
      },
      colors: ['#10b981', 'var(--bs-btn)']
    };
  }

  private updateChart() {
    if (!this.data || this.data.length === 0) return;

    const categories = this.data.map(item => item.month);
    let series: any[] = [];

    switch (this.viewMode) {
      case 'combined':
        series = [
          {
            name: 'Nuevos Usuarios',
            type: 'area',
            data: this.data.map(item => item.newUsers)
          },
          {
            name: 'Usuarios Activos',
            type: 'area',
            data: this.data.map(item => item.activeUsers)
          }
        ];
        break;
      case 'new':
        series = [
          {
            name: 'Nuevos Usuarios',
            type: 'area',
            data: this.data.map(item => item.newUsers)
          }
        ];
        break;
      case 'active':
        series = [
          {
            name: 'Usuarios Activos',
            type: 'area',
            data: this.data.map(item => item.activeUsers)
          }
        ];
        break;
    }

    this.chartOptions.series = series;
    this.chartOptions.xaxis = {
      ...this.chartOptions.xaxis,
      categories: categories
    };

    if (this.chart) {
      this.chart.updateOptions(this.chartOptions);
    }
  }

  setViewMode(mode: 'combined' | 'new' | 'active') {
    this.viewMode = mode;
    this.updateChart();
  }

  getTotalNewUsers(): number {
    return this.data.reduce((sum, item) => sum + item.newUsers, 0);
  }

  getAverageActiveUsers(): number {
    if (this.data.length === 0) return 0;
    const sum = this.data.reduce((sum, item) => sum + item.activeUsers, 0);
    return Math.round(sum / this.data.length);
  }

  getGrowthRate(): number {
    if (this.data.length < 2) return 0;
    const first = this.data[0].newUsers;
    const last = this.data[this.data.length - 1].newUsers;
    return first > 0 ? Math.round(((last - first) / first) * 100) : 0;
  }

  getPeakMonth(): string {
    if (this.data.length === 0) return '';
    const peak = this.data.reduce((max, item) => 
      item.activeUsers > max.activeUsers ? item : max
    );
    return peak.month;
  }
}