import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../auth/auth.service';

export interface ReadingGoals {
  yearly: number;
  monthly: number;
  daily_pages: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReadingGoalsService {
  private apiUrl = `${environment.apiUrl}/reading-goals`;
  
  private defaultGoals: ReadingGoals = {
    yearly: 15,
    monthly: 2,
    daily_pages: 30
  };

  private readingGoalsSubject = new BehaviorSubject<ReadingGoals>(this.defaultGoals);
  
  public readingGoals$ = this.readingGoalsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.loadLocalGoals();
  }

  /**
   * Carga las metas guardadas desde localStorage
   */
  private loadLocalGoals(): void {
    try {
      const savedGoals = localStorage.getItem('reading_goals');
      
      if (savedGoals) {
        const parsedGoals = JSON.parse(savedGoals);
        this.readingGoalsSubject.next(parsedGoals);
      }
    } catch (error) {
      console.error('Error al cargar metas de lectura desde localStorage:', error);
    }
  }
  
  /**
   * Guarda las metas en localStorage
   */
  private saveLocalGoals(goals: ReadingGoals): void {
    localStorage.setItem('reading_goals', JSON.stringify(goals));
  }

  /**
   * Carga las metas de lectura del usuario desde el servidor
   */
  loadUserGoals(nickname: string): Observable<ReadingGoals> {
    const headers = this.authService.getAuthHeaders();
    
    return this.http.get<ReadingGoals>(`${this.apiUrl}/${nickname}`, { headers })
      .pipe(
        tap(goals => {
          this.readingGoalsSubject.next(goals);
          this.saveLocalGoals(goals);
        }),
        catchError(error => {
          console.error('Error al cargar metas desde el servidor:', error);
          return of(this.defaultGoals);
        })
      );
  }

  /**
   * Actualiza las metas de lectura en el servidor
   */
  updateGoals(nickname: string, goals: ReadingGoals): Observable<ReadingGoals> {
    const headers = this.authService.getAuthHeaders();
    
    return this.http.put<{data: ReadingGoals}>(`${this.apiUrl}/${nickname}`, goals, { headers })
      .pipe(
        map(response => response.data),
        tap(updatedGoals => {
          this.readingGoalsSubject.next(updatedGoals);
          this.saveLocalGoals(updatedGoals);
        }),
        catchError(error => {
          console.error('Error al actualizar metas en el servidor:', error);
          return of(this.defaultGoals);
        })
      );
  }

  /**
   * Obtiene las metas actuales
   */
  getCurrentGoals(): ReadingGoals {
    return this.readingGoalsSubject.getValue();
  }

  /**
   * Formatea la meta anual como texto para mostrar
   */
  formatYearlyGoal(year: number = new Date().getFullYear()): string {
    const goals = this.readingGoalsSubject.getValue();
    return `Leer ${goals.yearly} libros en ${year}`;
  }
}