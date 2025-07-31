import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http'; // Añade HttpHeaders aquí
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, timeout, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Class } from '../models/class.model';

interface ClassesResponse {
  success: boolean;
  message?: string;
  data?: Class[];
}
interface ClassListResponse extends Array<Class> {}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}
interface Trainer {
  _id?: string;
  nombre?: string;
  apellido?: string;
  // Agrega otras propiedades del entrenador si existen
}
interface RawClassData {
  _id?: string;
  id?: string;
  name?: string;
  instructor?: string | Trainer; // Más específico que 'any'
  trainer?: Trainer; // Más específico que 'any'
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

  constructor(private http: HttpClient) { }

private handleError(error: HttpErrorResponse) {
  console.error('Error en ClassService:', {
    error: error,
    url: error.url,
    status: error.status,
    statusText: error.statusText,
    errorDetails: error.error
  });
    
    let errorMessage = 'Ocurrió un error inesperado';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error de conexión: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 0:
          errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión.';
          break;
        case 401:
          errorMessage = 'No autorizado. Por favor, inicia sesión nuevamente.';
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
// En tu class.service.ts
getUpcomingClasses(): Observable<Class[]> {
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${this.getAuthToken()}`
  });

  return this.http.get<ApiResponse<Class[]>>(`${this.apiUrl}/upcoming`, { headers }).pipe(
    timeout(10000),
    map(response => {
      if (!response.success) {
        throw new Error(response.message || 'Error al cargar clases próximas');
      }
      return this.transformClassArray(response.data || []);
    }),
    catchError(error => {
      console.error('Error al obtener clases:', error);
      if (!environment.production) {
        console.warn('Usando datos de prueba (solo desarrollo)');
        return of(this.getMockClasses());
      }
      return throwError(() => this.handleError(error));
    })
  );
}

private getAuthToken(): string {
  // Implementa según cómo guardes el token (ej: localStorage, servicio auth, etc.)
  return localStorage.getItem('auth_token') || '';
}

  private getMockClasses(): Class[] {
    return [{
      id: 'mock1',
      name: 'Clase de Prueba',
      description: 'Esta es una clase de demostración',
      startDate: new Date(),
      duration: 60,
      instructor: 'Instructor Demo',
      maxParticipants: 15,
      currentParticipants: 0,
      status: 'available',
      difficulty: 'Intermedio',
      active: true
    }];
  }

private transformClassArray(data: any): Class[] {
  if (!data) return [];
  
  try {
    const rawArray = Array.isArray(data) ? data : 
                    (data.data && Array.isArray(data.data) ? data.data : []);
    
    return rawArray.map((cls: RawClassData) => this.transformClassData(cls))
  } catch (error) {
    console.error('Error transformando datos de clases:', error);
    return [];
  }
}
  private validateStatus(status?: string): 'available' | 'full' | 'cancelled' | 'completed' {
    const validStatuses = ['available', 'full', 'cancelled', 'completed'];
    return validStatuses.includes(status as any) 
      ? status as 'available' | 'full' | 'cancelled' | 'completed'
      : 'available';
  }

  private validateDifficulty(difficulty?: string): 'Principiante' | 'Intermedio' | 'Avanzado' {
    const validDifficulties = ['Principiante', 'Intermedio', 'Avanzado'];
    return validDifficulties.includes(difficulty as any)
      ? difficulty as 'Principiante' | 'Intermedio' | 'Avanzado'
      : 'Intermedio';
  }
  
getAvailableClasses(): Observable<Class[]> {
  return this.http.get<ClassesResponse | ClassListResponse>(`${this.apiUrl}/available`).pipe(
    timeout(15000),
    map(response => {
      // Si es una respuesta estructurada
      if (response && typeof response === 'object' && !Array.isArray(response)) {
        if ('success' in response && response.success === false) {
          throw new Error(response.message || 'Error al cargar clases disponibles');
        }
        if ('data' in response) {
          return this.transformClassArray(response.data || []);
        }
      }
      
      // Si es un array directo
      if (Array.isArray(response)) {
        return this.transformClassArray(response);
      }
      
      throw new Error('Formato de respuesta no reconocido');
    }),
    catchError(this.handleError)
  );
}
private transformClassData(cls: RawClassData): Class {
  if (!cls) return this.getDefaultClassData();

  let nombreInstructor = 'Instructor no asignado';
  let idEntrenador: string | null = null;

  // Manejo seguro del instructor/entrenador
  if (cls.trainer && typeof cls.trainer === 'object') {
    const entrenador = cls.trainer as Trainer;
    nombreInstructor = [entrenador.nombre, entrenador.apellido]
      .filter(Boolean)
      .join(' ') 
      || nombreInstructor;
    idEntrenador = entrenador._id || null;
  } else if (typeof cls.instructor === 'string') {
    nombreInstructor = cls.instructor;
  } else if (cls.instructor && typeof cls.instructor === 'object') {
    const instructorObj = cls.instructor as Trainer;
    nombreInstructor = [instructorObj.nombre, instructorObj.apellido]
      .filter(Boolean)
      .join(' ')
      || nombreInstructor;
  }

  // Conversión segura de fechas
  let startDate: Date;
  try {
    startDate = cls.startDate ? new Date(cls.startDate) : new Date();
  } catch (e) {
    console.warn('Fecha inválida, usando fecha actual', cls.startDate);
    startDate = new Date();
  }

  return {
    id: cls._id || cls.id || '',
    name: cls.name || 'Clase sin nombre',
    description: cls.description || '',
    startDate: startDate,
    duration: cls.duration || 60,
    instructor: nombreInstructor,
    maxParticipants: cls.maxParticipants || 10,
    currentParticipants: cls.currentParticipants || 0,
    status: this.validateStatus(cls.status),
    active: cls.active !== false,
    difficulty: this.validateDifficulty(cls.difficulty),
    trainerId: idEntrenador
  };
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

  getClass(id: string): Observable<Class> {
    return this.http.get<Class>(`${this.apiUrl}/${id}`).pipe(
      timeout(10000),
      map(response => {
        if (!response || typeof response !== 'object') {
          throw new Error('Datos de clase inválidos');
        }

        return {
          ...(response as any),
          id: (response as any).id || id,
          trainer: typeof (response as any).trainer === 'object' ? 
                  ((response as any).trainer as any).id : 
                  (response as any).trainer,
          instructor: typeof (response as any).instructor === 'object' ? 
                    ((response as any).instructor as any).id : 
                    (response as any).instructor
        };
      }),
      catchError(this.handleError)
    );
  }

  updateClass(id: string, updatedClass: Partial<Class>): Observable<Class> {
    return this.http.put<Class>(`${this.apiUrl}/${id}`, updatedClass).pipe(
      timeout(10000),
      catchError(this.handleError)
    );
  }

  createClass(newClass: Class): Observable<Class> {
    console.log('Enviando datos al servidor:', newClass);
    return this.http.post<Class>(this.apiUrl, newClass, { 
      observe: 'response'
    }).pipe(
      timeout(10000),
      map(response => {
        if (!response.body) {
          throw new Error('Respuesta vacía del servidor');
        }
        return response.body;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error al crear clase:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          error: error.error,
          requestPayload: newClass
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
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      timeout(10000),
      catchError(this.handleError)
    );
  }

  cancelClass(classId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${classId}/cancel`, null).pipe(
      timeout(10000),
      catchError(this.handleError)
    );
  }

  bookClass(classId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${classId}/book`, null).pipe(
      timeout(10000),
      catchError(this.handleError)
    );
  }
}