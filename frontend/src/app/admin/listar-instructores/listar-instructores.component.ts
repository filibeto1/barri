import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

// Angular Material Modules
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';

// Services and Models
import { InstructorService } from '../../services/instructor.service';
import { Instructor } from '../../models/instructor.model';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-listar-instructores',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    // Angular Material Modules
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatChipsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule
  ],
  templateUrl: './listar-instructores.component.html',
  styleUrls: ['./listar-instructores.component.css']
})
export class ListarInstructoresComponent implements OnInit {
  displayedColumns: string[] = ['nombreCompleto', 'especialidad', 'horario', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<Instructor>();
  isLoading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private instructorService: InstructorService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.cargarInstructores();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
cargarInstructores(): void {
  this.isLoading = true;
  this.instructorService.obtenerInstructores().subscribe({
    next: (response: any) => {
      console.log('Respuesta completa:', response);
      // Manejar ambos casos: respuesta con formato {data} o array directo
      const instructors = Array.isArray(response) ? response : 
                        (response.data || []);
      console.log('Instructores para la tabla:', instructors);
      this.dataSource.data = instructors;
      this.isLoading = false;
    },
    error: (error: any) => {
      console.error('Error completo:', error);
      this.isLoading = false;
      this.mostrarSnackbar(
        error.message || 'Error al cargar instructores', 
        'error'
      );
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

eliminarInstructor(id: string): void {
  if (!id) {
    this.mostrarSnackbar('Error: ID de instructor no válido', 'error');
    return;
  }

  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    data: { titulo: 'Confirmar eliminación', mensaje: '¿Está seguro de eliminar este instructor?' }
  });

  dialogRef.afterClosed().subscribe((result: boolean) => {
    if (result) {
      this.isLoading = true; // Mostrar spinner durante la operación
      this.instructorService.eliminarInstructor(id).subscribe({
        next: () => {
          this.mostrarSnackbar('Instructor eliminado correctamente', 'success');
          // Filtra localmente en lugar de recargar
          this.dataSource.data = this.dataSource.data.filter(i => i._id !== id);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error completo al eliminar:', error);
          this.isLoading = false;
          
          let errorMessage = 'Error al eliminar instructor';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.status === 404) {
            errorMessage = 'Instructor no encontrado';
          } else if (error.status === 500) {
            errorMessage = 'Error en el servidor. Por favor, intente más tarde.';
          } else if (error.status === 400) {
            errorMessage = 'No se puede eliminar el instructor porque tiene datos asociados';
          }
          
          this.mostrarSnackbar(errorMessage, 'error');
        }
      });
    }
  });
}
  

  private mostrarSnackbar(mensaje: string, tipo: 'success' | 'error'): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: [`snackbar-${tipo}`]
    });
  }
}