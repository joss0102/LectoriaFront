import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';

interface Theme {
  name: string;
  class: string;
  previewClass: string;
  color: string;
}

interface AccentColor {
  name: string;
  color: string;
}

@Component({
  selector: 'app-theme-color',
  standalone: true,
  imports: [NgClass, NgFor],
  templateUrl: './theme-color.component.html',
  styleUrls: ['./theme-color.component.scss']
})
export class ThemeColorComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() themeChanged = new EventEmitter<{theme: string, accent: string}>();
  
  currentTheme: string = 'noche';
  currentAccent: string = '#FF8800';
  
  themes: Theme[] = [
    { name: 'Modo Noche', class: 'noche', previewClass: 'preview-noche', color: '#1a1a1a' },
    { name: 'Modo Día', class: 'dia', previewClass: 'preview-dia', color: '#B4AFA6' },
    { name: 'Ártico', class: 'artico', previewClass: 'preview-artico', color: '#65a8c9' },
    { name: 'Bosque', class: 'bosque', previewClass: 'preview-bosque', color: '#629862' },
    { name: 'Atardecer', class: 'atardecer', previewClass: 'preview-atardecer', color: '#c28f83' }
  ];
  
  accentColors: AccentColor[] = [
    { name: 'Naranja', color: '#FF8800' },
    { name: 'Azul', color: '#3498DB' },
    { name: 'Verde', color: '#009229' },
    { name: 'Rojo', color: '#E74C3C' },
    { name: 'Morado', color: '#9B59B6' },
    { name: 'Amarillo', color: '#F1C40F' },
    { name: 'Turquesa', color: '#1ABC9C' },
    { name: 'Azul oscuro', color: '#34495E' },
    { name: 'Naranja oscuro', color: '#E67E22' },
    { name: 'Gris', color: '#95A5A6' }
  ];
  
  constructor() {}
  
  ngOnInit(): void {
    const savedTheme = localStorage.getItem('appTheme');
    if (savedTheme) {
      this.currentTheme = savedTheme;
    }
    
    const savedAccent = localStorage.getItem('accentColor');
    if (savedAccent) {
      this.currentAccent = savedAccent;
    }
  }
  
  onThemeSelect(themeClass: string): void {
    this.currentTheme = themeClass;
    this.applyTheme();
  }
  
  onAccentSelect(accentColor: string): void {
    this.currentAccent = accentColor;
    this.applyAccentColor();
  }
  
  private applyTheme(): void {
    document.body.classList.remove(...this.getThemeClasses());
    document.body.classList.add(`tema-${this.currentTheme}`);
  }
  
  private getThemeClasses(): string[] {
    return this.themes.map(theme => `tema-${theme.class}`);
  }
  
  private applyAccentColor(): void {
    document.documentElement.style.setProperty('--accent-color', this.currentAccent);
  }
  
  saveAndClose(): void {
    localStorage.setItem('appTheme', this.currentTheme);
    localStorage.setItem('accentColor', this.currentAccent);
    
    this.themeChanged.emit({theme: this.currentTheme, accent: this.currentAccent});
    
    this.close.emit();
  }
}