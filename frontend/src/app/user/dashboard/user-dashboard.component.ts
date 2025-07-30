import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css'],
  imports: [
    CommonModule,
    MatCardModule,
     MatIconModule,
  ]
})
export class UserDashboardComponent implements OnInit {
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

ngOnInit(): void {
  console.log('UserDashboardComponent inicializado');
  
  this.authService.initializeAuth().subscribe({
    next: (initialized) => {
      if (!initialized || !this.authService.isAuthenticated) {
        console.log('Usuario no autenticado - Redirigiendo a login');
        this.router.navigate(['/login']);
      } else {
        console.log('Usuario autenticado:', this.authService.currentUserValue);
      }
    },
    error: (err) => {
      console.error('Error verificando autenticación:', err);
      this.router.navigate(['/login']);
    }
  });
}
}