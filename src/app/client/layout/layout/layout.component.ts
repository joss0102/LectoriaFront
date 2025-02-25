import { Component } from '@angular/core';
import { NavHorizontalComponent } from "../../header/nav-horizontal/nav-horizontal.component";
import { NavVerticalComponent } from "../../header/nav-vertical/nav-vertical.component";
import { RouterOutlet } from '@angular/router';
import { DividerTimerComponent } from "../../header/divider-timer/divider-timer.component";

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [NavHorizontalComponent, NavVerticalComponent, RouterOutlet, DividerTimerComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {

}
