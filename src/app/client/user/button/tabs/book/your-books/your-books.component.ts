import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription, forkJoin, of, catchError } from 'rxjs';

import { BookService } from '../../../../../../core/services/call-api/book.service';
import { ReadingService } from '../../../../../../core/services/call-api/reading.service';
import { AuthService } from '../../../../../../core/services/auth/auth.service';

import { UserBook } from '../../../../../../core/models/call-api/book.model';
import { Review, ReadingProgress, Phrase, Note } from '../../../../../../core/models/call-api/reading.model';

@Component({
  selector: 'app-your-books',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './your-books.component.html',
  styleUrl: './your-books.component.scss'
})
export class YourBooksComponent implements OnInit, OnDestroy {
  allBooks: UserBook[] = [];

  filteredBooks: UserBook[] = [];

  selectedBook: UserBook | null = null;
  selectedBookReadingProgress: ReadingProgress[] = [];
  selectedBookPhrases: Phrase[] = [];
  selectedBookNotes: Note[] = [];
  selectedBookReview: Review | null = null;
  
  isModalOpen: boolean = false;
  isEditModalOpen: boolean = false;

  editBookForm: FormGroup;
  isSubmitting: boolean = false;
  formError: string = '';

  searchQuery: string = '';

  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;

  currentUser: string = '';
  isLoading: boolean = true;
  error: string = '';

  private subscriptions: Subscription[] = [];

  constructor(
    private bookService: BookService,
    private readingService: ReadingService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.editBookForm = this.fb.group({
      book_title: ['', Validators.required],
      book_pages: [0, [Validators.required, Validators.min(1)]],
      synopsis: [''],
      authors: ['', Validators.required],
      genres: [''],
      sagas: [''],
      custom_description: [''],
      reading_status: ['']
    });
  }

  ngOnInit(): void {
    this.getCurrentUser();
    window.addEventListener('error', (e) => {
      if (e.target instanceof HTMLImageElement) {
        console.warn('Error cargando imagen:', e.target.src);
        e.target.src = '/assets/images/book-placeholder.jpg';
      }
    }, true);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  getCurrentUser(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      this.currentUser = user.nickname;
      this.loadUserBooks();
    } else {
      this.error = 'No se ha encontrado un usuario activo.';
      this.isLoading = false;
    }
  }

  // Cargar libros del usuario
  loadUserBooks(status?: string): void {
    this.isLoading = true;
    const subscription = this.bookService.getUserBooks(this.currentUser, status, this.currentPage, this.pageSize)
      .subscribe({
        next: (response) => {
          if (response && response.data) {
            const bookDetailsRequests = response.data.map(book => {
              return this.bookService.getBookById(book.book_id).pipe(
                catchError(error => {
                  console.error(`Error al obtener detalles del libro ${book.book_id}:`, error);
                  return of(book);
                })
              );
            });
            
            forkJoin(bookDetailsRequests).subscribe(detailedBooks => {
              
              this.allBooks = response.data.map((book, index) => {
                const detailedBook = detailedBooks[index];
                
                return {
                  ...book,
                  authors: detailedBook.authors || book.authors || 'Autor desconocido',
                  sagas: detailedBook.sagas || book.sagas || '',
                  synopsis: detailedBook.synopsis || book.synopsis || 'No hay sinopsis disponible',
                  book_pages: detailedBook.book_pages || book.book_pages || 0,
                  genres: detailedBook.genres || book.genres || ''
                } as UserBook;
              });
              
              this.filteredBooks = [...this.allBooks];
              this.totalItems = response.pagination.total_items;
              this.totalPages = response.pagination.total_pages;
              this.isLoading = false;
            });
          } else {
            console.error('Formato de respuesta inesperado:', response);
            this.error = 'Los datos recibidos no tienen el formato esperado.';
            this.isLoading = false;
          }
        },
        error: (err) => {
          console.error('Error al cargar los libros:', err);
          this.error = 'No se pudieron cargar los libros. Por favor, intenta de nuevo más tarde.';
          this.isLoading = false;
        }
      });
    this.subscriptions.push(subscription);
  }

  // Cargar detalles adicionales para un libro seleccionado
  loadBookDetails(book: UserBook): void {
    this.isLoading = true;
    this.selectedBook = book;
    


    if (!book.synopsis || !book.authors || !book.genres) {
      this.bookService.getBookById(book.book_id)
        .subscribe({
          next: (completeBook) => {
            console.log('Datos completos del libro:', completeBook);
            if (completeBook && this.selectedBook) {
              this.selectedBook = {
                ...this.selectedBook,
                synopsis: completeBook.synopsis || this.selectedBook.synopsis || 'No hay sinopsis disponible',
                authors: completeBook.authors || this.selectedBook.authors || 'Autor desconocido',
                genres: completeBook.genres || this.selectedBook.genres || '',
                sagas: completeBook.sagas || this.selectedBook.sagas || '',
                book_pages: completeBook.book_pages || this.selectedBook.book_pages || 0
              } as UserBook;
            }
          },
          error: (err) => {
            console.error('Error al obtener datos completos del libro:', err);
          }
        });
    }
    const progressSub = this.readingService.getReadingProgress(this.currentUser, book.book_title)
      .subscribe({
        next: (response) => {
          this.selectedBookReadingProgress = response.data;
          if (response.data && response.data.length > 0 && this.selectedBook) {
            const latestProgress = response.data[response.data.length - 1];
            this.selectedBook.pages_read = latestProgress.cumulative_pages_read;
            this.selectedBook.progress_percentage = latestProgress.cumulative_progress_percentage;
          }
        },
        error: (err) => {
          console.error('Error al cargar el progreso de lectura:', err);
        }
      });
    this.subscriptions.push(progressSub);

    const phrasesSub = this.readingService.getPhrases(book.book_title, this.currentUser)
      .subscribe({
        next: (response) => {
          this.selectedBookPhrases = response.data;
        },
        error: (err) => {
          console.error('Error al cargar las frases destacadas:', err);
        }
      });
    this.subscriptions.push(phrasesSub);
    const notesSub = this.readingService.getNotes(book.book_title, this.currentUser)
      .subscribe({
        next: (response) => {
          this.selectedBookNotes = response.data;
        },
        error: (err) => {
          console.error('Error al cargar las notas:', err);
        }
      });
    this.subscriptions.push(notesSub);
    const reviewSub = this.readingService.getBookReviews(book.book_title, this.currentUser)
      .subscribe({
        next: (response) => {
          if (response.data.length > 0) {
            this.selectedBookReview = response.data[0];
          } else {
            this.selectedBookReview = null;
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error al cargar las reseñas:', err);
          this.isLoading = false;
        }
      });
    this.subscriptions.push(reviewSub);
  }

  // Mostrar modal con detalles del libro
  openBookDetails(book: UserBook): void {
    this.loadBookDetails(book);
    this.isModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  // Cerrar modal
  closeModal(): void {
    this.isModalOpen = false;
    this.selectedBook = null;
    this.selectedBookReadingProgress = [];
    this.selectedBookPhrases = [];
    this.selectedBookNotes = [];
    this.selectedBookReview = null;
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
      book.book_title.toLowerCase().includes(query) || 
      book.authors?.toLowerCase().includes(query) ||
      book.sagas?.toLowerCase().includes(query)
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
      case 'reading':
        return 'status-reading';
      case 'completed':
        return 'status-completed';
      case 'dropped':
        return 'status-abandoned';
      case 'planned':
      default:
        return 'status-not-started';
    }
  }
  
  // Método para obtener el texto del estado
  getStatusText(status?: string): string {
    switch(status) {
      case 'reading':
        return 'Leyendo';
      case 'completed':
        return 'Completado';
      case 'dropped':
        return 'Abandonado';
      case 'on_hold':
        return 'En espera';
      case 'planned':
      default:
        return 'No iniciado';
    }
  }
  
  // Formatear fecha para mostrarla en el modal
  formatDate(date: string | null | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }
  
  // Calcular días de lectura
  calculateReadingDays(startDate?: string, endDate?: string): number {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24)) + 1; // +1 para incluir el día final
  }

  // Cambiar página
  changePage(page: number): void {
    this.currentPage = page;
    this.loadUserBooks();
  }

  // Actualizar el estado de un libro
  updateBookStatus(bookId: number, status: string): void {
    const updateData = { status: status };
    this.bookService.updateUserBookRelationship(this.currentUser, bookId, updateData)
      .subscribe({
        next: () => {
          this.loadUserBooks();
          if (this.selectedBook && this.selectedBook.book_id === bookId) {
            this.selectedBook.reading_status = status;
          }
        },
        error: (err) => {
          console.error('Error al actualizar el estado del libro:', err);
        }
      });
  }

  // Obtener la URL de la imagen del libro
  getBookImageUrl(book: UserBook | null): string {
    if (!book) {
      return '/assets/images/book-placeholder.jpg';
    } else {
      if (book.sagas) {
        return `/libros/${book.sagas}/covers/${book.book_title}.png`;
      } else {
        // URL diferente cuando no hay saga
        return `/libros/covers/${book.book_title}.png`;
      }
    }
  }
// Abrir formulario de edición
openEditForm(): void {
  if (!this.selectedBook) return;
  // Rellenar el formulario con los datos actuales
  this.editBookForm.patchValue({
    book_title: this.selectedBook.book_title || '',
    book_pages: this.selectedBook.book_pages || 0,
    synopsis: this.selectedBook.synopsis || '',
    authors: this.selectedBook.authors || '',
    genres: this.selectedBook.genres || '',
    sagas: this.selectedBook.sagas || '',
    custom_description: this.selectedBook.custom_description || '',
    reading_status: this.selectedBook.reading_status || 'planned'
  });
  
  this.isEditModalOpen = true;
}

// Cerrar formulario de edición
closeEditForm(): void {
  this.isEditModalOpen = false;
  this.formError = '';
}

// Guardar cambios del libro
saveBookChanges(): void {
  if (this.editBookForm.invalid) {
    this.formError = 'Por favor, completa todos los campos requeridos correctamente.';
    return;
  }
  if (!this.selectedBook) {
    this.formError = 'No se ha seleccionado ningún libro para editar.';
    return;
  }
  this.isSubmitting = true;
  this.formError = '';
  const bookData = {
    title: this.editBookForm.value.book_title,
    pages: this.editBookForm.value.book_pages,
    synopsis: this.editBookForm.value.synopsis,
    // Separar el nombre del autor y apellidos
    author_name: this.getAuthorParts(this.editBookForm.value.authors).name,
    author_last_name1: this.getAuthorParts(this.editBookForm.value.authors).lastName1,
    author_last_name2: this.getAuthorParts(this.editBookForm.value.authors).lastName2,
    // Si hay múltiples géneros, dividirlos
    genre1: this.getGenreParts(this.editBookForm.value.genres)[0] || '',
    genre2: this.getGenreParts(this.editBookForm.value.genres)[1] || '',
    genre3: this.getGenreParts(this.editBookForm.value.genres)[2] || '',
    genre4: this.getGenreParts(this.editBookForm.value.genres)[3] || '',
    genre5: this.getGenreParts(this.editBookForm.value.genres)[4] || '',
    saga_name: this.editBookForm.value.sagas
  };
  const updateBookSub = this.bookService.updateBook(this.selectedBook.book_id, bookData)
    .subscribe({
      next: () => {
        const userBookData = {
          status: this.editBookForm.value.reading_status,
          custom_description: this.editBookForm.value.custom_description
        };
        
        const updateUserBookSub = this.bookService.updateUserBookRelationship(
          this.currentUser, 
          this.selectedBook!.book_id, 
          userBookData
        ).subscribe({
          next: () => {
            console.log('Libro actualizado correctamente');
            this.isSubmitting = false;
            this.isEditModalOpen = false;
            
            if (this.selectedBook) {
              this.selectedBook = {
                ...this.selectedBook,
                book_title: bookData.title,
                book_pages: bookData.pages,
                synopsis: bookData.synopsis,
                authors: this.editBookForm.value.authors,
                genres: this.editBookForm.value.genres,
                sagas: bookData.saga_name,
                custom_description: userBookData.custom_description,
                reading_status: userBookData.status
              } as UserBook;
            }
            
            this.loadUserBooks();
          },
          error: (err) => {
            console.error('Error al actualizar la relación usuario-libro:', err);
            this.formError = 'Ocurrió un error al actualizar el estado del libro.';
            this.isSubmitting = false;
          }
        });
        
        this.subscriptions.push(updateUserBookSub);
      },
      error: (err) => {
        console.error('Error al actualizar el libro:', err);
        this.formError = 'Ocurrió un error al actualizar el libro. Por favor, intenta de nuevo.';
        this.isSubmitting = false;
      }
    });
  
  this.subscriptions.push(updateBookSub);
}

// Método auxiliar para separar el nombre y apellidos del autor
private getAuthorParts(fullName: string): { name: string, lastName1: string, lastName2: string } {
  const parts = fullName.trim().split(' ');
  
  if (parts.length === 1) {
    return { name: parts[0], lastName1: '', lastName2: '' };
  } else if (parts.length === 2) {
    return { name: parts[0], lastName1: parts[1], lastName2: '' };
  } else if (parts.length >= 3) {
    return { name: parts[0], lastName1: parts[1], lastName2: parts.slice(2).join(' ') };
  } else {
    return { name: '', lastName1: '', lastName2: '' };
  }
}
// Método auxiliar para separar géneros
private getGenreParts(genres: string): string[] {
  if (!genres) return [];
  return genres.split(',').map(g => g.trim()).filter(g => g !== '');
}
}