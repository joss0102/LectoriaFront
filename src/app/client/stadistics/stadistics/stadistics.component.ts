import { Component } from '@angular/core';
import { LinearGraphicComponent } from '../linear-graphic/linear-graphic.component';
import { SemiCircleGaugeComponent } from '../semi-circle-gauge/semi-circle-gauge.component';
import { DonutGraphicComponent } from '../donut-graphic/donut-graphic.component';

@Component({
  selector: 'app-stadistics',
  standalone: true,
  imports: [
    LinearGraphicComponent,
    SemiCircleGaugeComponent,
    DonutGraphicComponent,
  ],
  templateUrl: './stadistics.component.html',
  styleUrl: './stadistics.component.scss',
})
export class StadisticsComponent {}
