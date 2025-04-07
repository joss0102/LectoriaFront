import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { Book, ReadingRecord } from '../../../core/models/book-model';
import { BookService } from '../../../core/services/book/book.service';


@Component({
  selector: 'app-current-book',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './current-book.component.html',
  styleUrl: './current-book.component.scss',
})
export class CurrentBookComponent implements OnInit, OnDestroy {
  currentBook: Book | null = null;
  booksInProgress: Book[] = [];
  currentBookIndex: number = 0;
  activeTab: string = 'log';
  
  private subscription: Subscription = new Subscription();

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    console.log('Inicializando CurrentBookComponent');
    
    // Obtener todos los libros en progreso
    this.loadBooksInProgress();
    
    // Suscribirse a cambios en el libro actual
    this.subscription = this.bookService.bookActual$.subscribe(book => {
      console.log('Libro actual actualizado:', book);
      if (book) {
        this.currentBook = book;
        this.updateCurrentBookIndex();
        
        // Debug info
        console.log('Anotaciones:', this.currentBook.anotaciones);
        console.log('Frases:', this.currentBook.frases);
        console.log('Registro de lectura:', this.currentBook.registroLectura);
      }
    });

    // Si no hay libro seleccionado, seleccionar el primero en progreso
    if (!this.currentBook && this.booksInProgress.length > 0) {
      console.log('Seleccionando primer libro en progreso:', this.booksInProgress[0]);
      this.bookService.actualizarBookActual(this.booksInProgress[0]);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadBooksInProgress(): void {
    this.booksInProgress = this.bookService.getBooksByStatus('en-progreso');
    console.log('Libros en progreso cargados:', this.booksInProgress);
  }

  updateCurrentBookIndex(): void {
    if (this.currentBook) {
      const index = this.booksInProgress.findIndex(book => book.titulo === this.currentBook?.titulo);
      if (index !== -1) {
        this.currentBookIndex = index;
      }
    }
  }

  nextBook(): void {
    if (this.hasNextBook()) {
      this.currentBookIndex++;
      this.bookService.actualizarBookActual(this.booksInProgress[this.currentBookIndex]);
    }
  }

  prevBook(): void {
    if (this.hasPrevBook()) {
      this.currentBookIndex--;
      this.bookService.actualizarBookActual(this.booksInProgress[this.currentBookIndex]);
    }
  }

  hasNextBook(): boolean {
    return this.currentBookIndex < this.booksInProgress.length - 1;
  }

  hasPrevBook(): boolean {
    return this.currentBookIndex > 0;
  }

  setActiveTab(tab: string): void {
    console.log('Cambiando a pestaña:', tab);
    this.activeTab = tab;
  }

  getProgressStrokeDasharray(progress: number): string {
    // Para un círculo SVG con pathLength="100"
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

  // Métodos para estadísticas del registro de lectura
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
    // Ordenar por fecha descendente y tomar las últimas 5 sesiones
    return [...this.currentBook.registroLectura]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 5);
  }
}