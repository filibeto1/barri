import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http'; // Añade HttpHeaders aquí
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, timeout, tap, switchMap, take } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Class } from '../models/class.model';
import { AuthService } from '../../../src/app/auth/auth.service';

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

  constructor(private http: HttpClient,private authService: AuthService) { }

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

private getAuthHeaders(): HttpHeaders {
  const token = this.authService.getToken();
  if (!token) {
    console.error('No hay token disponible');
    throw new Error('No authentication token available');
  }
  
  return new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });
}

// En tu ClassService, modifica getUpcomingClasses así:
getUpcomingClasses(): Observable<Class[]> {
  return this.http.get<ApiResponse<Class[]>>(
    `${this.apiUrl}/upcoming`,
    { headers: this.getAuthHeaders() }
  ).pipe(
    timeout(10000),
    map(response => {
      if (!response?.success) {
        throw new Error(response?.message || 'Respuesta inválida del servidor');
      }
      return this.transformClassArray(response.data || []);
    }),
    catchError(error => {
      console.error('Error en servicio:', error);
      if (!environment.production) {
        console.warn('Usando datos mock');
        return of(this.getMockClasses());
      }
      return throwError(() => error);
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
  return this.http.get<any>(`${this.apiUrl}/available`).pipe(
    timeout(15000),
    map(response => {
      console.log('Raw API response:', response); // Para depuración
      
      // Manejo de diferentes formatos de respuesta
      let classesArray = [];
      
      if (Array.isArray(response)) {
        classesArray = response;
      } else if (response && typeof response === 'object') {
        if (response.data && Array.isArray(response.data)) {
          classesArray = response.data;
        } else if (Array.isArray(response.classes)) {
          classesArray = response.classes;
        }
      }
      
      if (classesArray.length === 0) {
        console.warn('La respuesta no contiene clases o está vacía');
      }
      
      return this.transformClassArray(classesArray);
    }),
    catchError(error => {
      console.error('Error fetching classes:', error);
      return throwError(() => new Error('Error al obtener las clases'));
    })
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
    trainer: idEntrenador ? { id: idEntrenador } : undefined, // ← Usa trainer en lugar de trainerId
    maxParticipants: cls.maxParticipants || 10,
    currentParticipants: cls.currentParticipants || 0,
    status: this.validateStatus(cls.status),
    active: cls.active !== false,
    difficulty: this.validateDifficulty(cls.difficulty),
    // Elimina trainerId: idEntrenador
  };
}

  private getDefaultClassData(id: string = 'unknown'): Class {
  return {
    id,
    name: 'Clase sin nombre',
    description: '',
    startDate: new Date(),
    duration: 60,
    instructor: 'Instructor no asignado',
    trainer: undefined, // ← En lugar de trainerId: null
    maxParticipants: 10,
    currentParticipants: 0,
    status: 'available',
    difficulty: 'Intermedio',
    active: true,
  };
  }

getClass(id: string): Observable<Class> {
  return this.http.get<Class>(`${this.apiUrl}/${id}`).pipe(
    map(response => {
      // Asegúrate de transformar los datos como espera tu interfaz
      const transformedData: Class = {
        ...response,
        id: response.id || (response as any)._id || id,
        trainer: response.trainer 
          ? typeof response.trainer === 'string' 
            ? response.trainer 
            : { id: (response.trainer as any)._id || (response.trainer as any).id }
          : undefined
      };
      return transformedData;
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
  if (!id) {
    return throwError(() => new Error('ID de clase no proporcionado'));
  }

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${this.getAuthToken()}`
  });

  return this.http.delete(`${this.apiUrl}/${id}`, { headers }).pipe(
    timeout(10000),
    catchError(error => {
      console.error('Error al eliminar clase:', {
        error: error,
        url: `${this.apiUrl}/${id}`,
        status: error.status,
        statusText: error.statusText,
        errorDetails: error.error
      });
      return throwError(() => this.handleError(error));
    })
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