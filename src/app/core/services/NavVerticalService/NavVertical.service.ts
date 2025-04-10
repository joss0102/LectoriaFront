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

  // Estado para controlar si los enlaces principales están en el nav horizontal o vertical
  private linksInHorizontalNavSubject = new BehaviorSubject<boolean>(true);
  linksInHorizontalNav$ = this.linksInHorizontalNavSubject.asObservable();

  // Estado para indicar si estamos en modo responsive
  private isResponsiveSubject = new BehaviorSubject<boolean>(false);
  isResponsive$ = this.isResponsiveSubject.asObservable();

  // Estado para indicar si estamos en la página de inicio
  private isHomePageSubject = new BehaviorSubject<boolean>(false);
  isHomePage$ = this.isHomePageSubject.asObservable();

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

    // Verificar el tamaño inicial de la pantalla
    this.checkScreenSize();
    
    // Escuchar cambios de tamaño de pantalla para ajustar el menú en responsive
    this.setupResizeListener();
  }

  // Alternar entre modo iconos y texto
  toggleIcons() {
    // En pantallas grandes, cambia entre modo icono y texto
    if (window.innerWidth > 1300) {
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
  
  // Método para obtener el estado actual de la visibilidad del menú
  getMenuVisible(): boolean {
    return this.menuVisibleSubject.getValue();
  }

  // Método para indicar si estamos en la página de inicio
  setIsHomePage(isHomePage: boolean) {
    this.isHomePageSubject.next(isHomePage);
  }

  // Guardar el estado en localStorage
  private saveState() {
    const state = {
      onlyIcon: this.onlyIconSubject.value
    };
    localStorage.setItem('navState', JSON.stringify(state));
  }
  
  // Verificar el tamaño de la pantalla y actualizar estados
  private checkScreenSize() {
    const isResponsive = window.innerWidth <= 1300;
    this.isResponsiveSubject.next(isResponsive);
    this.linksInHorizontalNavSubject.next(!isResponsive);
  }

  // Configurar listener para cambios de tamaño de pantalla
  private setupResizeListener() {
    window.addEventListener('resize', () => {
      // Verificar si estamos en modo responsive
      const isResponsive = window.innerWidth <= 1300;
      this.isResponsiveSubject.next(isResponsive);
      
      // Actualizar la ubicación de los enlaces (horizontal vs vertical)
      this.linksInHorizontalNavSubject.next(!isResponsive);
      
      // Si cambiamos a pantalla pequeña mientras el menú está visible, lo ocultamos
      if (isResponsive && this.menuVisibleSubject.value) {
        this.menuVisibleSubject.next(false);
      }
    });
  }
}