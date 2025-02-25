import { Routes } from '@angular/router';
import { LayoutComponent } from './client/layout/layout/layout.component';

import { InicioComponent } from './client/inicio/inicio/inicio.component';
import { RouterModule } from '@angular/router';
export const routes: Routes = [
    {
        path: "", component: LayoutComponent, children: [ // -> www.ejemplo.com
            // {path: "", component: InicioSesionComponent},
            {path: "inicio", component: InicioComponent}, // -> www.inicio.com
            
            // {path: "biblioteca", component: BibliotecaComponent},
            
        ]
    }

];
