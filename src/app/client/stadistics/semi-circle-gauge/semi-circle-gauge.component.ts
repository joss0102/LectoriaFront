import { Component, OnInit } from '@angular/core';
import {
  ApexChart,
  ApexTitleSubtitle,
  ApexPlotOptions,
  ApexStroke,
  ApexTheme,
  ApexDataLabels,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { AuthService } from '../../../core/services/auth/auth.service';
import { UserService } from '../../../core/services/call-api/user.service';
import { UserStatsResponse } from '../../../core/models/call-api/user.model';

export type ChartOptions = {
  series: number[];
  chart: ApexChart;
  plotOptions: ApexPlotOptions;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
  theme: ApexTheme;
  dataLabels: ApexDataLabels;
};

@Component({
  selector: 'app-semi-circle-gauge',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './semi-circle-gauge.component.html',
  styleUrls: ['./semi-circle-gauge.component.scss'],
})
export class SemiCircleGaugeComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private userStats: UserService
  ) {}

  ngOnInit(): void {
    this.bringUserData();
  }

  bringUserData() {
    const actualUser = this.authService.currentUserValue;

    if (actualUser && actualUser.nickname) {
      this.userStats.getUserStats(actualUser.nickname).subscribe({
        next: (response: UserStatsResponse) => {
          if (response && response.average_rating !== undefined) {
            this.chartOptions.series = [response.average_rating * 10];
          }
        },
        error: (error) => {
          console.error('error con los datos:', error);
        },
      });
    } else {
      console.warn('No hay usuario logeado');
    }
  }

  public chartOptions: ChartOptions = {
    series: [0],
    chart: {
      height: 350,
      type: 'radialBar',
      background: 'transparent',
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        hollow: {
          margin: 0,
          size: '65%',
          background: 'transparent',
        },
        track: {
          background: '#f2f2f2',
          strokeWidth: '97%',
          margin: 5,
          dropShadow: {
            enabled: false,
          },
        },
        dataLabels: {
          name: {
            show: false,
            fontSize: '16px',
            fontWeight: 'bold',
            offsetY: -10,
            color: '#333',
          },
          value: {
            offsetY: -20,
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'white',
            formatter: function (val) {
              return (val / 10).toFixed(2) + ' ⭐️';
            },
          },
        },
      },
    },
    stroke: {
      lineCap: 'round',
    },
    title: {
      text: ' ',
      align: 'center',
      margin: 10,
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: 'white',
      },
    },
    theme: {
      mode: 'light',
      palette: 'palette5',
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '24px',
        fontFamily: undefined,
        fontWeight: 'bold',
        colors: ['#dc3e3e'],
      },
      background: {
        enabled: false,
      },
    },
  };
}
