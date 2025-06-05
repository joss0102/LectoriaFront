import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, map, catchError, tap, timeout, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { StatsCardsComponent } from '../graphics/stats-cards-component/stats-cards.component';
import { GenreDistributionChartComponent } from '../graphics/genre-distribution-chart/genre-distribution-chart.component';
import { ReadingTrendsChartComponent } from '../graphics/reading-trends-chart/reading-trends-chart.component';
import { TopBooksChartComponent } from '../graphics/top-books-chart/top-books-chart.component';
import { UserActivityChartComponent } from '../graphics/user-activity-chart/user-activity-chart.component';

import { BookService } from '../../core/services/call-api/book.service';
import { UserService } from '../../core/services/call-api/user.service';
import { ReadingService } from '../../core/services/call-api/reading.service';
import { AuthorService } from '../../core/services/call-api/author.service';

export interface DashboardFilters {
  dateRange: {
    start: string;
    end: string;
  };
  genre?: string;
  refreshInterval: number;
}

export interface DashboardData {
  stats: {
    totalBooks: number;
    activeUsers: number;
    totalAuthors: number;
    averageRating: number;
    totalPages: number;
    completedBooks: number;
  };
  genreDistribution: Array<{ name: string; value: number; percentage: number }>;
  readingTrends: Array<{ month: string; pages: number; books: number }>;
  topBooks: Array<{ title: string; readers: number; rating: number; author: string }>;
  userActivity: Array<{ month: string; newUsers: number; activeUsers: number }>;
  recentActivity: Array<{ type: string; description: string; timestamp: Date; user?: string }>;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatsCardsComponent,
    GenreDistributionChartComponent,
    ReadingTrendsChartComponent,
    TopBooksChartComponent,
    UserActivityChartComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  private bookService = inject(BookService);
  private userService = inject(UserService);
  private readingService = inject(ReadingService);
  private authorService = inject(AuthorService);
  
  isLoading = true;
  error: string | null = null;
  lastUpdated: Date = new Date();
  
  dashboardData: DashboardData = {
    stats: {
      totalBooks: 0,
      activeUsers: 0,
      totalAuthors: 0,
      averageRating: 0,
      totalPages: 0,
      completedBooks: 0
    },
    genreDistribution: [],
    readingTrends: [],
    topBooks: [],
    userActivity: [],
    recentActivity: []
  };
  
  filters: DashboardFilters = {
    dateRange: {
      start: this.getDateString(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)),
      end: this.getDateString(new Date())
    },
    refreshInterval: 0
  };
  
  showFilters = false;
  autoRefreshInterval: any;
  availableGenres: string[] = [];

  datePresets = [
    { label: 'Última semana', days: 7 },
    { label: 'Último mes', days: 30 },
    { label: 'Últimos 3 meses', days: 90 },
    { label: 'Último año', days: 365 },
    { label: 'Todo el tiempo', days: 0 }
  ];

  ngOnInit() {
    this.loadDashboardData();
    this.setupAutoRefresh();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
    }
  }

  loadDashboardData() {
    try {
      this.isLoading = true;
      this.error = null;
      
      
      const dataObservables = {
        stats: this.loadStatsData(),
        genres: this.loadGenreDistribution(),
        topBooks: this.loadTopBooks(),
        users: this.loadUserData(),
        reviews: this.loadReviewsData(),
        readingTrends: this.loadReadingTrends()
      };
      
      forkJoin(dataObservables)
        .pipe(
          timeout(30000),
          takeUntil(this.destroy$),
          catchError(error => {
            this.error = 'Error al cargar los datos del dashboard';
            return of(null);
          })
        )
        .subscribe(result => {
          if (result) {
            this.processDashboardData(result);
            this.loadRecentActivity();
          }
          this.isLoading = false;
          this.lastUpdated = new Date();
        });
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.error = 'Error al cargar los datos del dashboard';
      this.isLoading = false;
    }
  }

  private loadStatsData() {
    
    const booksCall = this.bookService.getAllBooks(1, 1000).pipe(
      catchError(error => {
        console.error('Books error:', error);
        return of({ data: [], pagination: { total_items: 0 } });
      })
    );
    
    const usersCall = this.userService.getAllUsers(1, 1).pipe(
      catchError(error => {
        console.error('Users error:', error);
        return of({ data: [], pagination: { total_items: 0 } });
      })
    );
    
    const authorsCall = this.authorService.getAllAuthors().pipe(
      catchError(error => {
        console.error('Authors error:', error);
        return of({ data: [] });
      })
    );

    return forkJoin({
      books: booksCall,
      users: usersCall,
      authors: authorsCall
    })
  }

  private loadGenreDistribution() {
    
    return this.bookService.getAllBooks(1, 1000).pipe(
      map(response => {
        
        const genreCount = new Map<string, number>();
        let totalBooks = 0;

        response.data?.forEach(book => {
          if (book.genres) {
            const genres = book.genres.split(',').map(g => g.trim()).filter(g => g);
            genres.forEach(genre => {
              genreCount.set(genre, (genreCount.get(genre) || 0) + 1);
              totalBooks++;
            });
          }
        });

        const result = Array.from(genreCount.entries())
          .map(([name, value]) => ({
            name,
            value,
            percentage: Number(((value / totalBooks) * 100).toFixed(1))
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10);
          
        return result;
      }),
      catchError(error => {
        return of([]);
      })
    );
  }

  private loadTopBooks() {
    
    const booksCall = this.bookService.getAllBooks(1, 100);
    const reviewsCall = this.readingService.getBookReviews(undefined, undefined, 1, 1000);
    
    return forkJoin({
      books: booksCall,
      reviews: reviewsCall
    }).pipe(
      map(result => {
        
        if (!result.books.data) return [];
        
        const bookPopularity = new Map<string, { readers: number; totalRating: number; count: number }>();
        
        result.books.data.forEach(book => {
          bookPopularity.set(book.book_title, { readers: 0, totalRating: 0, count: 0 });
        });
        
        result.reviews.data?.forEach(review => {
          const numericRating = Number(review.rating);
          if (!isNaN(numericRating)) {
            const existing = bookPopularity.get(review.book_title) || { readers: 0, totalRating: 0, count: 0 };
            existing.readers += 1;
            existing.totalRating += numericRating;
            existing.count += 1;
            bookPopularity.set(review.book_title, existing);
          }
        });
        
        const topBooks = result.books.data
          .map(book => {
            const popularity = bookPopularity.get(book.book_title) || { readers: 0, totalRating: 0, count: 0 };
            const avgRating = popularity.count > 0 ? popularity.totalRating / popularity.count : 0;
            
            return {
              title: book.book_title,
              readers: popularity.readers,
              rating: Number(avgRating.toFixed(1)),
              author: book.authors || 'Autor desconocido'
            };
          })
          .filter(book => book.readers > 0)
          .sort((a, b) => b.readers - a.readers)
          .slice(0, 10);
          
        return topBooks;
      }),
      catchError(error => {
        console.error('Top books error:', error);
        return of([]);
      })
    );
  }

  private loadUserData() {
    
    return this.userService.getAllUsers(1, 1000).pipe(
      map(response => {
        
        if (!response.data) return [];
        
        const monthlyData = new Map<string, { newUsers: number; activeUsers: number }>();
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        
        months.forEach(month => {
          monthlyData.set(month, { newUsers: 0, activeUsers: 0 });
        });
        
        response.data.forEach(user => {
          if (user.union_date) {
            const date = new Date(user.union_date);
            const monthName = months[date.getMonth()];
            const existing = monthlyData.get(monthName) || { newUsers: 0, activeUsers: 0 };
            existing.newUsers += 1;
            existing.activeUsers += 1;
            monthlyData.set(monthName, existing);
          }
        });
        
        const result = months.map(month => ({
          month,
          newUsers: monthlyData.get(month)?.newUsers || 0,
          activeUsers: monthlyData.get(month)?.activeUsers || 0
        }));
        
        return result;
      }),
      catchError(error => {
        console.error('User data error:', error);
        return of([]);
      })
    );
  }

  private loadReviewsData() {
    
    return this.readingService.getBookReviews(undefined, undefined, 1, 10000).pipe(
      tap(response => {
      }),
      map(response => {
        if (!response?.data?.length) {
          return { averageRating: 0, totalReviews: 0 };
        }
        
        const validReviews = response.data.filter(review => {
          const numericRating = Number(review.rating);
          const isValid = !isNaN(numericRating) && 
                          numericRating > 0 && 
                          numericRating <= 10;
          if (!isValid && review.rating != null) {
          }
          return isValid;
        });
        
        
        if (!validReviews.length) {
          return { averageRating: 0, totalReviews: 0 };
        }
        
        const totalRating = validReviews.reduce((sum, review) => {
          const numericRating = Number(review.rating);
          return sum + numericRating;
        }, 0);
        
        const averageRating = totalRating / validReviews.length;
        
        return {
          averageRating: Number(averageRating.toFixed(1)),
          totalReviews: validReviews.length
        };
      }),
      catchError(error => {
        console.error('Error loading reviews:', error);
        return of({ averageRating: 0, totalReviews: 0 });
      })
    );
  }

private loadReadingTrends() {
    
    return this.userService.getAllUsers(1, 1000).pipe(
      switchMap(userResponse => {
        
        if (!userResponse?.data?.length) {
          return of([]);
        }
        
        const progressCalls = userResponse.data.map(user => 
          this.readingService.getReadingProgress(user.nickName, undefined, 1, 1000).pipe(
            catchError(error => {
              console.error(`Error loading progress for user ${user.nickName}:`, error);
              return of({ data: [] });
            })
          )
        );
        
        return forkJoin(progressCalls);
      }),
      map(allProgressResponses => {        
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        
        const yearlyData = new Map<number, Map<string, { pages: number; books: Set<string> }>>();
        
        allProgressResponses.forEach(response => {
          if (response?.data) {
            response.data.forEach(progress => {
              if (progress.current_reading_status === 'completed' || 
                  Number(progress.cumulative_progress_percentage) >= 100) {
                
                const date = new Date(progress.reading_date);
                if (!isNaN(date.getTime())) {
                  const year = date.getFullYear();
                  const monthName = months[date.getMonth()];
                  
                  if (!yearlyData.has(year)) {
                    yearlyData.set(year, new Map());
                    months.forEach(month => {
                      yearlyData.get(year)!.set(month, { pages: 0, books: new Set() });
                    });
                  }
                  
                  const monthData = yearlyData.get(year)!.get(monthName)!;
                  monthData.books.add(`${progress.book_title}-${progress.user_nickname}`);
                  
                  const pagesRead = Number(progress.cumulative_pages_read) || 300;
                  monthData.pages += pagesRead;
                }
              }
            });
          }
        });
        
        const result: Array<{ month: string; pages: number; books: number; year: number }> = [];
        
        yearlyData.forEach((monthsData, year) => {
          months.forEach(month => {
            const data = monthsData.get(month)!;
            result.push({
              month,
              pages: data.pages,
              books: data.books.size,
              year
            });
          });
        });
        
        return result;
      }),
      catchError(error => {
        console.error('Reading trends error:', error);
        
        return this.readingService.getBookReviews(undefined, undefined, 1, 10000).pipe(
          map(response => {
            const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            const yearlyData = new Map<number, Map<string, { pages: number; books: Set<string> }>>();
            
            if (response?.data) {
              response.data.forEach(review => {
                const date = new Date(review.review_date);
                if (!isNaN(date.getTime())) {
                  const year = date.getFullYear();
                  const monthName = months[date.getMonth()];
                  
                  if (!yearlyData.has(year)) {
                    yearlyData.set(year, new Map());
                    months.forEach(month => {
                      yearlyData.get(year)!.set(month, { pages: 0, books: new Set() });
                    });
                  }
                  
                  const monthData = yearlyData.get(year)!.get(monthName)!;
                  monthData.books.add(review.book_title);
                  monthData.pages += 300;
                }
              });
            }
            
            const result: Array<{ month: string; pages: number; books: number; year: number }> = [];
            
            yearlyData.forEach((monthsData, year) => {
              months.forEach(month => {
                const data = monthsData.get(month)!;
                result.push({
                  month,
                  pages: data.pages,
                  books: data.books.size,
                  year
                });
              });
            });
            
            return result;
          })
        );
      })
    );
  }

  private loadRecentActivity() {
    
    this.readingService.getBookReviews(undefined, undefined, 1, 10).pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('Recent activity error:', error);
        return of({ data: [] });
      })
    ).subscribe(response => {
      const activities: DashboardData['recentActivity'] = [];
      
      response.data?.forEach((review, index) => {
        activities.push({
          type: 'new_review',
          description: `Nueva reseña para "${review.book_title}" (${review.rating} estrellas)`,
          timestamp: new Date(review.review_date),
          user: review.user_nickname
        });
      });
      
      this.userService.getAllUsers(1, 5).pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Recent users error:', error);
          return of({ data: [] });
        })
      ).subscribe(userResponse => {
        userResponse.data?.forEach(user => {
          activities.push({
            type: 'new_user',
            description: `Nuevo usuario registrado: ${user.nickName}`,
            timestamp: new Date(user.union_date)
          });
        });
        
        this.dashboardData.recentActivity = activities
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 5);
          
      });
    });
  }

  private processDashboardData(data: any) {
    
    const completedBooks = data.reviews?.totalReviews || 0;
    
    this.dashboardData.stats = {
      totalBooks: data.stats?.books?.pagination?.total_items || 0,
      activeUsers: data.stats?.users?.pagination?.total_items || 0,
      totalAuthors: data.stats?.authors?.data?.length || 0,
      averageRating: data.reviews?.averageRating || 0,
      totalPages: this.calculateTotalPages(data.stats?.books?.data || []),
      completedBooks: completedBooks
    };

    this.dashboardData.genreDistribution = data.genres || [];
    this.dashboardData.topBooks = data.topBooks || [];
    this.dashboardData.userActivity = data.users || [];
    this.dashboardData.readingTrends = data.readingTrends || [];
    
  }

  private calculateTotalPages(books: any[]): number {
    const totalPages = books.reduce((total, book) => total + (book.book_pages || 0), 0);
    return totalPages;
  }

  applyDatePreset(days: number) {
    if (days === 0) {
      this.filters.dateRange.start = '2020-01-01';
      this.filters.dateRange.end = this.getDateString(new Date());
    } else {
      const endDate = new Date();
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      this.filters.dateRange.start = this.getDateString(startDate);
      this.filters.dateRange.end = this.getDateString(endDate);
    }
    this.applyFilters();
  }

  applyFilters() {
    this.loadDashboardData();
  }

  resetFilters() {
    this.filters = {
      dateRange: {
        start: this.getDateString(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)),
        end: this.getDateString(new Date())
      },
      refreshInterval: 0
    };
    this.loadDashboardData();
  }

  setupAutoRefresh() {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
    }
    
    if (this.filters.refreshInterval && this.filters.refreshInterval > 0) {
      this.autoRefreshInterval = setInterval(() => {
        this.loadDashboardData();
      }, this.filters.refreshInterval * 1000);
    }
  }

  toggleAutoRefresh() {
    if (this.filters.refreshInterval === 0) {
      this.filters.refreshInterval = 30;
    } else {
      this.filters.refreshInterval = 0;
    }
    this.setupAutoRefresh();
  }

  // Export methods
  exportData(format: 'csv' | 'json') {
    const data = this.dashboardData;
    const filename = `dashboard_data_${this.getDateString(new Date())}.${format}`;
    
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      this.downloadFile(blob, filename);
    } else {
      const csvData = this.convertToCSV(data);
      const blob = new Blob([csvData], { type: 'text/csv' });
      this.downloadFile(blob, filename);
    }
  }

  private convertToCSV(data: DashboardData): string {
    let csv = 'Tipo,Nombre,Valor\n';
    
    Object.entries(data.stats).forEach(([key, value]) => {
      csv += `Estadística,${key},${value}\n`;
    });
    
    data.genreDistribution.forEach(item => {
      csv += `Género,${item.name},${item.value}\n`;
    });
    
    data.topBooks.forEach(book => {
      csv += `Libro Popular,${book.title},${book.readers}\n`;
    });
    
    return csv;
  }

  private downloadFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private getDateString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays}d`;
  }

  getActivityIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'new_book': 'book',
      'new_review': 'star',
      'new_user': 'person-plus',
      'book_completed': 'check-circle'
    };
    return icons[type] || 'info-circle';
  }

  refreshData() {
    this.loadDashboardData();
  }

  trackByActivity(index: number, item: any): any {
    return item.timestamp;
  }
}