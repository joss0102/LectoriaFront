import { Routes } from '@angular/router';
import { LayoutComponent } from './app/client/layout/layout.component';

import { InicioComponent } from './app/client/inicio/inicio.component';
import { BibliotecaComponent } from './app/client/biblioteca/biblioteca.component';
import { RouterModule } from '@angular/router';
import { AjustesComponent } from './app/client/ajustes/ajustes.component';
import { CalificacionesComponent } from './app/client/calificaciones/calificaciones.component';
import { BuscadorAutoresComponent } from './app/client/features/buscador-autores/buscador-autores.component';
import { BuscadorLibrosComponent } from './app/client/features/buscador-libros/buscador-libros.component';
import { InicioSesionComponent } from './app/client/features/inicio-sesion/inicio-sesion.component';
import { RegistroComponent } from './app/client/features/registro/registro.component';
import { LecturaActualComponent } from './app/client/lectura-actual/lectura-actual.component';
import { PendientesComponent } from './app/client/pendientes/pendientes.component';
import { PageNotFoundComponent } from './app/page-not-found/page-not-found.component';
export const routes: Routes = [
    {
        path: "", component: LayoutComponent, children: [ // -> www.ejemplo.com
            // {path: "", component: InicioSesionComponent},

            {path: "ajustes", component: AjustesComponent},
            {path: "biblioteca", component: BibliotecaComponent},
            {path: "calificaciones", component: CalificacionesComponent},
            {path: "buscadorAutores", component: BuscadorAutoresComponent},
            {path: "buscadorLibros", component: BuscadorLibrosComponent},
            {path: "inicioSesion", component: InicioSesionComponent},
            {path: "registro", component: RegistroComponent},
            {path: "inicio", component: InicioComponent},

            {path: "lecturaActual", component: LecturaActualComponent},

            {path: "pendientes", component: PendientesComponent},

            
        ]
    },
    {path: "**", component: PageNotFoundComponent},

];
