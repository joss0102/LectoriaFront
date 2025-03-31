import { Component } from '@angular/core';
import { DividerTimerComponent } from '../divider-timer/divider-timer.component';
import { RouterModule } from '@angular/router';
import { NavVerticalService } from '../../../core/services/NavVerticalService/NavVertical.service';

@Component({
  selector: 'app-nav-horizontal',
  standalone: true,
  imports: [DividerTimerComponent, RouterModule],
  templateUrl: './nav-horizontal.component.html',
  styleUrl: './nav-horizontal.component.scss',
})
export class NavHorizontalComponent {
  modoNoche: boolean = false;

  constructor(private navService: NavVerticalService) {}

  ngOnInit() {
    const savedTheme = localStorage.getItem('modoNoche');
    this.modoNoche = savedTheme === 'true';
  }

  toggleNav() {
    this.navService.toggleIcons();
  }
}
