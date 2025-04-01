import { Component } from '@angular/core';
import { DataBookComponent } from '../../library/data-book/data-book.component';
import { CarouselWishComponent } from '../carousel-wish/carousel-wish.component';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [DataBookComponent, CarouselWishComponent],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.scss',
})
export class WishlistComponent {}
