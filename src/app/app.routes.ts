import { Routes } from '@angular/router';
import { LayoutComponent } from './client/layout/layout.component';

import { InicioSesionComponent } from './client/features/inicio-sesion/inicio-sesion/inicio-sesion.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { InicioComponent } from './client/inicio/inicio/inicio.component';
import { BibliotecaComponent } from './client/biblioteca/biblioteca/biblioteca.component';

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
    ],
  },
  { path: '**', component: PageNotFoundComponent },
];
