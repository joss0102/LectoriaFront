import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeType = 'noche' | 'dia' | 'artico' | 'bosque' | 'atardecer';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private modoNocheSubject = new BehaviorSubject<boolean>(true);
  public modoNoche$ = this.modoNocheSubject.asObservable();
  
  private temaActualSubject = new BehaviorSubject<ThemeType>('noche');
  public temaActual$ = this.temaActualSubject.asObservable();

  // Propiedad para controlar los colores dinámicos
  private dynamicColorsDisabledSubject = new BehaviorSubject<boolean>(false);
  public dynamicColorsDisabled$ = this.dynamicColorsDisabledSubject.asObservable();

  constructor() {
    // Inicializar con el valor almacenado o usar noche por defecto
    const savedTheme = localStorage.getItem('modoNoche');
    const initialTheme = savedTheme ? savedTheme === 'true' : true;
    this.modoNocheSubject.next(initialTheme);
    
    // Cargar tema personalizado si existe
    const savedCustomTheme = localStorage.getItem('temaPersonalizado');
    if (savedCustomTheme) {
      this.temaActualSubject.next(savedCustomTheme as ThemeType);
      this.aplicarTemaPersonalizado(savedCustomTheme as ThemeType);
    } else {
      // Si no hay tema personalizado, aplicar según modo noche/día
      this.aplicarTema(initialTheme);
    }

    // Cargar preferencia de colores dinámicos
    try {
      const dynamicColorsDisabled = localStorage.getItem('dynamicColorsDisabled') === 'true';
      this.dynamicColorsDisabledSubject.next(dynamicColorsDisabled);
    } catch (error) {
      console.error('Error al cargar dynamicColorsDisabled:', error);
      // Por defecto, los colores dinámicos están habilitados
      this.dynamicColorsDisabledSubject.next(false);
    }
  }

  toggleTema() {
    const nuevoTema = !this.modoNocheSubject.value;
    this.modoNocheSubject.next(nuevoTema);
    localStorage.setItem('modoNoche', nuevoTema.toString());
    
    // Si hay un tema personalizado, no cambiamos las clases del body
    if (!localStorage.getItem('temaPersonalizado')) {
      this.aplicarTema(nuevoTema);
    }
    
    return nuevoTema;
  }

  getTema() {
    return this.modoNocheSubject.value;
  }
  
  // Método para obtener el tema personalizado actual
  getTemaPersonalizado(): ThemeType {
    return this.temaActualSubject.value;
  }
  
  // Método para establecer un tema personalizado
  setTemaPersonalizado(tema: ThemeType) {
    // Actualizar el tema actual
    this.temaActualSubject.next(tema);
    
    // Guardar en localStorage
    localStorage.setItem('temaPersonalizado', tema);
    
    // Actualizar modoNoche basado en el tema
    const esModoNoche = tema === 'noche';
    this.modoNocheSubject.next(esModoNoche);
    localStorage.setItem('modoNoche', esModoNoche.toString());
    
    // Aplicar el tema
    this.aplicarTemaPersonalizado(tema);
    
    return tema;
  }

  // Método para configurar la preferencia de colores dinámicos
  setDynamicColorsDisabled(disabled: boolean) {
    try {
      // Asegurar que sea un booleano
      const isDisabled = disabled === true;
      
      // Actualizar el subject
      this.dynamicColorsDisabledSubject.next(isDisabled);
      
      // Guardar en localStorage
      localStorage.setItem('dynamicColorsDisabled', isDisabled.toString());
      
      return true;
    } catch (error) {
      console.error('Error al establecer dynamicColorsDisabled:', error);
      return false;
    }
  }

  // Método para obtener la preferencia de colores dinámicos
  getDynamicColorsDisabled(): boolean {
    return this.dynamicColorsDisabledSubject.value;
  }
  
  // Método para borrar tema personalizado y volver al modo día/noche
  resetTemaPersonalizado() {
    localStorage.removeItem('temaPersonalizado');
    this.temaActualSubject.next(this.modoNocheSubject.value ? 'noche' : 'dia');
    this.aplicarTema(this.modoNocheSubject.value);
  }

  private aplicarTema(modoNoche: boolean) {
    const body = document.querySelector('body');
    if (body) {
      // Remover cualquier tema personalizado
      body.classList.remove('tema-artico', 'tema-bosque', 'tema-atardecer');
      
      if (modoNoche) {
        body.classList.add('tema-noche');
        body.classList.remove('tema-dia');
      } else {
        body.classList.add('tema-dia');
        body.classList.remove('tema-noche');
      }
    }
  }
  
  private aplicarTemaPersonalizado(tema: ThemeType) {
    const body = document.querySelector('body');
    if (body) {
      // Remover todos los temas
      body.classList.remove('tema-noche', 'tema-dia', 'tema-artico', 'tema-bosque', 'tema-atardecer');
      
      // Aplicar el tema seleccionado
      body.classList.add(`tema-${tema}`);
    }
  }
}