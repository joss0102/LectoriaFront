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
import { BookService, Book } from '../../../core/services/book/book.service';

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

  // Array de libros que ya tienes
  books: Book[] = [
    {
      autor: 'Sarah J. Maas',
      saga: 'Trono de Cristal',
      titulo: 'Trono de Cristal',
      sinopsis:
        'Tras cumplir una condena de un año de trabajos forzados en las minas de sal de Endovier por sus crímenes, Celaena Sardothien, una asesina de 18 años de edad, es llevada ante el príncipe heredero. El príncipe Dorian le ofrece su libertad con una condición: ella debe actuar como su defensora en un torneo para encontrar un nuevo asesino real.',
      imagen: '/libros/Trono de cristal/covers/Trono de cristal.png',
    },
    {
      autor: 'Sarah J. Maas',
      saga: 'Ciudad medialuna',
      titulo: 'Casa de llama y sombra',
      sinopsis:
        'Celaena Sardothien ha ganado el torneo real y se ha convertido en la campeona del rey, pero su lealtad no pertenece al trono. Mientras realiza misiones para el monarca, descubre una conspiración que amenaza el reino entero. Celaena debe elegir entre su libertad y luchar por un futuro mejor para el reino.',
      imagen: '/libros/Ciudad medialuna/covers/Casa de llama y sombra.png',
    },
    {
      autor: 'Sarah J. Maas',
      saga: 'Caraval',
      titulo: 'Caraval',
      sinopsis:
        'Celaena Sardothien ha aceptado su identidad como Aelin Galathynius, reina de Terrasen. Viaja a Wendlyn para encontrar respuestas y entrenar con Rowan, un guerrero fae inmortal. Mientras tanto, fuerzas oscuras se están reuniendo para amenazar todo lo que ama, y ella debe aprender a controlar sus poderes para proteger su reino.',
      imagen: '/libros/Caraval/covers/Caraval.png',
    },
    {
      autor: 'Sarah J. Maas',
      saga: 'De sangre y cenizas',
      titulo: 'De sangre y cenizas',
      sinopsis:
        'Aelin Galathynius ha regresado a Adarlan para reclamar su trono y vengar a su pueblo. Pero antes, debe reunir antiguos aliados y formar nuevas alianzas para enfrentar al rey oscuro que amenaza su tierra natal. En el proceso, descubre secretos que podrían cambiar el curso de la guerra.',
      imagen: '/libros/De sangre y cenizas/covers/De sangre y cenizas.png',
    },
    {
      autor: 'Sarah J. Maas',
      saga: 'El principe cautivo',
      titulo: 'El principe cautivo',
      sinopsis:
        'El reino está al borde de la guerra, y Aelin ha sido capturada por la reina de las hadas. Sus amigos están dispersos, cada uno enfrentando sus propias batallas. La única esperanza para su liberación es forjar alianzas improbables y descubrir la clave para derrotar a un enemigo ancestral antes de que sea demasiado tarde.',
      imagen: '/libros/El principe cautivo/covers/El principe cautivo.png',
    },
    {
      autor: 'Sarah J. Maas',
      saga: 'Empireo',
      titulo: 'Alas de onix',
      sinopsis:
        'Aelin y sus compañeros luchan contra el tiempo mientras el mundo se precipita hacia la oscuridad. Con los Valg amenazando con conquistarlo todo, la única esperanza es encontrar y utilizar una antigua llave que podría salvar a los reinos o condenarlos. Las lealtades serán probadas y se formarán nuevos lazos en esta penúltima entrega.',
      imagen: '/libros/Empireo/covers/Alas de onix.png',
    },
    {
      autor: 'Sarah J. Maas',
      saga: 'Trono de Cristal',
      titulo: 'Reino de Cenizas',
      sinopsis:
        'En la épica conclusión de la serie, Aelin arriesgará todo para salvar su mundo, incluso mientras enfrenta cadenas y torturas. Sus amigos y aliados están preparados para la batalla final contra un enemigo que amenaza con destruir no solo su reino, sino todos los mundos. El destino de todos descansa sobre sus hombros.',
      imagen: '/libros/Trono de cristal/covers/Reino de cenizas.png',
    },
    {
      autor: 'Sarah J. Maas',
      saga: 'Hunting Adeline',
      titulo: 'Nunca te dejare',
      sinopsis:
        'Feyre, una cazadora de 19 años, mata a un lobo en el bosque y una bestia exige retribución. Arrastrada a una tierra mágica, descubre que su captor no es un animal sino Tamlin, un inmortal que una vez gobernó el mundo feérico. Mientras vive en su estado, sus sentimientos por él se transforman de hostilidad a pasión. Pero una antigua sombra crece sobre las tierras feéricas, y Feyre debe encontrar la manera de detenerla.',
      imagen: '/libros/Hunting Adeline/covers/Nunca te dejare.png',
    },
    {
      autor: 'Sarah J. Maas',
      saga: 'Una Corte de Rosas y Espinas',
      titulo: 'Una Corte de Rosas y Espinas',
      sinopsis:
        'Feyre ha sobrevivido a Bajo la Montaña, pero a un costo terrible. Aunque ahora tiene poderes de alto fae, su corazón permanece humano, y no puede olvidar las atrocidades que tuvo que cometer para salvar al pueblo de Tamlin. Tampoco puede olvidar el pacto que hizo con Rhysand, el Alto Lord de la Corte Nocturna, quien ahora la reclama como parte del trato.',
      imagen: '/libros/Acotar/covers/Una corte de niebla y furia.png',
    },

    {
      autor: 'Sarah J. Maas',
      saga: 'La Caida Lunar',
      titulo: 'Hasta que caiga la luna',
      sinopsis:
        'Una novela corta que sigue a Feyre y Rhysand mientras navegan por los desafíos posteriores a la guerra. Juntos enfrentan el proceso de reconstrucción y ayudan a sanar las heridas del conflicto, mientras también tratan de encontrar momentos de paz en un mundo que aún está cicatrizando.',
      imagen: '/libros/La Caida Lunar/covers/Hasta que caiga la luna.png',
    },
    {
      autor: 'Sarah J. Maas',
      saga: 'Los habitantes del aire',
      titulo: 'El rey malvado',
      sinopsis:
        'La historia sigue las consecuencias de la guerra contra Hybern. Nesta Archeron lucha con la pérdida y su transformación forzada en inmortal. A regañadientes, acepta entrenarse con Cassian en la Casa del Viento, donde debe enfrentar sus demonios internos mientras una nueva amenaza surge en el horizonte.',
      imagen: '/libros/Los habitantes del aire/covers/El rey malvado.png',
    },
    {
      autor: 'Sarah J. Maas',
      saga: 'Powerless',
      titulo: 'Powerless',
      sinopsis:
        'Feyre ha regresado a la Corte de Primavera, decidida a reunir información sobre los planes de Tamlin y del rey invasor que amenaza con destruir Prythian. Pero para hacerlo, debe jugar un juego mortal de engaño. Un solo error podría condenar no solo a Feyre, sino a todo su mundo.',
      imagen: '/libros/Powerless/covers/Powerless.png',
    },
    {
      autor: 'Jay Kristoff',
      saga: 'El Imperio del Vampiro',
      titulo: 'El Imperio del Vampiro',
      sinopsis:
        'Han pasado veintisiete años desde que salió el último sol. Durante casi tres décadas, los vampiros han saqueado la tierra, construyendo su eterno reino bajo el perpetuo e inquebrantable crepúsculo. Gabriel de León, medio vampiro y último de los plateados, está encarcelado por la iglesia. Cuenta su historia, desde su entrenamiento en la Orden de San Miguel hasta las leyendas de los Tres Reyes y la Última Cruzada contra la Reina Oscura.',
      imagen:
        '/libros/El imperio del vampiro/covers/El imperio del vampiro.png',
    },
    {
      autor: 'Jay Kristoff',
      saga: 'Dioses y monstruos',
      titulo: 'El libro de azrael',
      sinopsis:
        'Gabriel de León continúa su relato desde la prisión, narrando su búsqueda del Grial de Sangre. Mientras el ejército de la Reina Oscura se mueve inexorablemente hacia el último bastión de la humanidad, Gabriel y sus compañeros se adentran en territorios cada vez más peligrosos, enfrentándose a horrores inimaginables y sacrificios imposibles.',
      imagen: '/libros/Dioses y monstruos/covers/El libro de azrael.png',
    },
    {
      autor: 'Arancha Abad',
      saga: '',
      titulo: 'Mi Alma es Tuya',
      sinopsis:
        'Luna, una joven con un pasado oscuro, vive con su hermana gemela en un pequeño pueblo. Su vida cambia cuando conoce a Ethan, un chico misterioso con quien establece una conexión inmediata. Pero Ethan esconde un secreto sobrenatural que pondrá a prueba su relación y cambiará para siempre la vida de Luna, quien descubrirá que está más conectada con el mundo sobrenatural de lo que jamás hubiera imaginado.',
      imagen: '/libros/Alma/covers/Mi alma es tuya.png',
    },
  ];

  constructor(
    private bookService: BookService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    setTimeout(() => this.initializeCarousel(), 100);
  }

  initializeCarousel(): void {
    if (
      !this.sliderContainer ||
      !this.nextButton ||
      !this.prevButton ||
      !this.timerBar
    ) {
      console.error('No se pudieron encontrar los elementos DOM necesarios');
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
          this.bookService.actualizarBookActual(this.books[bookIndex]);
        }
      }
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.timerInterval);
  }
}
