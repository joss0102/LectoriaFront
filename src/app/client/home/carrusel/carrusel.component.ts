import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-carrusel',
  standalone: true,
  imports: [],
  templateUrl: './carrusel.component.html',
  styleUrls: ['./carrusel.component.scss']
})
export class CarruselComponent implements OnInit, OnDestroy {
  nextDom!: HTMLElement | null;
  prevDom!: HTMLElement | null;
  SliderDom!: HTMLElement | null;
  timerBar!: HTMLElement | null;

  currentIndex: number = 0;
  itemsToShow: number = 5;
  totalItems: number = 0;
  itemWidth: number = 0;
  timerDuration: number = 10000;
  timerInterval: any;
  autoSlideInterval: any;
  currentTime: number = 0;
  isTransitioning: boolean = false;

  ngOnInit(): void {
    // Obtener referencias a los elementos del DOM
    this.nextDom = document.getElementById('next');
    this.prevDom = document.getElementById('prev');
    this.SliderDom = document.querySelector('.carousel .list');
    this.timerBar = document.querySelector('.divide-time');

    // Inicializar las propiedades del carrusel
    if (this.SliderDom) {
      this.totalItems = this.SliderDom.children.length;

      // Asegurarse de que el primer elemento tenga la clase 'first' al inicio
      this.updateFirstItem();

      // Calcular el ancho de cada elemento
      setTimeout(() => {
        this.calculateItemWidth();
      }, 100); // Pequeño retraso para asegurar que las dimensiones estén calculadas
    }

    // Iniciar la barra de tiempo
    this.resetTimer();

    // Configurar los eventos de los botones
    if (this.nextDom && this.prevDom) {
      this.nextDom.onclick = () => {
        if (!this.isTransitioning) this.moveSlider('next');
      };
      this.prevDom.onclick = () => {
        if (!this.isTransitioning) this.moveSlider('prev');
      };
    }

    // Iniciar el auto-carrusel
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    // Limpiar intervalos cuando el componente se destruye
    this.clearAllIntervals();
  }

  // Calcular el ancho real de los elementos
  calculateItemWidth(): void {
    if (this.SliderDom && this.SliderDom.children.length > 0) {
      const baseItem = this.SliderDom.children[0] as HTMLElement;
      this.itemWidth = baseItem.offsetWidth;
      console.log("Ancho de elemento calculado:", this.itemWidth);
    }
  }

  // Iniciar el deslizamiento automático
  startAutoSlide(): void {
    this.clearAllIntervals();
    this.autoSlideInterval = setInterval(() => {
      if (!this.isTransitioning) {
        this.moveSlider('next');
      }
    }, this.timerDuration);
  }

  // Función para mover el slider con animación
  moveSlider(direction: string): void {
    if (!this.SliderDom || this.isTransitioning) return;

    this.isTransitioning = true;

    if (direction === 'next') {
      // Animación de desplazamiento hacia la izquierda
      this.SliderDom.style.transition = 'transform 0.5s ease-in-out';
      this.SliderDom.style.transform = `translateX(-${this.itemWidth}px)`;

      // Después de la animación, reorganizamos los elementos
      setTimeout(() => {
        // Movemos el primer elemento al final
        const firstElement = this.SliderDom!.children[0] as HTMLElement;
        this.SliderDom!.appendChild(firstElement);

        // Reseteamos la posición sin transición
        this.SliderDom!.style.transition = 'none';
        this.SliderDom!.style.transform = 'translateX(0)';

        // Forzamos un reflow
        void this.SliderDom!.offsetWidth;

        // Restauramos la transición para futuros movimientos
        this.SliderDom!.style.transition = 'transform 0.5s ease-in-out';

        // Actualizamos las clases
        this.updateFirstItem();
        this.isTransitioning = false;
      }, 500); // Tiempo igual a la duración de la transición

    } else { // dirección 'prev'
      // Preparamos el último elemento para colocarlo al principio
      const items = Array.from(this.SliderDom.children);
      const lastElement = items[items.length - 1] as HTMLElement;

      // Deshabilitamos la transición
      this.SliderDom.style.transition = 'none';

      // Movemos el último elemento al principio
      this.SliderDom.insertBefore(lastElement, this.SliderDom.firstChild);

      // Posicionamos el carrusel como si ya estuviera desplazado
      this.SliderDom.style.transform = `translateX(-${this.itemWidth}px)`;

      // Forzamos un reflow
      void this.SliderDom.offsetWidth;

      // Habilitamos la transición y animamos a la posición original
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
    }
  }

  // Función para reiniciar el temporizador de la barra
  resetTimer(): void {
    this.currentTime = 0;
    if (this.timerBar) {
      this.timerBar.style.width = '100%';
    }

    clearInterval(this.timerInterval);

    // Actualizamos la barra de tiempo cada 10ms
    this.timerInterval = setInterval(() => {
      this.currentTime += 10;
      const remainingTime = this.timerDuration - this.currentTime;
      const width = (remainingTime / this.timerDuration) * 100;

      if (this.timerBar) {
        this.timerBar.style.width = `${width}%`;
      }

      if (remainingTime <= 0) {
        clearInterval(this.timerInterval);
      }
    }, 10);
  }

  // Limpiamos todos los intervalos
  clearAllIntervals(): void {
    clearInterval(this.timerInterval);
    clearInterval(this.autoSlideInterval);
  }
}