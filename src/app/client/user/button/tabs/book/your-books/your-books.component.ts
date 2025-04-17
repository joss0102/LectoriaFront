import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BooksService } from '../../../../../../core/services/book/books.service';
import { Books } from '../../../../../../core/models/books-model';

@Component({
  selector: 'app-your-books',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './your-books.component.html',
  styleUrl: './your-books.component.scss'
})
export class YourBooksComponent implements OnInit {
  // Todos los libros
  allBooks: Books[] = [];
  
  // Libros filtrados para mostrar (según búsqueda)
  filteredBooks: Books[] = [];
  
  // Libro seleccionado para ver en el modal
  selectedBook: Books | null = null;
  
  // Estado del modal
  isModalOpen: boolean = false;
  
  // Filtros y ordenamiento
  sortBy: 'title' | 'author' | 'rating' | 'date' = 'title';
  filterStatus: 'all' | 'reading' | 'completed' | 'not-started' | 'abandoned' = 'all';
  searchQuery: string = '';

  constructor(private booksService: BooksService) {}

  ngOnInit(): void {
    // Obtener todos los libros
    this.allBooks = this.booksService.getAllBooks();
    this.filteredBooks = [...this.allBooks];
  }

  // Mostrar modal con detalles del libro
  openBookDetails(book: Books): void {
    this.selectedBook = book;
    this.isModalOpen = true;
    // Evitar scroll en el cuerpo cuando el modal está abierto
    document.body.style.overflow = 'hidden';
  }

  // Cerrar modal
  closeModal(): void {
    this.isModalOpen = false;
    this.selectedBook = null;
    // Restaurar scroll en el cuerpo
    document.body.style.overflow = 'auto';
  }
  
  // Prevenir que los clics dentro del modal cierren el modal
  preventClose(event: Event): void {
    event.stopPropagation();
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
  
  // Formatear fecha para mostrarla en el modal
  formatDate(date: Date | null | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }
  
  // Calcular días de lectura
  calculateReadingDays(book: Books): number {
    if (!book.fechaInicio || !book.fechaFin) return 0;
    
    const start = new Date(book.fechaInicio);
    const end = new Date(book.fechaFin);
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24)) + 1; // +1 para incluir el día final
  }
}