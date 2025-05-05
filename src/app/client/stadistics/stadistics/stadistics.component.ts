import { Component } from '@angular/core';
import { LinearGraphicComponent } from '../linear-graphic/linear-graphic.component';

@Component({
  selector: 'app-stadistics',
  standalone: true,
  imports: [LinearGraphicComponent],
  templateUrl: './stadistics.component.html',
  styleUrl: './stadistics.component.scss',
})
export class StadisticsComponent {}
