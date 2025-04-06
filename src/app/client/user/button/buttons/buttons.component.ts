import { Component } from '@angular/core';
import { SettingsComponent } from "../tabs/setting/settings/settings.component";
import { BooksComponent } from "../tabs/book/books/books.component";
import { PreferencesComponent } from "../tabs/preference/preferences/preferences.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-buttons',
  standalone: true,
  imports: [SettingsComponent, BooksComponent, PreferencesComponent, CommonModule],
  templateUrl: './buttons.component.html',
  styleUrl: './buttons.component.scss'
})
export class ButtonsComponent {
  // Variables para controlar la visibilidad de cada modal
  showSettingsModal = false;
  showBooksModal = false;
  showPreferencesModal = false;

  // Funciones para abrir cada modal
  openSettingsModal() {
    this.showSettingsModal = true;
    this.showBooksModal = false;
    this.showPreferencesModal = false;
  }

  openBooksModal() {
    this.showSettingsModal = false;
    this.showBooksModal = true;
    this.showPreferencesModal = false;
  }

  openPreferencesModal() {
    this.showSettingsModal = false;
    this.showBooksModal = false;
    this.showPreferencesModal = true;
  }

  // Función para cerrar todos los modales
  closeAllModals() {
    this.showSettingsModal = false;
    this.showBooksModal = false;
    this.showPreferencesModal = false;
  }
}