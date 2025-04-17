import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { BooksService } from '../../../core/services/book/books.service';
import { Books, ReadingRecord } from '../../../core/models/books-model';

// Declarar la variable global para acceder a Bootstrap
declare var bootstrap: any;

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent implements OnInit, AfterViewInit {
  // Datos del calendario
  currentDate: Date = new Date();
  currentMonth: number = this.currentDate.getMonth();
  currentYear: number = this.currentDate.getFullYear();
  
  // Estadísticas de lectura
  daysReadThisMonth: number = 0;
  pagesReadThisMonth: number = 0;
  booksCompletedThisMonth: number = 0;
  totalReadingTimeThisMonth: number = 0;
  
  // Meta actual y progreso
  currentGoal: string = 'Leer 15 libros en 2025';
  goalProgressPercentage: number = 0;
  goalProgressText: string = '';
  
  // Días de la semana
  weekdays: string[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  
  // Libros y usuario
  books: Books[] = [];
  
  // Variables para el modal
  modal: any;
  selectedDate: Date | null = null;
  selectedDay: number | null = null;
  selectedBook: Books | null = null;
  pagesRead: number = 0;
  timeSpent: number = 0;
  
  constructor(private booksService: BooksService) { }
  
  ngOnInit(): void {
    // Obtener los libros del servicio
    this.books = this.booksService.getAllBooks();
    
    // Actualizar estadísticas
    this.updateMonthStats();
    this.calculateYearlyProgress();
  }

  ngAfterViewInit(): void {
    // Inicializar el modal de Bootstrap después de que la vista se haya cargado
    this.initModal();
  }

  initModal(): void {
    const modalElement = document.getElementById('readingModal');
    if (modalElement) {
      this.modal = new bootstrap.Modal(modalElement);
    }
  }
  
  // Abrir el modal para registrar lectura
  openReadingModal(day: number): void {
    this.selectedDay = day;
    this.selectedDate = new Date(this.currentYear, this.currentMonth, day);
    this.selectedBook = null;
    this.pagesRead = 0;
    this.timeSpent = 0;
    
    if (this.modal) {
      this.modal.show();
    }
  }
  
  // Cambiar la fecha seleccionada
  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      this.selectedDate = new Date(input.value);
    }
  }
  
  // Obtener libros disponibles para seleccionar en el modal
  getAvailableBooks(): Books[] {
    // Devuelve libros que están en progreso o que aún no se han comenzado
    return this.books.filter(book => 
      book.estado === 'en-progreso' || book.estado === 'no-iniciado'
    );
  }
  
  // Seleccionar un libro del select
  onBookSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const bookId = select.value;
    
    if (bookId) {
      this.selectedBook = this.books.find(book => book.titulo === bookId) || null;
    } else {
      this.selectedBook = null;
    }
  }
  
  // Actualizar páginas leídas
  onPagesChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.pagesRead = Number(input.value);
  }
  
  // Actualizar tiempo dedicado
  onTimeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.timeSpent = Number(input.value);
  }
  
  // Calcular máximo de páginas que se pueden leer
  getMaxPages(): number {
    if (!this.selectedBook) return 100;
    
    const paginasRestantes = (this.selectedBook.paginasTotales || 0) - (this.selectedBook.paginasLeidas || 0);
    return Math.max(1, paginasRestantes);
  }
  
  // Verificar si el formulario es válido
  isReadingFormValid(): boolean {
    return !!this.selectedBook && this.pagesRead > 0 && this.timeSpent > 0;
  }
  
  // Guardar registro de lectura
  saveReading(): void {
    if (!this.selectedBook || !this.selectedDate) return;
    
    // Verificar que la fecha no sea futura
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalizar a inicio del día
    
    if (this.selectedDate > today) {
      alert('No puedes registrar lecturas en fechas futuras');
      return;
    }
    
    // Crear un objeto de fecha específico para el registro
    // Esto asegura que se guarde con la fecha correcta seleccionada por el usuario
    const registryDate = new Date(this.selectedDate);
    
    // Usar el servicio para actualizar el progreso, pasando la fecha personalizada
    this.booksService.updateReadingProgress(
      this.selectedBook.titulo,
      this.pagesRead,
      this.timeSpent,
      registryDate // Usar la fecha seleccionada por el usuario
    );
    
    // Actualizar estadísticas
    this.updateMonthStats();
    this.calculateYearlyProgress();
    
    // Si la fecha seleccionada es del mes actual, actualizar la vista al mes de esa fecha
    if (registryDate.getMonth() !== this.currentMonth || 
        registryDate.getFullYear() !== this.currentYear) {
      this.currentMonth = registryDate.getMonth();
      this.currentYear = registryDate.getFullYear();
      this.updateMonthStats();
    }
    
    // Cerrar el modal
    if (this.modal) {
      this.modal.hide();
    }
  }
  
  /**
   * Nombre del mes actual
   */
  get currentMonthName(): string {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[this.currentMonth];
  }
  
  /**
   * Actualiza las estadísticas del mes
   */
  updateMonthStats(): void {
    // Combinamos los registros de lectura de todos los libros
    const allRecords: ReadingRecord[] = [];
    
    this.books.forEach(book => {
      if (book.registroLectura) {
        allRecords.push(...book.registroLectura);
      }
    });
    
    // Filtramos por el mes y año actual
    const recordsThisMonth = allRecords.filter(record => {
      const recordDate = record.fecha;
      return recordDate.getMonth() === this.currentMonth && 
            recordDate.getFullYear() === this.currentYear;
    });
    
    // Calculamos las estadísticas
    this.daysReadThisMonth = new Set(recordsThisMonth.map(record => 
      new Date(record.fecha).getDate())).size;
      
    this.pagesReadThisMonth = recordsThisMonth.reduce(
      (sum, record) => sum + record.paginasLeidas, 0);
      
    this.totalReadingTimeThisMonth = recordsThisMonth.reduce(
      (sum, record) => sum + (record.tiempo || 0), 0);
      
    // Libros completados este mes
    this.booksCompletedThisMonth = this.books.filter(book => 
      book.fechaFin && 
      book.fechaFin.getMonth() === this.currentMonth && 
      book.fechaFin.getFullYear() === this.currentYear
    ).length;
  }
  
  /**
   * Calcula el progreso anual hacia la meta
   */
  calculateYearlyProgress(): void {
    // Contar libros leídos este año
    const booksReadThisYear = this.books.filter(book => 
      book.estado === 'finalizado' && 
      book.fechaFin && 
      book.fechaFin.getFullYear() === this.currentYear
    ).length;
    
    // Calcular porcentaje hacia la meta (15 libros)
    this.goalProgressPercentage = Math.min(100, (booksReadThisYear / 15) * 100);
    
    // Texto de progreso
    if (this.goalProgressPercentage < 25) {
      this.goalProgressText = `${booksReadThisYear}/15 - ¡Sigue así, aún queda mucho año!`;
    } else if (this.goalProgressPercentage < 50) {
      this.goalProgressText = `${booksReadThisYear}/15 - ¡Buen progreso, vas por buen camino!`;
    } else if (this.goalProgressPercentage < 75) {
      this.goalProgressText = `${booksReadThisYear}/15 - ¡Impresionante, estás avanzando rápido!`;
    } else if (this.goalProgressPercentage < 100) {
      this.goalProgressText = `${booksReadThisYear}/15 - ¡Casi ahí, solo unos pocos más!`;
    } else {
      this.goalProgressText = `${booksReadThisYear}/15 - ¡Meta completada! ¿Por qué no aumentarla?`;
    }
  }
  
  /**
   * Obtiene el número de días en el mes actual
   */
  getDaysInMonth(): number[] {
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }
  
  /**
   * Obtiene el offset de días para el comienzo del mes
   * Ajustado para que funcione correctamente con la cuadrícula
   */
  getDaysOffset(): number[] {
    // Obtener el día de la semana del primer día del mes (0 = domingo, 1 = lunes, etc.)
    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    
    // Ajustar para que la semana comience en lunes (0 = lunes, 6 = domingo)
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    
    // Crear un array con el número correcto de elementos vacíos
    return Array(offset).fill(0);
  }
  
  /**
   * Verifica si un día es el día actual
   */
  isToday(day: number): boolean {
    const today = new Date();
    return day === today.getDate() && 
           this.currentMonth === today.getMonth() && 
           this.currentYear === today.getFullYear();
  }
  
  /**
   * Verifica si se ha leído en un día específico
   */
  hasReadOnDay(day: number): boolean {
    return this.books.some(book => 
      book.registroLectura && book.registroLectura.some(record => 
        record.fecha.getDate() === day &&
        record.fecha.getMonth() === this.currentMonth &&
        record.fecha.getFullYear() === this.currentYear
      )
    );
  }
  
  /**
   * Verifica si se ha alcanzado la meta diaria en un día específico
   * (Definimos meta diaria como leer más de 30 páginas)
   */
  hasAchievedGoalOnDay(day: number): boolean {
    // Obtener todas las páginas leídas en este día
    let totalPagesOnDay = 0;
    
    this.books.forEach(book => {
      if (book.registroLectura) {
        const recordsOnDay = book.registroLectura.filter(record => 
          record.fecha.getDate() === day &&
          record.fecha.getMonth() === this.currentMonth &&
          record.fecha.getFullYear() === this.currentYear
        );
        
        totalPagesOnDay += recordsOnDay.reduce(
          (sum, record) => sum + record.paginasLeidas, 0);
      }
    });
    
    // Meta diaria: 30 páginas o más
    return totalPagesOnDay >= 30;
  }
  
  /**
   * Obtiene el número de páginas leídas en un día específico
   */
  getPagesForDay(day: number): number {
    let totalPages = 0;
    
    this.books.forEach(book => {
      if (book.registroLectura) {
        const recordsOnDay = book.registroLectura.filter(record => 
          record.fecha.getDate() === day &&
          record.fecha.getMonth() === this.currentMonth &&
          record.fecha.getFullYear() === this.currentYear
        );
        
        totalPages += recordsOnDay.reduce(
          (sum, record) => sum + record.paginasLeidas, 0);
      }
    });
    
    return totalPages;
  }
  
  /**
   * Navega al mes anterior
   */
  previousMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.updateMonthStats();
  }
  
  /**
   * Navega al mes siguiente
   */
  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.updateMonthStats();
  }
  
  /**
   * Formatea minutos a formato legible (2h 30m)
   */
  formatMinutes(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    } else {
      return `${mins}m`;
    }
  }
}