import { Component } from '@angular/core';
import { AddFormComponent } from "../add/add-form/add-form.component";
import { DeleteFormComponent } from '../delete/delete-form/delete-form.component';
import { PhrasesComponent } from "../phrases/phrases/phrases.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [AddFormComponent, DeleteFormComponent, PhrasesComponent, CommonModule],
  templateUrl: './books.component.html',
  styleUrl: './books.component.scss'
})
export class BooksComponent {
  // Variables para controlar la visibilidad de cada modal
  showAddModal = false;
  showDeleteModal = false;
  showPhrasesModal = false;

  // Funciones para abrir cada modal
  openAddModal() {
    this.showAddModal = true;
    this.showDeleteModal = false;
    this.showPhrasesModal = false;
  }

  openDeleteModal() {
    this.showAddModal = false;
    this.showDeleteModal = true;
    this.showPhrasesModal = false;
  }

  openPhrasesModal() {
    this.showAddModal = false;
    this.showDeleteModal = false;
    this.showPhrasesModal = true;
  }

  // Función para cerrar todos los modales
  closeAllModals() {
    this.showAddModal = false;
    this.showDeleteModal = false;
    this.showPhrasesModal = false;
  }
}