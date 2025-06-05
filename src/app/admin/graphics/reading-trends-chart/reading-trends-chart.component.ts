import { Component, Input, OnChanges, SimpleChanges, ViewChild, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApexChart, ApexDataLabels, ApexStroke, ApexXAxis, ApexYAxis, ApexTooltip, ApexFill, ApexMarkers, ApexGrid, ChartComponent} from 'ng-apexcharts';

export interface ReadingTrendsData {
  month: string;
  pages: number;
  books: number;
  year?: number;
  date?: Date;
}

export type ChartOptions = {
  series: any[];
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis | ApexYAxis[];
  tooltip: ApexTooltip;
  fill: ApexFill;
  markers: ApexMarkers;
  grid: ApexGrid;
  colors: string[];
};

@Component({
  selector: 'app-reading-trends-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './reading-trends-chart.component.html',
  styleUrl: './reading-trends-chart.component.scss'
})
export class ReadingTrendsChartComponent implements OnChanges, AfterViewInit {
  @ViewChild('chart') chart!: ChartComponent;
  @Input() data: ReadingTrendsData[] = [];
  @Input() isLoading = false;
  @Output() yearChanged = new EventEmitter<number>();

  chartOptions: ChartOptions = this.getDefaultChartOptions();
  currentYear = new Date().getFullYear();
  selectedMetric: 'pages' | 'books' = 'pages';
  selectedYear = new Date().getFullYear();
  
  availableYears: number[] = [];
  
  filteredData: ReadingTrendsData[] = [];

  private getDefaultChartOptions(): ChartOptions {
    return {
      series: [],
      chart: {
        type: 'area',
        height: 320,
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        },
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
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
        width: 3
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
      yaxis: [
        {
          title: {
            text: 'Páginas Leídas',
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
            },
            formatter: function (val: number) {
              return val >= 1000 ? (val / 1000).toFixed(1) + 'K' : val.toString();
            }
          }
        },
        {
          opposite: true,
          title: {
            text: 'Libros Leídos',
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
        }
      ],
      tooltip: {
        shared: true,
        intersect: false,
        theme: 'dark',
        style: {
          fontSize: '12px'
        },
        y: [
          {
            formatter: function (val: number) {
              return val.toLocaleString() + ' páginas';
            }
          },
          {
            formatter: function (val: number) {
              return val + ' libros';
            }
          }
        ]
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.1,
          stops: [0, 100]
        }
      },
      markers: {
        size: 5,
        colors: ['#fff'],
        strokeColors: ['var(--bs-btn)', '#10b981'],
        strokeWidth: 2,
        hover: {
          size: 7
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
      colors: ['var(--bs-btn)', '#10b981']
    };
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.updateChart();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && !changes['data'].firstChange) {
      this.processDataWithYears();
      setTimeout(() => {
        this.updateChart();
      });
    } else if (changes['data'] && changes['data'].firstChange) {
      this.processDataWithYears();
    }
  }

  private processDataWithYears() {
    if (!this.data || this.data.length === 0) {
      this.availableYears = [this.currentYear];
      this.selectedYear = this.currentYear;
      this.filteredData = [];
      return;
    }


    const years = new Set<number>();
    
    this.data.forEach(item => {
      if (item.year) {
        years.add(item.year);
      } else {
        years.add(this.currentYear);
      }
    });

    this.availableYears = Array.from(years).sort((a, b) => b - a);
    
    if (!this.selectedYear || !this.availableYears.includes(this.selectedYear)) {
      this.selectedYear = this.availableYears[0] || this.currentYear;
    }

    this.filterDataByYear();
  }

  private filterDataByYear() {
    if (!this.data || this.data.length === 0) {
      this.filteredData = this.createEmptyMonthsData();
      return;
    }


    this.filteredData = this.data.filter(item => {
      const itemYear = item.year || this.currentYear;
      return itemYear === this.selectedYear;
    });


    if (this.filteredData.length === 0) {
      this.filteredData = this.createEmptyMonthsData();
    } else {
      this.filteredData = this.ensureAllMonthsPresent(this.filteredData);
    }

  }

  private createEmptyMonthsData(): ReadingTrendsData[] {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return months.map(month => ({
      month,
      pages: 0,
      books: 0,
      year: this.selectedYear
    }));
  }

  private ensureAllMonthsPresent(data: ReadingTrendsData[]): ReadingTrendsData[] {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const existingMonths = new Set(data.map(item => item.month));
    
    const completeData = months.map(month => {
      const existing = data.find(item => item.month === month);
      return existing || {
        month,
        pages: 0,
        books: 0,
        year: this.selectedYear
      };
    });
    
    return completeData;
  }

  private updateChart() {
    if (!this.filteredData || this.filteredData.length === 0) {
      return;
    }

    if (!this.chart) {
      return;
    }

    try {
      const categories = this.filteredData.map(item => item.month);
      const pagesData = this.filteredData.map(item => item.pages || 0);
      const booksData = this.filteredData.map(item => item.books || 0);
      const newSeries = [
        {
          name: 'Páginas Leídas',
          type: 'area',
          data: pagesData,
          yAxisIndex: 0
        },
        {
          name: 'Libros Leídos',
          type: 'line',
          data: booksData,
          yAxisIndex: 1
        }
      ];

      const newOptions = {
        ...this.chartOptions,
        series: newSeries,
        xaxis: {
          ...this.chartOptions.xaxis,
          categories: categories
        }
      };

      this.chartOptions = newOptions;
      this.chart.updateOptions(newOptions, false, true, true);
      
      
    } catch (error) {
      console.error('Error updating chart:', error);
    }
  }

  switchMetric(metric: 'pages' | 'books') {
    this.selectedMetric = metric;
  }

  changeYear(year: number) {
    this.selectedYear = year;
    this.filterDataByYear();
    setTimeout(() => {
      this.updateChart();
    });
    this.yearChanged.emit(year);
  }

  getTotalPages(): number {
    return this.filteredData.reduce((sum, item) => sum + item.pages, 0);
  }

  getTotalBooks(): number {
    return this.filteredData.reduce((sum, item) => sum + item.books, 0);
  }

  getAveragePages(): number {
    if (this.filteredData.length === 0) return 0;
    return Math.round(this.getTotalPages() / this.filteredData.length);
  }

  getAverageBooks(): number {
    if (this.filteredData.length === 0) return 0;
    return Math.round(this.getTotalBooks() / this.filteredData.length);
  }

  goToPreviousYear() {
    const currentIndex = this.availableYears.indexOf(this.selectedYear);
    if (currentIndex < this.availableYears.length - 1) {
      this.changeYear(this.availableYears[currentIndex + 1]);
    }
  }

  goToNextYear() {
    const currentIndex = this.availableYears.indexOf(this.selectedYear);
    if (currentIndex > 0) {
      this.changeYear(this.availableYears[currentIndex - 1]);
    }
  }

  canGoToPreviousYear(): boolean {
    const currentIndex = this.availableYears.indexOf(this.selectedYear);
    return currentIndex < this.availableYears.length - 1;
  }

  canGoToNextYear(): boolean {
    const currentIndex = this.availableYears.indexOf(this.selectedYear);
    return currentIndex > 0;
  }

  hasNoDataForSelectedYear(): boolean {
    return this.filteredData.every(item => item.pages === 0 && item.books === 0);
  }
}