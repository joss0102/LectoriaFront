import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BookService } from '../../core/services/book/book.service';
import { UserService,User } from '../../core/services/user/user.service';
import { Book } from '../../core/models/book-model';

// Definición de User para el modal de detalles
interface BookUser {
  id: number;
  name: string;
  avatarUrl: string;
  status: string;
}

// Interface para el modelo de libro adaptado para la interfaz
interface BookDisplay {
  id: number;
  title: string;
  author: string;
  saga?: string;
  genre: string;
  description: string;
  coverUrl: string;
  publishDate: string;
  registeredUsers: BookUser[];
}

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './books.component.html',
  styleUrls: ['./books.component.scss']
})
export class BooksComponent implements OnInit, OnDestroy {
  // Propiedades para filtrado y búsqueda
  searchTerm: string = '';
  filterGenre: string = '';
  sortBy: string = 'title';
  
  // Propiedades de paginación
  currentPage: number = 1;
  itemsPerPage: number = 12;
  totalItems: number = 0;
  totalPages: number = 0;
  
  // Propiedades para el modal y edición
  selectedBook: BookDisplay | null = null;
  isEditingBook: boolean = false;
  editingBook: BookDisplay | null = null;
  showDeleteConfirmation: boolean = false;
  
  // Datos de libros
  books: BookDisplay[] = [];
  filteredBooks: BookDisplay[] = [];
  
  // Datos de usuarios
  users: User[] = [];
  
  // Subscripción para limpiar al destruir el componente
  private subscriptions: Subscription[] = [];
  
  constructor(
    private bookService: BookService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.loadUsers();
    this.loadBooks();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Método para cargar usuarios
  loadUsers(): void {
    this.users = this.userService.getAllUsers();
  }

  // Método para cargar libros desde el servicio
  loadBooks(): void {
    // Podríamos suscribirnos al observable books$ del servicio
    // pero para simplicidad, usaremos getAllBooks
    const serviceBooks = this.bookService.getAllBooks();
    
    // Convertir los libros del servicio al formato que espera la UI
    this.books = serviceBooks.map(book => this.mapBookToDisplay(book));
    
    // Aplicar filtros iniciales
    this.applyFilters();
  }

  // Método para convertir el modelo Book del servicio al modelo que usa la UI
  private mapBookToDisplay(book: Book): BookDisplay {
    const randomId = Math.floor(Math.random() * 1000) + 1; // ID aleatorio para ejemplo
    
    // Crear usuarios registrados basados en los usuarios reales
    const registeredUsers: BookUser[] = this.getRegisteredUsersForBook(book);
    
    // Mapear los géneros a un solo género principal para la UI
    const genre = book.generos && book.generos.length > 0 
      ? book.generos[0].toLowerCase().replace('á', 'a').replace('é', 'e')
      : 'fantasy';
    
    // Generar una fecha de publicación si no existe
    const publishDate = new Date().toISOString().split('T')[0];
    
    return {
      id: randomId,
      title: book.titulo,
      author: book.autor,
      saga: book.saga,
      genre: genre,
      description: book.sinopsis,
      coverUrl: book.imagen || 'https://via.placeholder.com/300x450?text=No+Cover',
      publishDate: publishDate,
      registeredUsers: registeredUsers
    };
  }

  // Método para asignar usuarios a libros de manera pseudo-aleatoria pero consistente
  private getRegisteredUsersForBook(book: Book): BookUser[] {
    const registeredUsers: BookUser[] = [];
    
    // Determinar cuántos usuarios tendrán este libro basado en su estado
    let userCount = 0;
    if (book.estado === 'finalizado') {
      // Libros finalizados son más populares
      userCount = Math.min(3, this.users.length);
    } else if (book.estado === 'en-progreso') {
      // Libros en progreso tienen algunos lectores
      userCount = Math.min(2, this.users.length);
    } else if (book.valoracion && book.valoracion >= 4) {
      // Libros bien valorados
      userCount = Math.min(2, this.users.length);
    } else {
      // Otros libros pueden tener 0-1 usuarios
      userCount = book.titulo.length % 2; // Pseudo-aleatorio pero consistente
    }
    
    // Seleccionar usuarios basados en el título del libro (para consistencia)
    const titleSum = book.titulo.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    
    for (let i = 0; i < userCount; i++) {
      // Selección pseudo-aleatoria pero consistente
      const userIndex = (titleSum + i) % this.users.length;
      const user = this.users[userIndex];
      
      // Determinar estado de lectura
      let status: string;
      if (book.estado === 'finalizado') {
        status = 'Completed';
      } else if (book.estado === 'en-progreso') {
        status = 'Reading';
      } else {
        status = 'Want to Read';
      }
      
      registeredUsers.push({
        id: user.id,
        name: `${user.nombre} ${user.primerApellido}`.trim(),
        avatarUrl: user.imagenPerfil || 'assets/img/default-profile.png',
        status: status
      });
    }
    
    return registeredUsers;
  }

  // Métodos para filtrado y paginación
  applyFilters(): void {
    let result = [...this.books];
    
    // Filtrar por término de búsqueda
    if (this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(book => 
        book.title.toLowerCase().includes(term) || 
        book.author.toLowerCase().includes(term) ||
        (book.saga && book.saga.toLowerCase().includes(term))
      );
    }
    
    // Filtrar por género
    if (this.filterGenre !== '') {
      result = result.filter(book => book.genre === this.filterGenre);
    }
    
    // Ordenar
    result = this.sortBooks(result, this.sortBy);
    
    // Actualizar totales
    this.totalItems = result.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    
    // Aplicar paginación
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.filteredBooks = result.slice(startIndex, startIndex + this.itemsPerPage);
  }
  
  sortBooks(books: BookDisplay[], sortBy: string): BookDisplay[] {
    switch (sortBy) {
      case 'title':
        return books.sort((a, b) => a.title.localeCompare(b.title));
      case 'author':
        return books.sort((a, b) => a.author.localeCompare(b.author));
      case 'saga':
        return books.sort((a, b) => {
          // Ordenar primero por saga (si existe), luego por título
          const sagaA = a.saga || '';
          const sagaB = b.saga || '';
          const sagaCompare = sagaA.localeCompare(sagaB);
          return sagaCompare !== 0 ? sagaCompare : a.title.localeCompare(b.title);
        });
      case 'recent':
        return books.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
      default:
        return books;
    }
  }
  
  goToPage(page: number): void {
    this.currentPage = page;
    this.applyFilters();
  }
  
  clearFilters(): void {
    this.searchTerm = '';
    this.filterGenre = '';
    this.sortBy = 'title';
    this.currentPage = 1;
    this.applyFilters();
  }
  
  // Métodos para el modal de detalles
  openBookDetails(book: BookDisplay): void {
    this.selectedBook = book;
    this.isEditingBook = false;
    this.editingBook = null;
  }
  
  closeBookDetails(): void {
    if (this.isEditingBook) {
      // Mostrar confirmación si hay cambios sin guardar
      const confirmClose = confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirmClose) return;
    }
    
    this.selectedBook = null;
    this.isEditingBook = false;
    this.editingBook = null;
  }
  
  // Métodos para edición
  toggleEditMode(): void {
    if (!this.selectedBook) return;
    
    this.isEditingBook = true;
    // Crear una copia para editar
    this.editingBook = JSON.parse(JSON.stringify(this.selectedBook));
  }
  
  cancelEdit(): void {
    this.isEditingBook = false;
    this.editingBook = null;
  }
  
  saveBookChanges(): void {
    if (!this.editingBook) return;
    
    // Actualizar el libro en la lista
    const index = this.books.findIndex(book => book.id === this.editingBook!.id);
    if (index !== -1) {
      this.books[index] = { ...this.editingBook };
      this.selectedBook = this.books[index];
      
      // Nota: En una implementación real, aquí llamaríamos a un método del servicio
      // para actualizar el libro en el backend
    }
    
    this.isEditingBook = false;
    this.editingBook = null;
    
    // Volver a aplicar filtros para actualizar la lista
    this.applyFilters();
  }
  
  // Métodos para eliminar libro
  confirmDelete(): void {
    this.showDeleteConfirmation = true;
  }
  
  cancelDelete(): void {
    this.showDeleteConfirmation = false;
  }
  
  deleteBook(): void {
    if (!this.selectedBook) return;
    
    // Eliminar libro
    this.books = this.books.filter(book => book.id !== this.selectedBook!.id);
    
    // Cerrar modales
    this.showDeleteConfirmation = false;
    this.selectedBook = null;
    
    // Actualizar la lista
    this.applyFilters();
    
    // Nota: En una implementación real, aquí llamaríamos a un método del servicio
    // para eliminar el libro en el backend
  }
  
  // Método para abrir el modal de añadir libro
  openAddBookModal(): void {
    // Crear un libro vacío
    this.editingBook = {
      id: this.generateNewId(),
      title: '',
      author: '',
      genre: 'fantasy',
      description: '',
      coverUrl: '',
      publishDate: new Date().toISOString().split('T')[0],
      registeredUsers: []
    };
    
    this.isEditingBook = true;
    this.selectedBook = null;
  }
  
  // Método para generar ID único
  generateNewId(): number {
    return Math.max(...this.books.map(book => book.id)) + 1;
  }
}