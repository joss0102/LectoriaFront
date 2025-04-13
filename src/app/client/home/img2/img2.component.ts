import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import Vibrant from 'node-vibrant';
import { NgClass } from '@angular/common';

import { ColorPrimaryService } from '../../../core/services/ColorPrimary/color-primary.service';
import { HomeService } from '../../../core/services/HomeService/home.service';
import { HomeModel } from '../../../core/models/home.model';

@Component({
  selector: 'app-img2',
  standalone: true,
  imports: [NgClass],
  templateUrl: './img2.component.html',
  styleUrls: ['./img2.component.scss'],
})
export class Img2Component implements OnInit, OnDestroy {
  backgroundImageUrl: string = '/libros/Trono de cristal/fondos/fondo2.jpg'; // Default
  animationActive: boolean = true;
  private subscription: Subscription = new Subscription();

  constructor(
    private homeService: HomeService,
    private cdr: ChangeDetectorRef,
    private colorService: ColorPrimaryService
  ) {}

  ngOnInit(): void {
    this.subscription = this.homeService.currentBook$.subscribe(book => {
      if (book) {
        this.animationActive = false;
        this.cdr.detectChanges();

        setTimeout(() => {
          this.updateBackgroundImage(book);

          setTimeout(() => {
            this.animationActive = true;
            this.cdr.detectChanges();
          }, 50);
        }, 50);
      }
    });

    setTimeout(() => {
      const currentBook = this.homeService.getBookActual();
      if (currentBook) {
        this.updateBackgroundImage(currentBook);
      }
    }, 100);
  }

  updateBackgroundImage(book: HomeModel): void {
    if (book.sagas && book.book_title) {
      const saga = book.sagas.trim();
      const titulo = book.book_title.trim();
      this.backgroundImageUrl = `/libros/${saga}/fondos/fondo2.jpg`;
      this.extractPrimaryColor();
    } else {
      this.backgroundImageUrl = '/libros/Trono de cristal/fondos/fondo2.jpg';
    }
  }

  extractPrimaryColor(): void {
    Vibrant.from(this.backgroundImageUrl)
      .getPalette()
      .then(palette => {
        const primary = palette.Vibrant || palette.Muted;
        const primaryColor = primary ? primary.getHex() : '#000000';
        this.colorService.updatePrimaryColor(primaryColor);
      })
      .catch(error => {
        console.error('Error al extraer el color primario:', error);
      });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
