import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; // Importación adicional
import { ActivatedRoute, Router } from '@angular/router';
import { ClassService } from '../../../services/class.service';
import { InstructorService } from '../../../services/instructor.service';
import { Class } from '../../../models/class.model';
import { Instructor } from '../../../models/instructor.model';
import { MatSnackBar } from '@angular/material/snack-bar';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatError } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-class-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatOptionModule,
    MatError
  ],
  templateUrl: './class-form.component.html',
  styleUrls: ['./class-form.component.css']
})
export class ClassFormComponent implements OnInit {
  classForm: FormGroup;
  isEditMode = false;
  classId: string | null = null;
  instructors: Instructor[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private classService: ClassService,
    private instructorService: InstructorService,
    private snackBar: MatSnackBar
  ) {
    this.classForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      schedule: ['', Validators.required],
      duration: [60, [Validators.required, Validators.min(30)]],
      trainer: ['', Validators.required],
      maxParticipants: [10, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.loadInstructors();
    
    this.classId = this.route.snapshot.paramMap.get('id');
    if (this.classId) {
      this.isEditMode = true;
      this.loadClass(this.classId);
    }
  }

  loadInstructors(): void {
    this.instructorService.obtenerInstructores().subscribe({
      next: (instructors) => {
        this.instructors = instructors;
      },
      error: (error) => {
        console.error('Error loading instructors:', error);
      }
    });
  }

  loadClass(id: string): void {
    this.classService.getClass(id).subscribe({
      next: (cls) => {
        this.classForm.patchValue({
          name: cls.name,
          description: cls.description,
          schedule: cls.schedule,
          duration: cls.duration,
          trainer: cls.trainer,
          maxParticipants: cls.maxParticipants
        });
      },
      error: (error) => {
        console.error('Error loading class:', error);
        this.snackBar.open('Error al cargar la clase', 'Cerrar', { duration: 3000 });
      }
    });
  }

  onSubmit(): void {
    if (this.classForm.invalid) {
      return;
    }

    const classData = this.classForm.value;

    if (this.isEditMode && this.classId) {
      this.classService.updateClass(this.classId, classData).subscribe({
        next: () => {
          this.snackBar.open('Clase actualizada correctamente', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/admin/classes']);
        },
        error: (error) => {
          console.error('Error updating class:', error);
          this.snackBar.open('Error al actualizar la clase', 'Cerrar', { duration: 3000 });
        }
      });
    } else {
      this.classService.createClass(classData).subscribe({
        next: () => {
          this.snackBar.open('Clase creada correctamente', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/admin/classes']);
        },
        error: (error) => {
          console.error('Error creating class:', error);
          this.snackBar.open('Error al crear la clase', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }
}