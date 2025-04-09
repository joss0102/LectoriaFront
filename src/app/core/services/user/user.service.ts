import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: number;
  nombre: string;
  primerApellido: string;
  segundoApellido: string;
  fechaNacimiento: string;
  fechaRegistro: string;
  nickname: string;
  password: string;
  rol: string;
  imagenPerfil?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private users: User[] = [
    {
      id: 1,
      nombre: 'Jose Ayrton',
      primerApellido: 'Rosell',
      segundoApellido: 'Bonavina',
      fechaNacimiento: '2000-08-06',
      fechaRegistro: '2024-03-30',
      nickname: 'joss0102',
      password: '1234',
      rol: 'admin',
      imagenPerfil: 'assets/img/default-profile.png'
    },
    {
      id: 2,
      nombre: 'David',
      primerApellido: 'Fernandez',
      segundoApellido: 'Valbuena',
      fechaNacimiento: '2003-08-06',
      fechaRegistro: '2024-03-30',
      nickname: 'DavidFdz',
      password: '1234',
      rol: 'admin',
      imagenPerfil: 'assets/img/default-profile.png'
    },
    {
      id: 3,
      nombre: 'Dumi',
      primerApellido: 'Tomas',
      segundoApellido: '',
      fechaNacimiento: '2002-09-14',
      fechaRegistro: '2024-03-30',
      nickname: 'dumitxmss',
      password: '1234',
      rol: 'client',
      imagenPerfil: 'assets/img/default-profile.png'
    },
    {
      id: 4,
      nombre: 'Isabel',
      primerApellido: 'Isidro',
      segundoApellido: 'Fernandez',
      fechaNacimiento: '2002-04-18',
      fechaRegistro: '2024-03-30',
      nickname: 'issafeez',
      password: '1234',
      rol: 'client',
      imagenPerfil: 'assets/img/default-profile.png'
    },
    {
      id: 5,
      nombre: 'Helio',
      primerApellido: 'Rebato',
      segundoApellido: 'Gamez',
      fechaNacimiento: '2002-07-25',
      fechaRegistro: '2024-03-30',
      nickname: 'heliiovk_',
      password: '1234',
      rol: 'client',
      imagenPerfil: 'assets/img/default-profile.png'
    }
  ];

  private currentUserSubject = new BehaviorSubject<User>(this.users[0]);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor() {}

  getAllUsers(): User[] {
    return this.users;
  }

  getUserById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }

  getCurrentUser(): User {
    return this.currentUserSubject.value;
  }

  setCurrentUser(userId: number): void {
    const user = this.getUserById(userId);
    if (user) {
      this.currentUserSubject.next(user);
    }
  }

  updateUser(updatedUser: User): void {
    const index = this.users.findIndex(user => user.id === updatedUser.id);
    if (index !== -1) {
      this.users[index] = { ...updatedUser };
      
      // Si el usuario actualizado es el actual, actualizar el BehaviorSubject
      if (this.currentUserSubject.value.id === updatedUser.id) {
        this.currentUserSubject.next(updatedUser);
      }
    }
  }
}