import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class roleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const requiredRole = route.data['role'] as string;
    console.log(`🔒 RoleGuard verificando rol: ${requiredRole}`);

    // Si no hay rol requerido, permitir acceso
    if (!requiredRole) {
      console.log('⚠️ RoleGuard: No hay rol requerido - Permitiendo acceso');
      return of(true);
    }

    // Verificar si el usuario tiene el rol requerido
    if (this.authService.currentUserValue?.role === requiredRole) {
      console.log(`✅ RoleGuard: Usuario tiene el rol ${requiredRole} - Permitiendo acceso`);
      return of(true);
    }

    console.log(`❌ RoleGuard: Usuario no tiene el rol ${requiredRole} - Redirigiendo`);
    this.router.navigate(['/unauthorized']);
    return of(false);
  }
}