import { Component } from '@angular/core';
import { SliderComponent } from '../slider/slider.component';
import { ButtonsComponent } from '../button/buttons/buttons.component';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [SliderComponent, ButtonsComponent],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
})
export class UserComponent {}
