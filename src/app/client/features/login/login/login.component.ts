import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

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

  constructor(private fb: FormBuilder) {
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
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      console.log('Login data:', this.loginForm.value);
      // Aquí iría la lógica de login
    }
  }

  onSignup(): void {
    if (this.signupForm.valid) {
      console.log('Signup data:', this.signupForm.value);
      // Aquí iría la lógica de registro
    }
  }

  loginWithGoogle(): void {
    console.log('Login with Google');
    // Implementar autenticación con Google
  }

  loginWithApple(): void {
    console.log('Login with Apple');
    // Implementar autenticación con Apple
  }
}
