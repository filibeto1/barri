import { Component, OnInit } from '@angular/core';
import { ClassService } from '../../../services/class.service';
import { InstructorService } from '../../../services/instructor.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Class } from '../../../models/class.model';
import { Instructor } from '../../../models/instructor.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
// Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-edit-class',
  standalone: true,
  templateUrl: './edit-class.component.html',
  styleUrls: ['./edit-class.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    
    // Material Modules
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatOptionModule,
    MatProgressBarModule
  ]
})
export class EditClassComponent implements OnInit {
  isLoading = true;
  isUpdating = false;
  loadingInstructors = false;
  
  // Objeto con todas las propiedades requeridas por la interfaz Class
  classData: Class = {
    _id: '',
    id: '',
    name: '',
    description: '',
    schedule: '',
    duration: 60,
    maxParticipants: 15,
    currentParticipants: 0,
    active: true,
    trainer: '',
    instructor: '',
    startDate: new Date(),
    date: new Date(),
    time: '',
    difficulty: 'Intermedio',
    status: 'available',
    image: '',
    category: '',
    location: ''
  };
  
  instructors: Instructor[] = [];
  
  // Opciones para los selectores
  difficultyOptions: Array<'Principiante' | 'Intermedio' | 'Avanzado'> = [
    'Principiante', 
    'Intermedio', 
    'Avanzado'
  ];
  
  statusOptions: Array<'available' | 'full' | 'cancelled' | 'completed'> = [
    'available', 
    'full', 
    'cancelled', 
    'completed'
  ];

  constructor(
    private classService: ClassService,
    private instructorService: InstructorService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadClassData();
    this.loadInstructors();
  }

  updateClass(): void {
    if (!this.classData._id) return;
    
    this.isUpdating = true;
    
    // Preparar los datos para la actualización
    const updateData: Partial<Class> = {
      ...this.classData,
      active: this.classData.active !== false,
      // Asegurar que las fechas sean válidas
      startDate: this.classData.startDate ? new Date(this.classData.startDate) : new Date(),
      date: this.classData.date ? new Date(this.classData.date) : new Date(),
      // Asegurar que los números sean válidos
      duration: Number(this.classData.duration) || 60,
      maxParticipants: Number(this.classData.maxParticipants) || 15,
      currentParticipants: Number(this.classData.currentParticipants) || 0
    };

    this.classService.updateClass(this.classData._id, updateData).subscribe({
      next: () => {
        this.snackBar.open('Clase actualizada exitosamente', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/admin/classes']);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error updating class:', error);
        this.isUpdating = false;
        const errorMessage = error.error?.message || 'Error al actualizar la clase';
        this.snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
      }
    });
  }

  loadClassData(): void {
    const classId = this.route.snapshot.paramMap.get('id');
    if (!classId) {
      this.handleInvalidClassId();
      return;
    }

    this.classService.getClass(classId).subscribe({
      next: (classData: Class) => {
        // Asegurar que todos los campos estén presentes
        this.classData = {
          ...this.getDefaultClassData(),
          ...classData,
          // Procesar campos específicos
          trainer: this.extractId(classData.trainer),
          instructor: this.extractId(classData.instructor),
          // Asegurar que las fechas sean objetos Date
          startDate: classData.startDate ? new Date(classData.startDate) : new Date(),
          date: classData.date ? new Date(classData.date) : new Date(),
          // Asegurar que los valores sean del tipo correcto
          difficulty: (classData.difficulty as 'Principiante' | 'Intermedio' | 'Avanzado') || 'Intermedio',
          status: (classData.status as 'available' | 'full' | 'cancelled' | 'completed') || 'available'
        };
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.handleClassLoadError(error);
      }
    });
  }

  private getDefaultClassData(): Class {
    return {
      _id: '',
      id: '',
      name: '',
      description: '',
      schedule: '',
      duration: 60,
      maxParticipants: 15,
      currentParticipants: 0,
      active: true,
      trainer: '',
      instructor: '',
      startDate: new Date(),
      date: new Date(),
      time: '',
      difficulty: 'Intermedio',
      status: 'available',
      image: '',
      category: '',
      location: ''
    };
  }

  private extractId(value: string | { _id: string } | undefined): string {
    if (!value) return '';
    return typeof value === 'string' ? value : value._id;
  }

  private handleInvalidClassId(): void {
    this.isLoading = false;
    this.snackBar.open('ID de clase no válido', 'Cerrar', { duration: 3000 });
    this.router.navigate(['/admin/classes']);
  }

  private handleClassLoadError(error: HttpErrorResponse): void {
    console.error('Error loading class:', error);
    this.snackBar.open('Error al cargar la clase', 'Cerrar', { duration: 3000 });
    this.router.navigate(['/admin/classes']);
  }

  loadInstructors(): void {
    this.loadingInstructors = true;
    this.instructorService.obtenerInstructores().subscribe({
      next: (response: any) => {
        try {
          this.instructors = this.processInstructorsResponse(response);
        } catch (error) {
          console.error('Error procesando instructores:', error);
          this.instructors = [];
        }
        this.loadingInstructors = false;
      },
      error: (error: HttpErrorResponse) => {
        this.handleInstructorsLoadError(error);
      }
    });
  }

  private processInstructorsResponse(response: any): Instructor[] {
    const instructores = Array.isArray(response) ? response : 
                       response?.data ? response.data : [];
    return instructores.filter((i: any) => i?.activo);
  }

  private handleInstructorsLoadError(error: HttpErrorResponse): void {
    console.error('Error loading instructors:', error);
    this.snackBar.open('Error al cargar instructores', 'Cerrar', { duration: 3000 });
    this.loadingInstructors = false;
    this.instructors = [];
  }

  // Métodos de utilidad para el formulario
  onDateChange(field: 'startDate' | 'date', event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.value) {
      this.classData[field] = new Date(target.value);
    }
  }

  onTimeChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.classData.time = target.value;
  }

  onNumberChange(field: 'duration' | 'maxParticipants' | 'currentParticipants', event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value, 10);
    if (!isNaN(value)) {
      this.classData[field] = value;
    }
  }

  // Métodos de formulario
  onSubmit(): void {
    this.updateClass();
  }

  onCancel(): void {
    this.router.navigate(['/admin/classes']);
  }
}