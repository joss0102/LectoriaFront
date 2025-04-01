import { Component, OnInit } from '@angular/core';

import { ColorPrimaryService } from '../../../core/services/ColorPrimary/color-primary.service';
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
export class HomeComponent implements OnInit {
  primaryColor: string = '#000000'; // Color inicial

  constructor(private colorService: ColorPrimaryService) { }

  ngOnInit(): void {
    // Nos suscribimos al servicio para obtener el color primario
    this.colorService.getPrimaryColor().subscribe(color => {
      this.primaryColor = color;
      this.updateBackgroundColor(); // Cambiamos el color de fondo
    });
  }

  // Método para actualizar el color de fondo del contenedor principal
  updateBackgroundColor(): void {
    // Convertir el color de hex a hsl
    const hex = this.primaryColor;
    const hsl = this.hexToHsl(hex);

    // Reducir la saturación (por ejemplo, al 50%)
    hsl.s = 10;  // Reducimos la saturación para hacerlo más suave
    hsl.l = 20;  // Aumentamos la luminosidad para hacerlo más claro y pastel

    // Convertir de nuevo a hex
    const newColor = this.hslToHex(hsl.h, hsl.s, hsl.l);

    const parentElement = document.querySelector('.parent') as HTMLElement;
    if (parentElement) {
      parentElement.style.backgroundColor = newColor; // Aplicar el color manipulado
    }
  }

  // Función para convertir hex a HSL
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

    return { h: h * 360, s, l };
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

}
