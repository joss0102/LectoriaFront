import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HomeService } from '../../../core/services/HomeService/home.service';
import { HomeModel } from '../../../core/models/home.model';
import { SearchService } from '../../../core/services/SearchService/search.service';

@Component({
  selector: 'app-data',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data.component.html',
  styleUrl: './data.component.scss'
})
export class DataComponent implements OnInit, OnDestroy {
  book: HomeModel | null = null;
  showData: boolean = true;
  private subscription: Subscription = new Subscription();
  
  constructor(
    private homeService: HomeService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private searchService: SearchService
  ) {}
  
  ngOnInit(): void {
    this.subscription = this.homeService.currentBook$.subscribe(book => {
      if (book) {
        this.showData = false;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.book = book;
          this.showData = true;
          this.cdr.detectChanges();
        }, 300);
      } else {
        console.log("El libro recibido es null");
      }
    });
    
    setTimeout(() => {
      const currentBook = this.homeService.getBookActual();
      if (currentBook) {
        this.book = currentBook;
        this.showData = true;
        this.cdr.detectChanges();
      }
    }, 100);
  }
  
  /**
   * Navega al componente Search para mostrar detalles completos del libro
   */
  showBookDetails(): void {
    if (this.book && this.book.book_id) {
      // Resetear el estado anterior para asegurar que se cargue el nuevo libro
      this.searchService.resetSelectedItem();
      
      // Pequeño delay para asegurar que el reseteo surta efecto
      setTimeout(() => {
        // Seleccionar el libro en el servicio de búsqueda
        this.searchService.selectItemById(this.book!.book_id, 'book');
        
        // Navegar al componente Search
        this.router.navigate(['/search'], {
          queryParams: {
            id: this.book!.book_id,
            type: 'book'
          }
        });
      }, 50);
    }
  }
  
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}