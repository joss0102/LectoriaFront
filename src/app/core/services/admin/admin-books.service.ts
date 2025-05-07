import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Book } from '../../../core/models/call-api/book.model';

@Injectable({
  providedIn: 'root'
})
export class AdminBooksService {
  
  private selectedBookSource = new BehaviorSubject<Book | null>(null);
  selectedBook$ = this.selectedBookSource.asObservable();
  
  private modalStateSource = new BehaviorSubject<boolean>(false);
  modalState$ = this.modalStateSource.asObservable();
  
  constructor() { }
  
  /**
   * Establece el libro seleccionado para ver detalles
   */
  setSelectedBook(book: Book): void {
    this.selectedBookSource.next(book);
    this.openModal();
  }
  
  /**
   * Obtiene el libro seleccionado actual
   */
  getSelectedBook(): Observable<Book | null> {
    return this.selectedBook$;
  }
  
  /**
   * Abre el modal de detalles
   */
  openModal(): void {
    this.modalStateSource.next(true);
    document.body.style.overflow = 'hidden';
  }
  
  /**
   * Cierra el modal de detalles
   */
  closeModal(): void {
    this.modalStateSource.next(false);
    document.body.style.overflow = 'auto';
  }
  
  /**
   * Obtiene el estado actual del modal
   */
  getModalState(): Observable<boolean> {
    return this.modalState$;
  }
}