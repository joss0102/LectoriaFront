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
    console.log('DataComponent: Constructor ejecutado');
  }

  ngOnInit(): void {
    console.log('DataComponent: ngOnInit iniciado');

    // Suscribirse al observable del servicio para recibir actualizaciones
    this.subscription = this.bookService.bookActual$.subscribe(book => {
      console.log('Libro recibido en DataComponent:', book);

      if (book) {
        // Implementar animación de fade-out/fade-in sin animations API
        this.showData = false; // Ocultar
        this.cdr.detectChanges();

        setTimeout(() => {
          this.book = book; // Actualizar el libro
          this.showData = true; // Mostrar nuevamente
          this.cdr.detectChanges();
          console.log("Libro actualizado y listo para ser mostrado");
        }, 300);
      } else {
        console.log("El libro recibido es null");
      }
    });

    // Verificar si ya hay un libro disponible en el servicio
    setTimeout(() => {
      const currentBook = this.bookService.getBookActual();
      if (currentBook) {
        console.log('Libro encontrado en el servicio:', currentBook);
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