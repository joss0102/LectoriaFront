import { Component, OnInit, OnDestroy, ChangeDetectorRef, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookService, Book } from '../../../core/services/book/book.service';


@Component({
  selector: 'app-carrusel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrusel.component.html',
  styleUrls: ['./carrusel.component.scss']
})
export class CarruselComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('sliderContainer') sliderContainer!: ElementRef;
  @ViewChild('nextButton') nextButton!: ElementRef;
  @ViewChild('prevButton') prevButton!: ElementRef;
  @ViewChild('timerBarElement') timerBarElement!: ElementRef;

  nextDom!: HTMLElement;
  prevDom!: HTMLElement;
  SliderDom!: HTMLElement;
  timerBar!: HTMLElement;

  currentIndex: number = 0;
  itemsToShow: number = 5;
  totalItems: number = 0;
  itemWidth: number = 0;
  timerDuration: number = 10000; // 10 segundos
  timerInterval: any;
  autoSlideInterval: any;
  currentTime: number = 0;
  isTransitioning: boolean = false;

  // Array de libros (Cuando se conecte a base de datos se elimina)
  books: Book[] = [
    {
      autor: "Sarah J. Maas",
      saga: "Trono de Cristal",
      titulo: "Trono de Cristal",
      sinopsis: "Tras cumplir una condena de un año de trabajos forzados en las minas de sal de Endovier por sus crímenes, Celaena Sardothien, una asesina de 18 años de edad, es llevada ante el príncipe heredero. El príncipe Dorian le ofrece su libertad con una condición: ella debe actuar como su defensora en un torneo para encontrar un nuevo asesino real.",
      imagen: "/libros/Trono de cristal/covers/Trono de cristal.png",
    },
    {
      autor: "Sarah J. Maas",
      saga: "Ciudad medialuna",
      titulo: "Casa de llama y sombra",
      sinopsis: "Celaena Sardothien ha ganado el torneo real y se ha convertido en la campeona del rey, pero su lealtad no pertenece al trono. Mientras realiza misiones para el monarca, descubre una conspiración que amenaza el reino entero. Celaena debe elegir entre su libertad y luchar por un futuro mejor para el reino.",
      imagen: "/libros/Ciudad medialuna/covers/Casa de llama y sombra.png"
    },
    {
      autor: "Sarah J. Maas",
      saga: "Caraval",
      titulo: "Caraval",
      sinopsis: "Celaena Sardothien ha aceptado su identidad como Aelin Galathynius, reina de Terrasen. Viaja a Wendlyn para encontrar respuestas y entrenar con Rowan, un guerrero fae inmortal. Mientras tanto, fuerzas oscuras se están reuniendo para amenazar todo lo que ama, y ella debe aprender a controlar sus poderes para proteger su reino.",
      imagen: "/libros/Caraval/covers/Caraval.png"
    },
    {
      autor: "Sarah J. Maas",
      saga: "Trono de Cristal",
      titulo: "Reina de Sombras",
      sinopsis: "Aelin Galathynius ha regresado a Adarlan para reclamar su trono y vengar a su pueblo. Pero antes, debe reunir antiguos aliados y formar nuevas alianzas para enfrentar al rey oscuro que amenaza su tierra natal. En el proceso, descubre secretos que podrían cambiar el curso de la guerra.",
      imagen: "/libros/Trono de cristal/covers/Reina de sombras.png"
    },
    {
      autor: "Sarah J. Maas",
      saga: "Trono de Cristal",
      titulo: "Torre del Alba",
      sinopsis: "El reino está al borde de la guerra, y Aelin ha sido capturada por la reina de las hadas. Sus amigos están dispersos, cada uno enfrentando sus propias batallas. La única esperanza para su liberación es forjar alianzas improbables y descubrir la clave para derrotar a un enemigo ancestral antes de que sea demasiado tarde.",
      imagen: "/libros/Trono de cristal/covers/Torre del alba.png"
    },
    {
      autor: "Sarah J. Maas",
      saga: "Trono de Cristal",
      titulo: "Imperio de Tormentas",
      sinopsis: "Aelin y sus compañeros luchan contra el tiempo mientras el mundo se precipita hacia la oscuridad. Con los Valg amenazando con conquistarlo todo, la única esperanza es encontrar y utilizar una antigua llave que podría salvar a los reinos o condenarlos. Las lealtades serán probadas y se formarán nuevos lazos en esta penúltima entrega.",
      imagen: "/libros/Trono de cristal/covers/Imperio de tormentas.png"
    },
    {
      autor: "Sarah J. Maas",
      saga: "Trono de Cristal",
      titulo: "Reino de Cenizas",
      sinopsis: "En la épica conclusión de la serie, Aelin arriesgará todo para salvar su mundo, incluso mientras enfrenta cadenas y torturas. Sus amigos y aliados están preparados para la batalla final contra un enemigo que amenaza con destruir no solo su reino, sino todos los mundos. El destino de todos descansa sobre sus hombros.",
      imagen: "/libros/Trono de cristal/covers/Reino de cenizas.png"
    },
    {
      autor: "Sarah J. Maas",
      saga: "Una Corte de Rosas y Espinas",
      titulo: "Una Corte de Rosas y Espinas",
      sinopsis: "Feyre, una cazadora de 19 años, mata a un lobo en el bosque y una bestia exige retribución. Arrastrada a una tierra mágica, descubre que su captor no es un animal sino Tamlin, un inmortal que una vez gobernó el mundo feérico. Mientras vive en su estado, sus sentimientos por él se transforman de hostilidad a pasión. Pero una antigua sombra crece sobre las tierras feéricas, y Feyre debe encontrar la manera de detenerla.",
      imagen: "/libros/Acotar/covers/Una corte de rosas y espinas.png"
    },
    {
      autor: "Sarah J. Maas",
      saga: "Una Corte de Rosas y Espinas",
      titulo: "Una Corte de Niebla y Furia",
      sinopsis: "Feyre ha sobrevivido a Bajo la Montaña, pero a un costo terrible. Aunque ahora tiene poderes de alto fae, su corazón permanece humano, y no puede olvidar las atrocidades que tuvo que cometer para salvar al pueblo de Tamlin. Tampoco puede olvidar el pacto que hizo con Rhysand, el Alto Lord de la Corte Nocturna, quien ahora la reclama como parte del trato.",
      imagen: "/libros/Acotar/covers/Una corte de niebla y furia.png"
    },
    {
      autor: "Sarah J. Maas",
      saga: "Una Corte de Rosas y Espinas",
      titulo: "Una Corte de Hielo y Estrellas",
      sinopsis: "Una novela corta que sigue a Feyre y Rhysand mientras navegan por los desafíos posteriores a la guerra. Juntos enfrentan el proceso de reconstrucción y ayudan a sanar las heridas del conflicto, mientras también tratan de encontrar momentos de paz en un mundo que aún está cicatrizando.",
      imagen: "/libros/Acotar/covers/Una corte de hielo y estrellas.png"
    },
    {
      autor: "Sarah J. Maas",
      saga: "Una Corte de Rosas y Espinas",
      titulo: "Una Corte de Llamas Plateadas",
      sinopsis: "La historia sigue las consecuencias de la guerra contra Hybern. Nesta Archeron lucha con la pérdida y su transformación forzada en inmortal. A regañadientes, acepta entrenarse con Cassian en la Casa del Viento, donde debe enfrentar sus demonios internos mientras una nueva amenaza surge en el horizonte.",
      imagen: "/libros/Acotar/covers/Una corte de llamas plateadas.png"
    },
    {
      autor: "Sarah J. Maas",
      saga: "Una Corte de Rosas y Espinas",
      titulo: "Una Corte de Alas y Ruina",
      sinopsis: "Feyre ha regresado a la Corte de Primavera, decidida a reunir información sobre los planes de Tamlin y del rey invasor que amenaza con destruir Prythian. Pero para hacerlo, debe jugar un juego mortal de engaño. Un solo error podría condenar no solo a Feyre, sino a todo su mundo.",
      imagen: "/libros/Acotar/covers/Una corte de alas y ruina.png"
    },
    {
      autor: "Jay Kristoff",
      saga: "El Imperio del Vampiro",
      titulo: "El Imperio del Vampiro",
      sinopsis: "Han pasado veintisiete años desde que salió el último sol. Durante casi tres décadas, los vampiros han saqueado la tierra, construyendo su eterno reino bajo el perpetuo e inquebrantable crepúsculo. Gabriel de León, medio vampiro y último de los plateados, está encarcelado por la iglesia. Cuenta su historia, desde su entrenamiento en la Orden de San Miguel hasta las leyendas de los Tres Reyes y la Última Cruzada contra la Reina Oscura.",
      imagen: "/libros/El imperio del vampiro/covers/El imperio del vampiro.png"
    },
    {
      autor: "Jay Kristoff",
      saga: "El Imperio del Vampiro",
      titulo: "El Imperio de los Condenados",
      sinopsis: "Gabriel de León continúa su relato desde la prisión, narrando su búsqueda del Grial de Sangre. Mientras el ejército de la Reina Oscura se mueve inexorablemente hacia el último bastión de la humanidad, Gabriel y sus compañeros se adentran en territorios cada vez más peligrosos, enfrentándose a horrores inimaginables y sacrificios imposibles.",
      imagen: "/libros/El imperio del vampiro/covers/El imperio de los condenados.png"
    },
    {
      autor: "Arancha Abad",
      saga: "",
      titulo: "Mi Alma es Tuya",
      sinopsis: "Luna, una joven con un pasado oscuro, vive con su hermana gemela en un pequeño pueblo. Su vida cambia cuando conoce a Ethan, un chico misterioso con quien establece una conexión inmediata. Pero Ethan esconde un secreto sobrenatural que pondrá a prueba su relación y cambiará para siempre la vida de Luna, quien descubrirá que está más conectada con el mundo sobrenatural de lo que jamás hubiera imaginado.",
      imagen: "/libros/Alma/covers/Mi alma es tuya.png"
    }
  ];

  constructor(
    private bookService: BookService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {

    setTimeout(() => {
      this.initializeCarousel();
    }, 100);
  }

  initializeCarousel(): void {
    this.nextDom = this.nextButton.nativeElement;
    this.prevDom = this.prevButton.nativeElement;
    this.SliderDom = this.sliderContainer.nativeElement;
    this.timerBar = this.timerBarElement?.nativeElement;

    // Verificar que tenemos todos los elementos necesarios
    if (!this.SliderDom || !this.nextDom || !this.prevDom) {
      console.error('No se pudieron encontrar los elementos DOM necesarios');
      return;
    }

    // Inicializar las propiedades del carrusel
    this.totalItems = this.SliderDom.children.length;

    // Agregar atributos de índice a cada elemento del carrusel
    this.addBookIndices();

    // Asegurarse de que el primer elemento tenga la clase 'first' al inicio
    this.updateFirstItem();

    // Calcular el ancho de cada elemento
    this.calculateItemWidth();

    // Iniciar la barra de tiempo
    if (this.timerBar) {
      this.resetTimer();
    }

    // Configurar los eventos de los botones
    this.nextDom.onclick = () => {
      if (!this.isTransitioning) {
        this.moveSlider('next');
      }
    };

    this.prevDom.onclick = () => {
      if (!this.isTransitioning) {
        this.moveSlider('prev');
      }
    };
    // Iniciar el auto-carrusel
    this.startAutoSlide();

    // Importante: Asegurarse de que el libro actual se actualice al inicio
    this.actualizarBookActual();
  }

  addBookIndices(): void {
    if (!this.SliderDom) return;

    const items = Array.from(this.SliderDom.children);
    items.forEach((item, index) => {
      (item as HTMLElement).setAttribute('data-book-index', index.toString());
    });
  }

  ngOnDestroy(): void {
    // Limpiar intervalos cuando el componente se destruye
    this.clearAllIntervals();
  }

  // Actualizar la información del libro actual basado en el elemento visible
  actualizarBookActual(): void {
    if (!this.SliderDom) {
      return;
    }

    // Obtener el primer elemento con clase 'first'
    const firstElement = this.SliderDom.querySelector('.item.first') as HTMLElement;

    if (firstElement) {
      // Obtener el índice del libro a partir del atributo data-book-index
      const bookIndexAttr = firstElement.getAttribute('data-book-index');

      if (bookIndexAttr !== null) {
        const bookIndex = parseInt(bookIndexAttr, 10);

        if (bookIndex >= 0 && bookIndex < this.books.length) {
          const libroActual = this.books[bookIndex];
          this.bookService.actualizarBookActual(libroActual);
        } else {
          console.error('Índice fuera de rango:', bookIndex, 'Total libros:', this.books.length);
        }
      } else {
        console.error('No se encontró el atributo data-book-index en el elemento first');
      }
    } else {

      // Asegurarse de que siempre hay un elemento con clase 'first'
      if (this.SliderDom.children.length > 0) {
        const firstItem = this.SliderDom.children[0] as HTMLElement;
        firstItem.classList.add('first');

        const bookIndexAttr = firstItem.getAttribute('data-book-index');
        if (bookIndexAttr !== null) {
          const bookIndex = parseInt(bookIndexAttr, 10);
          if (bookIndex >= 0 && bookIndex < this.books.length) {
            this.bookService.actualizarBookActual(this.books[bookIndex]);
          }
        } else if (this.books.length > 0) {
          this.bookService.actualizarBookActual(this.books[0]);
        }
      } else if (this.books.length > 0) {
        this.bookService.actualizarBookActual(this.books[0]);
      }
    }
  }

  calculateItemWidth(): void {
    if (this.SliderDom && this.SliderDom.children.length > 0) {
      const baseItem = this.SliderDom.children[0] as HTMLElement;
      this.itemWidth = baseItem.offsetWidth;
    }
  }

  startAutoSlide(): void {
    this.clearAllIntervals();
    this.autoSlideInterval = setInterval(() => {
      if (!this.isTransitioning) {
        this.moveSlider('next');
      }
    }, this.timerDuration);
  }

  moveSlider(direction: string): void {
    if (!this.SliderDom || this.isTransitioning) return;

    console.log(`Moviendo slider: ${direction}`);
    this.isTransitioning = true;

    if (direction === 'next') {
      // Animación de desplazamiento hacia la izquierda
      this.SliderDom.style.transition = 'transform 0.5s ease-in-out';
      this.SliderDom.style.transform = `translateX(-${this.itemWidth}px)`;

      setTimeout(() => {
        const firstElement = this.SliderDom!.children[0] as HTMLElement;
        this.SliderDom!.appendChild(firstElement);

        this.SliderDom!.style.transition = 'none';
        this.SliderDom!.style.transform = 'translateX(0)';

        void this.SliderDom!.offsetWidth;
        this.SliderDom!.style.transition = 'transform 0.5s ease-in-out';


        this.updateFirstItem();


        this.isTransitioning = false;
      }, 500);

    } else {
      // Preparamos el último elemento para colocarlo al principio
      const items = Array.from(this.SliderDom.children);
      const lastElement = items[items.length - 1] as HTMLElement;

      this.SliderDom.style.transition = 'none';

      this.SliderDom.insertBefore(lastElement, this.SliderDom.firstChild);

      this.SliderDom.style.transform = `translateX(-${this.itemWidth}px)`;

      void this.SliderDom.offsetWidth;

      this.SliderDom.style.transition = 'transform 0.5s ease-in-out';
      this.SliderDom.style.transform = 'translateX(0)';

      // Después de la animación
      setTimeout(() => {
        this.updateFirstItem();

        this.isTransitioning = false;
      }, 500);
    }

    // Reiniciamos el temporizador y el auto-slide
    this.resetTimer();
    this.startAutoSlide();
  }

  // Función para actualizar la clase 'first' al primer item
  updateFirstItem(): void {
    if (!this.SliderDom) return;

    const items = Array.from(this.SliderDom.children);

    // Removemos la clase 'first' de todos los items
    items.forEach(item => item.classList.remove('first'));

    // Asignamos la clase 'first' al primer item visible
    if (items.length > 0) {
      items[0].classList.add('first');

      this.actualizarBookActual();
    }
  }

  // Función para reiniciar el temporizador de la barra
  resetTimer(): void {
    this.currentTime = 0;

    if (this.timerBar) {
      this.timerBar.style.width = '100%';
      this.timerBar.style.transition = 'none';

      void this.timerBar.offsetWidth;

      this.timerBar.style.transition = `width ${this.timerDuration}ms linear`;
      this.timerBar.style.width = '0%';
      console.log('Timer reseteado');
    } else {
      console.warn("Elemento de temporizador no encontrado");
    }

    clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      this.currentTime += 10;
      const remainingTime = this.timerDuration - this.currentTime;

      if (remainingTime <= 0) {
        clearInterval(this.timerInterval);
      }
    }, 10);
  }

  clearAllIntervals(): void {
    clearInterval(this.timerInterval);
    clearInterval(this.autoSlideInterval);
  }
}