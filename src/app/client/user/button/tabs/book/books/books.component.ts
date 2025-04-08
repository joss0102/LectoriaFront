import { Component } from '@angular/core';
import { AddFormComponent } from "../add/add-form/add-form.component";
import { DeleteFormComponent } from '../delete/delete-form/delete-form.component';
import { PhrasesComponent } from "../phrases/phrases/phrases.component";
import { CommonModule } from '@angular/common';
import { CalificationsComponent } from "../califications/califications.component";
import { ImagesComponent } from "../images/images.component";
import { NotesComponent } from "../notes/notes.component";
import { YourBooksComponent } from "../your-books/your-books.component";
import { AuthorsComponent } from "../authors/authors.component";

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [
    CommonModule, 
    AddFormComponent, 
    DeleteFormComponent, 
    PhrasesComponent, 
    CalificationsComponent, 
    ImagesComponent, 
    NotesComponent, 
    YourBooksComponent,
    AuthorsComponent
  ],
  templateUrl: './books.component.html',
  styleUrl: './books.component.scss'
})
export class BooksComponent {
  // Variables para controlar la visibilidad de cada modal
  showAddModal = false;
  showDeleteModal = false;
  showPhrasesModal = false;
  showCalificationsModal = false;
  showImagesModal = false;
  showNotesModal = false;
  showYourBooksModal = false;
  showAuthorsModal = false;

  // Funciones para abrir cada modal
  openAddModal() {
    this.closeAllModals();
    this.showAddModal = true;
  }

  openDeleteModal() {
    this.closeAllModals();
    this.showDeleteModal = true;
  }

  openPhrasesModal() {
    this.closeAllModals();
    this.showPhrasesModal = true;
  }
  
  openAuthorsModal() {
    this.closeAllModals();
    this.showAuthorsModal = true;
  }
  
  openCalificationsModal() {
    this.closeAllModals();
    this.showCalificationsModal = true;
  }
  
  openImagesModal() {
    this.closeAllModals();
    this.showImagesModal = true;
  }
  
  openNotesModal() {
    this.closeAllModals();
    this.showNotesModal = true;
  }
  
  openYourBooksModal() {
    this.closeAllModals();
    this.showYourBooksModal = true;
  }

  // Función para cerrar todos los modales
  closeAllModals() {
    this.showAddModal = false;
    this.showDeleteModal = false;
    this.showPhrasesModal = false;
    this.showCalificationsModal = false;
    this.showImagesModal = false;
    this.showNotesModal = false;
    this.showYourBooksModal = false;
    this.showAuthorsModal = false;
  }
}