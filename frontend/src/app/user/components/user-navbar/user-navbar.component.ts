// user-navbar.component.ts
import { Component } from '@angular/core';
import { AuthService } from '../../../auth/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-user-navbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  templateUrl: './user-navbar.component.html',
  styleUrls: ['./user-navbar.component.scss']
})
export class UserNavbarComponent {
  constructor(private authService: AuthService, private router: Router) {}

  // Método para navegación con debug
  navigateTo(path: string) {
    console.log(`Intentando navegar a /user/${path}`);
    this.router.navigate(['/user', path]).then(success => {
      console.log(success ? 'Navegación exitosa' : 'Navegación fallida');
    }).catch(err => {
      console.error('Error de navegación:', err);
    });
  }

logout() {
  console.log('Iniciando proceso de cierre de sesión...');
  this.authService.logout().subscribe({
    next: (success) => {
      if (success) {
        console.log('Cierre de sesión exitoso - Redirigiendo a login');
        this.router.navigate(['/login']).then(() => {
          // Forzar recarga para limpiar estados
          window.location.reload();
        });
      } else {
        console.error('Cierre de sesión fallido');
        this.router.navigate(['/login']);
      }
    },
    error: (err) => {
      console.error('Error durante cierre de sesión:', err);
      this.router.navigate(['/login']);
    }
  });
}
}