import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../../core/services/call-api/book.service';
import { ReadingService } from '../../../core/services/call-api/reading.service';
import { UserBook } from '../../../core/models/call-api/book.model';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ReadingProgress } from '../../../core/models/call-api/reading.model';

import { ReadingGoalsService } from '../../../core/services/ReadingGoals/reading-goals.service';
import { Subscription } from 'rxjs';

declare var bootstrap: any;

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent implements OnInit, AfterViewInit, OnDestroy {
  currentDate: Date = new Date();
  currentMonth: number = this.currentDate.getMonth();
  currentYear: number = this.currentDate.getFullYear();
  
  daysReadThisMonth: number = 0;
  pagesReadThisMonth: number = 0;
  booksCompletedThisMonth: number = 0;
  totalReadingTimeThisMonth: number = 0;
  
  currentGoal: string = 'Leer 15 libros en 2025';
  goalProgressPercentage: number = 0;
  goalProgressText: string = '';
  
  weekdays: string[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  
  books: UserBook[] = [];
  userNickname: string = '';
  
  allReadingRecords: ReadingProgress[] = [];
  
  modal: any;
  selectedDate: Date | null = null;
  selectedDay: number | null = null;
  selectedBook: UserBook | null = null;
  pagesRead: number = 0;
  timeSpent: number = 0;
  
  confirmationModal: any;
  bookToUpdate: UserBook | null = null;

  loading: boolean = true;
  error: string | null = null;
  
  // Suscripción a las metas de lectura
  private readingGoalsSubscription: Subscription = new Subscription();
  
  // Metas diarias para verificar logros
  dailyPagesGoal: number = 30;
  
  constructor(
    private bookService: BookService,
    private readingService: ReadingService,
    private authService: AuthService,
    private readingGoalsService: ReadingGoalsService
  ) { }
  
  ngOnInit(): void {
    const currentUser = this.authService.currentUserValue;
    
    if (currentUser) {
      this.userNickname = currentUser.nickname;
      
      const now = new Date();
      this.currentMonth = now.getMonth();
      this.currentYear = now.getFullYear();

      
      this.loadUserBooks();
      
      // Suscribirse a cambios en las metas de lectura
      this.subscribeToReadingGoals();
    } else {
      this.error = 'No hay usuario autenticado';
      console.error('Error: No hay usuario autenticado');
      this.loading = false;
    }
  }

  ngAfterViewInit(): void {
    this.initModal();
    this.initConfirmationModal();
  }
  
  ngOnDestroy(): void {
    // Limpiar suscripciones
    if (this.readingGoalsSubscription) {
      this.readingGoalsSubscription.unsubscribe();
    }
  }
  
  /**
   * Suscribirse a cambios en las metas de lectura
   */
  private subscribeToReadingGoals(): void {
    // Cargar metas desde el servidor
    this.readingGoalsService.loadUserGoals(this.userNickname).subscribe();
    
    // Obtener metas iniciales
    const initialGoals = this.readingGoalsService.getCurrentGoals();
    this.updateGoals(initialGoals);
    
    // Suscribirse a cambios futuros
    this.readingGoalsSubscription = this.readingGoalsService.readingGoals$
      .subscribe(goals => {
        this.updateGoals(goals);
        
        // Recalcular el progreso cuando cambien las metas
        this.calculateYearlyProgress();
      });
  }
  
  /**
   * Actualizar las metas locales con las nuevas
   */
  private updateGoals(goals: any): void {
    this.dailyPagesGoal = goals.daily_pages;
    this.currentGoal = this.readingGoalsService.formatYearlyGoal(this.currentYear);
  }

  initModal(): void {
    const modalElement = document.getElementById('readingModal');
    if (modalElement) {
      this.modal = new bootstrap.Modal(modalElement);
    } else {
      console.error('Elemento modal no encontrado en el DOM');
    }
  }
  
  initConfirmationModal(): void {
    const modalElement = document.getElementById('confirmationModal');
    if (modalElement) {
      this.confirmationModal = new bootstrap.Modal(modalElement);
    } else {
      console.error('Elemento modal de confirmación no encontrado en el DOM');
    }
  }
  
  // Cargar libros del usuario
  loadUserBooks(): void {
    this.loading = true;
    this.error = null;
    
    this.bookService.getUserBooks(this.userNickname, undefined, 1, 200)
      .subscribe({
        next: (response) => {
          
          if (response && response.data) {
            this.books = response.data;
            this.loadReadingRecords();
          } else {
            console.error('Respuesta de la API incorrecta o vacía:', response);
            this.error = 'Formato de respuesta de API incorrecto';
            this.loading = false;
          }
        },
        error: (err) => {
          console.error('Error al obtener libros del usuario:', err);
          this.error = 'Error al cargar los libros del usuario';
          this.loading = false;
        }
      });
  }
  
  // Cargar registros de lectura
  loadReadingRecords(): void {
    this.readingService.getReadingProgress(this.userNickname, undefined, 1, 200)
      .subscribe({
        next: (response) => {

          
          if (response && response.data) {
            this.allReadingRecords = response.data;
            
            this.updateMonthStats();
            this.calculateYearlyProgress();
          } else {
            console.error('Respuesta de la API incorrecta o vacía:', response);
            this.error = 'Formato de respuesta de API incorrecto';
          }
          
          this.loading = false;
        },
        error: (err) => {
          console.error('Error al obtener registros de lectura:', err);
          this.error = 'Error al cargar los registros de lectura';
          this.loading = false;
        }
      });
  }
  
  booksReadToday: { title: string, pagesRead: number }[] = [];
  
  openReadingModal(day: number): void {
    this.selectedDay = day;
    this.selectedDate = new Date(this.currentYear, this.currentMonth, day);
    this.selectedBook = null;
    this.pagesRead = 0;
    this.timeSpent = 0;
    
    this.booksReadToday = this.getBooksReadOnDay(day);
    
    if (this.modal) {
      this.modal.show();
    } else {
      console.error('Modal no inicializado');
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
  getAvailableBooks(): UserBook[] {
    
    const availableBooks = this.books.filter(book => {
      const validStatuses = ['reading', 'plan_to_read', 'on_hold', 'dropped'];
      return validStatuses.includes(book.reading_status);
    });
  

    
    return availableBooks;
  }
  getBooksReadOnDay(day: number): { title: string, pagesRead: number }[] {
    const dayRecords = this.getReadingRecordsForDay(day);
    const booksReadToday = dayRecords.map(record => ({
      title: record.book_title,
      pagesRead: record.pages_read_session
    }));
  
    console.log(`Libros leídos el día ${day}:`, booksReadToday);
    
    return booksReadToday;
  }
  /**
   * Función para parsear correctamente las fechas de la API
   * La API devuelve fechas en formato: "Fri, 22 Dec 2023 00:00:00 GMT"
   */
  parseApiDate(dateString: string): Date {
    return new Date(dateString);
  }
  
  // Seleccionar un libro del select
  onBookSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const bookTitle = select.value;
    
    if (bookTitle) {
      this.selectedBook = this.books.find(book => book.book_title === bookTitle) || null;
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
    
    const totalPages = this.selectedBook.book_pages || 0;
    const pagesRead = this.selectedBook.pages_read || 0;
    const paginasRestantes = totalPages - pagesRead;
    
    return Math.max(1, paginasRestantes);
  }
  
  // Verificar si el formulario es válido
  isReadingFormValid(): boolean {
    return !!this.selectedBook && this.pagesRead > 0 && this.timeSpent > 0;
  }
  
  // Guardar registro de lectura
  saveReading(): void {
    if (!this.selectedBook || !this.selectedDate) {
      console.error('Libro o fecha no seleccionados');
      return;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (this.selectedDate > today) {
      alert('No puedes registrar lecturas en fechas futuras');
      return;
    }
    
    if (this.selectedBook.reading_status !== 'reading') {
      this.bookToUpdate = this.selectedBook;
      
      if (this.confirmationModal) {
        this.confirmationModal.show();
      } else {
        const confirmChange = confirm(`El libro "${this.selectedBook.book_title}" está actualmente marcado como "${this.getStatusText(this.selectedBook.reading_status)}". ¿Deseas cambiar su estado a "Leyendo" y registrar la lectura?`);
        
        if (confirmChange) {
          this.confirmStatusChange();
        }
      }
      return;
    }
    
    this.registerReading();
  }
  
  // Obtener texto legible del estado
  getStatusText(status: string): string {
    const statusMap: {[key: string]: string} = {
      'reading': 'Leyendo',
      'completed': 'Completado',
      'dropped': 'Abandonado',
      'on_hold': 'En pausa',
      'plan_to_read': 'Sin empezar'
    };
    return statusMap[status] || status;
  }
  
  // Confirmar el cambio de estado y registrar la lectura
  confirmStatusChange(): void {
    if (this.confirmationModal) {
      this.confirmationModal.hide();
    }
    // Registrar la lectura
    this.registerReading();
  }
  
  // Cancelar el cambio de estado
  cancelStatusChange(): void {
    if (this.confirmationModal) {
      this.confirmationModal.hide();
    }
    
    if (this.modal) {
      this.modal.hide();
    }
    
    this.bookToUpdate = null;
  }
  
  // Registrar la lectura (después de cualquier confirmación necesaria)
  registerReading(): void {
    if (!this.selectedBook || !this.selectedDate) {
      console.error('Libro o fecha no seleccionados');
      return;
    }
    
    const formattedDate = new Date(
      this.selectedDate.getFullYear(), 
      this.selectedDate.getMonth(), 
      this.selectedDate.getDate() + 1
    ).toISOString().split('T')[0];
    
    const progressData = {
      nickname: this.userNickname,
      book_title: this.selectedBook.book_title,
      pages_read_list: this.pagesRead.toString(),
      dates_list: formattedDate
    };
    
    console.log('Fecha original seleccionada:', this.selectedDate);
    console.log('Fecha formateada para API:', formattedDate);
    
    this.readingService.addReadingProgress(progressData).subscribe({
      next: (response) => {
        console.log('Progreso de lectura registrado:', response);
        
        this.loadReadingRecords();
        
        if (this.selectedDate && 
            (this.selectedDate.getMonth() !== this.currentMonth || 
            this.selectedDate.getFullYear() !== this.currentYear)) {
          this.currentMonth = this.selectedDate.getMonth();
          this.currentYear = this.selectedDate.getFullYear();
        }
        
        if (this.modal) {
          this.modal.hide();
        }
      },
      error: (err) => {
        console.error('Error al guardar el progreso de lectura:', err);
      }
    });
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

    
    const recordsThisMonth = this.allReadingRecords.filter(record => {
      const recordDate = this.parseApiDate(record.reading_date);
      return recordDate.getMonth() === this.currentMonth && 
              recordDate.getFullYear() === this.currentYear;
    });
    

    
    const uniqueDays = new Set();
    let totalPages = 0;
    let totalTime = 0;
    
    recordsThisMonth.forEach(record => {
      const recordDate = this.parseApiDate(record.reading_date);
      uniqueDays.add(recordDate.getDate());
      totalPages += record.pages_read_session;
      
      totalTime += Math.floor(record.pages_read_session * 1.2);
    });
    
    this.daysReadThisMonth = uniqueDays.size;
    this.pagesReadThisMonth = totalPages;
    this.totalReadingTimeThisMonth = totalTime;
    
    this.booksCompletedThisMonth = this.books.filter(book => {
      if (book.reading_status === 'completed' && book.date_ending) {
        const endingDate = this.parseApiDate(book.date_ending);
        return endingDate.getMonth() === this.currentMonth && 
                endingDate.getFullYear() === this.currentYear;
      }
      return false;
    }).length;
  }
  
/**
   * Calcula el progreso anual hacia la meta
   */
calculateYearlyProgress(): void {
  const booksReadThisYear = this.books.filter(book => {
    if (book.reading_status === 'completed' && book.date_ending) {
      const endingDate = this.parseApiDate(book.date_ending);
      return endingDate.getFullYear() === this.currentYear;
    }
    return false;
  }).length;
  
  // Obtener la meta anual actual del servicio
  const currentGoals = this.readingGoalsService.getCurrentGoals();
  const yearlyGoal = currentGoals.yearly;
  
  this.goalProgressPercentage = Math.min(100, (booksReadThisYear / yearlyGoal) * 100);
  
  if (this.goalProgressPercentage < 25) {
    this.goalProgressText = `${booksReadThisYear}/${yearlyGoal} - ¡Sigue así, aún queda mucho año!`;
  } else if (this.goalProgressPercentage < 50) {
    this.goalProgressText = `${booksReadThisYear}/${yearlyGoal} - ¡Buen progreso, vas por buen camino!`;
  } else if (this.goalProgressPercentage < 75) {
    this.goalProgressText = `${booksReadThisYear}/${yearlyGoal} - ¡Impresionante, estás avanzando rápido!`;
  } else if (this.goalProgressPercentage < 100) {
    this.goalProgressText = `${booksReadThisYear}/${yearlyGoal} - ¡Casi ahí, solo unos pocos más!`;
  } else {
    this.goalProgressText = `${booksReadThisYear}/${yearlyGoal} - ¡Meta completada! ¿Por qué no aumentarla?`;
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
 */
getDaysOffset(): number[] {
  const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
  
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  
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
  const records = this.getReadingRecordsForDay(day);
  return records.length > 0;
}

/**
 * Verifica si se ha alcanzado la meta diaria en un día específico
 */
hasAchievedGoalOnDay(day: number): boolean {
  const totalPagesOnDay = this.getPagesForDay(day);
  
  // Usar la meta diaria configurada en preferencias
  return totalPagesOnDay >= this.dailyPagesGoal;
}

getReadingRecordsForDay(day: number): ReadingProgress[] {
  return this.allReadingRecords.filter(record => {
    try {
      const recordDate = this.parseApiDate(record.reading_date);
      
      const recordDateOnly = new Date(
        recordDate.getFullYear(), 
        recordDate.getMonth(), 
        recordDate.getDate()
      );
      
      const targetDate = new Date(
        this.currentYear,
        this.currentMonth,
        day
      );
      
      const recordDateStr = recordDateOnly.toISOString().split('T')[0];
      const targetDateStr = targetDate.toISOString().split('T')[0];
      
      return recordDateStr === targetDateStr;
    } catch (error) {
      console.error('Error al procesar fecha:', record.reading_date, error);
      return false;
    }
  });
}

/**
 * Obtiene el número de páginas leídas en un día específico
 */
getPagesForDay(day: number): number {
  const records = this.getReadingRecordsForDay(day);
  const totalPages = records.reduce(
    (sum, record) => sum + record.pages_read_session, 0);
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
  console.log(`Cambiando a mes anterior: ${this.currentMonthName} ${this.currentYear}`);
  this.updateMonthStats();
  
  this.forceViewRefresh();
}

nextMonth(): void {
  if (this.currentMonth === 11) {
    this.currentMonth = 0;
    this.currentYear++;
  } else {
    this.currentMonth++;
  }
  console.log(`Cambiando a mes siguiente: ${this.currentMonthName} ${this.currentYear}`);
  this.updateMonthStats();
  
  this.forceViewRefresh();
}

/**
 * Fuerza un refresco de la vista para solucionar problemas de actualización
 */
forceViewRefresh(): void {
  setTimeout(() => {
    const temp = this.currentMonth;
    this.currentMonth = -1;
    setTimeout(() => {
      this.currentMonth = temp;
    }, 0);
  }, 0);
}

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