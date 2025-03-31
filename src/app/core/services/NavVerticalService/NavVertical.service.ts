import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NavVerticalService {
  private onlyIcon = new BehaviorSubject<boolean>(true);
  onlyIcon$ = this.onlyIcon.asObservable();

  toggleIcons() {
    this.onlyIcon.next(!this.onlyIcon.value);
  }
  constructor() {}
}
