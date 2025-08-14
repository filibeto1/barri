import { Component, OnInit } from '@angular/core';
import { ClassService } from '../../../services/class.service';
import { InstructorService } from '../../../services/instructor.service'; // Importar el servicio
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Class } from '../../../models/class.model';
import { Instructor } from '../../../models/instructor.model'; // Importar el modelo
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

@Component({
  selector: 'app-new-class',
  standalone: true,
  templateUrl: './new-class.component.html',
  styleUrls: ['./new-class.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatSelectModule, // Añadir estos módulos
    MatOptionModule
  ]
})
export class NewClassComponent implements OnInit {
  isLoading = false;
  loadingInstructors = false; // Definir la propiedad
  instructors: Instructor[] = []; // Definir la propiedad con tipo

  newClass: Omit<Partial<Class>, 'trainer'> & { 
    trainer: string | null;
    classDate: string; // Nueva propiedad para la fecha
    classTime: string; // Nueva propiedad para la hora
  } = {
    name: '',
    description: '',
    classDate: new Date().toISOString().split('T')[0], // Fecha actual por defecto
    classTime: '12:00', // Hora por defecto
    duration: 60,
    trainer: null,
    maxParticipants: 15,
    active: true
  };

  constructor(
    private classService: ClassService,
    private instructorService: InstructorService, // Inyectar el servicio
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadInstructors(); 
  }
loadInstructors(): void {
  this.loadingInstructors = true;
  this.instructorService.obtenerInstructores().subscribe({
    next: (instructores: any[]) => {
      this.instructors = instructores.map(i => ({
        _id: i._id || i.id || '',
        nombre: i.nombre || i.name || 'Sin nombre',
        apellido: i.apellido || i.lastName || '',
        especialidad: i.especialidad || i.specialty || 'Sin especialidad',
        email: i.email || '',
        telefono: i.telefono || '',
        fechaContratacion: i.fechaContratacion || new Date(),
        horario: i.horario || '',
        activo: i.activo !== false
      } as Instructor)); // Casting a tipo Instructor
      
      console.log('Instructores cargados:', this.instructors);
      this.loadingInstructors = false;
    },
    error: (error) => {
      console.error('Error loading instructors:', error);
      this.loadingInstructors = false;
    }
  });
}
isFormValid(): boolean {
  return !!this.newClass.name && 
         !!this.newClass.classDate && 
         !!this.newClass.classTime && 
         (this.newClass.duration ?? 0) >= 15 && 
         (this.newClass.maxParticipants ?? 0) >= 1;
}
onSubmit(): void {
  if (!this.isFormValid() || !this.newClass.classDate || !this.newClass.classTime) return;

  this.isLoading = true;
  
  // Combinar fecha y hora
  const [year, month, day] = this.newClass.classDate.split('-');
  const [hours, minutes] = this.newClass.classTime.split(':');
  
  const startDate = new Date(
    parseInt(year, 10),
    parseInt(month, 10) - 1, // Los meses en JS son 0-indexed
    parseInt(day, 10),
    parseInt(hours, 10),
    parseInt(minutes, 10)
  );

  // Crear objeto para enviar al backend
  const classToCreate = {
    name: this.newClass.name,
    description: this.newClass.description,
    startDate: startDate.toISOString(),
    duration: this.newClass.duration,
    trainer: this.newClass.trainer,
    maxParticipants: this.newClass.maxParticipants,
    difficulty: 'Intermedio',
    status: 'available',
    active: this.newClass.active
  };

  console.log('Datos a enviar:', classToCreate);

  this.classService.createClass(classToCreate as Class).subscribe({
    next: () => {
      this.snackBar.open('Clase creada exitosamente', 'Cerrar', { duration: 3000 });
      this.router.navigate(['/admin/classes']);
    },
    error: (error: any) => {
      console.error('Error creating class:', error);
      this.isLoading = false;
      const errorMessage = error.error?.message || 
                         error.message || 
                         'Error al crear clase';
      this.snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
    }
  });
}
  onCancel(): void {
    this.router.navigate(['/admin/classes']);
  }
}