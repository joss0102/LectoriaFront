import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription, forkJoin, of } from 'rxjs';
import { finalize, catchError, map } from 'rxjs/operators';

import { BookService } from '../../../core/services/call-api/book.service';
import { AuthorService } from '../../../core/services/call-api/author.service';
import { UserService } from '../../../core/services/call-api/user.service';
import { ReadingService } from '../../../core/services/call-api/reading.service';

import { AddBookComponent } from '../add-book/add-book.component';

import { Book, UserBook } from '../../../core/models/call-api/book.model';

interface AdminBook extends Book {
  user_count?: number;
  date_added?: string;
}

interface FilterOption {
  id: string;
  label: string;
  value: string;
  type: string;
}

interface GenreOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AddBookComponent],
  templateUrl: './books.component.html',
  styleUrl: './books.component.scss'
})
export class BooksComponent implements OnInit, OnDestroy {
  books: AdminBook[] = [];
  displayedBooks: AdminBook[] = [];
  selectedBooks: number[] = [];
  
  searchQuery: string = '';
  activeFilters: FilterOption[] = [];
  
  availableGenres: GenreOption[] = [];
  selectedGenres: GenreOption[] = [];
  
  filterPagesMin: number | null = null;
  filterPagesMax: number | null = null;
  filterDateSort: string = '';
  
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;
  
  isLoading: boolean = true;
  error: string = '';
  
  isFiltersSidebarOpen: boolean = false;
  isAddBookSidebarOpen: boolean = false;
  
  Math = Math;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private bookService: BookService,
    private authorService: AuthorService,
    private userService: UserService,
    private readingService: ReadingService
  ) {}

  ngOnInit(): void {
    this.loadBooks();
    this.loadGenres();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  /**
   * Carga los géneros disponibles del servicio
   */
  loadGenres(): void {
    this.availableGenres = [
      { label: 'Fantasía', value: 'fantasia' },
      { label: 'Ciencia Ficción', value: 'ciencia-ficcion' },
      { label: 'Misterio', value: 'misterio' },
      { label: 'Romance', value: 'romance' },
      { label: 'Histórica', value: 'historica' },
      { label: 'Biografía', value: 'biografia' },
      { label: 'Aventura', value: 'aventura' },
      { label: 'Drama', value: 'drama' }
    ];
  }
  
  /**
   * Carga todos los libros con paginación
   */
  loadBooks(): void {
    this.isLoading = true;
    this.error = '';
    
    const subscription = this.bookService.getAllBooks(this.currentPage, this.pageSize, this.searchQuery)
      .pipe(
        finalize(() => this.isLoading = false),
        catchError(error => {
          console.error('Error al cargar los libros:', error);
          this.error = 'No se pudieron cargar los libros. Por favor, intenta de nuevo más tarde.';
          return of({ data: [], pagination: { total_items: 0, total_pages: 0, page: 1, page_size: this.pageSize } });
        })
      )
      .subscribe(response => {
        this.books = response.data.map(book => {
          const adminBook: AdminBook = {
            ...book,
            user_count: Math.floor(Math.random() * 30) + 1,
            date_added: this.generateRandomDate()
          };
          return adminBook;
        });
        
        this.displayedBooks = [...this.books];
        this.totalItems = response.pagination.total_items;
        this.totalPages = response.pagination.total_pages;
        
        this.applyFiltersAndSort();
      });
    
    this.subscriptions.push(subscription);
  }
  
  /**
   * Genera una fecha aleatoria en los últimos 2 años
   */
  private generateRandomDate(): string {
    const now = new Date();
    const pastDate = new Date(now.getFullYear() - 2, 0, 1);
    const randomTimestamp = pastDate.getTime() + Math.random() * (now.getTime() - pastDate.getTime());
    return new Date(randomTimestamp).toISOString();
  }
  
  /**
   * Abre el sidebar de filtros
   */
  openFiltersSidebar(): void {
    this.isFiltersSidebarOpen = true;
    document.body.style.overflow = 'hidden';
  }
  
  /**
   * Cierra el sidebar de filtros
   */
  closeFiltersSidebar(): void {
    this.isFiltersSidebarOpen = false;
    document.body.style.overflow = 'auto';
  }

  /**
   * Abre el sidebar para añadir un nuevo libro
   */
  addNewBook(): void {
    this.isAddBookSidebarOpen = true;
    document.body.style.overflow = 'hidden';
  }

  /**
   * Cierra el sidebar de añadir libro
   */
  closeAddBookSidebar(): void {
    this.isAddBookSidebarOpen = false;
    document.body.style.overflow = 'auto';
  }

  /**
   * Maneja el evento de libro añadido correctamente
   */
  onBookAdded(): void {
    console.log('Evento bookAdded recibido: recargando libros...');
    this.closeAddBookSidebar();
    this.currentPage = 1;
    this.loadBooks();
  }
  
  /**
   * Procesa la selección de un género desde el select
   */
  onGenreSelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const genreValue = selectElement.value;
    
    if (!genreValue) return;
    
    if (this.selectedGenres.some(g => g.value === genreValue)) {
      return;
    }
    
    const genre = this.availableGenres.find(g => g.value === genreValue);
    if (genre) {
      this.selectedGenres.push({ ...genre });
      
      selectElement.value = '';
    }
  }
  
  /**
   * Elimina un género de la lista de seleccionados
   */
  removeSelectedGenre(genreValue: string): void {
    this.selectedGenres = this.selectedGenres.filter(g => g.value !== genreValue);
  }
  
  /**
   * Resetea todos los filtros
   */
  resetFilters(): void {
    this.selectedGenres = [];
    this.filterPagesMin = null;
    this.filterPagesMax = null;
    this.filterDateSort = '';
  }
  
  /**
   * Aplica los filtros seleccionados en el sidebar
   */
  applyFilters(): void {
    this.activeFilters = [];
    
    if (this.selectedGenres.length > 0) {
      this.selectedGenres.forEach(genre => {
        this.activeFilters.push({
          id: `genre-${genre.value}`,
          label: `Género: ${genre.label}`,
          value: genre.value,
          type: 'genre'
        });
      });
    }
    
    if (this.filterPagesMin !== null || this.filterPagesMax !== null) {
      let pagesLabel = 'Páginas: ';
      
      if (this.filterPagesMin !== null && this.filterPagesMax !== null) {
        pagesLabel += `${this.filterPagesMin} a ${this.filterPagesMax}`;
      } else if (this.filterPagesMin !== null) {
        pagesLabel += `Mín. ${this.filterPagesMin}`;
      } else if (this.filterPagesMax !== null) {
        pagesLabel += `Máx. ${this.filterPagesMax}`;
      }
      
      this.activeFilters.push({
        id: 'pages',
        label: pagesLabel,
        value: `${this.filterPagesMin || 0}-${this.filterPagesMax || 9999}`,
        type: 'pages'
      });
    }
    
    if (this.filterDateSort) {
      const sortLabel = this.filterDateSort === 'newest' 
                      ? 'Ordenar: Más recientes' 
                      : 'Ordenar: Más antiguos';
      
      this.activeFilters.push({
        id: 'date-sort',
        label: sortLabel,
        value: this.filterDateSort,
        type: 'date-sort'
      });
    }
    
    this.applyFiltersAndSort();
    this.closeFiltersSidebar();
  }
  
  /**
   * Elimina un filtro activo
   */
  removeFilter(filterId: string): void {
    const index = this.activeFilters.findIndex(filter => filter.id === filterId);
    
    if (index !== -1) {
      const filter = this.activeFilters[index];
      
      if (filter.type === 'genre') {
        const genreValue = filter.value;
        this.selectedGenres = this.selectedGenres.filter(g => g.value !== genreValue);
      } else if (filter.type === 'pages') {
        this.filterPagesMin = null;
        this.filterPagesMax = null;
      } else if (filter.type === 'date-sort') {
        this.filterDateSort = '';
      }
      
      this.activeFilters.splice(index, 1);
      
      this.applyFiltersAndSort();
    }
  }
  
  /**
   * Busca libros por consulta en todas las páginas (búsqueda global)
   */
  searchGlobalBooks(): void {
    this.currentPage = 1;
    this.loadBooks();
  }
  
  /**
   * Limpia la búsqueda y todos los filtros
   */
  clearSearch(): void {
    this.searchQuery = '';
    this.activeFilters = [];
    this.selectedGenres = [];
    this.filterPagesMin = null;
    this.filterPagesMax = null;
    this.filterDateSort = '';
    
    this.currentPage = 1;
    this.loadBooks();
  }
  
  /**
   * Cambia la página actual
   */
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    
    this.currentPage = page;
    this.loadBooks();
  }
  
  /**
   * Obtiene los números de página a mostrar
   */
  getPageNumbers(): number[] {
    const displayedPages = [];
    
    if (this.totalPages <= 5) {
      for (let i = 1; i <= this.totalPages; i++) {
        displayedPages.push(i);
      }
    } else {
      if (this.currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          displayedPages.push(i);
        }
      } else if (this.currentPage >= this.totalPages - 2) {
        for (let i = this.totalPages - 4; i <= this.totalPages; i++) {
          displayedPages.push(i);
        }
      } else {
        for (let i = this.currentPage - 2; i <= this.currentPage + 2; i++) {
          displayedPages.push(i);
        }
      }
    }
    
    return displayedPages;
  }
  
  /**
   * Cambia el tamaño de página
   */
  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadBooks();
  }
  
  /**
   * Obtiene la URL de la imagen de portada
   */
  getBookImageUrl(book: AdminBook): string {
    if (!book) {
      return '/libros/default.png';
    } else {
      if (book.sagas) {
        return `/libros/${book.sagas}/covers/${book.book_title}.png`;
      } else {
        return `/libros/default.png`;
      }
    }
  }
  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = '/libros/default.png';
  }
  
  /**
   * Formatea una fecha para mostrarla
   */
  formatDate(date: string | null | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }
  
  /**
   * Selecciona o deselecciona un libro
   */
  toggleBookSelection(bookId: number): void {
    const index = this.selectedBooks.indexOf(bookId);
    if (index === -1) {
      this.selectedBooks.push(bookId);
    } else {
      this.selectedBooks.splice(index, 1);
    }
  }
  
  /**
   * Verifica si un libro está seleccionado
   */
  isSelected(bookId: number): boolean {
    return this.selectedBooks.includes(bookId);
  }
  
  /**
   * Selecciona o deselecciona todos los libros
   */
  toggleSelectAll(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    
    if (isChecked) {
      // Seleccionar todos los libros visibles
      this.selectedBooks = this.displayedBooks.map(book => book.book_id);
    } else {
      // Deseleccionar todos
      this.selectedBooks = [];
    }
  }
  
  /**
   * Verifica si todos los libros están seleccionados
   */
  isAllSelected(): boolean {
    return this.displayedBooks.length > 0 && 
            this.displayedBooks.every(book => this.selectedBooks.includes(book.book_id));
  }
  
  /**
   * Aplica todos los filtros y ordenaciones activos
   */
  private applyFiltersAndSort(): void {
    this.displayedBooks = [...this.books];
    
    const genreFilters = this.activeFilters.filter(f => f.type === 'genre');
    if (genreFilters.length > 0) {
      this.displayedBooks = this.displayedBooks.filter(book => {
        if (!book.genres) return false;
        
        const bookGenres = book.genres.toLowerCase();
        return genreFilters.some(filter => 
          bookGenres.includes(filter.value.toLowerCase())
        );
      });
    }
    
    const pagesFilter = this.activeFilters.find(f => f.type === 'pages');
    if (pagesFilter) {
      const [minPages, maxPages] = pagesFilter.value.split('-').map(Number);
      
      this.displayedBooks = this.displayedBooks.filter(book => {
        const pages = book.book_pages || 0;
        return pages >= minPages && pages <= maxPages;
      });
    }
    
    const dateSort = this.activeFilters.find(f => f.type === 'date-sort');
    if (dateSort) {
      this.displayedBooks.sort((a, b) => {
        const dateA = new Date(a.date_added || '').getTime();
        const dateB = new Date(b.date_added || '').getTime();
        
        if (dateSort.value === 'newest') {
          return dateB - dateA;
        } else {
          return dateA - dateB;
        }
      });
    }
  }
  
  /**
   * Edita un libro existente
   */
  editBook(book: AdminBook): void {
    console.log('Editar libro:', book);
  }
  
  /**
   * Muestra los detalles de un libro
   */
  viewBookDetails(book: AdminBook): void {
    console.log('Ver detalles del libro:', book);
  }
  
  /**
   * Elimina un libro
   */
  deleteBook(bookId: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este libro? Esta acción no se puede deshacer.')) {
      console.log('Eliminar libro:', bookId);
      this.books = this.books.filter(book => book.book_id !== bookId);
      this.displayedBooks = this.displayedBooks.filter(book => book.book_id !== bookId);
      const index = this.selectedBooks.indexOf(bookId);
      if (index !== -1) {
        this.selectedBooks.splice(index, 1);
      }
    }
  }
  
  /**
   * Elimina los libros seleccionados
   */
  deleteSelectedBooks(): void {
    if (this.selectedBooks.length === 0) {
      return;
    }
    
    if (confirm(`¿Estás seguro de que deseas eliminar ${this.selectedBooks.length} libros seleccionados? Esta acción no se puede deshacer.`)) {
      console.log('Eliminar libros seleccionados:', this.selectedBooks);
      
      this.books = this.books.filter(book => !this.selectedBooks.includes(book.book_id));
      this.displayedBooks = this.displayedBooks.filter(book => !this.selectedBooks.includes(book.book_id));
      this.selectedBooks = [];
    }
  }
  
  /**
   * Exporta los datos de los libros
   */
  exportBooks(): void {
    console.log('Exportar libros - Función no implementada');
  }
}