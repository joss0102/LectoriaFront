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
import { UserService } from '../../../../core/services/call-api/user.service';
import { UserRequest } from '../../../../core/models/call-api/user.model';

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
    private userService: UserService,
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
      nickname: ['', [Validators.required, Validators.minLength(3)]],
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
        password: this.loginForm.value.password,
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
          this.loginError =
            error.message ||
            'Error al iniciar sesión. Verifica tus credenciales.';
          console.error('Error de login:', error);
        },
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  onSignup(): void {
    if (this.signupForm.valid) {
      this.isLoading = true;
      // Extraer el nombre completo y dividirlo en partes
      const fullNameParts = this.signupForm.value.fullName.trim().split(' ');
      const name = fullNameParts[0] || '';
      const lastName1 = fullNameParts[1] || ''; // separar por espacios y sacar apellidos si no fallback vacio
      const lastName2 =
        fullNameParts.length > 2 ? fullNameParts.slice(2).join(' ') : '';

      // Crear objeto UserRequest para el registro
      const userData: UserRequest = {
        name: name,
        last_name1: lastName1,
        last_name2: lastName2,
        nickname: this.signupForm.value.nickname,
        password: this.signupForm.value.password,
        role_name: 'client', // por defecto cliente!!
      };

      this.userService.addUser(userData).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          // Mostrar mensaje de éxito y redirigir al login
          alert('Registro exitoso. Ahora puedes iniciar sesión.');
          this.toggleForm(true); // Cambiar a la pestaña de login
          this.signupForm.reset();
        },
        error: (error: any) => {
          this.isLoading = false;
          alert(
            'Error al crear un nuevo usuario, usuario ya existente o error del servidor'
          );
          console.error('Error de registro:', error);
        },
      });
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
