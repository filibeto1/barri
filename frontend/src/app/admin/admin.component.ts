import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { filter } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

// Angular Material Modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatMenuModule,
    MatTooltipModule,
    MatBadgeModule,
    MatDividerModule
  ],
  template: `
    <div class="admin-layout">
      <!-- Toolbar superior -->
      <mat-toolbar class="admin-toolbar">
        <div class="toolbar-content">
          <div class="logo-section">
            <mat-icon class="logo-icon">fitness_center</mat-icon>
            <h1>{{ currentTitle }}</h1>
          </div>
          
          <div class="toolbar-actions">
            <button mat-icon-button matTooltip="Notificaciones" [matBadge]="notificationCount" matBadgeColor="warn">
              <mat-icon>notifications</mat-icon>
            </button>
            
            <button mat-button [matMenuTriggerFor]="userMenu" class="user-menu">
              <mat-icon>account_circle</mat-icon>
              <span>{{ currentUser?.name || 'Admin' }}</span>
              <mat-icon>arrow_drop_down</mat-icon>
            </button>
            
            <mat-menu #userMenu="matMenu">
              <button mat-menu-item (click)="navigateTo('/admin/profile')">
                <mat-icon>person</mat-icon>
                <span>Perfil</span>
              </button>
              
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="logout()">
                <mat-icon>logout</mat-icon>
                <span>Cerrar Sesión</span>
              </button>
            </mat-menu>
          </div>
        </div>
      </mat-toolbar>

      <!-- Sidebar de navegación -->
      <div class="admin-sidebar">
        <nav class="sidebar-nav">
          <mat-list>
            <mat-list-item (click)="navigateTo('/admin/dashboard')" class="nav-item" 
                           [class.active]="isActiveRoute('/admin/dashboard')">
              <mat-icon matListIcon>dashboard</mat-icon>
              <span matLine>Dashboard</span>
            </mat-list-item>
            
            <mat-list-item (click)="navigateTo('/admin/members')" class="nav-item"
                           [class.active]="isActiveRoute('/admin/members')">
              <mat-icon matListIcon>people</mat-icon>
              <span matLine>Miembros</span>
            </mat-list-item>
            
            <mat-list-item (click)="navigateTo('/admin/instructores')" class="nav-item"
                           [class.active]="isActiveRoute('/admin/instructores')">
              <mat-icon matListIcon>group</mat-icon>
              <span matLine>Instructores</span>
            </mat-list-item>
            
            <mat-list-item (click)="navigateTo('/admin/crear-instructor')" class="nav-item"
                           [class.active]="isActiveRoute('/admin/crear-instructor')">
              <mat-icon matListIcon>person_add</mat-icon>
              <span matLine>Crear Instructor</span>
            </mat-list-item>
            
            <mat-list-item (click)="navigateTo('/admin/classes')" class="nav-item"
                           [class.active]="isActiveRoute('/admin/classes')">
              <mat-icon matListIcon>fitness_center</mat-icon>
              <span matLine>Clases</span>
            </mat-list-item>
            
            <mat-list-item (click)="navigateTo('/admin/payments')" class="nav-item"
                           [class.active]="isActiveRoute('/admin/payments')">
              <mat-icon matListIcon>payment</mat-icon>
              <span matLine>Pagos</span>
            </mat-list-item>
            
            <mat-list-item (click)="navigateTo('/admin/reportes')" class="nav-item"
                           [class.active]="isActiveRoute('/admin/reportes')">
              <mat-icon matListIcon>analytics</mat-icon>
              <span matLine>Reportes</span>
            </mat-list-item>
          </mat-list>
        </nav>
      </div>

      <!-- Contenido principal -->
      <div class="admin-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: #f5f5f5;
    }

    .admin-toolbar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      height: 64px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .toolbar-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 16px;
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-icon {
      font-size: 28px;
      color: #fff;
    }

    .toolbar-content h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 500;
    }

    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 8px;
      transition: background-color 0.2s ease;
    }

    .user-menu:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .admin-sidebar {
      position: fixed;
      top: 64px;
      left: 0;
      width: 280px;
      height: calc(100vh - 64px);
      background: white;
      border-right: 1px solid #e0e0e0;
      overflow-y: auto;
      z-index: 100;
      box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
    }

    .sidebar-nav {
      padding: 20px 0;
    }

    .nav-item {
      margin: 4px 16px;
      border-radius: 8px;
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .nav-item:hover {
      background-color: rgba(102, 126, 234, 0.1);
    }

    .nav-item.active {
      background-color: rgba(102, 126, 234, 0.15);
      color: #667eea;
    }

    .nav-item.active mat-icon {
      color: #667eea;
    }

    .admin-content {
      margin-left: 280px;
      margin-top: 64px;
      padding: 24px;
      min-height: calc(100vh - 64px);
      background: #f8f9fa;
    }

    @media (max-width: 768px) {
      .admin-sidebar {
        width: 100%;
        transform: translateX(-100%);
        transition: transform 0.3s ease;
      }
      
      .admin-content {
        margin-left: 0;
        padding: 16px;
      }
      
      .toolbar-content h1 {
        font-size: 1.2rem;
      }
    }
  `]
})
export class AdminComponent implements OnInit {
  currentTitle = 'Gestión de Gimnasio';
  currentRoute = '';
  notificationCount = 3;
  currentUser: any;

  // Inyección de dependencias
  private authService = inject(AuthService);
  private router = inject(Router);
  private titleService = inject(Title);
  private snackBar = inject(MatSnackBar);

  constructor() {
    this.titleService.setTitle('Admin - Gimnasio');
    
    // Escuchar cambios de ruta para actualizar el título
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.url;
      this.updateTitle();
    });

    // Obtener usuario actual
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnInit() {
    // Si estamos en la ruta base /admin, redirigir al dashboard
    if (this.router.url === '/admin' || this.router.url === '/admin/') {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  isActiveRoute(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.snackBar.open('Sesión cerrada correctamente', 'Cerrar', {
          duration: 3000
        });
        this.router.navigate(['/login'], { replaceUrl: true });
      },
      error: (err) => {
        console.error('Error al cerrar sesión:', err);
        this.snackBar.open('Error al cerrar sesión', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  private updateTitle(): void {
    const routeTitles: { [key: string]: string } = {
      '/admin/dashboard': 'Dashboard - Gimnasio',
      '/admin/members': 'Miembros - Gimnasio',
      '/admin/instructores': 'Instructores - Gimnasio',
      '/admin/crear-instructor': 'Crear Instructor - Gimnasio',
      '/admin/classes': 'Clases - Gimnasio',
      '/admin/payments': 'Pagos - Gimnasio',
      '/admin/reportes': 'Reportes - Gimnasio',
      '/admin/profile': 'Perfil - Gimnasio'
    };

    const title = routeTitles[this.currentRoute] || 'Gestión de Gimnasio';
    this.currentTitle = title.split(' - ')[0];
    this.titleService.setTitle(title);
  }
}