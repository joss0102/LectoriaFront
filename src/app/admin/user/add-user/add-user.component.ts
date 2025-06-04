import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { UserService } from '../../../core/services/call-api/user.service';

interface UserRequest {
  name: string;
  last_name1?: string;
  last_name2?: string;
  birthdate: string;
  union_date: string;
  nickname: string;
  password: string;
  role_name: string;
}

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {
  @Output() userAdded = new EventEmitter<boolean>();
  userForm!: FormGroup;
  
  isSubmitting = false;
  
  today = new Date().toISOString().split('T')[0];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  /**
   * Inicializa el formulario con sus validaciones
   */
  initForm(): void {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      last_name1: [''],
      last_name2: [''],
      birthdate: ['', [Validators.required]],
      union_date: [this.today, [Validators.required]],
      nickname: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      role_name: ['client', [Validators.required]]
    });
    
    this.userForm.get('birthdate')?.setValidators([
      Validators.required,
      this.birthdateValidator.bind(this)
    ]);
  }

  /**
   * Validador personalizado para la fecha de nacimiento
   */
  birthdateValidator(control: any) {
    if (!control.value) {
      return null;
    }
    
    const birthDate = new Date(control.value);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      const actualAge = age - 1;
      if (actualAge < 13) {
        return { tooYoung: true };
      }
    } else if (age < 13) {
      return { tooYoung: true };
    }
    
    if (birthDate > today) {
      return { futureDate: true };
    }
    
    if (age > 120) {
      return { tooOld: true };
    }
    
    return null;
  }

  /**
   * Calcula y muestra la edad en tiempo real
   */
  calculateAge(): string {
    const birthdate = this.userForm.get('birthdate')?.value;
    if (!birthdate) return '';
    
    try {
      const birth = new Date(birthdate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      
      return age >= 0 ? `${age} años` : 'Fecha inválida';
    } catch (error) {
      return 'Fecha inválida';
    }
  }

  /**
   * Prepara los datos del usuario para enviar al servicio
   */
  prepareUserData(): UserRequest {
    const formValue = this.userForm.value;

    return {
      name: formValue.name.trim(),
      last_name1: formValue.last_name1?.trim() || undefined,
      last_name2: formValue.last_name2?.trim() || undefined,
      birthdate: formValue.birthdate,
      union_date: formValue.union_date,
      nickname: formValue.nickname.trim(),
      password: formValue.password,
      role_name: formValue.role_name
    };
  }

  /**
   * Genera un nickname sugerido basado en el nombre
   */
  generateNicknameSuggestion(): void {
    const name = this.userForm.get('name')?.value;
    const lastName1 = this.userForm.get('last_name1')?.value;
    
    if (name) {
      let suggestion = name.toLowerCase().replace(/\s+/g, '');
      if (lastName1) {
        suggestion += lastName1.toLowerCase().substring(0, 3);
      }
      // Añadir números aleatorios
      suggestion += Math.floor(Math.random() * 99).toString().padStart(2, '0');
      
      this.userForm.get('nickname')?.setValue(suggestion);
    }
  }

  /**
   * Envía el formulario al servidor
   */
  onSubmit(): void {
    if (this.userForm.valid) {
      this.isSubmitting = true;
      
      const userData = this.prepareUserData();
      
      console.log('Datos del usuario a crear:', userData);
      
      setTimeout(() => {
        this.isSubmitting = false;
        alert('Usuario añadido correctamente (simulado)');
        this.userAdded.emit(true);
        this.resetForm();
      }, 1500);
      
    } else {
      this.markFormGroupTouched(this.userForm);
      alert('Por favor, completa todos los campos requeridos correctamente.');
    }
  }

  /**
   * Marca todos los campos del formulario como tocados para mostrar validaciones
   */
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Resetea el formulario a su estado inicial
   */
  resetForm(): void {
    this.userForm.reset({
      union_date: this.today,
      role_name: 'client'
    });
    this.userForm.markAsUntouched();
    this.userForm.markAsPristine();
  }

  /**
   * Obtiene el nombre completo del usuario para preview
   */
  getUserFullName(): string {
    const formValue = this.userForm.value;
    return `${formValue.name || ''} ${formValue.last_name1 || ''} ${formValue.last_name2 || ''}`.trim();
  }

  /**
   * Obtiene los errores de validación para mostrar
   */
  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (field?.touched && field?.errors) {
      if (field.errors['required']) return `El ${fieldName} es obligatorio`;
      if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['pattern']) return 'Solo se permiten letras, números y guiones bajos';
      if (field.errors['tooYoung']) return 'Debe ser mayor de 13 años';
      if (field.errors['futureDate']) return 'La fecha no puede ser futura';
      if (field.errors['tooOld']) return 'Fecha no válida';
    }
    return '';
  }
}