import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription, forkJoin, of } from 'rxjs';
import { finalize, catchError, map, switchMap } from 'rxjs/operators';

import { BookService } from '../../../core/services/call-api/book.service';
import { AuthorService } from '../../../core/services/call-api/author.service';
import { UserService } from '../../../core/services/call-api/user.service';
import { ReadingService } from '../../../core/services/call-api/reading.service';
import { AdminAuthorsService } from '../../../core/services/admin/admin-author.service';

import { AddAuthorComponent } from '../add-author/add-author.component';
import { DetailsAuthorComponent } from '../details-author/details-author.component';

import { Author } from '../../../core/models/call-api/author.model';

interface AdminAuthor extends Author {
  total_books?: number;
  books_in_libraries?: number;
  user_count?: number;
}

interface FilterOption {
  id: string;
  label: string;
  value: string;
  type: string;
}

@Component({
  selector: 'app-authors',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    AddAuthorComponent, 
    DetailsAuthorComponent
  ],
  templateUrl: './authors.component.html',
  styleUrl: './authors.component.scss'
})
export class AuthorsComponent implements OnInit, OnDestroy {
  authors: AdminAuthor[] = [];
  displayedAuthors: AdminAuthor[] = [];
  selectedAuthors: number[] = [];
  
  searchQuery: string = '';
  activeFilters: FilterOption[] = [];
  
  filterBooksWrittenMin: number | null = null;
  filterBooksWrittenMax: number | null = null;
  filterUsersMin: number | null = null;
  filterUsersMax: number | null = null;
  
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;
  
  isLoading: boolean = true;
  error: string = '';
  
  isFiltersSidebarOpen: boolean = false;
  isAddAuthorSidebarOpen: boolean = false;
  
  Math = Math;
  
  private subscriptions: Subscription[] = [];
  private allUsers: any[] = [];
  private allBooks: any[] = [];

  constructor(
    private bookService: BookService,
    private authorService: AuthorService,
    private userService: UserService,
    private readingService: ReadingService,
    private adminAuthorsService: AdminAuthorsService
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  /**
   * Carga datos iniciales (usuarios, libros y autores)
   */
  loadInitialData(): void {
    this.isLoading = true;
    this.error = '';
    
    const subscription = forkJoin({
      users: this.userService.getAllUsers().pipe(
        catchError(error => {
          console.error('Error al cargar usuarios:', error);
          return of({ data: [] as any[] });
        })
      ),
      books: this.bookService.getAllBooks(1, 1000).pipe(
        catchError(error => {
          console.error('Error al cargar libros:', error);
          return of({ data: [] as any[] });
        })
      )
    }).pipe(
      switchMap(response => {
        this.allUsers = response.users.data;
        this.allBooks = response.books.data;
        return this.loadAuthors();
      }),
      finalize(() => this.isLoading = false)
    ).subscribe();
    
    this.subscriptions.push(subscription);
  }
  
  /**
   * Carga los autores con información estadística
   */
  loadAuthors(): any {
    this.isLoading = true;
    
    return this.authorService.getAllAuthors()
      .pipe(
        catchError(error => {
          console.error('Error al cargar los autores:', error);
          this.error = 'No se pudieron cargar los autores. Por favor, intenta de nuevo más tarde.';
          this.isLoading = false;
          return of({ data: [] });
        }),
        switchMap(response => {
          if (response.data.length === 0) {
            this.authors = [];
            this.displayedAuthors = [];
            this.isLoading = false;
            return of([]);
          }
          
          const adminAuthors: AdminAuthor[] = response.data.map(author => ({
            ...author,
            total_books: 0,
            books_in_libraries: 0,
            user_count: 0
          }));
          
          if (this.allUsers.length === 0) {
            adminAuthors.forEach(author => {
              const authorFullName = this.getAuthorFullName(author);
              author.total_books = this.allBooks.filter(book => 
                book.authors?.toLowerCase().includes(authorFullName.toLowerCase())
              ).length;
            });
            
            this.authors = adminAuthors;
            this.displayedAuthors = [...this.authors];
            this.totalItems = this.authors.length;
            this.totalPages = Math.ceil(this.totalItems / this.pageSize);
            this.applyFiltersAndSort();
            this.isLoading = false;
            return of(adminAuthors);
          }
          
          const userBookObservables = this.allUsers.map(user => 
            this.bookService.getUserBooks(user.nickName).pipe(
              map(response => ({
                userId: user.nickName,
                books: response.data
              })),
              catchError(() => of({ userId: user.nickName, books: [] }))
            )
          );
          
          return forkJoin(userBookObservables).pipe(
            map(userBooksResults => {
              adminAuthors.forEach(author => {
                const authorFullName = this.getAuthorFullName(author);
                
                const authorBooks = this.allBooks.filter(book => 
                  book.authors?.toLowerCase().includes(authorFullName.toLowerCase())
                );
                author.total_books = authorBooks.length;
                
                const usersWithAuthor = new Set<string>();
                let booksInLibraries = 0;
                
                userBooksResults.forEach(userBooks => {
                  if (userBooks.books) {
                    const userAuthorBooks = userBooks.books.filter(userBook => 
                      authorBooks.some(authorBook => authorBook.book_id === userBook.book_id)
                    );
                    
                    if (userAuthorBooks.length > 0) {
                      usersWithAuthor.add(userBooks.userId);
                      booksInLibraries += userAuthorBooks.length;
                    }
                  }
                });
                
                author.user_count = usersWithAuthor.size;
                author.books_in_libraries = booksInLibraries;
              });
              
              this.authors = adminAuthors;
              this.displayedAuthors = [...this.authors];
              this.totalItems = this.authors.length;
              this.totalPages = Math.ceil(this.totalItems / this.pageSize);
              this.applyFiltersAndSort();
              this.isLoading = false;
              
              return adminAuthors;
            })
          );
        })
      );
  }
  
  /**
   * Obtiene el nombre completo del autor
   */
  getAuthorFullName(author: Author): string {
    return `${author.name} ${author.last_name1 || ''} ${author.last_name2 || ''}`.trim();
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
   * Abre el sidebar para añadir un autor
   */
  addNewAuthor(): void {
    this.isAddAuthorSidebarOpen = true;
    document.body.style.overflow = 'hidden';
  }

  /**
   * Cierra el sidebar de añadir autor
   */
  closeAddAuthorSidebar(): void {
    this.isAddAuthorSidebarOpen = false;
    document.body.style.overflow = 'auto';
  }

  /**
   * Maneja el evento cuando se añade un autor nuevo
   */
  onAuthorAdded(): void {
    this.closeAddAuthorSidebar();
    this.currentPage = 1;
    const subscription = this.loadAuthors().subscribe();
    this.subscriptions.push(subscription);
  }
  
  /**
   * Resetea todos los filtros
   */
  resetFilters(): void {
    this.filterBooksWrittenMin = null;
    this.filterBooksWrittenMax = null;
    this.filterUsersMin = null;
    this.filterUsersMax = null;
  }
  
  /**
   * Aplica los filtros seleccionados
   */
  applyFilters(): void {
    this.activeFilters = [];
    
    if (this.filterBooksWrittenMin !== null || this.filterBooksWrittenMax !== null) {
      let booksLabel = 'Libros escritos: ';
      
      if (this.filterBooksWrittenMin !== null && this.filterBooksWrittenMax !== null) {
        booksLabel += `${this.filterBooksWrittenMin} a ${this.filterBooksWrittenMax}`;
      } else if (this.filterBooksWrittenMin !== null) {
        booksLabel += `Mín. ${this.filterBooksWrittenMin}`;
      } else if (this.filterBooksWrittenMax !== null) {
        booksLabel += `Máx. ${this.filterBooksWrittenMax}`;
      }
      
      this.activeFilters.push({
        id: 'books-written',
        label: booksLabel,
        value: `${this.filterBooksWrittenMin || 0}-${this.filterBooksWrittenMax || 9999}`,
        type: 'books-written'
      });
    }
    
    if (this.filterUsersMin !== null || this.filterUsersMax !== null) {
      let usersLabel = 'Usuarios: ';
      
      if (this.filterUsersMin !== null && this.filterUsersMax !== null) {
        usersLabel += `${this.filterUsersMin} a ${this.filterUsersMax}`;
      } else if (this.filterUsersMin !== null) {
        usersLabel += `Mín. ${this.filterUsersMin}`;
      } else if (this.filterUsersMax !== null) {
        usersLabel += `Máx. ${this.filterUsersMax}`;
      }
      
      this.activeFilters.push({
        id: 'users',
        label: usersLabel,
        value: `${this.filterUsersMin || 0}-${this.filterUsersMax || 9999}`,
        type: 'users'
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
      
      if (filter.type === 'books-written') {
        this.filterBooksWrittenMin = null;
        this.filterBooksWrittenMax = null;
      } else if (filter.type === 'users') {
        this.filterUsersMin = null;
        this.filterUsersMax = null;
      }
      
      this.activeFilters.splice(index, 1);
      this.applyFiltersAndSort();
    }
  }
  
  /**
   * Busca autores por consulta global
   */
  searchGlobalAuthors(): void {
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }
  
  /**
   * Limpia la búsqueda y filtros
   */
  clearSearch(): void {
    this.searchQuery = '';
    this.activeFilters = [];
    this.filterBooksWrittenMin = null;
    this.filterBooksWrittenMax = null;
    this.filterUsersMin = null;
    this.filterUsersMax = null;
    
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }
  
  /**
   * Cambia a la página especificada
   */
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    
    this.currentPage = page;
    this.applyFiltersAndSort();
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
    this.applyFiltersAndSort();
  }
  
  /**
   * Obtiene la URL de la imagen del autor
   */
  getAuthorImageUrl(author: AdminAuthor): string {
    const fullName = this.getAuthorFullName(author);
    return `/autores/${fullName}/autor/${fullName}.jpg`;
  }
  
  /**
   * Maneja errores de carga de imágenes
   */
  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = '/autores/fondo-default.jpg';
  }
  
  /**
   * Selecciona o deselecciona un autor
   */
  toggleAuthorSelection(authorId: number): void {
    const index = this.selectedAuthors.indexOf(authorId);
    if (index === -1) {
      this.selectedAuthors.push(authorId);
    } else {
      this.selectedAuthors.splice(index, 1);
    }
  }
  
  /**
   * Verifica si un autor está seleccionado
   */
  isSelected(authorId: number): boolean {
    return this.selectedAuthors.includes(authorId);
  }
  
  /**
   * Selecciona o deselecciona todos los autores
   */
  toggleSelectAll(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    
    if (isChecked) {
      this.selectedAuthors = this.displayedAuthors.map(author => author.id);
    } else {
      this.selectedAuthors = [];
    }
  }
  
  /**
   * Verifica si todos los autores están seleccionados
   */
  isAllSelected(): boolean {
    return this.displayedAuthors.length > 0 && 
            this.displayedAuthors.every(author => this.selectedAuthors.includes(author.id));
  }
  
  /**
   * Aplica filtros y ordenación
   */
  private applyFiltersAndSort(): void {
    let filteredAuthors = [...this.authors];
    
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filteredAuthors = filteredAuthors.filter(author => 
        this.getAuthorFullName(author).toLowerCase().includes(query) ||
        author.description?.toLowerCase().includes(query)
      );
    }
    
    const booksWrittenFilter = this.activeFilters.find(f => f.type === 'books-written');
    if (booksWrittenFilter) {
      const [minBooks, maxBooks] = booksWrittenFilter.value.split('-').map(Number);
      
      filteredAuthors = filteredAuthors.filter(author => {
        const books = author.total_books || 0;
        return books >= minBooks && books <= maxBooks;
      });
    }
    
    const usersFilter = this.activeFilters.find(f => f.type === 'users');
    if (usersFilter) {
      const [minUsers, maxUsers] = usersFilter.value.split('-').map(Number);
      
      filteredAuthors = filteredAuthors.filter(author => {
        const users = author.user_count || 0;
        return users >= minUsers && users <= maxUsers;
      });
    }
    
    this.totalItems = filteredAuthors.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedAuthors = filteredAuthors.slice(startIndex, endIndex);
  }
  
  /**
   * Muestra los detalles de un autor
   */
  viewAuthorDetails(author: AdminAuthor): void {
    this.adminAuthorsService.setSelectedAuthor(author);
  }
  
  /**
   * Elimina un autor
   */
  deleteAuthor(authorId: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este autor? Esta acción no se puede deshacer.')) {
      const subscription = this.authorService.deleteAuthor(authorId)
        .pipe(
          catchError(error => {
            console.error('Error al eliminar el autor:', error);
            alert('No se pudo eliminar el autor. Por favor, intenta de nuevo más tarde.');
            return of(null);
          })
        )
        .subscribe(response => {
          if (response) {
            this.authors = this.authors.filter(author => author.id !== authorId);
            this.applyFiltersAndSort();
            
            const index = this.selectedAuthors.indexOf(authorId);
            if (index !== -1) {
              this.selectedAuthors.splice(index, 1);
            }
            
            alert('Autor eliminado correctamente');
          }
        });
      
      this.subscriptions.push(subscription);
    }
  }
  
  /**
   * Elimina los autores seleccionados
   */
  deleteSelectedAuthors(): void {
    if (this.selectedAuthors.length === 0) {
      return;
    }
    
    if (confirm(`¿Estás seguro de que deseas eliminar ${this.selectedAuthors.length} autores seleccionados? Esta acción no se puede deshacer.`)) {
      const deleteObservables = this.selectedAuthors.map(authorId => 
        this.authorService.deleteAuthor(authorId).pipe(
          catchError(error => {
            console.error(`Error al eliminar el autor ID ${authorId}:`, error);
            return of(null);
          })
        )
      );
      
      const subscription = forkJoin(deleteObservables)
        .subscribe(results => {
          const successCount = results.filter(result => result !== null).length;
          
          if (successCount > 0) {
            this.authors = this.authors.filter(author => !this.selectedAuthors.includes(author.id));
            this.applyFiltersAndSort();
            this.selectedAuthors = [];
            
            alert(`${successCount} autores eliminados correctamente`);
          } else {
            alert('No se pudo eliminar ningún autor. Por favor, intenta de nuevo más tarde.');
          }
        });
      
      this.subscriptions.push(subscription);
    }
  }
  
  /**
   * Exporta los datos de los autores
   */
  exportAuthors(): void {
    const headers = ['ID', 'Nombre', 'Apellido 1', 'Apellido 2', 'Descripción', 'Libros Escritos', 'En Bibliotecas', 'Usuarios'];
    const csv = [
      headers.join(','),
      ...this.authors.map(author => [
        author.id,
        `"${author.name.replace(/"/g, '""')}"`,
        `"${(author.last_name1 || '').replace(/"/g, '""')}"`,
        `"${(author.last_name2 || '').replace(/"/g, '""')}"`,
        `"${(author.description || '').replace(/"/g, '""')}"`,
        author.total_books || 0,
        author.books_in_libraries || 0,
        author.user_count || 0
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `autores_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}