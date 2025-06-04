import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../../models/call-api/user.model';

@Injectable({
  providedIn: 'root'
})
export class AdminUsersService {
  
  private selectedUserSource = new BehaviorSubject<User | null>(null);
  selectedUser$ = this.selectedUserSource.asObservable();
  
  private modalStateSource = new BehaviorSubject<boolean>(false);
  modalState$ = this.modalStateSource.asObservable();
  
  constructor() { }
  
  /**
   * Establece el usuario seleccionado para ver detalles
   */
  setSelectedUser(user: User): void {
    this.selectedUserSource.next(user);
    this.openModal();
  }
  
  /**
   * Obtiene el usuario seleccionado actual
   */
  getSelectedUser(): Observable<User | null> {
    return this.selectedUser$;
  }
  
  /**
   * Abre el modal de detalles
   */
  openModal(): void {
    this.modalStateSource.next(true);
    document.body.style.overflow = 'hidden';
  }
  
  /**
   * Cierra el modal de detalles
   */
  closeModal(): void {
    this.modalStateSource.next(false);
    document.body.style.overflow = 'auto';
  }
  
  /**
   * Obtiene el estado actual del modal
   */
  getModalState(): Observable<boolean> {
    return this.modalState$;
  }
}