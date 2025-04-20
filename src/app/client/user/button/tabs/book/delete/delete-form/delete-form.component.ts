import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BooksService } from '../../../../../../../core/services/book/books.service';
import { Books } from '../../../../../../../core/models/books-model';

@Component({
  selector: 'app-delete-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './delete-form.component.html',
  styleUrl: './delete-form.component.scss'
})
export class DeleteFormComponent implements OnInit {
  // Todos los libros
  allBooks: Books[] = [];
  
  // Libros filtrados para mostrar
  filteredBooks: Books[] = [];
  
  // Libro seleccionado para eliminar
  selectedBookToDelete: Books | null = null;
  
  // Estado del modal de confirmación
  isDeleteModalOpen: boolean = false;
  
  // Término de búsqueda
  searchQuery: string = '';

  constructor(private booksService: BooksService) {}

  ngOnInit(): void {
    // Obtener todos los libros
    this.allBooks = this.booksService.getAllBooks();
    this.filteredBooks = [...this.allBooks];
  }

  // Método para buscar libros
  searchBooks(): void {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      this.filteredBooks = [...this.allBooks];
      return;
    }
    
    const query = this.searchQuery.toLowerCase().trim();
    this.filteredBooks = this.allBooks.filter(book => 
      book.titulo.toLowerCase().includes(query) || 
      book.autor.toLowerCase().includes(query) ||
      (book.saga && book.saga.toLowerCase().includes(query))
    );
  }
  
  // Limpiar la búsqueda
  clearSearch(): void {
    this.searchQuery = '';
    this.filteredBooks = [...this.allBooks];
  }

  // Abrir modal de confirmación de eliminación
  openDeleteModal(book: Books): void {
    this.selectedBookToDelete = book;
    this.isDeleteModalOpen = true;
    // Evitar scroll en el cuerpo cuando el modal está abierto
    document.body.style.overflow = 'hidden';
  }

  // Cerrar modal de eliminación
  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.selectedBookToDelete = null;
    // Restaurar scroll en el cuerpo
    document.body.style.overflow = 'auto';
  }

  // Confirmar eliminación del libro
  confirmDelete(): void {
    if (this.selectedBookToDelete) {

      this.allBooks = this.allBooks.filter(
        book => book.titulo !== this.selectedBookToDelete!.titulo
      );
      this.filteredBooks = [...this.allBooks];
      this.closeDeleteModal();
    }
  }

  // Método para obtener la clase CSS según el estado del libro
  getStatusClass(status?: string): string {
    switch(status) {
      case 'en-progreso':
        return 'status-reading';
      case 'finalizado':
        return 'status-completed';
      case 'abandonado':
        return 'status-abandoned';
      case 'no-iniciado':
      default:
        return 'status-not-started';
    }
  }
  
  // Método para obtener el texto del estado
  getStatusText(status?: string): string {
    switch(status) {
      case 'en-progreso':
        return 'Leyendo';
      case 'finalizado':
        return 'Completado';
      case 'abandonado':
        return 'Abandonado';
      case 'no-iniciado':
      default:
        return 'No iniciado';
    }
  }
}