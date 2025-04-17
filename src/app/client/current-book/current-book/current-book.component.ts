import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, forkJoin } from 'rxjs';

import { Books, ReadingRecord } from '../../../core/models/books.model';

import { BookService } from '../../../core/services/call-api/book.service';


import { ReadingService } from '../../../core/services/call-api/reading.service';

import { AuthService } from '../../../core/services/auth/auth.service';

import { UserBook } from '../../../core/models/call-api/book.model';



@Component({
  selector: 'app-current-book',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './current-book.component.html',
  styleUrl: './current-book.component.scss',
})
export class CurrentBookComponent implements OnInit, OnDestroy {
  currentBook: Books | null = null;
  booksInProgress: Books[] = [];
  currentBookIndex: number = 0;
  activeTab: string = 'log';
  
  private bookSubscription: Subscription = new Subscription();
  private booksListSubscription: Subscription = new Subscription();

  constructor(
    private bookService: BookService,
    private readingService: ReadingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (!user) return;

    this.booksListSubscription = this.bookService.getUserBooks(user.nickname, 'reading').subscribe(response => {
      this.booksInProgress = response.data.map(book => this.transformUserBookToBooks(book));
      this.updateCurrentBookIndex();

      if (this.booksInProgress.length > 0) {
        this.loadBookDetails(this.booksInProgress[0]);
      }
    });
  }

  ngOnDestroy(): void {
    this.bookSubscription.unsubscribe();
    this.booksListSubscription.unsubscribe();
  }

  private transformUserBookToBooks(userBook: UserBook): Books {
    return {
      id: userBook.book_id,
      titulo: userBook.book_title,
      autor: userBook.authors || '',
      generos: userBook.genres ? userBook.genres.split(',').map((g: string) => g.trim()) : [],
      paginasTotales: userBook.book_pages || 0,
      paginasLeidas: userBook.pages_read || 0,
      progreso: userBook.progress_percentage || 0,
      sinopsis: userBook.synopsis || '',
      estado: this.mapStatusToFrontend(userBook.reading_status),
      fechaInicio: userBook.date_start ? new Date(userBook.date_start) : null,
      fechaFin: userBook.date_ending ? new Date(userBook.date_ending) : null,
      anotaciones: [],
      frases: [],
      saga: userBook.sagas || '',
      registroLectura: [],
      descripcionPersonal: userBook.custom_description || ''
    };
  }

  private mapStatusToFrontend(status: string): string {
    switch (status) {
      case 'plan_to_read': return 'no-iniciado';
      case 'reading': return 'en-progreso';
      case 'completed': return 'finalizado';
      case 'dropped': return 'abandonado';
      case 'on_hold': return 'pausado';
      default: return status;
    }
  }

  private loadBookDetails(book: Books): void {
    const user = this.authService.currentUserValue;
    if (!user) return;

    // Primero, obtener los detalles completos del libro
    this.bookService.getBookById(book.id).subscribe(bookDetails => {
      console.log('Detalles completos del libro:', bookDetails);

      // Actualizar los detalles básicos del libro
      const updatedBook: Books = {
        ...book,
        autor: bookDetails.authors || book.autor,
        sinopsis: bookDetails.synopsis || book.sinopsis,
        saga: bookDetails.sagas || book.saga,
        paginasTotales: bookDetails.book_pages || book.paginasTotales,
        generos: bookDetails.genres ? bookDetails.genres.split(',').map((g: string) => g.trim()) : book.generos
      };

      // Luego, obtener el progreso, notas y frases
      const progressObs = this.readingService.getReadingProgress(user.nickname, book.titulo);
      const notesObs = this.readingService.getNotes(book.titulo, user.nickname);
      const phrasesObs = this.readingService.getPhrases(book.titulo, user.nickname);

      forkJoin({
        progress: progressObs,
        notes: notesObs,
        phrases: phrasesObs
      }).subscribe(results => {
        console.log('Resultados de progreso:', results.progress);
        console.log('Resultados de notas:', results.notes);
        console.log('Resultados de frases:', results.phrases);

        const finalBook: Books = {
          ...updatedBook,
          registroLectura: this.transformProgressData(results.progress.data),
          anotaciones: results.notes.data.map(note => note.text),
          frases: results.phrases.data.map(phrase => phrase.text)
        };
        
        this.currentBook = finalBook;
        this.updateCurrentBookIndex();
      });
    }, error => {
      console.error('Error al obtener detalles del libro:', error);
      
      // Incluso si falla la obtención de detalles, continuar con el progreso, notas y frases
      const progressObs = this.readingService.getReadingProgress(user.nickname, book.titulo);
      const notesObs = this.readingService.getNotes(book.titulo, user.nickname);
      const phrasesObs = this.readingService.getPhrases(book.titulo, user.nickname);

      forkJoin({
        progress: progressObs,
        notes: notesObs,
        phrases: phrasesObs
      }).subscribe(results => {
        this.currentBook = {
          ...book,
          registroLectura: this.transformProgressData(results.progress.data),
          anotaciones: results.notes.data.map(note => note.text),
          frases: results.phrases.data.map(phrase => phrase.text)
        };
        this.updateCurrentBookIndex();
      });
    });
  }

  private transformProgressData(progressData: any[]): ReadingRecord[] {
    return progressData.map(progress => ({
      id: progress.progress_id,
      fecha: new Date(progress.reading_date),
      paginasLeidas: progress.pages_read_session
    }));
  }

  updateCurrentBookIndex(): void {
    if (this.currentBook && this.booksInProgress.length > 0) {
      const index = this.booksInProgress.findIndex(book => book.id === this.currentBook?.id);
      if (index !== -1) {
        this.currentBookIndex = index;
      }
    }
  }

  nextBook(): void {
    if (this.hasNextBook()) {
      this.currentBookIndex++;
      this.loadBookDetails(this.booksInProgress[this.currentBookIndex]);
    }
  }

  prevBook(): void {
    if (this.hasPrevBook()) {
      this.currentBookIndex--;
      this.loadBookDetails(this.booksInProgress[this.currentBookIndex]);
    }
  }

  hasNextBook(): boolean {
    return this.currentBookIndex < this.booksInProgress.length - 1;
  }

  hasPrevBook(): boolean {
    return this.currentBookIndex > 0;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  getProgressStrokeDasharray(progress: number): string {
    return `${progress}, 100`;
  }

  getFormattedDate(date: Date | null | undefined): string {
    if (!date) return 'No disponible';
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  getShortDate(date: Date | null | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit'
    });
  }

  getEstadoLabel(estado: string | undefined): string {
    if (!estado) return 'No iniciado';
    
    switch (estado) {
      case 'no-iniciado': return 'No iniciado';
      case 'en-progreso': return 'En progreso';
      case 'finalizado': return 'Finalizado';
      case 'abandonado': return 'Abandonado';
      default: return estado;
    }
  }

  getEstadoClass(estado: string | undefined): string {
    if (!estado) return '';
    
    switch (estado) {
      case 'no-iniciado': return 'not-started';
      case 'en-progreso': return 'in-progress';
      case 'finalizado': return 'finished';
      case 'abandonado': return 'abandoned';
      default: return '';
    }
  }

  getTotalPagesRead(): number {
    if (!this.currentBook?.registroLectura) return 0;
    return this.currentBook.registroLectura.reduce((total, record) => total + record.paginasLeidas, 0);
  }

  getTotalReadingTime(): number {
    if (!this.currentBook?.registroLectura) return 0;
    return this.currentBook.registroLectura.reduce((total, record) => total + (record.tiempo || 0), 0);
  }

  getAveragePagesPerSession(): number {
    if (!this.currentBook?.registroLectura || this.currentBook.registroLectura.length === 0) return 0;
    const total = this.getTotalPagesRead();
    return Math.round(total / this.currentBook.registroLectura.length);
  }

  getRecentSessions(): ReadingRecord[] {
    if (!this.currentBook?.registroLectura) return [];
    return [...this.currentBook.registroLectura]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 10);
  }
  getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }
  updateReadingProgress(pages: number, date: string): void {
    if (!this.currentBook || !this.authService.currentUserValue) return;
    
    const progressData = {
      nickname: this.authService.currentUserValue.nickname,
      book_title: this.currentBook.titulo,
      pages_read_list: pages.toString(),
      dates_list: date
    };

    this.readingService.addReadingProgress(progressData).subscribe({
      next: () => {
        this.loadBookDetails(this.currentBook!);
      },
      error: (error) => {
        console.error('Error al actualizar progreso:', error);
      }
    });
  }

  addNote(text: string): void {
    if (!text.trim() || !this.authService.currentUserValue) return;
    
    const noteData = {
      user_nickname: this.authService.currentUserValue.nickname,
      book_title: this.currentBook!.titulo,
      text: text
    };

    this.readingService.addNote(noteData).subscribe({
      next: () => {
        this.loadBookDetails(this.currentBook!);
      },
      error: (error) => {
        console.error('Error al añadir nota:', error);
      }
    });
  }

  addQuote(text: string): void {
    if (!text.trim() || !this.authService.currentUserValue) return;
    
    const phraseData = {
      user_nickname: this.authService.currentUserValue.nickname,
      book_title: this.currentBook!.titulo,
      text: text
    };

    this.readingService.addPhrase(phraseData).subscribe({
      next: () => {
        this.loadBookDetails(this.currentBook!);
      },
      error: (error) => {
        console.error('Error al añadir frase:', error);
      }
    });
  }

  markAsCompleted(): void {
    if (!this.currentBook || !this.authService.currentUserValue) return;
    
    const updateData = {
      status: 'completed'
    };

    this.bookService.updateUserBookRelationship(
      this.authService.currentUserValue.nickname, 
      this.currentBook.id, 
      updateData
    ).subscribe({
      next: () => {
        this.loadBookDetails(this.currentBook!);
      },
      error: (error) => {
        console.error('Error al actualizar estado del libro:', error);
      }
    });
  }

}