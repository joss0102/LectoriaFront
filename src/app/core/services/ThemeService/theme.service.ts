// theme.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private modoNocheSubject = new BehaviorSubject<boolean>(true);
  public modoNoche$ = this.modoNocheSubject.asObservable();

  constructor() {
    // Inicializar con el valor almacenado o usar noche por defecto
    const savedTheme = localStorage.getItem('modoNoche');
    const initialTheme = savedTheme ? savedTheme === 'true' : true;
    this.modoNocheSubject.next(initialTheme);
    this.aplicarTema(initialTheme);
  }

  toggleTema() {
    const nuevoTema = !this.modoNocheSubject.value;
    this.modoNocheSubject.next(nuevoTema);
    localStorage.setItem('modoNoche', nuevoTema.toString());
    this.aplicarTema(nuevoTema);
    return nuevoTema;
  }

  getTema() {
    return this.modoNocheSubject.value;
  }

  private aplicarTema(modoNoche: boolean) {
    const body = document.querySelector('body');
    if (body) {
      if (modoNoche) {
        body.classList.add('tema-noche');
        body.classList.remove('tema-dia');
      } else {
        body.classList.add('tema-dia');
        body.classList.remove('tema-noche');
      }
    }
  }
}