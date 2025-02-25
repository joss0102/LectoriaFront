import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-nav-horizontal',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './nav-horizontal.component.html',
  styleUrl: './nav-horizontal.component.scss'
})
export class NavHorizontalComponent {
  activeRoute: string = '';

  constructor(private router: Router) {}

  ngOnInit() {
    this.updateActiveRoute();
    this.router.events.subscribe(() => {
      this.updateActiveRoute();
    });
  }

  updateActiveRoute() {
    const currentPath = this.router.url.replace('/', '');
    this.activeRoute = currentPath === 'inicio' || currentPath === 'biblioteca' ? currentPath : '';
  }
}
