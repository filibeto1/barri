import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
this.registerForm = this.fb.group({
  name: ['', [Validators.required, Validators.minLength(3)]], // Mínimo 3 caracteres
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(6), Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/)]], // Al menos 1 letra y 1 número
  role: ['user', Validators.required] // Asegurar que siempre tenga valor
});
  }
onSubmit(): void {
  if (this.registerForm.invalid) {
    this.snackBar.open('Por favor complete todos los campos correctamente', 'Cerrar', { 
      duration: 5000,
      panelClass: ['error-snackbar']
    });
    return;
  }

  this.loading = true;
  const { name, email, password, role } = this.registerForm.value;

  this.authService.register(name, email, password, role).subscribe({
    next: (user) => {
      this.loading = false;
      this.snackBar.open('Registro exitoso. Redirigiendo...', 'Cerrar', { 
        duration: 3000 
      });
      
      // Si el registro incluyó login automático (user no es null)
      if (user) {
        const redirectUrl = user.role === 'admin' ? '/admin' : '/dashboard';
        this.router.navigate([redirectUrl]);
      } else {
        // Si solo fue registro, redirige a login
        this.router.navigate(['/login']);
      }
    },
    error: (error) => {
      this.loading = false;
      console.error('Error en registro:', error);
      
      let errorMessage = 'Error al registrarse';
      if (error.message.includes('El usuario ya existe')) {
        errorMessage = 'El email ya está registrado';
      } else if (error.message.includes('campos')) {
        errorMessage = 'Por favor complete todos los campos';
      }

      this.snackBar.open(errorMessage, 'Cerrar', { 
        duration: 5000,
        panelClass: ['error-snackbar'] 
      });
    }
  });
}
}