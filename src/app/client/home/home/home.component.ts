import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { ColorPrimaryService } from '../../../core/services/ColorPrimary/color-primary.service';
import { ThemeService, ThemeType } from '../../../core/services/ThemeService/theme.service';
import { DataComponent } from '../data/data.component';
import { Img1Component } from '../img1/img1.component';
import { Img2Component } from '../img2/img2.component';
import { CarruselComponent } from '../carrusel/carrusel.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [DataComponent, Img1Component, Img2Component, CarruselComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  primaryColor: string = '#000000'; // Color inicial
  modoNoche: boolean = true; // Por defecto en modo noche
  temaActual: ThemeType = 'noche'; // Tema actual
  dynamicColorsDisabled: boolean = false; // Si los colores dinámicos están desactivados
  
  private colorSubscription: Subscription = new Subscription();
  private themeSubscription: Subscription = new Subscription();
  private customThemeSubscription: Subscription = new Subscription();
  private dynamicColorsSubscription: Subscription = new Subscription();

  constructor(
    private colorService: ColorPrimaryService,
    private themeService: ThemeService
  ) { }

  ngOnInit(): void {
    // Obtener el estado actual de los colores dinámicos
    this.dynamicColorsDisabled = this.themeService.getDynamicColorsDisabled();
    
    // Nos suscribimos al servicio para obtener el color primario
    this.colorSubscription = this.colorService.getPrimaryColor().subscribe(color => {
      this.primaryColor = color;
      this.updateBackgroundColor(); // Cambiamos el color de fondo
    });
    
    // Nos suscribimos al servicio del tema (modo noche/día)
    this.themeSubscription = this.themeService.modoNoche$.subscribe(modoNoche => {
      this.modoNoche = modoNoche;
      this.updateBackgroundColor(); // Actualizamos el color cuando cambia el tema
    });
    
    // Nos suscribimos al servicio de tema personalizado
    this.customThemeSubscription = this.themeService.temaActual$.subscribe(tema => {
      this.temaActual = tema;
      this.updateBackgroundColor(); // Actualizamos el color cuando cambia el tema personalizado
    });

    // Nos suscribimos a los cambios en la configuración de colores dinámicos
    this.dynamicColorsSubscription = this.themeService.dynamicColorsDisabled$.subscribe(disabled => {
      this.dynamicColorsDisabled = disabled;
      this.updateBackgroundColor(); // Actualizamos el color cuando cambia la configuración
    });
  }

  // Método para actualizar el color de fondo del contenedor principal
  updateBackgroundColor(): void {
    const parentElement = document.querySelector('.parent') as HTMLElement;
    if (!parentElement) {
      return;
    }

    // Si los colores dinámicos están desactivados, quitar el color de fondo personalizado
    if (this.dynamicColorsDisabled) {
      // Importante: usar removeProperty para eliminar completamente el estilo
      parentElement.style.removeProperty('background-color');
      return;
    }

    // Convertir el color de hex a hsl
    const hex = this.primaryColor;
    const hsl = this.hexToHsl(hex);

    // Ajustamos los valores según el tema actual
    switch (this.temaActual) {
      case 'noche':
        // Modo noche: color más oscuro y menos saturado
        hsl.s = 10;  // Reducimos la saturación
        hsl.l = 20;  // Luminosidad baja para modo oscuro
        break;
      case 'dia':
        // Modo día: color más claro y menos saturado
        hsl.s = 6;   // Un poco más de saturación para el modo día
        hsl.l = 60;  // Aumentamos la luminosidad significativamente para modo día
        break;
      case 'artico':
        // Tema ártico: colores azulados y fríos
        hsl.h = this.blendHue(hsl.h, 200); // Mezclar con un tono azul
        hsl.s = 25;  // Saturación media
        hsl.l = 85;  // Alta luminosidad para un aspecto frío
        break;
      case 'bosque':
        // Tema bosque: colores verdosos
        hsl.h = this.blendHue(hsl.h, 120); // Mezclar con un tono verde
        hsl.s = 30;  // Buena saturación para los verdes
        hsl.l = 75;  // Luminosidad para un aspecto natural
        break;
      case 'atardecer':
        // Tema atardecer: colores cálidos
        hsl.h = this.blendHue(hsl.h, 30); // Mezclar con un tono naranja/rojizo
        hsl.s = 35;  // Buena saturación para los tonos cálidos
        hsl.l = 70;  // Luminosidad media-alta para sensación de calidez
        break;
    }

    // Convertir de nuevo a hex
    const newColor = this.hslToHex(hsl.h, hsl.s, hsl.l);

    // Aplicar el color manipulado
    parentElement.style.backgroundColor = newColor;
  }

  // Función auxiliar para mezclar tonos (hues)
  blendHue(originalHue: number, targetHue: number, strength: number = 0.7): number {
    // Mezcla el tono original con el tono objetivo usando el factor de fuerza
    // Un valor de strength = 1 significa que el resultado es 100% el targetHue
    // Un valor de strength = 0 significa que el resultado es 100% el originalHue
    return (originalHue * (1 - strength) + targetHue * strength) % 360;
  }

  // Función para convertir hex a HSL
  hexToHsl(hex: string): { h: number, s: number, l: number } {
    let r: number = 0, g: number = 0, b: number = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex[1] + hex[2], 16);
      g = parseInt(hex[3] + hex[4], 16);
      b = parseInt(hex[5] + hex[6], 16);
    }

    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h: number = 0, s: number, l: number;
    l = (max + min) / 2;
    if (max === min) {
      h = 0; // achromatic
      s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  // Función para convertir HSL a hex
  hslToHex(h: number, s: number, l: number): string {
    let r: number, g: number, b: number;

    h /= 360;
    s /= 100;
    l /= 100;

    const q = l < 0.5 ? l * (1 + s) : (l + s) - (l * s);
    const p = 2 * l - q;

    r = this.hueToRgb(p, q, h + 1 / 3);
    g = this.hueToRgb(p, q, h);
    b = this.hueToRgb(p, q, h - 1 / 3);

    return `#${((1 << 24) | (Math.round(r * 255) << 16) | (Math.round(g * 255) << 8) | Math.round(b * 255)).toString(16).slice(1)}`;
  }

  hueToRgb(p: number, q: number, t: number): number {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }
  
  ngOnDestroy(): void {
    // Limpiamos las suscripciones
    this.colorSubscription.unsubscribe();
    this.themeSubscription.unsubscribe();
    this.customThemeSubscription.unsubscribe();
    this.dynamicColorsSubscription.unsubscribe();
  }
}