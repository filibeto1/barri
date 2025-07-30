import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LoginResponse, User } from '../shared/interfaces/user.interface';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';
// Añade estas importaciones al inicio del archivo auth.service.ts
import { filter, take } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public apiUrl = `${environment.apiUrl}/auth`;
  public currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  public authInitialized = false;

  // Primero declara el BehaviorSubject
  private initializationSubject = new BehaviorSubject<boolean>(false);
  // Luego puedes usarlo para crear el Observable
  public initialization$ = this.initializationSubject.asObservable();
  
  private initializationPromise: Promise<boolean> | null = null;

public async initialize(): Promise<boolean> {
  if (this.initializationPromise) {
    return this.initializationPromise;
  }

  this.initializationPromise = new Promise(async (resolve) => {
    console.log('🔐 Inicializando autenticación...');
    const token = this.getToken();
    
    if (!token) {
      console.log('🔴 No hay token disponible');
      this.authInitialized = true;
      resolve(false);
      return;
    }

    if (this.isTokenExpired(token)) {
      console.log('🟠 Token expirado - Intentando renovar...');
      try {
        const newToken = await this.refreshToken().toPromise();
        if (newToken) {
          await this.getUserProfile().toPromise();
          resolve(true);
        } else {
          resolve(false);
        }
      } catch (error) {
        console.error('Error al renovar token:', error);
        resolve(false);
      }
      return;
    }

    if (this.currentUserValue) {
      console.log('🟢 Usuario ya cargado');
      this.authInitialized = true;
      resolve(true);
      return;
    }

    console.log('🟡 Cargando perfil de usuario...');
    try {
      await this.getUserProfile().toPromise();
      resolve(true);
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      resolve(false);
    }
  });

  return this.initializationPromise;
}


  constructor(private http: HttpClient, private router: Router) {
    this.currentUserSubject = new BehaviorSubject<User | null>(
      this.getCurrentUserFromStorage()
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  // Método register que faltaba
  register(name: string, email: string, password: string, role: string = 'user'): Observable<User> {
    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return throwError(() => new Error('Todos los campos son requeridos'));
    }

    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role
    }).pipe(
      switchMap(response => {
        if (!response.success || !response.token || !response.user) {
          throw new Error(response.msg || 'Registro fallido');
        }

        this.setUserData(response.token, response.user);
        return of(response.user);
      }),
      catchError(this.handleError)
    );
  }
 

  private getCurrentUserFromStorage(): User | null {
    try {
      const userStr = localStorage.getItem('currentUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      localStorage.removeItem('currentUser');
      return null;
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get isAdmin(): boolean {
    return this.currentUserValue?.role === 'admin';
  }

get isAuthenticated(): boolean {
  const token = this.getToken();
  
  if (!token) {
    console.log('🔴 No hay token');
    return false;
  }
  
  if (this.isTokenExpired(token)) {
    console.log('🔴 Token expirado');
    return false;
  }
  
  const hasUser = !!this.currentUserValue;
  console.log('🔍 Estado auth:', { token: !!token, hasUser, authInitialized: this.authInitialized });
  
  return hasUser;
}

public initializeAuth(): Observable<boolean> {
  console.log('🔐 InitializeAuth llamado');
  
  if (this.authInitialized) {
    console.log('✅ Auth ya inicializado:', this.isAuthenticated);
    return of(this.isAuthenticated);
  }

  const token = this.getToken();
  
  // Si no hay token, marcamos como inicializado y devolvemos false
  if (!token) {
    console.log('❌ No hay token disponible');
    this.authInitialized = true;
    return of(false);
  }

  // Si el token está expirado, limpiar y devolver false
  if (this.isTokenExpired(token)) {
    console.log('❌ Token expirado');
    this.logout();
    return of(false);
  }

  // Si hay usuario en memoria y token válido, marcamos como inicializado
  if (this.currentUserValue) {
    console.log('✅ Usuario ya en memoria');
    this.authInitialized = true;
    return of(true);
  }

  // Si hay token válido pero no usuario, cargamos el perfil
  console.log('🔄 Cargando perfil de usuario...');
  return this.getUserProfile().pipe(
    map(user => {
      console.log('✅ Perfil cargado exitosamente:', user);
      this.authInitialized = true;
      return true;
    }),
    catchError(error => {
      console.error('❌ Error al cargar perfil:', error);
      this.logout();
      return of(false);
    })
  );
}
// auth.service.ts
public async initializeOnStartup(): Promise<boolean> {
  console.log('🚀 Inicializando auth en startup...');
  
  const token = this.getToken();
  if (!token) {
    console.log('🔴 No hay token disponible');
    this.authInitialized = true;
    this.initializationSubject.next(false);
    return false;
  }

  // Verificar si el token está expirado
  if (this.isTokenExpired(token)) {
    console.log('🟠 Token expirado - Intentando renovar...');
    try {
      const newToken = await this.refreshToken().toPromise();
      if (newToken) {
        console.log('🟢 Token renovado con éxito');
        await this.getUserProfile().toPromise();
        this.initializationSubject.next(true);
        return true;
      } else {
        this.logout();
        this.initializationSubject.next(false);
        return false;
      }
    } catch (error) {
      console.error('Error renovando token:', error);
      this.logout();
      this.initializationSubject.next(false);
      return false;
    }
  }

  // Si hay token válido pero no usuario, cargar perfil
  if (!this.currentUserValue) {
    console.log('🟡 Cargando perfil de usuario...');
    try {
      await this.getUserProfile().toPromise();
      this.initializationSubject.next(true);
      return true;
    } catch (error) {
      console.error('Error cargando perfil:', error);
      this.logout();
      this.initializationSubject.next(false);
      return false;
    }
  }

  // Si ya hay usuario y token válido
  console.log('🟢 Usuario ya autenticado');
  this.initializationSubject.next(true);
  return true;
}
public isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp < (Date.now() / 1000);
    } catch (error) {
      return true;
    }
  }
private setUserData(token: string, user: User): void {
  console.log('📝 Guardando datos de usuario:', user);
  
  // Guardar en localStorage
  localStorage.setItem('token', token);
  localStorage.setItem('currentUser', JSON.stringify(user));
  
  // Actualizar el BehaviorSubject
  this.currentUserSubject.next(user);
  
  // Marcar como autenticado e inicializado
  this.authInitialized = true;
  this.initializationSubject.next(true);
  
  console.log('✅ Datos guardados. Auth inicializado:', this.authInitialized, 
              'Usuario:', this.currentUserValue);
}

login(email: string, password: string): Observable<User> {
  if (!email?.trim() || !password?.trim()) {
    return throwError(() => new Error('Email y contraseña son requeridos'));
  }

  return this.http.post<LoginResponse>(`${this.apiUrl}/login`, {
    email: email.trim().toLowerCase(), 
    password 
  }).pipe(
    switchMap(response => {
      if (!response.success || !response.token || !response.user) {
        throw new Error(response.msg || 'Autenticación fallida');
      }

      // Guardar datos y marcar como autenticado
      this.setUserData(response.token, response.user);
      
      return of(response.user);
    }),
    catchError(this.handleError)
  );
}
public get isReady(): Observable<boolean> {
  return this.initialization$.pipe(
    filter(initialized => initialized),
    take(1)
  );
}
logout(): Observable<boolean> {
  return new Observable<boolean>(subscriber => {
    console.log('🔴 Iniciando cierre de sesión...');
    
    try {
      // Limpiar almacenamiento local
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token_expires_at');
      
      // Resetear estados
      this.currentUserSubject.next(null);
      this.authInitialized = false;
      this.initializationSubject.next(false);
      
      console.log('✅ Sesión cerrada correctamente');
      subscriber.next(true);
      subscriber.complete();
    } catch (error) {
      console.error('❌ Error durante logout:', error);
      subscriber.error(error);
    }
  });
}

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserProfile(): Observable<User> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<User>(`${this.apiUrl}/user`, { headers }).pipe(
      tap(user => this.setUserData(this.getToken()!, user)),
      catchError(this.handleError)
    );
  }

  // Método mejorado para manejo de errores
  private handleError(error: any): Observable<never> {
    console.error('Error en AuthService:', error);
    
    let errorMessage = 'Ocurrió un error';
    if (error instanceof HttpErrorResponse) {
      // Manejo de errores HTTP
      if (error.status === 0) {
        errorMessage = 'Error de conexión con el servidor';
      } else if (error.status === 400) {
        errorMessage = error.error?.msg || 'Datos inválidos';
      } else if (error.status === 401) {
        errorMessage = error.error?.msg || 'No autorizado';
      } else if (error.status === 409) {
        errorMessage = error.error?.msg || 'El usuario ya existe';
      } else {
        errorMessage = error.error?.msg || error.message || `Error ${error.status}`;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return throwError(() => new Error(errorMessage));
  }

  // Método adicional para verificar roles
  hasRole(role: string): boolean {
    return this.currentUserValue?.role === role;
  }
verifyToken(): Observable<boolean> {
  const token = this.getToken();
  if (!token) {
    return of(false);
  }
  
  // Verificación simple del token sin llamada al backend
  return of(!this.isTokenExpired(token));
}
refreshToken(): Observable<string> {
  const token = this.getToken();
  if (!token) {
    return throwError(() => new Error('No hay token disponible para renovar'));
  }

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  return this.http.post<{token: string, expiresIn: number}>(
    `${this.apiUrl}/refresh`, 
    {}, 
    { headers }
  ).pipe(
    tap(response => {
      if (response?.token) {
        console.log('🔄 Token renovado exitosamente');
        localStorage.setItem('token', response.token);
        
        // Opcional: Guardar la fecha de expiración
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + (response.expiresIn || 3600));
        localStorage.setItem('token_expires_at', expiresAt.toISOString());
      }
    }),
    map(response => response.token),
    catchError(error => {
      console.error('❌ Error al renovar token:', error);
      
      // Manejo específico de errores
      if (error.status === 404) {
        console.warn('Endpoint de refresh no implementado en el backend');
        this.logout();
        return throwError(() => new Error('Funcionalidad no disponible en el servidor'));
      }
      
      if (error.status === 401 || error.status === 403) {
        console.warn('Token inválido o expirado - Forzando logout');
        this.logout();
        return throwError(() => new Error('Sesión inválida. Por favor inicie sesión nuevamente'));
      }
      
      return throwError(() => error);
    })
  );
}
}