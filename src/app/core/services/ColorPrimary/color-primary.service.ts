import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ColorPrimaryService {
  private primaryColorSubject: BehaviorSubject<string> = new BehaviorSubject<string>('#000000'); // Valor predeterminado

  constructor() { }

  // Método para actualizar el color primario
  updatePrimaryColor(color: string): void {
    this.primaryColorSubject.next(color);
  }

  // Método para obtener el color primario
  getPrimaryColor() {
    return this.primaryColorSubject.asObservable();
  }
}
