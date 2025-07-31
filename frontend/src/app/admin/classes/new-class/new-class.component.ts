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

  // Solución para el error de tipo con trainer
  newClass: Omit<Partial<Class>, 'trainer'> & { trainer: string | null } = {
    name: '',
    description: '',
    schedule: '',
    duration: 60,
    trainer: null, // Ahora acepta null
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
           !!this.newClass.schedule && 
           (this.newClass.duration ?? 0) >= 15 && 
           (this.newClass.maxParticipants ?? 0) >= 1;
  }

onSubmit(): void {
  if (!this.isFormValid() || !this.newClass.schedule) return;

  this.isLoading = true;
  
  // Convertir schedule a startDate (asumiendo que schedule es una hora como "HH:MM")
  const [hours, minutes] = this.newClass.schedule.split(':');
  const startDate = new Date();
  startDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

  // Crear objeto que coincida exactamente con el modelo del backend
  const classToCreate = {
    name: this.newClass.name,
    description: this.newClass.description,
    startDate: startDate.toISOString(), // Fecha en formato ISO
    duration: this.newClass.duration,
    trainer: this.newClass.trainer, // Debe ser un ID válido de instructor
    maxParticipants: this.newClass.maxParticipants,
    difficulty: 'Intermedio', // Valor por defecto según el modelo
    status: 'available', // Valor por defecto según el modelo
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