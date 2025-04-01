import { Component } from '@angular/core';
import { CarruselComponent } from "../../library/carrusel/carrusel.component";
import { DataBookComponent } from "../../library/data-book/data-book.component";
import { DataAuthorComponent } from "../../library/data-author/data-author.component";

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CarruselComponent, DataBookComponent, DataAuthorComponent],
  templateUrl: './library.component.html',
  styleUrl: './library.component.scss',
})
export class LibraryComponent { }
