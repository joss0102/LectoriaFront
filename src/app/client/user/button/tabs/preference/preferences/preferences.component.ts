import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService, ThemeType } from '../../../../../../core/services/ThemeService/theme.service';
import { Subscription } from 'rxjs';

import { ReadingGoalsService,ReadingGoals } from '../../../../../../core/services/ReadingGoals/reading-goals.service';
import { AuthService } from '../../../../../../core/services/auth/auth.service';


interface CustomPalette {
  primary: string;
  secondary: string;
  success: string;
  danger: string;
}

interface UserPreferences {
  theme: 'day' | 'night' | 'auto';
  themeType: ThemeType;
  autoThemeEnabled: boolean;
  dayModeStartTime: string;
  nightModeStartTime: string;
  language: string;
  region: string;
  accentColor: string;
  useCustomPalette: boolean;
  palette: CustomPalette;
  readingGoals: ReadingGoals;
  disableDynamicColors: boolean;
}

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './preferences.component.html',
  styleUrl: './preferences.component.scss'
})
export class PreferencesComponent implements OnInit, OnDestroy {
  // Variables para controlar la visibilidad de cada modal
  showThemeModal = false;
  showLanguageModal = false;
  showAccentColorsModal = false;
  showReadingGoalsModal = false;

  // Variable para controlar el tema
  modoNoche: boolean = true;
  private themeSubscription: Subscription = new Subscription();
  private dynamicColorsSubscription: Subscription = new Subscription();
  private readingGoalsSubscription: Subscription = new Subscription();

  // array de días de la semana
  weekdays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
  
  // Colores predefinidos
  predefinedColors = [
    '#FF8800', // Naranja (actual)
    '#009229', // Azul
    '#2ECC71', // Verde
    '#E74C3C', // Rojo
    '#9B59B6', // Morado
    '#F1C40F', // Amarillo
    '#1ABC9C', // Turquesa
    '#34495E', // Azul oscuro
    '#E67E22', // Naranja oscuro
    '#95A5A6'  // Gris
  ];
  
  // Valores originales para restablecer
  private defaultAccentColor = '#FF8800';
  private defaultPalette = {
    primary: '#0d6efd',
    secondary: '#6c757d',
    success: '#198754',
    danger: '#dc3545'
  };
  
  // Preferencias del usuario
  preferences: UserPreferences = {
    theme: 'night',
    themeType: 'noche',
    autoThemeEnabled: false,
    dayModeStartTime: '07:00',
    nightModeStartTime: '20:00',
    language: 'es',
    region: 'ES',
    accentColor: '#FF8800',
    useCustomPalette: false,
    palette: {
      primary: '#0d6efd',
      secondary: '#6c757d',
      success: '#198754',
      danger: '#dc3545'
    },
    readingGoals: {
      yearly: 15,
      monthly: 2,
      daily_pages: 30
    },
    disableDynamicColors: false
  };

  constructor(
    private renderer: Renderer2,
    private themeService: ThemeService,
    private readingGoalsService: ReadingGoalsService,
    private authService: AuthService
  ) {
    console.log('PreferencesComponent constructor');
  }

  ngOnInit(): void {
    this.modoNoche = this.themeService.getTema();

    const currentThemeType = this.themeService.getTemaPersonalizado();
    this.preferences.themeType = currentThemeType;

    this.preferences.theme = this.modoNoche ? 'night' : 'day';
    const dynamicColorsDisabled = this.themeService.getDynamicColorsDisabled();

    this.preferences.disableDynamicColors = dynamicColorsDisabled;
    this.themeSubscription = this.themeService.modoNoche$.subscribe(value => {
      this.modoNoche = value;
      if (['noche', 'dia'].includes(this.preferences.themeType)) {
        this.preferences.theme = value ? 'night' : 'day';
      }
    });
    this.dynamicColorsSubscription = this.themeService.dynamicColorsDisabled$.subscribe(value => {
      this.preferences.disableDynamicColors = value;
    });
    
    this.loadPreferences();
    this.loadReadingGoals();
    this.applyAccentColors();
  }

  ngOnDestroy(): void {
    // Limpieza de suscripciones
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
    if (this.dynamicColorsSubscription) {
      this.dynamicColorsSubscription.unsubscribe();
    }
    if (this.readingGoalsSubscription) {
      this.readingGoalsSubscription.unsubscribe();
    }
  }
  
  /**
   * Carga las metas de lectura del usuario actual
   */
  loadReadingGoals(): void {
    const currentUser = this.authService.currentUserValue;
    
    if (currentUser) {
      const initialGoals = this.readingGoalsService.getCurrentGoals();
      this.preferences.readingGoals = initialGoals;
      
      this.readingGoalsSubscription = this.readingGoalsService.readingGoals$
        .subscribe(goals => {
          this.preferences.readingGoals = goals;
        });
      this.readingGoalsService.loadUserGoals(currentUser.nickname)
        .subscribe(goals => {
          this.preferences.readingGoals = goals;
        });
    }
  }

  // Funciones para abrir cada modal
  openThemeModal(): void {
    this.closeAllModals();
    this.showThemeModal = true;
    this.toggleBodyScroll(true);
  }

  openLanguageModal(): void {
    this.closeAllModals();
    this.showLanguageModal = true;
    this.toggleBodyScroll(true);
  }

  openAccentColorsModal(): void {
    this.closeAllModals();
    this.showAccentColorsModal = true;
    this.toggleBodyScroll(true);
  }

  openReadingGoalsModal(): void {
    this.closeAllModals();
    this.showReadingGoalsModal = true;
    this.toggleBodyScroll(true);
  }

  // Función para cerrar todos los modales
  closeAllModals(): void {
    this.showThemeModal = false;
    this.showLanguageModal = false;
    this.showAccentColorsModal = false;
    this.showReadingGoalsModal = false;
    this.toggleBodyScroll(false);
  }
  
  // Función para seleccionar un tema
  selectTheme(themeType: ThemeType): void {
    this.preferences.themeType = themeType;
    
    if (themeType === 'noche') {
      this.preferences.theme = 'night';
    } else if (themeType === 'dia') {
      this.preferences.theme = 'day';
    }
    
    this.themeService.setTemaPersonalizado(themeType);
  }
  
  // Función para cambiar el estado de colores dinámicos
  toggleDynamicColors(): void {
    const valorAnterior = this.preferences.disableDynamicColors;
    this.preferences.disableDynamicColors = !valorAnterior;
    this.themeService.setDynamicColorsDisabled(this.preferences.disableDynamicColors);
  }
  
  isDarkTheme(themeType: ThemeType): boolean {
    return ['noche', 'bosque'].includes(themeType);
  }
  
  toggleBodyScroll(block: boolean): void {
    if (block) {
      this.renderer.addClass(document.body, 'modal-open');
      this.renderer.setStyle(document.body, 'overflow', 'hidden');
      this.renderer.setStyle(document.body, 'padding-right', '15px');
    } else {
      this.renderer.removeClass(document.body, 'modal-open');
      this.renderer.removeStyle(document.body, 'overflow');
      this.renderer.removeStyle(document.body, 'padding-right');
    }
  }

  saveThemeSettings(): void {
    this.themeService.setTemaPersonalizado(this.preferences.themeType);
    const success = this.themeService.setDynamicColorsDisabled(this.preferences.disableDynamicColors);
    if (!success) {
      console.error('Error al guardar la configuración de colores dinámicos');
    }
    if (this.preferences.theme === 'auto' && this.preferences.autoThemeEnabled) {
      this.applyAutoTheme();
    }
    this.savePreferences();
    this.closeAllModals();
  }

  saveLanguageSettings(): void {
    this.savePreferences();
    this.closeAllModals();
  }
  
  saveAccentColors(): void {
    this.savePreferences();
    this.applyAccentColors();
    this.closeAllModals();
  }
  
  resetAccentColors(): void {
    this.preferences.accentColor = this.defaultAccentColor;
    this.preferences.useCustomPalette = false;
    this.preferences.palette = { ...this.defaultPalette };
    this.onColorPreview();
  }
  
  saveReadingGoals(): void {
    const currentUser = this.authService.currentUserValue;
    
    if (currentUser) {
      this.readingGoalsService.updateGoals(currentUser.nickname, this.preferences.readingGoals)
        .subscribe({
          next: (updatedGoals) => {
            console.log('Metas de lectura actualizadas:', updatedGoals);
            this.savePreferences();
            this.closeAllModals();
          },
          error: (error) => {
            console.error('Error al actualizar metas de lectura:', error);
          }
        });
    } else {
      // Guardar solo en localStorage si no hay usuario
      this.savePreferences();
      this.closeAllModals();
    }
  }

  applyAutoTheme(): void {
    if (!this.preferences.autoThemeEnabled) return;
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const dayStart = this.preferences.dayModeStartTime;
    const nightStart = this.preferences.nightModeStartTime;
    const shouldBeDarkMode = !(currentTime >= dayStart && currentTime < nightStart);
    if (this.themeService.getTema() !== shouldBeDarkMode) {
      this.themeService.toggleTema();
    }
  }

  previewColor(color: string): void {
    this.preferences.accentColor = color;
    this.onColorPreview();
  }

  onColorPreview(): void {
    this.applyAccentColors();
  }
  
  applyAccentColors(): void {
    document.documentElement.style.setProperty('--bs-btn', this.preferences.accentColor);
    
    // Calcular un color hover más oscuro (70% de brillo)
    const darkerColor = this.darkenColor(this.preferences.accentColor, 0.7);
    document.documentElement.style.setProperty('--bs-btn-hover', darkerColor);
    
    if (this.preferences.useCustomPalette) {
      document.documentElement.style.setProperty('--bs-primary', this.preferences.palette.primary);
      document.documentElement.style.setProperty('--bs-secondary', this.preferences.palette.secondary);
      document.documentElement.style.setProperty('--bs-success', this.preferences.palette.success);
      document.documentElement.style.setProperty('--bs-danger', this.preferences.palette.danger);
    }
  }
  
  darkenColor(color: string, factor: number): string {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    const darkenR = Math.floor(r * factor);
    const darkenG = Math.floor(g * factor);
    const darkenB = Math.floor(b * factor);
    
    return `#${darkenR.toString(16).padStart(2, '0')}${darkenG.toString(16).padStart(2, '0')}${darkenB.toString(16).padStart(2, '0')}`;
  }
  
  savePreferences(): void {
    localStorage.setItem('userPreferences', JSON.stringify(this.preferences));
  }

  // Cargar preferencias desde localStorage
  loadPreferences(): void {
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      try {
        const parsedPrefs = JSON.parse(savedPreferences);
        this.preferences = {
          ...this.preferences,
          ...parsedPrefs
        };
        if (this.preferences.themeType) {
          this.themeService.setTemaPersonalizado(this.preferences.themeType);
        }
        this.themeService.setDynamicColorsDisabled(this.preferences.disableDynamicColors);
        
        // Si el modo automático está activado, aplicarlo
        if (this.preferences.theme === 'auto' && this.preferences.autoThemeEnabled) {
          this.applyAutoTheme();
        }
        this.applyAccentColors();
        
      } catch (error) {
        console.error('Error al cargar preferencias:', error);
      }
    }
  }
}