import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { HomeService } from '../../../core/services/HomeService/home.service';
import { HomeModel } from '../../../core/models/home.model';

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
    private cdr: ChangeDetectorRef
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

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
