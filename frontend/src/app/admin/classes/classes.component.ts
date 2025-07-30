import { Component, OnInit, ViewChild } from '@angular/core';
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
  dataSource = new MatTableDataSource<Class>();
  isLoading = true;
  displayedColumns: string[] = ['name', 'schedule', 'duration', 'trainer', 'maxParticipants', 'actions'];
  showForm = false;
  upcomingClasses: Class[] = []; // Propiedad añadida
  availableClasses: Class[] = []; // Propiedad añadida
  
  newClass: Partial<Class> = {
    name: '',
    description: '',
    schedule: '',
    duration: 60,
    trainer: undefined,
    maxParticipants: 15,
    active: true
  };
  
  trainers: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private classService: ClassService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}
    private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
  confirmDelete(cls: any): void {
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
        this.deleteClass(cls._id);
      }
    });
  }

  ngOnInit(): void {
    this.loadClasses();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

loadClasses(): void {
  this.isLoading = true;
  
  this.classService.getUpcomingClasses().subscribe({
    next: (classes: Class[]) => {
      this.upcomingClasses = classes;
      this.isLoading = false;
    },
    error: (err: HttpErrorResponse) => {
      console.error('Error al cargar clases próximas:', err);
      const errorMessage = err.error?.message || 'Error al cargar tus clases reservadas';
      this.showError(errorMessage);
      this.isLoading = false;
    }
  });

   this.classService.getAvailableClasses().subscribe({
    next: (classes: Class[]) => {
      this.availableClasses = classes;
      this.dataSource.data = classes;
    },
    error: (err: HttpErrorResponse) => {
      console.error('Error al cargar clases disponibles:', err);
      const errorMessage = err.error?.message || 'Error al cargar clases disponibles';
      this.showError(errorMessage);
    }
  });
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
      // Verifica las rutas disponibles
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
      schedule: '',
      duration: 60,
      trainer: undefined,
      maxParticipants: 15,
      active: true
    };
  }

// Cambia el método onSubmit para prevenir el comportamiento por defecto del formulario
onSubmit(event: Event): void {
  event.preventDefault(); // Previene la recarga de la página
  
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
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Confirmar eliminación', message: '¿Estás seguro de eliminar esta clase?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.classService.deleteClass(id).subscribe({
          next: () => {
            this.snackBar.open('Clase eliminada correctamente', 'Cerrar', { duration: 3000 });
            this.loadClasses();
          },
          error: (error) => {
            console.error('Error deleting class:', error);
            this.snackBar.open('Error al eliminar clase', 'Cerrar', { duration: 3000 });
          }
        });
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
}