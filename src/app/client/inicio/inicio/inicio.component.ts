import { Component } from '@angular/core';
import { DatosComponent } from "../datos/datos.component";
import { Imagen1Component } from "../imagen1/imagen1.component";
import { Imagen2Component } from "../imagen2/imagen2.component";
import { CarruselComponent } from "../carrusel/carrusel.component";

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [DatosComponent, Imagen1Component, Imagen2Component, CarruselComponent],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.scss'
})
export class InicioComponent {

}
