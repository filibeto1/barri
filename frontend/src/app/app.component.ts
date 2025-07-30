import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { AuthService } from './auth/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="main-content">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .main-content {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
  `]
})
// app.component.ts
export class AppComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}
// En tu app.component.ts
async ngOnInit() {
  console.log('🚀 Inicializando aplicación...');
  try {
    const isAuthenticated = await this.authService.initializeOnStartup();
    console.log('✅ App inicializada:', isAuthenticated);
    
    // Solo redirigir si estamos en login o página inicial
    if (isAuthenticated && (this.router.url === '/login' || this.router.url === '/')) {
      const defaultRoute = this.authService.isAdmin ? '/admin/dashboard' : '/user/dashboard';
      this.router.navigate([defaultRoute]);
    }
  } catch (error) {
    console.error('❌ Error inicializando app:', error);
  }
}
}