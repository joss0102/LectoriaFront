import { Component } from '@angular/core';
import { DataBottomComponent } from '../data-bottom/data-bottom.component';
import { DataTopComponent } from '../data-top/data-top.component';

@Component({
  selector: 'app-current-book',
  standalone: true,
  imports: [DataBottomComponent, DataTopComponent],
  templateUrl: './current-book.component.html',
  styleUrl: './current-book.component.scss',
})
export class CurrentBookComponent { }
