import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { SearchService,DetailedSearchResult } from '../../../core/services/SearchService/search.service';

import { BookService } from '../../../core/services/call-api/book.service';
import { AuthorService } from '../../../core/services/call-api/author.service';
import { ActivatedRoute, Router } from '@angular/router';

import { Book } from '../../../core/models/call-api/book.model';
import { Author } from '../../../core/models/call-api/author.model';

// Interfaz extendida para manejar propiedades adicionales
interface UserBook extends Book {
  reading_status?: string;
  pages_read?: number;
  progress_percentage?: number;
  date_added?: string;
  date_start?: string;
  date_ending?: string;
  custom_description?: string;
  notes?: string;
  phrases?: string;
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent implements OnInit, OnDestroy {
  selectedItem: DetailedSearchResult | null = null;
  authorBooks: any[] = [];
  loading: boolean = true;
  error: string | null = null;
  
  private searchSubscription: Subscription | null = null;
  
  constructor(
    private searchService: SearchService,
    private bookService: BookService,
    private authorService: AuthorService,
    private route: ActivatedRoute,
    private router: Router
  ) {}
  
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      
      const id = params['id'];
      const type = params['type'];
      
      if (id && (type === 'book' || type === 'author')) {
        this.searchService.selectItemById(parseInt(id), type);
      }
    });
    
    this.searchSubscription = this.searchService.selectedItem$.subscribe(
      item => {
        this.selectedItem = item;
        this.loading = false;
        
        if (item) {
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { id: item.id, type: item.type },
            queryParamsHandling: 'merge'
          });
          
          if (item.type === 'author') {
            this.loadAuthorBooks(item.id);
          }
        }
      },
      error => {
        console.error('Error al cargar el ítem seleccionado:', error);
        this.error = 'No se pudo cargar la información. Por favor, inténtalo de nuevo.';
        this.loading = false;
      }
    );
  }
  
  /**
   * Carga los libros de un autor
   */
  loadAuthorBooks(authorId: number) {
    this.authorService.getAuthorBooks(authorId).subscribe(
      response => {
        this.authorBooks = response.data;
      },
      error => {
        console.error('Error al cargar los libros del autor:', error);
      }
    );
  }
  
  /**
   * Verifica si un ítem es un libro
   */
  isBook(item: any): boolean {
    return item && 'book_id' in item;
  }
  
  /**
   * Verifica si un ítem es un autor
   */
  isAuthor(item: any): boolean {
    return item && 'id' in item && !('book_id' in item);
  }
  
  /**
   * Verifica si un libro está en la biblioteca del usuario
   */
  isInUserLibrary(): boolean {
    const result = this.selectedItem?.inUserLibrary || false;
    return result;
  }
  
  /**
   * Obtiene el libro seleccionado
   */
  getBook(): UserBook {
    const book = this.selectedItem?.data as UserBook;
    return book;
  }
  
  /**
   * Obtiene el autor seleccionado
   */
  getAuthor(): Author {
    return this.selectedItem?.data as Author;
  }
  
  /**
   * Obtiene la URL de la imagen del libro seleccionado
   */
  getBookImageUrl(): string {
    const book = this.getBook();
    if (book) {
      const url = this.searchService.getBookImageUrl(book);
      return url;
    }
    return '/assets/images/book-placeholder.jpg';
  }
  
  /**
   * Obtiene la URL de la imagen del autor seleccionado
   */
  getAuthorImageUrl(): string {
    const author = this.getAuthor();
    return author ? this.searchService.getAuthorImageUrl(author) : '/assets/images/author-placeholder.jpg';
  }
  
  /**
   * Obtiene la URL de la portada para un libro de la lista de libros de un autor
   */
  getBookCoverUrl(book: any): string {
    const bookObj: Book = {
      book_id: book.id,
      book_title: book.title,
      book_pages: book.pages,
      synopsis: book.synopsis,
      sagas: ''
    };
    
    return this.searchService.getBookImageUrl(bookObj);
  }
  
  /**
   * Obtiene el estado de lectura para mostrar la clase correcta
   */
  getReadingStatusClass(): string {
    const status = this.getBook()?.reading_status;
    if (status === 'reading') return 'badge bg-success';
    if (status === 'pending') return 'badge bg-warning';
    if (status === 'finished') return 'badge bg-primary';
    return 'badge bg-secondary';
  }
  
  /**
   * Obtiene el texto del estado de lectura
   */
  getReadingStatusText(): string {
    const status = this.getBook()?.reading_status;
    if (status === 'reading') return 'Leyendo';
    if (status === 'pending') return 'Pendiente';
    if (status === 'finished') return 'Leído';
    return 'Estado desconocido';
  }
  
  /**
   * Navega a la página de detalles de un libro desde la lista de libros de un autor
   */
  goToBookDetails(bookId: number) {
    this.searchService.selectItemById(bookId, 'book');
  }
  
  /**
   * Vuelve a la página anterior
   */
  goBack() {
    window.history.back();
  }
  
  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }
}