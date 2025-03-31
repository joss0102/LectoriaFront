import { Component } from '@angular/core';
import { DataComponent } from '../data/data.component';
import { Img1Component } from '../img1/img1.component';
import { Img2Component } from '../img2/img2.component';
import { CarruselComponent } from '../carrusel/carrusel.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [DataComponent, Img1Component, Img2Component, CarruselComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent { }
