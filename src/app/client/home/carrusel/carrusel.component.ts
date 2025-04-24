import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeService } from '../../../core/services/HomeService/home.service';
import { HomeModel } from '../../../core/models/home.model';

@Component({
  selector: 'app-carrusel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrusel.component.html',
  styleUrls: ['./carrusel.component.scss'],
})
export class CarruselComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('sliderContainer') sliderContainer!: ElementRef;
  @ViewChild('nextButton') nextButton!: ElementRef;
  @ViewChild('prevButton') prevButton!: ElementRef;
  @ViewChild('timerBar') timerBar!: ElementRef;

  SliderDom!: HTMLElement;
  TimerDom!: HTMLElement;

  currentIndex: number = 0;
  itemsToShow: number = 5;
  itemWidth: number = 0;
  timerDuration: number = 10000; // 10000 = 10 segundos
  autoSlideInterval: any;
  timerInterval: any;
  currentTime: number = 0;
  isTransitioning: boolean = false;
  totalItems: number = 0;
  originalItemCount: number = 0;

  // Array de libros obtenido del servicio
  books: HomeModel[] = [];
  
  constructor(
    private homeService: HomeService,
    private cdr: ChangeDetectorRef
  ) {}
  seleccionarLibro(libro: HomeModel) {
    this.homeService.actualizarBookActual(libro);
  }
  ngOnInit(): void {
    
    // Añadimos valores de prueba en caso de error
    const dummyBooks: HomeModel[] = [
      {
        book_id: 1,
        book_title: 'Libro de prueba 1',
        book_pages: 200,
        synopsis: 'Sinopsis de prueba',
        authors: 'Autor de prueba',
        genres: 'Género de prueba',
        sagas: 'Saga de prueba',
        imagen: 'assets/images/placeholder.jpg' // Imagen de placeholder
      },
      // Puedes añadir más libros de prueba si lo deseas
    ];
    
    // Obtener TODOS los libros para el carrusel (pasando 0 como límite)
    this.homeService.getBooksForCarousel(0).subscribe({
      next: (books) => {
        console.log('Received books:', books.length);
        // Añadir URL de imagen a cada libro
        this.books = books.map(book => ({
          ...book,
          imagen: this.getBookImageUrl(book)
        }));
        
        console.log('Books with images prepared for carousel:', this.books.length);
        this.cdr.detectChanges();
        // Inicializar el carrusel después de recibir los datos
        setTimeout(() => {
          this.initializeCarousel();
        }, 100);
      },
      error: (error) => {
        console.error('Error al cargar los libros:', error);
        // Usar datos de prueba en caso de error para mostrar algo
        this.books = dummyBooks;
        this.cdr.detectChanges();
        // Inicializar el carrusel con los datos de prueba
        setTimeout(() => {
          this.initializeCarousel();
        }, 100);
      }
    });
  }

  ngAfterViewInit(): void {
    // Ahora esperamos a que los datos se carguen antes de inicializar
  }

  initializeCarousel(): void {
    if (
      !this.sliderContainer ||
      !this.nextButton ||
      !this.prevButton ||
      !this.timerBar ||
      this.books.length === 0
    ) {
      console.error('No se pudieron encontrar los elementos DOM necesarios o no hay libros');
      return;
    }

    this.SliderDom = this.sliderContainer.nativeElement;
    this.TimerDom = this.timerBar.nativeElement;
    this.originalItemCount = this.SliderDom.children.length;
    this.totalItems = this.originalItemCount;

    // Inicializar las propiedades del carrusel
    this.calculateItemWidth();

    // Clonar elementos para el bucle infinito
    this.setupInfiniteLoop();

    // Actualizar la primera imagen seleccionada después de crear el bucle
    this.updateFirstItem();

    // Configurar los eventos de los botones
    this.nextButton.nativeElement.addEventListener('click', () => {
      if (!this.isTransitioning) {
        this.moveSlider('next');
      }
    });

    this.prevButton.nativeElement.addEventListener('click', () => {
      if (!this.isTransitioning) {
        this.moveSlider('prev');
      }
    });

    // Iniciar la barra de tiempo
    this.resetTimer();

    // Actualizar el libro actual
    this.actualizarBookActual();
  }

  // Función para clonar elementos y crear un bucle infinito
  setupInfiniteLoop(): void {
    if (!this.SliderDom || this.originalItemCount === 0) return;

    const items = Array.from(this.SliderDom.children);

    // Guardar los elementos originales antes de clonar
    const originalItems = [...items] as HTMLElement[];

    // Clonamos elementos para crear el loop
    for (let i = 0; i < Math.min(this.itemsToShow, originalItems.length); i++) {
      const clone = originalItems[i].cloneNode(true) as HTMLElement;
      this.SliderDom.appendChild(clone);
    }

    // Y también añadimos clones al principio para navegación inversa
    for (
      let i = originalItems.length - 1;
      i >= Math.max(0, originalItems.length - this.itemsToShow);
      i--
    ) {
      const clone = originalItems[i].cloneNode(true) as HTMLElement;
      this.SliderDom.insertBefore(clone, this.SliderDom.firstChild);
    }

    // Actualizar el total de elementos después de añadir los clones
    this.totalItems = this.SliderDom.children.length;

    // Ajustar la posición inicial para mostrar los elementos originales
    this.currentIndex = this.itemsToShow;
    this.SliderDom.style.transform = `translateX(-${
      this.currentIndex * this.itemWidth
    }px)`;

    // Actualizar todos los atributos data-book-index para los elementos
    this.updateBookIndices();
  }

  updateBookIndices(): void {
    if (!this.SliderDom) return;

    const items = Array.from(this.SliderDom.children) as HTMLElement[];

    items.forEach((item, index) => {
      // Primero calculamos el índice del libro real
      // Hay que tener en cuenta el offset por los elementos clonados al principio
      let bookIndex;

      if (index < this.itemsToShow) {
        // Elementos clonados al principio
        bookIndex = this.originalItemCount - this.itemsToShow + index;
      } else if (index >= this.itemsToShow + this.originalItemCount) {
        // Elementos clonados al final
        bookIndex = index - (this.itemsToShow + this.originalItemCount);
      } else {
        // Elementos originales
        bookIndex = index - this.itemsToShow;
      }

      // Aseguramos que el índice está dentro del rango
      bookIndex = bookIndex % this.books.length;
      if (bookIndex < 0) bookIndex += this.books.length;

      // Asignamos el atributo data-book-index
      item.setAttribute('data-book-index', bookIndex.toString());
    });
  }

  calculateItemWidth(): void {
    if (this.SliderDom && this.SliderDom.children.length > 0) {
      const baseItem = this.SliderDom.children[0] as HTMLElement;
      this.itemWidth = baseItem.offsetWidth;
    }
  }

  moveSlider(direction: string): void {
    if (!this.SliderDom || this.isTransitioning) return;

    this.isTransitioning = true;

    if (direction === 'next') {
      this.currentIndex++;

      // Actualiza la posición del carrusel con animación
      this.SliderDom.style.transition = 'transform 0.5s ease-in-out';
      this.SliderDom.style.transform = `translateX(-${
        this.currentIndex * this.itemWidth
      }px)`;

      // Verifica si necesitamos hacer un salto invisible al principio
      if (this.currentIndex >= this.totalItems - this.itemsToShow) {
        setTimeout(() => {
          // Desactivamos la transición para evitar que se vea el salto
          this.SliderDom.style.transition = 'none';
          // Reseteamos al principio (después de los clones iniciales)
          this.currentIndex = this.itemsToShow;
          this.SliderDom.style.transform = `translateX(-${
            this.currentIndex * this.itemWidth
          }px)`;

          // Forzar reflow para que el navegador procese los cambios
          void this.SliderDom.offsetWidth;

          // Restaurar la transición
          this.SliderDom.style.transition = 'transform 0.5s ease-in-out';

          this.updateFirstItem();
          this.isTransitioning = false;
        }, 500);
      } else {
        setTimeout(() => {
          this.updateFirstItem();
          this.isTransitioning = false;
        }, 500);
      }
    } else {
      // Movimiento hacia atrás
      this.currentIndex--;

      // Actualiza la posición del carrusel con animación
      this.SliderDom.style.transition = 'transform 0.5s ease-in-out';
      this.SliderDom.style.transform = `translateX(-${
        this.currentIndex * this.itemWidth
      }px)`;

      // Verifica si necesitamos hacer un salto invisible al final
      if (this.currentIndex < this.itemsToShow) {
        setTimeout(() => {
          // Desactivamos la transición para evitar que se vea el salto
          this.SliderDom.style.transition = 'none';
          // Saltamos al final (antes de los clones finales)
          this.currentIndex = this.totalItems - this.itemsToShow * 2;
          this.SliderDom.style.transform = `translateX(-${
            this.currentIndex * this.itemWidth
          }px)`;

          // Forzar reflow para que el navegador procese los cambios
          void this.SliderDom.offsetWidth;

          // Restaurar la transición
          this.SliderDom.style.transition = 'transform 0.5s ease-in-out';

          this.updateFirstItem();
          this.isTransitioning = false;
        }, 500);
      } else {
        setTimeout(() => {
          this.updateFirstItem();
          this.isTransitioning = false;
        }, 500);
      }
    }

    // Reiniciar el temporizador
    this.resetTimer();
  }

  updateFirstItem(): void {
    if (!this.SliderDom) return;

    const items = Array.from(this.SliderDom.children) as HTMLElement[];

    // Remover la clase 'first' de todos los items
    items.forEach((item) => item.classList.remove('first'));

    // Asignar la clase 'first' al item en currentIndex
    const firstItem = items[this.currentIndex];
    if (firstItem) {
      firstItem.classList.add('first');
      // Actualizar el libro seleccionado inmediatamente
      this.actualizarBookActual();
    }
  }

  resetTimer(): void {
    this.currentTime = 0;

    if (this.TimerDom) {
      this.TimerDom.style.width = '100%';
    }

    clearInterval(this.timerInterval);

    // Actualiza la barra de tiempo cada 10ms
    this.timerInterval = setInterval(() => {
      this.currentTime += 10;
      const remainingTime = this.timerDuration - this.currentTime;
      const width = (remainingTime / this.timerDuration) * 100;

      if (this.TimerDom) {
        this.TimerDom.style.width = `${width}%`;
      }

      if (remainingTime <= 0) {
        clearInterval(this.timerInterval);
        this.moveSlider('next');
      }
    }, 10);
  }

  actualizarBookActual(): void {
    if (!this.SliderDom) return;

    // Obtener el item con clase 'first'
    const firstElement = this.SliderDom.querySelector(
      '.item.first'
    ) as HTMLElement;

    if (firstElement) {
      const bookIndexAttr = firstElement.getAttribute('data-book-index');
      if (bookIndexAttr !== null) {
        const bookIndex = parseInt(bookIndexAttr, 10);
        if (bookIndex >= 0 && bookIndex < this.books.length) {
          this.homeService.actualizarBookActual(this.books[bookIndex]);
        }
      }
    }
  }

  /**
   * Construye la URL de la imagen del libro según el formato:
   * libros/{nombre.saga}/covers/{nombre.libro}.png
   * 
   * @param book Libro del que se desea obtener la imagen
   * @returns URL de la imagen
   */
  private getBookImageUrl(book: HomeModel): string {
    // Formatear el nombre de la saga (reemplazar espacios por guiones bajos y convertir a minúsculas)
    const saga = book.sagas ? book.sagas.trim().replace(/\s+/g, '_').toLowerCase() : 'general';
    
    // Formatear el título del libro (reemplazar espacios por guiones bajos y convertir a minúsculas)
    const titulo = book.book_title.trim().replace(/\s+/g, '_').toLowerCase();
    
    // Construir la URL según el formato especificado
    //return `libros/${saga}/covers/${titulo}.png`;
    return `libros/${book.sagas}/covers/${book.book_title}.png`;
  }

  ngOnDestroy(): void {
    clearInterval(this.timerInterval);
  }
} 