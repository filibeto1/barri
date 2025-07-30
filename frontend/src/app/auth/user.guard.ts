import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable, of } from 'rxjs';
import { map, take, switchMap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    console.log('🛡️ UserGuard activado para ruta:', state.url);

    // Si la autenticación no está inicializada, inicializarla primero
    if (!this.authService.authInitialized) {
      console.log('🔄 UserGuard: Inicializando autenticación...');
      return this.authService.initializeAuth().pipe(
        switchMap(isAuthenticated => {
          if (!isAuthenticated) {
            console.log('❌ UserGuard: No autenticado después de inicialización, redirigiendo a login');
            this.router.navigate(['/login']);
            return of(false);
          }
          return this.checkUserRole();
        }),
        catchError(error => {
          console.error('❌ UserGuard: Error en inicialización:', error);
          this.router.navigate(['/login']);
          return of(false);
        })
      );
    }

    // Si ya está inicializada, verificar directamente
    return this.checkUserRole();
  }

  private checkUserRole(): Observable<boolean> {
    return this.authService.currentUser.pipe(
      take(1),
      map(user => {
        console.log('🔍 UserGuard: Verificando usuario:', user);

        // Si no hay usuario autenticado, redirigir al login
        if (!user) {
          console.log('🚫 UserGuard: No hay usuario, redirigiendo a login');
          this.router.navigate(['/login']);
          return false;
        }

        // Si es admin, redirigir al área de admin
        if (user.role === 'admin') {
          console.log('🚫 UserGuard: Usuario admin detectado, redirigiendo a admin dashboard');
          this.router.navigate(['/admin/dashboard']);
          return false;
        }

        // Si es usuario normal, permitir acceso
        if (user.role === 'user') {
          console.log('✅ UserGuard: Usuario normal, acceso permitido');
          return true;
        }

        // Cualquier otro caso, redirigir al login
        console.log('🚫 UserGuard: Rol no reconocido:', user.role, 'redirigiendo a login');
        this.router.navigate(['/login']);
        return false;
      }),
      catchError(error => {
        console.error('❌ UserGuard: Error al verificar usuario:', error);
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}