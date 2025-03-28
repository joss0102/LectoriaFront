import { Component } from '@angular/core';
import { DividerTimerComponent } from '../divider-timer/divider-timer.component';
import { RouterModule } from '@angular/router';
import { VerticalServiceService } from '../../../services/navVertical/vertical-service.service';

@Component({
  selector: 'app-nav-horizontal',
  standalone: true,
  imports: [DividerTimerComponent, RouterModule],
  templateUrl: './nav-horizontal.component.html',
  styleUrl: './nav-horizontal.component.scss',
})
export class NavHorizontalComponent {
  modoNoche: boolean = false;

  constructor(private soloIconos: VerticalServiceService) { }

  ngOnInit() {
    const savedTheme = localStorage.getItem('modoNoche');
    this.modoNoche = savedTheme === 'true';
    this.aplicarModoNoche();
  }

  cambiarIconos() {
    this.soloIconos.cambiarSoloIconos();
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
