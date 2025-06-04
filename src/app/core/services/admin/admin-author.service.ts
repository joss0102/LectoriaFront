import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Author } from '../../models/call-api/author.model';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthorsService {
  
  private selectedAuthorSource = new BehaviorSubject<Author | null>(null);
  selectedAuthor$ = this.selectedAuthorSource.asObservable();
  
  private modalStateSource = new BehaviorSubject<boolean>(false);
  modalState$ = this.modalStateSource.asObservable();
  
  constructor() { }
  
  /**
   * Establece el autor seleccionado para ver detalles
   */
  setSelectedAuthor(author: Author): void {
    this.selectedAuthorSource.next(author);
    this.openModal();
  }
  
  /**
   * Obtiene el autor seleccionado actual
   */
  getSelectedAuthor(): Observable<Author | null> {
    return this.selectedAuthor$;
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