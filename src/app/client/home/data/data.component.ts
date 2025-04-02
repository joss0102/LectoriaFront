import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookService, Book } from '../../../core/services/book/book.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-data',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data.component.html',
  styleUrl: './data.component.scss'
})
export class DataComponent implements OnInit, OnDestroy {
  book: Book | null = null;
  showData: boolean = true; // Control de visibilidad para la animación
  private subscription: Subscription = new Subscription();

  constructor(
    private bookService: BookService,
    private cdr: ChangeDetectorRef
  ) {

  }

  ngOnInit(): void {


    // Suscribirse al observable del servicio para recibir actualizaciones
    this.subscription = this.bookService.bookActual$.subscribe(book => {


      if (book) {
        // Implementar animación de fade-out/fade-in sin animations API
        this.showData = false; // Ocultar
        this.cdr.detectChanges();

        setTimeout(() => {
          this.book = book; // Actualizar el libro
          this.showData = true; // Mostrar nuevamente
          this.cdr.detectChanges();
        }, 300);
      } else {
        console.log("El libro recibido es null");
      }
    });

    // Verificar si ya hay un libro disponible en el servicio
    setTimeout(() => {
      const currentBook = this.bookService.getBookActual();
      if (currentBook) {

        this.book = currentBook;
        this.showData = true;
        this.cdr.detectChanges();
      }
    }, 100);
  }

  ngOnDestroy(): void {
    console.log('DataComponent: Destruyendo componente, limpiando suscripción');
    // Limpiar la suscripción cuando el componente se destruye
    this.subscription.unsubscribe();
  }
}