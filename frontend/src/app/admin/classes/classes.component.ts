import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { ClassService } from '../../services/class.service';
import { Class } from '../../models/class.model';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HttpErrorResponse } from '@angular/common/http';
// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../../../src/app/auth/auth.service';
@Component({
  selector: 'app-classes',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressBarModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSelectModule
  ],
  templateUrl: './classes.component.html',
  styleUrls: ['./classes.component.css']
})
export class ClassesComponent implements OnInit {
  // Inyección de dependencias usando inject()
  private classService = inject(ClassService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  dataSource = new MatTableDataSource<Class>();
  isLoading = true;
  displayedColumns: string[] = ['name', 'startDate', 'duration', 'maxParticipants', 'actions'];
  showForm = false;
  upcomingClasses: Class[] = [];
  availableClasses: Class[] = [];
  
  newClass: Partial<Class> = {
    name: '',
    description: '',

    duration: 60,
    trainer: undefined,
    maxParticipants: 15,
    active: true
  };
  
  trainers: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
confirmDelete(cls: Class): void {
  if (!cls.id) {
    this.showError('No se puede eliminar: ID de clase no válido');
    return;
  }

  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    width: '350px',
    data: {
      title: 'Confirmar eliminación',
      message: `¿Estás seguro que quieres eliminar la clase ${cls.name}?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.deleteClass(cls.id);
    }
  });
}

  ngOnInit(): void {
    this.loadClasses();
  }

ngAfterViewInit() {
  this.dataSource.paginator = this.paginator;
  this.dataSource.sort = this.sort;
  
  this.dataSource.sortingDataAccessor = (item, property) => {
    switch (property) {
      case 'startDate': 
        return new Date(item.startDate).getTime();
      default: 
        return item[property as keyof Class] as string;
    }
  };
}
loadClasses(): void {
  this.isLoading = true;
  
  this.classService.getUpcomingClasses().subscribe({
    next: (classes) => {
      console.log('Clases recibidas:', classes);
      this.dataSource.data = classes;
      this.isLoading = false;
      
      // Verifica los datos en la consola
      console.log('Datos en dataSource:', this.dataSource.data);
    },
    error: (error) => {
      console.error('Error detallado:', error);
      this.isLoading = false;
      
      let errorMessage = 'Error al cargar clases';
      if (error.error?.message) {
        errorMessage += `: ${error.error.message}`;
      } else if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      
      this.snackBar.open(errorMessage, 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      
      // Solo usar mocks en desarrollo
      if (!environment.production) {
        console.warn('Usando datos de prueba');
        this.dataSource.data = this.getMockClasses();
        this.showMockDataWarning();
      }
    }
  });
}
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  

    
private showMockDataWarning(): void {
  this.snackBar.open('Usando datos de prueba (modo desarrollo)', 'Cerrar', {
    duration: 5000,
    panelClass: ['warning-snackbar']
  });
}

private getMockClasses(): Class[] {
  return [{
    id: 'mock1',
    name: 'Yoga Inicial',
    description: 'Clase de introducción al yoga',
    startDate: new Date(Date.now() + 86400000), // Mañana
    duration: 60,
    instructor: 'Instructor Demo',
    maxParticipants: 15,
    currentParticipants: 5,
    status: 'available',
    difficulty: 'Principiante',
    active: true
  }, {
    id: 'mock2',
    name: 'Pilates Avanzado',
    description: 'Clase para estudiantes avanzados',
    startDate: new Date(Date.now() + 172800000), // En 2 días
    duration: 90,
    instructor: 'Instructor Demo',
    maxParticipants: 10,
    currentParticipants: 8,
    status: 'almost_full',
    difficulty: 'Avanzado',
    active: true
  }];
}
  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) { 
      this.resetForm();
    }
  }

  navigateToNewClass() {
    console.log('Intentando navegar a /admin/classes/new');
    this.router.navigate(['/admin/classes/new']).then(navigationResult => {
      console.log('Resultado de navegación:', navigationResult);
      if (!navigationResult) {
        console.error('La navegación falló');
        console.log('Rutas actuales:', this.router.config);
      }
    }).catch(error => {
      console.error('Error en navegación:', error);
    });
  }

  resetForm(): void {
    this.newClass = {
      name: '',
      description: '',

      duration: 60,
      trainer: undefined,
      maxParticipants: 15,
      active: true
    };
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    
    if (!this.newClass.name || !this.newClass.schedule) {
      this.snackBar.open('Nombre y horario son requeridos', 'Cerrar', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    this.classService.createClass(this.newClass as Class).subscribe({
      next: (response) => {
        this.snackBar.open('Clase creada exitosamente', 'Cerrar', { duration: 3000 });
        this.loadClasses();
        this.showForm = false;
        this.resetForm();
      },
      error: (error) => {
        console.error('Error creating class:', error);
        this.isLoading = false;
        this.snackBar.open('Error al crear clase', 'Cerrar', { duration: 3000 });
      }
    });
  }

  editClass(id: string): void {
    this.router.navigate([`/admin/classes/edit/${id}`]);
  }

deleteClass(id: string): void {
  if (!id) {
    this.showError('ID de clase no proporcionado');
    return;
  }

  this.classService.deleteClass(id).subscribe({
    next: () => {
      this.snackBar.open('Clase eliminada correctamente', 'Cerrar', { duration: 3000 });
      this.loadClasses();
    },
    error: (error) => {
      console.error('Error deleting class:', error);
      this.snackBar.open('Error al eliminar clase: ' + (error.error?.message || 'Error interno'), 'Cerrar', { duration: 5000 });
    }
  });
}

}