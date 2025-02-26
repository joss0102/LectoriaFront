import { Routes } from '@angular/router';
import { LayoutComponent } from './app/client/layout/layout.component';

import { InicioSesionComponent } from './app/client/features/inicio-sesion/inicio-sesion.component';
import { PageNotFoundComponent } from './app/page-not-found/page-not-found.component';

import { InicioComponent } from './app/client/inicio/inicio.component';
import { BibliotecaComponent } from './app/client/biblioteca/biblioteca.component';
import { AjustesComponent } from './app/client/ajustes/ajustes.component';
import { CalificacionesComponent } from './app/client/calificaciones/calificaciones.component';
import { BuscadorAutoresComponent } from './app/client/features/buscador-autores/buscador-autores.component';
import { BuscadorLibrosComponent } from './app/client/features/buscador-libros/buscador-libros.component';
import { RegistroComponent } from './app/client/features/registro/registro/registro.component';
import { LecturaActualComponent } from './app/client/lectura-actual/lectura-actual.component';
import { PendientesComponent } from './app/client/pendientes/pendientes.component';

export const routes: Routes = [
    {
        path: "", component: LayoutComponent, children: [ // -> www.ejemplo.com
            {path: "inicioSesion", component: InicioSesionComponent},
        ]
    },
    {path: "**", component: PageNotFoundComponent},

];
