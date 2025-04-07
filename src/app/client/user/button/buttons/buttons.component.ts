import { Component, OnInit, OnDestroy } from '@angular/core';
import { SettingsComponent } from "../tabs/setting/settings/settings.component";
import { BooksComponent } from "../tabs/book/books/books.component";
import { PreferencesComponent } from "../tabs/preference/preferences/preferences.component";
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../../core/services/ThemeService/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-buttons',
  standalone: true,
  imports: [SettingsComponent, BooksComponent, PreferencesComponent, CommonModule],
  templateUrl: './buttons.component.html',
  styleUrl: './buttons.component.scss'
})
export class ButtonsComponent implements OnInit, OnDestroy {
  // Variables para controlar la visibilidad de cada modal
  showSettingsModal = false;
  showBooksModal = false;
  showPreferencesModal = false;
  
  // Variable para controlar el tema
  modoNoche: boolean = true;
  private themeSubscription: Subscription = new Subscription();
  
  constructor(private themeService: ThemeService) {}
  
  ngOnInit(): void {
    // Suscripción al servicio de tema
    this.themeSubscription = this.themeService.modoNoche$.subscribe(value => {
      this.modoNoche = value;
    });
  }

  // Funciones para abrir cada modal
  openSettingsModal() {
    this.showSettingsModal = true;
    this.showBooksModal = false;
    this.showPreferencesModal = false;
    document.body.style.overflow = 'hidden'; // Evitar scroll del cuerpo
  }

  openBooksModal() {
    this.showSettingsModal = false;
    this.showBooksModal = true;
    this.showPreferencesModal = false;
    document.body.style.overflow = 'hidden'; // Evitar scroll del cuerpo
  }

  openPreferencesModal() {
    this.showSettingsModal = false;
    this.showBooksModal = false;
    this.showPreferencesModal = true;
    document.body.style.overflow = 'hidden'; // Evitar scroll del cuerpo
  }

  // Función para cerrar todos los modales
  closeAllModals() {
    this.showSettingsModal = false;
    this.showBooksModal = false;
    this.showPreferencesModal = false;
    document.body.style.overflow = ''; // Restaurar scroll del cuerpo
  }
  
  ngOnDestroy(): void {
    // Limpieza de suscripciones
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
    
    // Asegurarse de restaurar el scroll en caso de que el componente se destruya con un modal abierto
    document.body.style.overflow = ''; 
  }
}