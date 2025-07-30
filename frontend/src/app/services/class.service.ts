import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, timeout, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Class } from '../models/class.model';
import { AuthService } from '../auth/auth.service';

// Define las interfaces necesarias
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}

interface RawClassData {
  _id?: string;
  id?: string;
  name?: string;
  instructor?: any;
  trainer?: any;
  startDate?: Date | string;
  date?: Date | string;
  time?: string;
  duration?: number;
  difficulty?: string;
  maxParticipants?: number;
  currentParticipants?: number;
  status?: string;
  description?: string;
  image?: string;
  active?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ClassService {
  private apiUrl = `${environment.apiUrl}/classes`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      console.error('No hay token de autenticación disponible');
      this.authService.logout();
      throw new Error('No autenticado');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
private handleError(error: HttpErrorResponse) {
    console.error('Error en ClassService:', error);
    
    let errorMessage = 'Ocurrió un error inesperado';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error de conexión: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 0:
          errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión.';
          break;
        case 401:
          errorMessage = 'No autorizado. Por favor, inicia sesión nuevamente.';
          this.authService.logout();
          break;
        case 403:
          errorMessage = 'No tienes permisos para realizar esta acción.';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Inténtalo más tarde.';
          break;
        case 503:
          errorMessage = 'Servicio no disponible temporalmente.';
          break;
        default:
          errorMessage = `Error del servidor (${error.status}): ${error.error?.message || error.message}`;
      }
    }
    
    return throwError(() => errorMessage);
  }
   getUpcomingClasses(): Observable<Class[]> {
    return this.http.get<any>(`${this.apiUrl}/upcoming`, { 
      headers: this.getHeaders()
    }).pipe(
      timeout(15000),
      map(response => {
        if (!response?.success) {
          throw new Error(response?.message || 'Error al cargar clases próximas');
        }
        return (response.data || []).map((cls: any) => this.transformClassData(cls));
      }),
      catchError(this.handleError)
    );
  }

  getAvailableClasses(): Observable<Class[]> {
    return this.http.get<any>(`${this.apiUrl}/available`, { 
      headers: this.getHeaders()
    }).pipe(
      timeout(15000),
      map(response => {
        if (!response?.success) {
          throw new Error(response?.message || 'Error al cargar clases disponibles');
        }
        return (response.data || []).map((cls: any) => this.transformClassData(cls));
      }),
      catchError(this.handleError)
    );
  }
private transformClassData(cls: any): Class {
    if (!cls) return this.getDefaultClassData();

    try {
      return {
        id: cls._id || cls.id || '',
        name: cls.name || 'Clase sin nombre',
        instructor: cls.trainer?.name || cls.instructor || 'Instructor no asignado',
        startDate: cls.startDate ? new Date(cls.startDate) : new Date(),
        duration: cls.duration || 60,
        maxParticipants: cls.maxParticipants || 10,
        currentParticipants: cls.participants?.length || cls.currentParticipants || 0,
        status: cls.status || 'available',
        description: cls.description || '',
        active: cls.active !== false,
        difficulty: cls.difficulty || 'Intermedio',
        trainerId: cls.trainer?._id || cls.trainerId || null
      };
    } catch (error) {
      console.error('Error transformando clase:', error, cls);
      return this.getDefaultClassData(cls?._id || cls?.id);
    }
  }

private parseDate(dateInput: any): Date | null {
  if (!dateInput) return null;
  if (dateInput instanceof Date) return dateInput;
  
  try {
    const date = new Date(dateInput);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

private formatTime(date: Date): string {
  return date.toTimeString().substring(0, 5);
}

private getDefaultClassData(id: string = 'unknown'): Class {
    return {
      id,
      name: 'Clase sin nombre',
      instructor: 'Instructor no asignado',
      startDate: new Date(),
      duration: 60,
      maxParticipants: 10,
      currentParticipants: 0,
      status: 'available',
      description: '',
      active: true,
      difficulty: 'Intermedio',
      trainerId: null
    };
  }


  // Resto de los métodos permanecen igual pero con mejor manejo de errores...
  getClass(id: string): Observable<Class> {
    return this.http.get<{success: boolean, data: Class}>(`${this.apiUrl}/${id}`, { 
      headers: this.getHeaders() 
    }).pipe(
      timeout(10000),
      map(response => {
        if (!response || typeof response !== 'object' || !response.data) {
          throw new Error('Respuesta inválida del servidor');
        }

        const data: Class = response.data;
        
        if (typeof data !== 'object') {
          throw new Error('Datos de clase inválidos');
        }

        return {
          ...data,
          _id: data._id || id,
          trainer: typeof data.trainer === 'object' ? 
                  (data.trainer as any)._id : 
                  data.trainer,
          instructor: typeof data.instructor === 'object' ? 
                    (data.instructor as any)._id : 
                    data.instructor
        };
      }),
      catchError(this.handleError)
    );
  }

  updateClass(id: string, updatedClass: Partial<Class>): Observable<Class> {
    return this.http.put<Class>(`${this.apiUrl}/${id}`, updatedClass, { 
      headers: this.getHeaders() 
    }).pipe(
      timeout(10000),
      catchError(this.handleError)
    );
  }

createClass(newClass: Class): Observable<Class> {
  console.log('Enviando datos al servidor:', newClass); // Depuración
  
  return this.http.post<Class>(this.apiUrl, newClass, { 
    headers: this.getHeaders(),
    observe: 'response' // Para obtener toda la respuesta
  }).pipe(
    timeout(10000),
    map(response => {
      if (!response.body) {
        throw new Error('Respuesta vacía del servidor');
      }
      return response.body;
    }),
    catchError((error: HttpErrorResponse) => {
      console.error('Error completo al crear clase:', {
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        error: error.error,
        requestPayload: newClass // Mostrar qué enviamos
      });
      
      let errorMessage = 'Error al crear la clase';
      if (error.error && error.error.message) {
        errorMessage += `: ${error.error.message}`;
      } else if (error.error && typeof error.error === 'string') {
        errorMessage += `: ${error.error}`;
      }
      
      return throwError(() => errorMessage);
    })
  );
}

  deleteClass(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { 
      headers: this.getHeaders() 
    }).pipe(
      timeout(10000),
      catchError(this.handleError)
    );
  }

  cancelClass(classId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${classId}/cancel`, null, { 
      headers: this.getHeaders() 
    }).pipe(
      timeout(10000),
      catchError(this.handleError)
    );
  }

  bookClass(classId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${classId}/book`, null, { 
      headers: this.getHeaders() 
    }).pipe(
      timeout(10000),
      catchError(this.handleError)
    );
  }
}