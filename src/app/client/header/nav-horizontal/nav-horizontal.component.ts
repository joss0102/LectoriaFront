import { Component } from '@angular/core';

import { InicioComponent } from '../../inicio/inicio.component';
import { BibliotecaComponent } from '../../biblioteca/biblioteca.component';


import { AjustesComponent } from '../../ajustes/ajustes.component';
import { CalificacionesComponent } from '../../calificaciones/calificaciones.component';
import { EstadisticasComponent } from '../../estadisticas/estadisticas.component';
import { BuscadorAutoresComponent } from '../../features/buscador-autores/buscador-autores.component';
import { BuscadorLibrosComponent } from '../../features/buscador-libros/buscador-libros.component';
import { InicioSesionComponent } from '../../features/inicio-sesion/inicio-sesion.component';
import { RegistroComponent } from '../../features/registro/registro.component';

import { LecturaActualComponent } from '../../lectura-actual/lectura-actual.component';
import { PendientesComponent } from '../../pendientes/pendientes.component';

import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-nav-horizontal',
  standalone: true,
  imports: [
    NgIf,
    InicioComponent,
    BibliotecaComponent,
    NgClass,
    AjustesComponent,
    CalificacionesComponent,
    EstadisticasComponent,
    BuscadorAutoresComponent,
    BuscadorLibrosComponent,
    InicioSesionComponent,
    RegistroComponent,
    LecturaActualComponent,
    PendientesComponent
  ],
  templateUrl: './nav-horizontal.component.html',
  styleUrl: './nav-horizontal.component.scss'
})
export class NavHorizontalComponent {
  activeSection: string = 'inicio';
  modoNoche: boolean = false;

  constructor() {}

  ngOnInit() {
    // Cargar el estado del modo noche desde localStorage
    const savedTheme = localStorage.getItem('modoNoche');
    this.modoNoche = savedTheme === 'true';
    this.aplicarModoNoche();
  }

  setActiveSection(section: string) {
    this.activeSection = section;
  }

  toggleModoNoche() {
    this.modoNoche = !this.modoNoche;
    localStorage.setItem('modoNoche', this.modoNoche.toString());
    this.aplicarModoNoche();
  }

  aplicarModoNoche() {
    if (this.modoNoche) {
      document.body.classList.add('modo-noche');
      document.body.classList.remove('modo-dia');
    } else {
      document.body.classList.add('modo-dia');
      document.body.classList.remove('modo-noche');
    }
  }
}
