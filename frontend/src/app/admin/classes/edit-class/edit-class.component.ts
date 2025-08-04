import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClassService } from '../../../services/class.service';
import { InstructorService } from '../../../services/instructor.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Class } from '../../../models/class.model';
import { Instructor } from '../../../models/instructor.model';
import { HttpErrorResponse } from '@angular/common/http';

// Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-edit-class',
  standalone: true,
  templateUrl: './edit-class.component.html',
  styleUrls: ['./edit-class.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    NgIf,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ]
})
export class EditClassComponent implements OnInit {
  isLoading = true;
  isUpdating = false;
  loadingInstructors = false;
  
classData: Class = {
  id: '',
  name: '',
  description: '',
  startDate: new Date(),
  duration: 60,
  trainer: '',  // Usamos trainer como principal
  instructor: '',  // Mantenemos por compatibilidad
  maxParticipants: 15,
  currentParticipants: 0,  // Número en lugar de array
  status: 'available',
  difficulty: 'Intermedio',
  active: true,
  time: '12:00'
};
  
  instructors: Instructor[] = [];

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

  formValid(): boolean {
    return !!this.classData.name && 
           !!this.classData.startDate && 
           !!this.classData.time && 
           !!this.classData.duration && 
           !!this.classData.instructor && 
           !!this.classData.maxParticipants;
  }

  formatDateForInput(date: Date | string): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
  }

  onDateChange(field: 'startDate', event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.value) {
      this.classData[field] = new Date(target.value);
    }
  }
loadClassData(): void {
  const classId = this.route.snapshot.paramMap.get('id');
  if (!classId) {
    this.snackBar.open('ID de clase no válido', 'Cerrar', { duration: 3000 });
    this.router.navigate(['/admin/classes']);
    return;
  }

  this.classService.getClass(classId).subscribe({
    next: (classData: any) => {
      // Asegúrate de mapear los campos correctamente
      this.classData = {
        id: classData._id || classData.id,
        name: classData.name,
        description: classData.description,
        startDate: new Date(classData.startDate),
        duration: classData.duration,
        trainer: classData.trainer || classData.instructor, // Maneja ambos casos
        maxParticipants: classData.maxParticipants,
currentParticipants: classData.participants?.length || classData.currentParticipants || 0,
        status: classData.status || 'available',
        difficulty: classData.difficulty || 'Intermedio',
        active: classData.active !== false, // Por defecto true
        time: classData.time || '12:00'
      };
      this.isLoading = false;
    },
    error: (error: HttpErrorResponse) => {
      console.error('Error loading class:', error);
      this.snackBar.open('Error al cargar la clase', 'Cerrar', { duration: 3000 });
      this.router.navigate(['/admin/classes']);
    }
  });
}

  loadInstructors(): void {
    this.loadingInstructors = true;
    this.instructorService.obtenerInstructores().subscribe({
      next: (response: any) => {
        this.instructors = Array.isArray(response) ? response : response?.data || [];
        this.loadingInstructors = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading instructors:', error);
        this.snackBar.open('Error al cargar instructores', 'Cerrar', { duration: 3000 });
        this.loadingInstructors = false;
      }
    });
  }
onSubmit(): void {
  if (!this.formValid()) {
    this.snackBar.open('Por favor complete todos los campos requeridos', 'Cerrar', { duration: 3000 });
    return;
  }

  this.isUpdating = true;
  
  // Prepara los datos para enviar al backend
  const updateData = {
    name: this.classData.name,
    description: this.classData.description,
    startDate: this.classData.startDate,
    duration: Number(this.classData.duration),
    trainer: this.classData.trainer, // Usa trainer en lugar de instructor
    maxParticipants: Number(this.classData.maxParticipants),
    difficulty: this.classData.difficulty,
    active: this.classData.active,
    time: this.classData.time
  };

  this.classService.updateClass(this.classData.id, updateData).subscribe({
    next: () => {
      this.snackBar.open('Clase actualizada exitosamente', 'Cerrar', { duration: 3000 });
      this.router.navigate(['/admin/classes']);
    },
    error: (error: HttpErrorResponse) => {
      this.isUpdating = false;
      this.snackBar.open(
        error.error?.message || 'Error al actualizar la clase', 
        'Cerrar', 
        { duration: 5000 }
      );
    }
  });
}
  onCancel(): void {
    this.router.navigate(['/admin/classes']);
  }
}