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
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Excluir rutas que no necesitan autenticación (login, register, etc.)
    if (request.url.includes('/login') || request.url.includes('/register')) {
      return next.handle(request);
    }

    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    
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
        }
      } catch (e) {
        console.error('Error procesando token:', e);
      }
    }
    
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('Error de autenticación 401, token puede ser inválido');
          // Aquí podrías redirigir al login si lo deseas
        }
        return throwError(() => error);
      })
    );
  }
}