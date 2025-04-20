import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AuthService } from '../../../../core/services/auth/auth.service';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  isLoginActive = false;
  loginForm!: FormGroup;
  signupForm!: FormGroup;
  loginError: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    const savedState = localStorage.getItem('active');
    this.isLoginActive = savedState === 'true';
  }

  ngOnInit(): void {
    this.initForms();
  }

  initForms(): void {
    this.loginForm = this.fb.group({
      nickname: ['', Validators.required],
      password: ['', Validators.required],
    });

    this.signupForm = this.fb.group({
      fullName: ['', Validators.required],
      nickname: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  toggleForm(isLogin: boolean): void {
    this.isLoginActive = isLogin;
    localStorage.setItem('active', String(isLogin));
    // Limpiar errores al cambiar de formulario
    this.loginError = '';
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.loginError = '';
      
      const loginData = {
        nickname: this.loginForm.value.nickname,
        password: this.loginForm.value.password
      };
      
      this.authService.login(loginData).subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('Login exitoso', response);
          
          // Verificar si el usuario es admin para redirigir a la sección correspondiente
          const user = this.authService.currentUserValue;
          if (user && user.role === 'admin') {
            this.router.navigate(['/']);
          } else {
            this.router.navigate(['/']);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.loginError = error.message || 'Error al iniciar sesión. Verifica tus credenciales.';
          console.error('Error de login:', error);
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  onSignup(): void {
    if (this.signupForm.valid) {
      console.log('Signup data:', this.signupForm.value);

      alert('Funcionalidad de registro no implementada aún');
    } else {
      this.signupForm.markAllAsTouched();
    }
  }

  // No implementado
  loginWithGoogle(): void {
    console.log('Login with Google');
    alert('Autenticación con Google no implementada aún');
  }

  loginWithApple(): void {
    console.log('Login with Apple');
    alert('Autenticación con Apple no implementada aún');
  }
}