import { Routes } from '@angular/router';
import { LayoutComponent } from './app/client/layout/layout.component';

import { InicioSesionComponent } from './app/client/features/inicio-sesion/inicio-sesion/inicio-sesion.component';
import { PageNotFoundComponent } from './app/page-not-found/page-not-found.component';



export const routes: Routes = [
    {
        path: "", component: LayoutComponent, children: [ // -> www.ejemplo.com
            {path: "inicioSesion", component: InicioSesionComponent},
        ]
    },
    {path: "**", component: PageNotFoundComponent},

];
