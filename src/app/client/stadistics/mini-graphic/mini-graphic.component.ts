import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth.service';
import { UserService } from '../../../core/services/call-api/user.service';

@Component({
  selector: 'app-mini-graphic',
  standalone: true,
  imports: [],
  templateUrl: './mini-graphic.component.html',
  styleUrls: ['./mini-graphic.component.scss'],
})
export class MiniGraphicComponent implements OnInit {
  avg_pages_per_day: string = '0';
  avg_reading_days_per_book: string = '0';

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadUserStats();
  }

  loadUserStats(): void {
    const actualUser = this.authService.currentUserValue;
    if (actualUser) {
      this.userService.getUserStats(actualUser.nickname).subscribe({
        next: (response) => {
          this.avg_pages_per_day = (response.avg_pages_per_day || 0).toString();
          this.avg_reading_days_per_book = (
            response.avg_reading_days_per_book || 0
          ).toString();
        },
      });
    }
  }

  getFormattedNumber(value: string): string {
    const num = parseFloat(value);
    return num.toFixed(0);
  }
}
