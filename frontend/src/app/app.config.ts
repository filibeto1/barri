import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { 
  provideHttpClient, 
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS  // Importa esto
} from '@angular/common/http';
import { provideZoneChangeDetection } from '@angular/core';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(
      withInterceptorsFromDi()
    ),
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Registra el interceptor como provider tradicional
    { 
      provide: HTTP_INTERCEPTORS, 
      useClass: AuthInterceptor, 
      multi: true 
    }
  ]
};