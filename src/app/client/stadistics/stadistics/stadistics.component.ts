import { Component } from '@angular/core';
import { LinearGraphicComponent } from '../linear-graphic/linear-graphic.component';
import { SemiCircleGaugeComponent } from '../semi-circle-gauge/semi-circle-gauge.component';
import { DonutGraphicComponent } from '../donut-graphic/donut-graphic.component';
import { CardsStadisticsComponent } from '../cards-stadistics/cards-stadistics.component';
import { FavouriteBooksComponent } from '../favourite-books/favourite-books.component';
import { MiniGraphicComponent } from '../mini-graphic/mini-graphic.component';

@Component({
  selector: 'app-stadistics',
  standalone: true,
  imports: [
    LinearGraphicComponent,
    SemiCircleGaugeComponent,
    DonutGraphicComponent,
    CardsStadisticsComponent,
    FavouriteBooksComponent,
    MiniGraphicComponent,
  ],
  templateUrl: './stadistics.component.html',
  styleUrl: './stadistics.component.scss',
})
export class StadisticsComponent {}