import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VerticalServiceService {
  private soloIconos = new BehaviorSubject<boolean>(true);
  soloIconos$ = this.soloIconos.asObservable();

  cambiarSoloIconos() {
    this.soloIconos.next(!this.soloIconos.value);
  }
  constructor() {}
}
