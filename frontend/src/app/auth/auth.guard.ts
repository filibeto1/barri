import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class authGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
 canActivate(
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean> {
  console.log('🔒 AuthGuard para ruta:', state.url);
  
  return this.authService.initializeAuth().pipe(
    switchMap(initialized => {
      if (!initialized || !this.authService.currentUserValue) {
        console.log('🔴 Usuario no autenticado');
        return this.router.navigate(['/login'], { 
          queryParams: { returnUrl: state.url } 
        }).then(() => false);
      }
      
      // Verificar roles
      if (route.data['role'] && this.authService.currentUserValue?.role !== route.data['role']) {
        console.log('🚫 Acceso denegado por rol');
        return this.router.navigate(['/unauthorized']).then(() => false);
      }
      
      console.log('🟢 Acceso permitido');
      return of(true);
    }),
    catchError(error => {
      console.error('Error en AuthGuard:', error);
      return this.router.navigate(['/login']).then(() => false);
    })
  );
}

private checkAccess(route: ActivatedRouteSnapshot): Observable<boolean> {
  // Verificar rol si es necesario
  if (route.data['role'] && this.authService.currentUserValue?.role !== route.data['role']) {
    this.router.navigate(['/unauthorized']);
    return of(false);
  }
  return of(true);
}

  private handleInitializedAuth(state: RouterStateSnapshot): Observable<boolean> {
    if (this.authService.currentUserValue) {
      console.log('✅ AuthGuard: Usuario autenticado - Permitiendo acceso');
      return of(true);
    } else {
      console.log('❌ AuthGuard: No hay usuario después de inicialización');
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return of(false);
    }
  }
} 