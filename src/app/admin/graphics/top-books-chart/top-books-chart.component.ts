import { Component, Input, OnChanges, SimpleChanges, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApexChart, ApexDataLabels, ApexPlotOptions, ApexXAxis, ApexYAxis, ApexTooltip, ApexFill, ApexGrid, ChartComponent} from 'ng-apexcharts';

export interface TopBookData {
  title: string;
  readers: number;
  rating: number;
  author: string;
}

export type ChartOptions = {
  series: any[];
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  tooltip: ApexTooltip;
  fill: ApexFill;
  grid: ApexGrid;
  colors: string[];
};
@Component({
  selector: 'app-top-books-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './top-books-chart.component.html',
  styleUrl: './top-books-chart.component.scss'
})
export class TopBooksChartComponent implements OnChanges, AfterViewInit {
  @ViewChild('chart') chart!: ChartComponent;
  @Input() data: TopBookData[] = [];
  @Input() isLoading = false;

  chartOptions: ChartOptions = this.getDefaultChartOptions();
  displayLimit = 10;
  sortBy: 'readers' | 'rating' = 'readers';

  private getDefaultChartOptions(): ChartOptions {
    return {
      series: [],
      chart: {
        type: 'bar',
        height: 400,
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        },
        toolbar: {
          show: false
        }
      },
      dataLabels: {
        enabled: true,
        formatter: function (val: string) {
          return val.toString();
        },
        style: {
          fontSize: '12px',
          fontWeight: 'bold',
          colors: ['#fff']
        }
      },
      plotOptions: {
        bar: {
          borderRadius: 6,
          horizontal: true,
          barHeight: '70%',
          distributed: false
        }
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
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: 'var(--text-color)',
            fontSize: '11px'
          },
          maxWidth: 120,
        formatter: function (val: number) {
          return val.toString().length > 20 ? val.toString().substring(0, 20) + '...' : val.toString();
        }
        }
      },
      tooltip: {
        shared: false,
        intersect: true,
        theme: 'dark',
        style: {
          fontSize: '12px'
        },
        custom: function({ series, seriesIndex, dataPointIndex, w }: any) {
          const book = w.config.customData[dataPointIndex];
          return `
            <div class="custom-tooltip">
              <div class="tooltip-title">${book.title}</div>
              <div class="tooltip-author">por ${book.author}</div>
              <div class="tooltip-stats">
                <div>👥 ${book.readers} lectores</div>
                <div>⭐ ${book.rating}/5.0</div>
              </div>
            </div>
          `;
        }
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'horizontal',
          shadeIntensity: 0.25,
          gradientToColors: undefined,
          inverseColors: false,
          opacityFrom: 0.85,
          opacityTo: 0.85,
          stops: [50, 0, 100]
        }
      },
      grid: {
        show: true,
        borderColor: 'rgba(var(--border-color-rgb), 0.1)',
        strokeDashArray: 3,
        xaxis: {
          lines: {
            show: true
          }
        },
        yaxis: {
          lines: {
            show: false
          }
        }
      },
      colors: ['var(--bs-btn)']
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

    const sortedData = this.getSortedDataPrivate();
    const limitedData = sortedData.slice(0, this.displayLimit);

    const categories = limitedData.map(book => book.title);
    const values = limitedData.map(book => 
      this.sortBy === 'readers' ? book.readers : book.rating
    );

    this.chartOptions.series = [{
      name: this.sortBy === 'readers' ? 'Lectores' : 'Valoración',
      data: values
    }];

    this.chartOptions.xaxis = {
      ...this.chartOptions.xaxis,
      categories: categories
    };

    if (this.chartOptions.tooltip && typeof this.chartOptions.tooltip === 'object') {
      (this.chartOptions as any).customData = limitedData;
    }

    if (this.chart) {
      this.chart.updateOptions(this.chartOptions);
    }
  }

  private getSortedDataPrivate(): TopBookData[] {
    return [...this.data].sort((a, b) => {
      if (this.sortBy === 'readers') {
        return b.readers - a.readers;
      } else {
        return b.rating - a.rating;
      }
    });
  }

  getSortedData(): TopBookData[] {
    return this.getSortedDataPrivate();
  }

  setSortBy(sortBy: 'readers' | 'rating') {
    this.sortBy = sortBy;
    this.updateChart();
  }

  setDisplayLimit(limit: number) {
    this.displayLimit = limit;
    this.updateChart();
  }

  getTopBook(): TopBookData | null {
    const sorted = this.getSortedDataPrivate();
    return sorted.length > 0 ? sorted[0] : null;
  }

  getAverageRating(): number {
    if (this.data.length === 0) return 0;
    const sum = this.data.reduce((acc, book) => acc + book.rating, 0);
    return sum / this.data.length;
  }

  getTotalReaders(): number {
    return this.data.reduce((acc, book) => acc + book.readers, 0);
  }

  trackByBook(index: number, item: TopBookData): string {
    return item.title;
  }
  onDisplayLimitChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.setDisplayLimit(+target.value);
  }
}