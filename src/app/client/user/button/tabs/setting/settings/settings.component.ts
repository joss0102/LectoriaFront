import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { UserService } from '../../../../../../core/services/call-api/user.service';
import { AuthService } from '../../../../../../core/services/auth/auth.service';
import { 
  User, 
  UserProfileForm, 
  PasswordChangeForm 
} from '../../../../../../core/models/call-api/user.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  isLoading = true;
  isEditing = false;
  isChangingPassword = false;
  showPasswordSection = false;
  
  user: User | null = null;
  originalUserData: UserProfileForm | null = null;
  
  profileForm: UserProfileForm = {
    name: '',
    last_name1: '',
    last_name2: '',
    birthdate: ''
  };
  
  passwordForm: PasswordChangeForm = {
    current_password: '',
    new_password: '',
    confirm_password: ''
  };
  
  successMessage = '';
  errorMessage = '';
  
  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga el perfil del usuario actual
   */
  loadUserProfile(): void {
    this.isLoading = true;
    this.clearMessages();
    
    this.userService.getCurrentUserProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.user = user;
          this.initializeForm();
          this.isLoading = false;
        },
        error: (error) => {
          this.showError('Error al cargar el perfil: ' + error.message);
          this.isLoading = false;
        }
      });
  }

  /**
   * Inicializa el formulario con los datos del usuario
   */
  private initializeForm(): void {
    if (this.user) {
      this.profileForm = {
        name: this.user.name || '',
        last_name1: this.user.last_name1 || '',
        last_name2: this.user.last_name2 || '',
        birthdate: this.userService.formatDate(this.user.birthdate) || ''
      };
      
      this.originalUserData = { ...this.profileForm };
    }
  }

  /**
   * Activa el modo de edición
   */
  enableEditing(): void {
    console.log('Enabling editing mode', { user: this.user, profileForm: this.profileForm });
    this.isEditing = true;
    this.clearMessages();
  }

  /**
   * Cancela la edición y restaura los datos originales
   */
  cancelEditing(): void {
    if (this.originalUserData) {
      this.profileForm = { ...this.originalUserData };
    }
    this.isEditing = false;
    this.clearMessages();
  }

  /**
   * Maneja el click del botón de guardar
   */
  onSaveButtonClick(form: NgForm): void {
    console.log('=== SAVE BUTTON CLICKED ===');
    this.saveProfile(form);
  }

  /**
   * Guarda los cambios del perfil
   */
  saveProfile(form: NgForm): void {
    console.log('=== SAVE PROFILE CALLED ===');
    console.log('Form reference:', form);
    console.log('Form valid:', form?.valid);
    console.log('Profile form data:', this.profileForm);
    console.log('User service available:', !!this.userService);
    console.log('Current user:', this.authService.currentUserValue);
    
    if (!form.valid) {
      console.log('Form is invalid, stopping execution');
      this.showError('Por favor, completa todos los campos requeridos.');
      return;
    }

    if (!this.profileForm.name || this.profileForm.name.trim() === '') {
      console.log('Name is empty, stopping execution');
      this.showError('El nombre es obligatorio.');
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    console.log('About to call userService.updateCurrentUserProfile with:', this.profileForm);

    this.userService.updateCurrentUserProfile(this.profileForm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('SUCCESS - Server response:', response);
          this.showSuccess('Perfil actualizado correctamente.');
          this.isEditing = false;
          this.originalUserData = { ...this.profileForm };
          
          if (this.user) {
            this.user.name = this.profileForm.name;
            this.user.last_name1 = this.profileForm.last_name1;
            this.user.last_name2 = this.profileForm.last_name2;
            this.user.birthdate = this.profileForm.birthdate;
          }
          
          this.isLoading = false;
        },
        error: (error) => {
          console.error('ERROR - Failed to update profile:', error);
          this.showError('Error al actualizar el perfil: ' + error.message);
          this.isLoading = false;
        }
      });
  }

  /**
   * Muestra/oculta la sección de cambio de contraseña
   */
  togglePasswordSection(): void {
    this.showPasswordSection = !this.showPasswordSection;
    if (this.showPasswordSection) {
      this.resetPasswordForm();
    }
    this.clearMessages();
  }

  /**
   * Resetea el formulario de contraseña
   */
  private resetPasswordForm(): void {
    this.passwordForm = {
      current_password: '',
      new_password: '',
      confirm_password: ''
    };
  }

  /**
   * Obtiene la URL de la imagen de perfil del usuario
   */
  getUserProfileImageUrl(): string {
    if (!this.user || !this.user.nickName) {
      return '/usuarios/default.png';
    }
    return `/usuarios/${this.user.nickName}.png`;
  }

  /**
   * Maneja errores de carga de imagen de perfil
   */
  onProfileImageError(event: any): void {
    event.target.src = '/usuarios/default.png';
  }

  /**
   * Maneja el click del botón de cambiar contraseña
   */
  onChangePasswordClick(form: NgForm): void {
    console.log('=== CHANGE PASSWORD BUTTON CLICKED ===');
    this.changePassword(form);
  }

  /**
   * Cambia la contraseña del usuario
   */
  changePassword(form: NgForm): void {
    console.log('=== CHANGE PASSWORD CALLED ===');
    console.log('Form reference:', form);
    console.log('Form valid:', form?.valid);
    console.log('Password form data:', this.passwordForm);
    console.log('User service available:', !!this.userService);
    
    if (!form.valid) {
      console.log('Form is invalid, stopping execution');
      this.showError('Por favor, completa todos los campos de contraseña.');
      return;
    }

    if (!this.passwordForm.current_password) {
      console.log('Current password is empty');
      this.showError('La contraseña actual es obligatoria.');
      return;
    }

    if (!this.passwordForm.new_password) {
      console.log('New password is empty');
      this.showError('La nueva contraseña es obligatoria.');
      return;
    }

    if (this.passwordForm.new_password !== this.passwordForm.confirm_password) {
      console.log('Passwords do not match');
      this.showError('Las contraseñas nuevas no coinciden.');
      return;
    }

    if (this.passwordForm.new_password.length < 6) {
      console.log('Password too short');
      this.showError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    this.isChangingPassword = true;
    this.clearMessages();

    console.log('About to call userService.changeCurrentUserPassword');

    this.userService.changeCurrentUserPassword(this.passwordForm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('SUCCESS - Password changed:', response);
          this.showSuccess('Contraseña cambiada correctamente.');
          this.resetPasswordForm();
          this.showPasswordSection = false;
          this.isChangingPassword = false;
        },
        error: (error) => {
          console.error('ERROR - Failed to change password:', error);
          this.showError('Error al cambiar la contraseña: ' + error.message);
          this.isChangingPassword = false;
        }
      });
  }

  /**
   * Cancela el cambio de contraseña
   */
  cancelPasswordChange(): void {
    this.resetPasswordForm();
    this.showPasswordSection = false;
    this.clearMessages();
  }

  /**
   * Obtiene el nombre completo del usuario
   */
  getFullName(): string {
    return this.user ? this.userService.getFullName(this.user) : '';
  }

  /**
   * Formatea la fecha de nacimiento para mostrar
   */
  getFormattedBirthdate(): string {
    if (!this.user?.birthdate) return 'No especificada';
    
    const date = new Date(this.user.birthdate);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  /**
   * Formatea la fecha de unión para mostrar
   */
  getFormattedUnionDate(): string {
    if (!this.user?.union_date) return '';
    
    const date = new Date(this.user.union_date);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Muestra un mensaje de éxito
   */
  private showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';
    
    // Limpiar el mensaje después de 5 segundos
    setTimeout(() => {
      this.successMessage = '';
    }, 5000);
  }

  /**
   * Muestra un mensaje de error
   */
  private showError(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
  }

  /**
   * Limpia todos los mensajes
   */
  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}