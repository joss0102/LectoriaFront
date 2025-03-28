import { Routes } from '@angular/router';
import { LayoutComponent } from './client/layout/layout.component';

import { InicioSesionComponent } from './client/features/inicio-sesion/inicio-sesion/inicio-sesion.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { InicioComponent } from './client/inicio/inicio/inicio.component';
import { BibliotecaComponent } from './client/biblioteca/biblioteca/biblioteca.component';
import { LecturaActualComponent } from './client/lectura-actual/lectura-actual/lectura-actual.component';
import { EstadisticasComponent } from './client/estadisticas/estadisticas/estadisticas.component';
import { CalificacionesComponent } from './client/calificaciones/calificaciones/calificaciones.component';
import { PendientesComponent } from './client/pendientes/pendientes/pendientes.component';
import { AjustesComponent } from './client/ajustes/ajustes/ajustes.component';

export const routes: Routes = [
  // User
  {
    path: '',
    component: LayoutComponent,
    children: [
      // -> www.ejemplo.com
      { path: '', component: InicioComponent },
      { path: 'biblioteca', component: BibliotecaComponent },
      { path: 'inicioSesion', component: InicioSesionComponent },
      { path: 'lectura-actual', component: LecturaActualComponent },
      { path: 'estadisticas', component: EstadisticasComponent },
      { path: 'calificaciones', component: CalificacionesComponent },
      { path: 'pendientes', component: PendientesComponent },
      { path: 'ajustes', component: AjustesComponent },
    ],
  },
  { path: '**', component: PageNotFoundComponent },
];
