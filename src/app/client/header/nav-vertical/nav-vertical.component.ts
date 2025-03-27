import { Component } from '@angular/core';
import { VerticalServiceService } from '../../../services/navVertical/vertical-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav-vertical',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nav-vertical.component.html',
  styleUrl: './nav-vertical.component.scss',
})
export class NavVerticalComponent {
  soloIcono: boolean = true;
  constructor(private soloIconos: VerticalServiceService) {
    this.soloIconos.soloIconos$.subscribe((value) => {
      this.soloIcono = value;
    });
  }
}
