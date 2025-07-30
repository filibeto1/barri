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
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // 1. Clonar la petición para agregar headers
    const token = this.authService.getToken();
    let authReq = request;

    if (token) {
      authReq = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      console.debug('🚀 Outgoing request with token:', authReq.url);
    }

    // 2. Manejar la respuesta
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // 3. Manejar errores 401
        if (error.status === 401) {
          console.warn('⛔ Unauthorized request:', {
            url: request.url,
            error: error.error
          });
          
          this.authService.logout();
          this.router.navigate(['/login'], {
            queryParams: { 
              returnUrl: this.router.routerState.snapshot.url,
              sessionExpired: true
            }
          });
        }

        return throwError(() => error);
      })
    );
  }
}