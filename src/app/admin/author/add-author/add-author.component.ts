import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthorService } from '../../../core/services/call-api/author.service';
import { AuthorRequest } from '../../../core/models/call-api/author.model';

@Component({
  selector: 'app-add-author',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-author.component.html',
  styleUrls: ['./add-author.component.scss']
})
export class AddAuthorComponent implements OnInit {
  @Output() authorAdded = new EventEmitter<boolean>();
  authorForm!: FormGroup;
  
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authorService: AuthorService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  /**
   * Inicializa el formulario con sus validaciones
   */
  initForm(): void {
    this.authorForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      last_name1: [''],
      last_name2: [''],
      description: ['', [Validators.maxLength(1000)]]
    });
  }

  /**
   * Prepara los datos del autor para enviar al servicio
   */
  prepareAuthorData(): AuthorRequest {
    const formValue = this.authorForm.value;

    return {
      name: formValue.name.trim(),
      last_name1: formValue.last_name1?.trim() || undefined,
      last_name2: formValue.last_name2?.trim() || undefined,
      description: formValue.description?.trim() || undefined
    };
  }

  /**
   * Envía el formulario al servidor
   */
  onSubmit(): void {
    if (this.authorForm.valid) {
      this.isSubmitting = true;
      
      const authorData = this.prepareAuthorData();
      
      this.authorService.addAuthor(authorData).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          alert('Autor añadido correctamente');
          this.authorAdded.emit(true);
          this.resetForm();
        },
        error: (error) => {
          this.isSubmitting = false;
          alert('Error al añadir el autor: ' + (error.error?.error || error.message || 'Error de servidor'));
        }
      });
    } else {
      this.markFormGroupTouched(this.authorForm);
      alert('Por favor, completa todos los campos requeridos.');
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
    this.authorForm.reset();
    this.authorForm.markAsUntouched();
    this.authorForm.markAsPristine();
  }

  /**
   * Obtiene el nombre completo del autor para preview
   */
  getAuthorFullName(): string {
    const formValue = this.authorForm.value;
    return `${formValue.name || ''} ${formValue.last_name1 || ''} ${formValue.last_name2 || ''}`.trim();
  }
}