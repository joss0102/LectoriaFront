import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { Books, ReadingRecord } from '../../../core/models/books.model';
import { CurrentBookService } from '../../../core/services/currentBook/current-book.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-current-book',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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

  constructor(private currentBookService: CurrentBookService) {}


ngOnInit(): void {

  this.booksListSubscription = this.currentBookService.booksInProgress$.subscribe(books => {

    this.booksInProgress = books;
    this.updateCurrentBookIndex();
  });

  this.bookSubscription = this.currentBookService.currentBook$.subscribe(book => {

    if (book) {
      this.currentBook = book;
      this.updateCurrentBookIndex();
    }
  });

  this.currentBookService.loadBooksInProgress();
}


  ngOnDestroy(): void {
    this.bookSubscription.unsubscribe();
    this.booksListSubscription.unsubscribe();
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
      this.currentBookService.setCurrentBook(this.booksInProgress[this.currentBookIndex]);
    }
  }

  prevBook(): void {
    if (this.hasPrevBook()) {
      this.currentBookIndex--;
      this.currentBookService.setCurrentBook(this.booksInProgress[this.currentBookIndex]);
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

  // Método para actualizar el progreso de lectura
  updateReadingProgress(pages: number): void {
    if (!this.currentBook) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    this.currentBookService.updateReadingProgress(
      this.currentBook.id, 
      pages,
      today
    ).subscribe({
      next: (response) => {
        console.log('Progreso actualizado correctamente:', response);
      },
      error: (error) => {
        console.error('Error al actualizar progreso:', error);
      }
    });
  }

  // Método para añadir una nota
  addNote(text: string): void {
    if (!text.trim()) return;
    
    this.currentBookService.addOrUpdateNote(text).subscribe({
      next: (response) => {
        console.log('Nota añadida correctamente:', response);
      },
      error: (error) => {
        console.error('Error al añadir nota:', error);
      }
    });
  }

  // Método para añadir una frase destacada
  addQuote(text: string): void {
    if (!text.trim()) return;
    
    this.currentBookService.addQuote(text).subscribe({
      next: (response) => {
        console.log('Frase añadida correctamente:', response);
      },
      error: (error) => {
        console.error('Error al añadir frase:', error);
      }
    });
  }

  // Método para marcar un libro como completado
  markAsCompleted(): void {
    if (!this.currentBook) return;
    
    this.currentBookService.updateBookStatus(
      this.currentBook.id,
      'finalizado'
    ).subscribe({
      next: (response) => {
        console.log('Libro marcado como completado:', response);
      },
      error: (error) => {
        console.error('Error al actualizar estado del libro:', error);
      }
    });
  }
}