import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
// Añade estas importaciones al inicio del archivo login.component.ts
import { switchMap, map } from 'rxjs/operators';
@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatIconModule
  ] 
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Verificar si ya está autenticado
    if (this.authService.isAuthenticated && this.authService.currentUserValue) {
      const user = this.authService.currentUserValue;
      console.log('👤 Usuario ya autenticado en login:', user);
      
      if (user.role === 'admin') {
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.router.navigate(['/user/dashboard']);
      }
    }
  }

 // login.component.ts
onSubmit(): void {
  if (this.loginForm.invalid) {
    this.snackBar.open('Por favor complete todos los campos correctamente', 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
    return;
  }

  this.loading = true;
  const { email, password } = this.loginForm.value;

  this.authService.login(email, password).pipe(
    switchMap(user => {
      // Esperar a que la autenticación esté completamente inicializada
      return this.authService.isReady.pipe(
        map(() => user)
      );
    })
  ).subscribe({
    next: (user) => {
      this.loading = false;
      this.snackBar.open('¡Bienvenido!', 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });

      // Redirigir según el rol
      const targetRoute = user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
      this.router.navigate([targetRoute]).catch(err => {
        console.error('Error en redirección:', err);
      });
    },
    error: (error) => {
      this.loading = false;
      this.snackBar.open(error.message || 'Error al iniciar sesión', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  });
}

  // Método para mostrar/ocultar contraseña
  hidePassword = true;
  
  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }
}