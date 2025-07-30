import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    
    if (token) {
      try {
        if (token.split('.').length !== 3) {
          console.error('Token con formato inválido');
        } else {
          request = request.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          });
        }
      } catch (e) {
        console.error('Error procesando token:', e);
      }
    }
    
    return next.handle(request).pipe(
      catchError((error: any) => { // Tipo explícito para error
        if (error.status === 401) {
          console.error('Error de autenticación, redirigiendo...');
        }
        return throwError(() => error);
      })
    );
  }
}