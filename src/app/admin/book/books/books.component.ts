import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription, forkJoin, of } from 'rxjs';
import { finalize, catchError, map, switchMap } from 'rxjs/operators';

import { BookService } from '../../../core/services/call-api/book.service';
import { AuthorService } from '../../../core/services/call-api/author.service';
import { UserService } from '../../../core/services/call-api/user.service';
import { ReadingService } from '../../../core/services/call-api/reading.service';
import { AdminBooksService } from '../../../core/services/admin/admin-books.service';

import { AddBookComponent } from '../add-book/add-book.component';
import { DetailsBookComponent } from '../details-book/details-book.component';

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
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    AddBookComponent, 
    DetailsBookComponent
  ],
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
  private allUsers: any[] = [];

  constructor(
    private bookService: BookService,
    private authorService: AuthorService,
    private userService: UserService,
    private readingService: ReadingService,
    private adminBooksService: AdminBooksService
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
    this.loadGenres();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  // Carga los géneros disponibles
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
  
  // Carga datos iniciales (usuarios y libros)
  loadInitialData(): void {
    this.isLoading = true;
    this.error = '';
    
    const subscription = this.userService.getAllUsers()
      .pipe(
        catchError(error => {
          console.error('Error al cargar usuarios:', error);
          return of({ data: [] as any[] });
        }),
        switchMap(response => {
          this.allUsers = response.data;
          return this.loadBooks();
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe();
    
    this.subscriptions.push(subscription);
  }
  
  // Carga los libros con información de conteo de usuarios
  loadBooks(): any {
    this.isLoading = true;
    
    return this.bookService.getAllBooks(this.currentPage, this.pageSize, this.searchQuery)
      .pipe(
        catchError(error => {
          console.error('Error al cargar los libros:', error);
          this.error = 'No se pudieron cargar los libros. Por favor, intenta de nuevo más tarde.';
          this.isLoading = false;
          return of({ data: [], pagination: { total_items: 0, total_pages: 0, page: 1, page_size: this.pageSize } });
        }),
        switchMap(response => {
          this.totalItems = response.pagination.total_items;
          this.totalPages = response.pagination.total_pages;
          
          if (response.data.length === 0) {
            this.books = [];
            this.displayedBooks = [];
            this.isLoading = false;
            return of([]);
          }
          
          const adminBooks: AdminBook[] = response.data.map(book => ({
            ...book,
            user_count: 0,
            date_added: undefined
          }));
          
          if (this.allUsers.length === 0) {
            this.books = adminBooks;
            this.displayedBooks = [...this.books];
            this.applyFiltersAndSort();
            this.isLoading = false;
            return of([]);
          }
          
          const userBookPromises = this.allUsers.map(user => 
            this.bookService.getUserBooks(user.nickName)
              .pipe(
                map(response => ({ 
                  userId: user.nickName, 
                  books: response.data 
                })),
                catchError(() => of({ userId: user.nickName, books: [] }))
              )
          );
          
          return forkJoin(userBookPromises).pipe(
            map(userBooksResults => {
              const bookUserCounts = new Map<number, number>();
              const bookEarliestDates = new Map<number, Date>();
              
              userBooksResults.forEach(userBooks => {
                if (userBooks.books) {
                  userBooks.books.forEach((userBook: UserBook) => {
                    const bookId = userBook.book_id;
                    
                    // Actualizar contador de usuarios
                    const currentCount = bookUserCounts.get(bookId) || 0;
                    bookUserCounts.set(bookId, currentCount + 1);
                    
                    // Actualizar fecha más antigua
                    if (userBook.date_added) {
                      const addedDate = new Date(userBook.date_added);
                      const currentEarliestDate = bookEarliestDates.get(bookId);
                      
                      if (!currentEarliestDate || addedDate < currentEarliestDate) {
                        bookEarliestDates.set(bookId, addedDate);
                      }
                    }
                  });
                }
              });
              
              // Actualizar los libros con el conteo y la fecha más antigua
              adminBooks.forEach(book => {
                book.user_count = bookUserCounts.get(book.book_id) || 0;
                
                const earliestDate = bookEarliestDates.get(book.book_id);
                if (earliestDate) {
                  book.date_added = earliestDate.toISOString();
                } else if (book.user_count === 0) {
                  // Si no hay usuarios, asignar fecha actual
                  book.date_added = new Date().toISOString();
                }
              });
              
              this.books = adminBooks;
              this.displayedBooks = [...this.books];
              this.applyFiltersAndSort();
              this.isLoading = false;
              
              return adminBooks;
            })
          );
        })
      );
  }
  
  // Abre el sidebar de filtros
  openFiltersSidebar(): void {
    this.isFiltersSidebarOpen = true;
    document.body.style.overflow = 'hidden';
  }
  
  // Cierra el sidebar de filtros
  closeFiltersSidebar(): void {
    this.isFiltersSidebarOpen = false;
    document.body.style.overflow = 'auto';
  }

  // Abre el sidebar para añadir un libro
  addNewBook(): void {
    this.isAddBookSidebarOpen = true;
    document.body.style.overflow = 'hidden';
  }

  // Cierra el sidebar de añadir libro
  closeAddBookSidebar(): void {
    this.isAddBookSidebarOpen = false;
    document.body.style.overflow = 'auto';
  }

  // Maneja el evento cuando se añade un libro nuevo
  onBookAdded(): void {
    this.closeAddBookSidebar();
    this.currentPage = 1;
    const subscription = this.loadBooks().subscribe();
    this.subscriptions.push(subscription);
  }
  
  // Procesa la selección de un género
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
  
  // Elimina un género seleccionado
  removeSelectedGenre(genreValue: string): void {
    this.selectedGenres = this.selectedGenres.filter(g => g.value !== genreValue);
  }
  
  // Resetea todos los filtros
  resetFilters(): void {
    this.selectedGenres = [];
    this.filterPagesMin = null;
    this.filterPagesMax = null;
    this.filterDateSort = '';
  }
  
  // Aplica los filtros seleccionados
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
  
  // Elimina un filtro activo
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
  
  // Busca libros por consulta global
  searchGlobalBooks(): void {
    this.currentPage = 1;
    const subscription = this.loadBooks().subscribe();
    this.subscriptions.push(subscription);
  }
  
  // Limpia la búsqueda y filtros
  clearSearch(): void {
    this.searchQuery = '';
    this.activeFilters = [];
    this.selectedGenres = [];
    this.filterPagesMin = null;
    this.filterPagesMax = null;
    this.filterDateSort = '';
    
    this.currentPage = 1;
    const subscription = this.loadBooks().subscribe();
    this.subscriptions.push(subscription);
  }
  
  // Cambia a la página especificada
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    
    this.currentPage = page;
    const subscription = this.loadBooks().subscribe();
    this.subscriptions.push(subscription);
  }
  
  // Obtiene los números de página a mostrar
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
  
  // Cambia el tamaño de página
  onPageSizeChange(): void {
    this.currentPage = 1;
    const subscription = this.loadBooks().subscribe();
    this.subscriptions.push(subscription);
  }
  
  // Obtiene la URL de la imagen del libro
  getBookImageUrl(book: AdminBook): string {
    if (!book) {
      return '/libros/default.png';
    } else {
      if (book.sagas) {
        return `/libros/${book.sagas}/covers/${book.book_title}.png`;
      } else {
        return '/libros/default.png';
      }
    }
  }
  
  // Maneja errores de carga de imágenes
  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = '/libros/default.png';
  }
  
  // Formatea una fecha para mostrarla
  formatDate(date: string | null | undefined): string {
    if (!date) return 'N/A';
    
    try {
      return new Date(date).toLocaleDateString();
    } catch (error) {
      return 'N/A';
    }
  }
  
  // Selecciona o deselecciona un libro
  toggleBookSelection(bookId: number): void {
    const index = this.selectedBooks.indexOf(bookId);
    if (index === -1) {
      this.selectedBooks.push(bookId);
    } else {
      this.selectedBooks.splice(index, 1);
    }
  }
  
  // Verifica si un libro está seleccionado
  isSelected(bookId: number): boolean {
    return this.selectedBooks.includes(bookId);
  }
  
  // Selecciona o deselecciona todos los libros
  toggleSelectAll(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    
    if (isChecked) {
      this.selectedBooks = this.displayedBooks.map(book => book.book_id);
    } else {
      this.selectedBooks = [];
    }
  }
  
  // Verifica si todos los libros están seleccionados
  isAllSelected(): boolean {
    return this.displayedBooks.length > 0 && 
            this.displayedBooks.every(book => this.selectedBooks.includes(book.book_id));
  }
  
  // Aplica filtros y ordenación
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
        const dateA = new Date(a.date_added || '').getTime() || 0;
        const dateB = new Date(b.date_added || '').getTime() || 0;
        
        if (dateSort.value === 'newest') {
          return dateB - dateA;
        } else {
          return dateA - dateB;
        }
      });
    }
  }
  
  // Muestra los detalles de un libro
  viewBookDetails(book: AdminBook): void {
    this.adminBooksService.setSelectedBook(book);
  }
  
  // Elimina un libro
  deleteBook(bookId: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este libro? Esta acción no se puede deshacer.')) {
      const subscription = this.bookService.deleteBook(bookId)
        .pipe(
          catchError(error => {
            console.error('Error al eliminar el libro:', error);
            alert('No se pudo eliminar el libro. Por favor, intenta de nuevo más tarde.');
            return of(null);
          })
        )
        .subscribe(response => {
          if (response) {
            this.books = this.books.filter(book => book.book_id !== bookId);
            this.displayedBooks = this.displayedBooks.filter(book => book.book_id !== bookId);
            
            const index = this.selectedBooks.indexOf(bookId);
            if (index !== -1) {
              this.selectedBooks.splice(index, 1);
            }
            
            alert('Libro eliminado correctamente');
          }
        });
      
      this.subscriptions.push(subscription);
    }
  }
  
  // Elimina los libros seleccionados
  deleteSelectedBooks(): void {
    if (this.selectedBooks.length === 0) {
      return;
    }
    
    if (confirm(`¿Estás seguro de que deseas eliminar ${this.selectedBooks.length} libros seleccionados? Esta acción no se puede deshacer.`)) {
      const deleteObservables = this.selectedBooks.map(bookId => 
        this.bookService.deleteBook(bookId).pipe(
          catchError(error => {
            console.error(`Error al eliminar el libro ID ${bookId}:`, error);
            return of(null);
          })
        )
      );
      
      const subscription = forkJoin(deleteObservables)
        .subscribe(results => {
          const successCount = results.filter(result => result !== null).length;
          
          if (successCount > 0) {
            this.books = this.books.filter(book => !this.selectedBooks.includes(book.book_id));
            this.displayedBooks = this.displayedBooks.filter(book => !this.selectedBooks.includes(book.book_id));
            
            this.selectedBooks = [];
            
            alert(`${successCount} libros eliminados correctamente`);
          } else {
            alert('No se pudo eliminar ningún libro. Por favor, intenta de nuevo más tarde.');
          }
        });
      
      this.subscriptions.push(subscription);
    }
  }
  
  // Exporta los datos de los libros
  exportBooks(): void {
    const headers = ['ID', 'Título', 'Autor', 'Páginas', 'Género', 'Saga', 'Usuarios'];
    const csv = [
      headers.join(','),
      ...this.books.map(book => [
        book.book_id,
        `"${book.book_title.replace(/"/g, '""')}"`,
        `"${book.authors?.replace(/"/g, '""') || ''}"`,
        book.book_pages || 0,
        `"${book.genres?.replace(/"/g, '""') || ''}"`,
        `"${book.sagas?.replace(/"/g, '""') || ''}"`,
        book.user_count || 0
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `libros_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}