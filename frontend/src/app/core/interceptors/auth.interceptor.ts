// core/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router, private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Excluir rutas públicas que no necesitan autenticación
    if (request.url.includes('/login') || request.url.includes('/register') || 
        request.url.includes('/public')) {
      return next.handle(request);
    }

    const token = this.authService.getToken(); // Mejor usar el servicio en lugar de localStorage directamente
    
    if (token) {
      try {
        // Verificación básica del token JWT
        if (token.split('.').length === 3) {
          request = request.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          });
        } else {
          console.warn('Token con formato inválido');
          this.authService.logout(); // Limpiar token inválido
          this.router.navigate(['/login']);
        }
      } catch (e) {
        console.error('Error procesando token:', e);
        return throwError(() => e);
      }
    }
    
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('Error de autenticación 401');
          this.authService.logout();
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}