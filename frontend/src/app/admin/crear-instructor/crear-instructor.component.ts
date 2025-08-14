import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InstructorService } from '../../services/instructor.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Instructor, HORARIOS_DISPONIBLES, ESPECIALIDADES } from '../../models/instructor.model';
 
// Importaciones de Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-crear-instructor',
  standalone: true,
  templateUrl: './crear-instructor.component.html',
  styleUrls: ['./crear-instructor.component.css'],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatNativeDateModule,
    MatProgressSpinnerModule
  ]
})
export class CrearInstructorComponent implements OnInit {
  instructorForm: FormGroup;
  isLoading = false;
  horarios = HORARIOS_DISPONIBLES;
  especialidades = ESPECIALIDADES;
  maxDate = new Date();
  modoEdicion = false;
  instructorId: string | null = null;
  pageTitle = 'Crear Instructor';

  // 🔧 REEMPLAZA estos getters en tu componente TypeScript

// Getters mejorados que manejan casos null/undefined
get nombre() { 
  return this.instructorForm ? this.instructorForm.get('nombre') : null; 
}

get apellido() { 
  return this.instructorForm ? this.instructorForm.get('apellido') : null; 
}

get email() { 
  return this.instructorForm ? this.instructorForm.get('email') : null; 
}

get telefono() { 
  return this.instructorForm ? this.instructorForm.get('telefono') : null; 
}

get especialidad() { 
  return this.instructorForm ? this.instructorForm.get('especialidad') : null; 
}

get fechaContratacion() { 
  return this.instructorForm ? this.instructorForm.get('fechaContratacion') : null; 
}

get horario() { 
  return this.instructorForm ? this.instructorForm.get('horario') : null; 
}

get experiencia() { 
  return this.instructorForm ? this.instructorForm.get('experiencia') : null; 
}

get certificaciones() { 
  return this.instructorForm ? this.instructorForm.get('certificaciones') : null; 
}

get activo() { 
  return this.instructorForm ? this.instructorForm.get('activo') : null; 
}
  constructor(
    private fb: FormBuilder,
    private instructorService: InstructorService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.instructorForm = this.createForm();
  }

  ngOnInit(): void {
    console.log('🚀 Inicializando CrearInstructorComponent');
    
    // Verificar si estamos en modo edición
    this.instructorId = this.route.snapshot.paramMap.get('id');
    this.modoEdicion = !!this.instructorId;
    this.pageTitle = this.modoEdicion ? 'Editar Instructor' : 'Crear Instructor';
    
    console.log('📝 Modo edición:', this.modoEdicion, 'ID:', this.instructorId);

    if (this.modoEdicion && this.instructorId) {
      this.cargarInstructorParaEditar(this.instructorId);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      apellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      especialidad: ['', Validators.required],
      fechaContratacion: [new Date(), [Validators.required]],
      horario: ['', Validators.required],
      experiencia: [0, [Validators.min(0), Validators.max(50)]],
      certificaciones: [''],
      activo: [true]
    });
  }

  cargarInstructorParaEditar(id: string): void {
    console.log('📥 Cargando instructor para editar:', id);
    this.isLoading = true;
    
    this.instructorService.obtenerInstructor(id).subscribe({
      next: (instructor: Instructor) => {
        console.log('✅ Instructor cargado:', instructor);
        
        this.instructorForm.patchValue({
          nombre: instructor.nombre,
          apellido: instructor.apellido,
          email: instructor.email,
          telefono: instructor.telefono,
          especialidad: instructor.especialidad,
          fechaContratacion: new Date(instructor.fechaContratacion),
          horario: instructor.horario,
          experiencia: instructor.experiencia || 0,
          certificaciones: instructor.certificaciones || '',
          activo: instructor.activo
        });
        
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('❌ Error al cargar instructor:', error);
        this.isLoading = false;
        this.mostrarSnackbar('Error al cargar instructor: ' + error.message, 'error');
        this.router.navigate(['/admin/instructores']);
      }
    });
  }

onSubmit(): void {
  if (this.instructorForm.invalid) {
    this.markFormGroupTouched();
    this.mostrarSnackbar('Por favor, complete todos los campos requeridos', 'error');
    return;
  }

  // 🔧 AGREGAR: Activar loading al iniciar el proceso
  this.isLoading = true;

  // Preparar datos del instructor
  const instructorData: Instructor = {
    ...this.instructorForm.value,
    fechaContratacion: this.instructorForm.value.fechaContratacion.toISOString()
  };

  console.log('💾 Datos a enviar:', JSON.stringify(instructorData, null, 2));
  console.log('💾 Guardando instructor:', instructorData);

  const operation = this.modoEdicion && this.instructorId
    ? this.instructorService.actualizarInstructor(this.instructorId, instructorData)
    : this.instructorService.crearInstructor(instructorData);

  operation.subscribe({
    next: (instructor) => {
      console.log('✅ Instructor guardado exitosamente:', instructor);
      this.isLoading = false; // ✅ Desactivar loading en éxito
      const mensaje = this.modoEdicion ? 'Instructor actualizado correctamente' : 'Instructor creado correctamente';
      this.mostrarSnackbar(mensaje, 'success');
      this.router.navigate(['/admin/instructores']);
    },
    error: (error: any) => {
      console.error('❌ Error al guardar instructor:', error);
      this.isLoading = false; // ✅ Desactivar loading en error
      this.mostrarSnackbar(error.message || 'Error al guardar instructor', 'error');
    }
  });
}

  cancelar(): void {
    if (this.instructorForm.dirty) {
      const confirmar = confirm('¿Estás seguro de que quieres cancelar? Los cambios no guardados se perderán.');
      if (!confirmar) {
        return;
      }
    }
    this.router.navigate(['/admin/instructores']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.instructorForm.controls).forEach(key => {
      const control = this.instructorForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  hasError(field: string, errorType: string): boolean {
    const control = this.instructorForm.get(field);
    return !!(control && control.hasError(errorType) && control.touched);
  }

  getErrorMessage(field: string): string {
    const control = this.instructorForm.get(field);
    if (control && control.errors && control.touched) {
      if (control.errors['required']) return `${this.getFieldName(field)} es requerido`;
      if (control.errors['email']) return 'Email no válido';
      if (control.errors['minlength']) return `${this.getFieldName(field)} debe tener al menos ${control.errors['minlength'].requiredLength} caracteres`;
      if (control.errors['maxlength']) return `${this.getFieldName(field)} no puede tener más de ${control.errors['maxlength'].requiredLength} caracteres`;
      if (control.errors['pattern']) return 'Formato no válido (debe tener 10 dígitos)';
      if (control.errors['min']) return `El valor debe ser mayor o igual a ${control.errors['min'].min}`;
      if (control.errors['max']) return `El valor debe ser menor o igual a ${control.errors['max'].max}`;
    }
    return '';
  }

  private getFieldName(field: string): string {
    const fieldNames: { [key: string]: string } = {
      nombre: 'Nombre',
      apellido: 'Apellido',
      email: 'Email',
      telefono: 'Teléfono',
      especialidad: 'Especialidad',
      fechaContratacion: 'Fecha de contratación',
      horario: 'Horario',
      experiencia: 'Experiencia',
      certificaciones: 'Certificaciones'
    };
    return fieldNames[field] || field;
  }

  private mostrarSnackbar(mensaje: string, tipo: 'success' | 'error'): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 4000,
      panelClass: [`snackbar-${tipo}`],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}