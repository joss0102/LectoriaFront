import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NavVerticalService {
  // Estado para el modo de iconos (colapsado/expandido)
  private onlyIconSubject = new BehaviorSubject<boolean>(true);
  onlyIcon$ = this.onlyIconSubject.asObservable();

  // Estado para la visibilidad del menú en responsive
  private menuVisibleSubject = new BehaviorSubject<boolean>(false);
  menuVisible$ = this.menuVisibleSubject.asObservable();

  constructor() {
    // Inicializar el estado del menú desde localStorage si existe
    const savedState = localStorage.getItem('navState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        this.onlyIconSubject.next(state.onlyIcon);
      } catch (e) {
        console.error('Error parsing saved nav state', e);
      }
    }
    
    // Escuchar cambios de tamaño de pantalla para ajustar el menú en responsive
    this.setupResizeListener();
  }

  // Alternar entre modo iconos y texto
  toggleIcons() {
    // En pantallas grandes, cambia entre modo icono y texto
    if (window.innerWidth > 1200) {
      const newValue = !this.onlyIconSubject.value;
      this.onlyIconSubject.next(newValue);
      this.saveState();
    } 
    // En pantallas pequeñas, muestra/oculta el menú
    else {
      const newValue = !this.menuVisibleSubject.value;
      this.menuVisibleSubject.next(newValue);
    }
  }

  // Método específico para establecer la visibilidad del menú
  setMenuVisible(visible: boolean) {
    this.menuVisibleSubject.next(visible);
  }

  // Guardar el estado en localStorage
  private saveState() {
    const state = {
      onlyIcon: this.onlyIconSubject.value
    };
    localStorage.setItem('navState', JSON.stringify(state));
  }
  
  // Configurar listener para cambios de tamaño de pantalla
  private setupResizeListener() {
    window.addEventListener('resize', () => {
      // Si cambiamos a pantalla pequeña mientras el menú está visible, lo ocultamos
      if (window.innerWidth <= 1200 && this.menuVisibleSubject.value) {
        this.menuVisibleSubject.next(false);
      }
    });
  }
}