import { Component } from '@angular/core';
import { LinearGraphicComponent } from '../linear-graphic/linear-graphic.component';
import { SemiCircleGaugeComponent } from '../semi-circle-gauge/semi-circle-gauge.component';

@Component({
  selector: 'app-stadistics',
  standalone: true,
  imports: [LinearGraphicComponent, SemiCircleGaugeComponent],
  templateUrl: './stadistics.component.html',
  styleUrl: './stadistics.component.scss',
})
export class StadisticsComponent {}
