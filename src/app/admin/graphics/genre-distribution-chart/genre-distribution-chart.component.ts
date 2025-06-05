import { Component, Input, OnChanges, SimpleChanges, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApexChart, ApexDataLabels, ApexPlotOptions, ApexResponsive, ApexTooltip, ApexLegend, ApexFill, ChartComponent} from 'ng-apexcharts';

export interface GenreData {
  name: string;
  value: number;
  percentage: number;
}

export type ChartOptions = {
  series: number[];
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  tooltip: ApexTooltip;
  legend: ApexLegend;
  labels: string[];
  fill: ApexFill;
  colors: string[];
};

@Component({
  selector: 'app-genre-distribution-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './genre-distribution-chart.component.html',
  styleUrl: './genre-distribution-chart.component.scss'
})
export class GenreDistributionChartComponent implements OnChanges, AfterViewInit {
  @ViewChild('chart') chart!: ChartComponent;
  @Input() data: GenreData[] = [];
  @Input() isLoading = false;

  chartOptions: ChartOptions = this.getDefaultChartOptions();
  topGenres: GenreData[] = [];

  private colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];

  private getDefaultChartOptions(): ChartOptions {
    return {
      series: [],
      chart: {
        type: 'donut',
        height: 280,
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350
          }
        },
        dropShadow: {
          enabled: false
        }
      },
      dataLabels: {
        enabled: false
      },
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: '16px',
                fontWeight: 600,
                color: 'var(--text-color)'
              },
              value: {
                show: true,
                fontSize: '14px',
                fontWeight: 400,
                color: 'var(--border-color)',
                formatter: function (val: string) {
                  return val + '%';
                }
              },
              total: {
                show: true,
                showAlways: false,
                label: 'Total',
                fontSize: '16px',
                fontWeight: 600,
                color: 'var(--text-color)'
              }
            }
          }
        }
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: {
              height: 250
            },
            legend: {
              position: 'bottom'
            }
          }
        },
        {
          breakpoint: 576,
          options: {
            chart: {
              height: 220
            }
          }
        }
      ],
      tooltip: {
        enabled: true,
        style: {
          fontSize: '12px'
        },
        y: {
          formatter: function (val: number, opts: any) {
            const data = opts.w.config.series[opts.seriesIndex];
            return val + ' libros (' + opts.w.config.labels[opts.dataPointIndex] + ')';
          }
        }
      },
      legend: {
        show: false
      },
      labels: [],
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'horizontal',
          shadeIntensity: 0.25,
          gradientToColors: this.colors,
          inverseColors: true,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 50, 100]
        }
      },
      colors: this.colors
    };
  }

  ngAfterViewInit() {
    this.updateChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && !changes['data'].firstChange) {
      this.updateChart();
    }
  }

  private updateChart() {
    if (!this.data || this.data.length === 0) return;

    this.topGenres = this.data.slice(0, 6);

    this.chartOptions.series = this.data.map(item => item.value);
    this.chartOptions.labels = this.data.map(item => item.name);

    if (this.chart) {
      this.chart.updateOptions(this.chartOptions);
    }
  }

  getGenreColor(genreName: string): string {
    const index = this.data.findIndex(item => item.name === genreName);
    return this.colors[index % this.colors.length];
  }

  trackByGenre(index: number, item: GenreData): string {
    return item.name;
  }
}