import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map} from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Instructor } from '../models/instructor.model';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class InstructorService {
  private apiUrl = `${environment.apiUrl}/instructores`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }); 
  }
obtenerInstructores(): Observable<Instructor[]> {
  return this.http.get<any>(this.apiUrl, { 
    headers: this.getHeaders(),
    observe: 'response' // Para obtener toda la respuesta HTTP
  }).pipe(
    map(response => {
      // Debug: Mostrar la respuesta completa
      console.log('Respuesta completa del API:', response);
      
      const body = response.body;
      
      // Caso 1: Respuesta directa con array de instructores
      if (Array.isArray(body)) {
        return body;
      }
      // Caso 2: Respuesta con formato { success, data }
      else if (body && typeof body === 'object' && body.success) {
        return Array.isArray(body.data) ? body.data : [];
      }
      // Caso 3: Respuesta con formato { instructors }
      else if (body && typeof body === 'object' && body.instructors) {
        return Array.isArray(body.instructors) ? body.instructors : [];
      }
      // Caso 4: Respuesta inesperada
      else {
        console.warn('Formato de respuesta inesperado:', body);
        return [];
      }
    }),
    catchError(error => {
      console.error('Error en obtenerInstructores:', error);
      if (error.status === 401) {
        this.authService.logout();
      }
      return throwError(() => new Error('No se pudieron cargar los instructores'));
    })
  );
}

  // Obtener un instructor por ID
  obtenerInstructor(id: string): Observable<Instructor> {
    console.log('🔍 Obteniendo instructor por ID:', id);
    return this.http.get<Instructor>(`${this.apiUrl}/${id}`, { 
      headers: this.getHeaders() 
    }).pipe(
      tap(instructor => console.log('✅ Instructor obtenido:', instructor)),
      catchError(this.handleError)
    );
  }

  // Método alternativo para compatibilidad
  obtenerInstructorPorId(id: string): Observable<Instructor> {
    return this.obtenerInstructor(id);
  }

crearInstructor(instructor: Instructor): Observable<Instructor> {
  console.log('➕ Datos a enviar al crear instructor:', JSON.stringify(instructor, null, 2));
  return this.http.post<Instructor>(this.apiUrl, instructor, { 
    headers: this.getHeaders() 
  }).pipe(
    tap(newInstructor => console.log('✅ Instructor creado:', newInstructor)),
    catchError(this.handleError)
  );
}

  // Actualizar instructor existente
  actualizarInstructor(id: string, instructor: Instructor): Observable<Instructor> {
    console.log('📝 Actualizando instructor:', id, instructor);
    return this.http.put<Instructor>(`${this.apiUrl}/${id}`, instructor, { 
      headers: this.getHeaders() 
    }).pipe(
      tap(updatedInstructor => console.log('✅ Instructor actualizado:', updatedInstructor)),
      catchError(this.handleError)
    );
  }

  // Eliminar instructor
  eliminarInstructor(id: string): Observable<any> {
    console.log('🗑️ Eliminando instructor:', id);
    return this.http.delete(`${this.apiUrl}/${id}`, { 
      headers: this.getHeaders() 
    }).pipe(
      tap(() => console.log('✅ Instructor eliminado')),
      catchError(this.handleError)
    );
  }

  // Cambiar estado de instructor (activo/inactivo)
  cambiarEstadoInstructor(id: string, activo: boolean): Observable<Instructor> {
    console.log('🔄 Cambiando estado instructor:', id, 'activo:', activo);
    return this.http.patch<Instructor>(`${this.apiUrl}/${id}/estado`, 
      { activo }, 
      { headers: this.getHeaders() }
    ).pipe(
      tap(instructor => console.log('✅ Estado cambiado:', instructor)),
      catchError(this.handleError)
    );
  }

  // Manejo de errores mejorado
private handleError(error: any): Observable<never> {
  console.error('❌ Error completo:', error);
  console.error('❌ Error response:', {
    status: error.status,
    statusText: error.statusText,
    url: error.url,
    error: error.error
  });
  
  let errorMessage = 'Ocurrió un error desconocido';
  
  if (error.error instanceof ErrorEvent) {
    errorMessage = `Error del cliente: ${error.error.message}`;
  } else {
    if (error.error && error.error.error) {
      errorMessage = error.error.error; // Mostrar el mensaje específico del backend
    } else {
      errorMessage = `Error del servidor: ${error.status} - ${error.statusText}`;
    }
  }

  return throwError(() => new Error(errorMessage));
}
}  