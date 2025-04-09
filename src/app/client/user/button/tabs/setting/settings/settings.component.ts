import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User } from '../../../../../../core/services/user/user.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  // Variables para controlar la visibilidad de cada modal
  showProfileModal = false;
  showProfilePicModal = false;
  showPasswordModal = false;
  showUserDetailsModal = false;

  // Variable para almacenar el usuario actual
  currentUser: User = {} as User;
  users: User[] = [];

  // Objeto para manejar la actualización de contraseña
  passwordData = {
    current: '',
    new: '',
    confirm: ''
  };

  // Variable para almacenar la imagen seleccionada
  selectedFile: File | null = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    // Suscribirse a los cambios del usuario actual
    this.userService.currentUser$.subscribe(user => {
      this.currentUser = {...user}; // Crear una copia para no modificar el original directamente
    });
    
    // Obtener todos los usuarios
    this.users = this.userService.getAllUsers();
  }

  // Funciones para abrir cada modal
  openProfileModal(): void {
    this.closeAllModals();
    this.showProfileModal = true;
  }

  openProfilePicModal(): void {
    this.closeAllModals();
    this.showProfilePicModal = true;
  }

  openPasswordModal(): void {
    this.closeAllModals();
    this.showPasswordModal = true;
    this.passwordData = { current: '', new: '', confirm: '' }; // Resetear valores
  }

  openUserDetailsModal(): void {
    this.closeAllModals();
    this.showUserDetailsModal = true;
  }

  // Función para cerrar todos los modales
  closeAllModals(): void {
    this.showProfileModal = false;
    this.showProfilePicModal = false;
    this.showPasswordModal = false;
    this.showUserDetailsModal = false;
  }

  // Función para actualizar la información personal
  updatePersonalInfo(): void {
    this.userService.updateUser(this.currentUser);
    this.closeAllModals();
    // Aquí podrías mostrar un mensaje de éxito
  }

  // Función para manejar la selección de archivos
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
      
      // Previsualizar la imagen
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.currentUser.imagenPerfil = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  // Función para actualizar la foto de perfil
  updateProfilePic(): void {
    if (this.selectedFile) {
      // En un escenario real, aquí subirías la imagen a un servidor
      // Por ahora solo actualizamos el usuario local
      this.userService.updateUser(this.currentUser);
      this.closeAllModals();
      this.selectedFile = null;
    }
  }

  // Función para actualizar la contraseña
  updatePassword(): void {
    // Verificar que la contraseña actual es correcta
    if (this.passwordData.current !== this.currentUser.password) {
      alert('La contraseña actual no es correcta');
      return;
    }
    
    // Verificar que las nuevas contraseñas coinciden
    if (this.passwordData.new !== this.passwordData.confirm) {
      alert('Las nuevas contraseñas no coinciden');
      return;
    }
    
    // Actualizar la contraseña
    this.currentUser.password = this.passwordData.new;
    this.userService.updateUser(this.currentUser);
    this.closeAllModals();
    // Aquí podrías mostrar un mensaje de éxito
  }

  // Función para actualizar todos los detalles del usuario
  updateUserDetails(): void {
    this.userService.updateUser(this.currentUser);
    this.closeAllModals();
    // Aquí podrías mostrar un mensaje de éxito
  }

  // Función para seleccionar un usuario diferente
  selectUser(userId: number): void {
    this.userService.setCurrentUser(userId);
    // Al cambiar de usuario, actualizamos currentUser con los nuevos datos
    const user = this.userService.getCurrentUser();
    this.currentUser = {...user};
  }
}