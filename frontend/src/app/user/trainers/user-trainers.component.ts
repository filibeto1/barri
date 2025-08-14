import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { InstructorService } from '../../services/instructor.service';
import { Instructor } from '../../models/instructor.model';

@Component({
  selector: 'app-user-trainers',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './user-trainers.component.html',
  styleUrls: ['./user-trainers.component.css']
})
export class UserTrainersComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['nombreCompleto', 'especialidad', 'horario', 'contacto'];
  dataSource = new MatTableDataSource<Instructor>();
  isLoading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private instructorService: InstructorService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadTrainers();
  }
ngAfterViewInit() {
  this.dataSource.paginator = this.paginator;
  this.dataSource.sort = this.sort;
  
  this.dataSource.sortingDataAccessor = (item: Instructor, property: string): string | number => {
    switch (property) {
      case 'horario': 
        if (Array.isArray(item.horario)) {
          return item.horario[0]?.horaInicio || '';
        } else if (typeof item.horario === 'string') {
          return item.horario;
        }
        return '';
      case 'nombreCompleto':
        return `${item.nombre} ${item.apellido}`;
      case 'especialidad':
        return Array.isArray(item.especialidad) ? 
          item.especialidad.join(', ') : 
          item.especialidad || '';
      case 'contacto':
        return item.email || item.telefono || '';
      default:
        const value = item[property as keyof Instructor];
        if (typeof value === 'string' || typeof value === 'number') {
          return value;
        }
        return '';
    }
  };
}

  loadTrainers(): void {
    this.isLoading = true;
    this.instructorService.obtenerInstructores().subscribe({
      next: (instructores) => {
        this.dataSource.data = this.processTrainerData(instructores);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar instructores:', err);
        this.showError('Error al cargar los instructores');
        this.isLoading = false;
        this.dataSource.data = [];
      }
    });
  }

private processTrainerData(trainers: Instructor[]): any[] {
  return trainers.map(trainer => {
    const horarios = this.formatSchedules(trainer.horario);
    return {
      ...trainer,
      especialidades: Array.isArray(trainer.especialidad) ? 
        trainer.especialidad : 
        [trainer.especialidad].filter(Boolean),
      horarios: horarios,
      // Propiedad calculada para mostrar en la tabla
      horarioDisplay: horarios.map(h => `${h.dias}: ${h.horaInicio} - ${h.horaFin}`).join('\n')
    };
  });
}

private formatSchedules(schedule: string | any[]): any[] {
  if (!schedule) return [];
  
  // Si ya es un array, devolverlo directamente
  if (Array.isArray(schedule)) {
    return schedule;
  }
  
  // Si es string, intentar parsearlo
  if (typeof schedule === 'string') {
    try {
      const parsed = JSON.parse(schedule);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      console.warn('No se pudo parsear el horario:', schedule);
      // Formato alternativo para strings no JSON
      if (schedule.includes(':')) {
        const [dias, horas] = schedule.split(':');
        const [horaInicio, horaFin] = horas.split('-').map(h => h.trim());
        return [{ dias: dias.trim(), horaInicio, horaFin }];
      }
    }
  }
  
  // Valor por defecto si no se puede procesar
  return [{ dias: 'L-V', horaInicio: '09:00', horaFin: '18:00' }];
}
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getColorForSpecialty(specialty: string): string {
    const colors: Record<string, string> = {
      'Yoga': '#8BC34A',
      'Crossfit': '#FF5722',
      'Pilates': '#9C27B0',
      'Spinning': '#3F51B5',
      'Boxeo': '#F44336',
      'Musculación': '#607D8B'
    };
    return colors[specialty] || '#2196F3';
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}