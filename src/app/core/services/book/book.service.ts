import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Definición de la interfaz para los books
export interface Book {
  autor: string;
  saga: string;
  titulo: string;
  sinopsis: string;
  imagen: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookService {
  // BehaviorSubject que mantiene el book actual
  private bookActualSubject: BehaviorSubject<Book | null> = new BehaviorSubject<Book | null>(null);

  // Observable público que otros componentes pueden suscribirse
  public bookActual$: Observable<Book | null> = this.bookActualSubject.asObservable();

  constructor() {
    console.log('BookService: Inicializado');
  }

  // Método para actualizar el book actual
  actualizarBookActual(book: Book): void {
    console.log('BookService: Actualizando libro actual:', book);
    this.bookActualSubject.next(book);
  }

  // Método para obtener el libro actual directamente
  getBookActual(): Book | null {
    return this.bookActualSubject.getValue();
  }
}