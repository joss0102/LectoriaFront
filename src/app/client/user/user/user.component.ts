import { Component } from '@angular/core';
import { CalendarComponent } from '../calendar/calendar.component';
import { ButtonsComponent } from '../button/buttons/buttons.component';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CalendarComponent, ButtonsComponent],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
})
export class UserComponent {}
