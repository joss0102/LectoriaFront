import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './page-not-found.component.html',
  styleUrl: './page-not-found.component.scss'
})
export class PageNotFoundComponent {
  messages: string[] = [
    "No todos los caminos llevan a la Corte Noche... y este claramente no. (Una Corte de Rosas y Espinas)",
    "Parece que este enlace fue reclamado por el wyrd. (Trono de Cristal)",
    "404: Este capítulo fue tragado por la neblina de Basgiath. (Alas de sangre)",
    "Cuidado, esta página ha sido maldecida como los libros del Tesoro de Asteri. (Trono de Cristal)"
  ];
  
  randomMessage: string = this.messages[Math.floor(Math.random() * this.messages.length)];
}
