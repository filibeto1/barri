import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError,switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router, private authService: AuthService) {}
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Excluir APIs externas y rutas públicas
    if (this.isExternalApiRequest(request) || this.isPublicRequest(request)) {
      return next.handle(request);
    }

    // Obtener token de forma segura
    const token = this.authService.getToken();
    
    if (!token) {
      this.handleUnauthorizedError();
      return throwError(() => new Error('No authentication token available'));
    }

    // Clonar request con token
    const authReq = this.addTokenToRequest(request, token);

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          if (this.authService.isTokenExpired(token)) {
            return this.handleExpiredToken(request, next);
          }
          this.handleUnauthorizedError();
        }
        return throwError(() => error);
      })
    );
  }
  private handleExpiredToken(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.authService.refreshToken().pipe(
      switchMap((newToken: string) => { // Tipo explícito añadido
        const newRequest = this.addTokenToRequest(request, newToken);
        return next.handle(newRequest);
      }),
      catchError(refreshError => {
        this.handleUnauthorizedError();
        return throwError(() => refreshError);
      })
    );
  }
  private addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }
private isExternalApiRequest(request: HttpRequest<any>): boolean {
    const externalApis = ['youtube.googleapis.com', 'maps.googleapis.com'];
    return externalApis.some(api => request.url.includes(api));
  }

  private isPublicRequest(request: HttpRequest<any>): boolean {
    const publicRoutes = ['/auth/login', '/auth/register', '/assets'];
    return publicRoutes.some(route => request.url.includes(route));
  }

  private handleUnauthorizedError(): void {
    this.authService.logout();
    this.router.navigate(['/login'], {
      queryParams: { sessionExpired: true }
    });
  }

  private getValidToken(): string | null {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    return token && this.isValidToken(token) ? token : null;
  }

  private isValidToken(token: string): boolean {
    return token.split('.').length === 3;
  }


  private handleInvalidToken(): void {
    console.warn('Token con formato inválido');
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}