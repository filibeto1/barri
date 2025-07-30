import { Component, OnInit } from '@angular/core';
import { ClassService } from '../../../services/class.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Class } from '../../../models/class.model';
import { RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ClassDetailDialogComponent } from './class-detail-dialog/class-detail-dialog.component';

@Component({
  selector: 'app-user-classes',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule,
    RouterModule,
    MatDialogModule
  ],
  templateUrl: './user-classes.component.html',
  styleUrls: ['./user-classes.component.css'],
  providers: [DatePipe] 
})
export class UserClassesComponent implements OnInit {
  classes: Class[] = [];
  isLoading = true;
  error: string | null = null;
  displayedColumns: string[] = ['name', 'instructor', 'date', 'time', 'difficulty', 'actions'];

  constructor(
    private classService: ClassService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.loadClasses();
  }

  loadClasses(): void {
    this.isLoading = true;
    this.error = null;

    this.classService.getAvailableClasses().subscribe({
      next: (classes) => {
        this.classes = classes;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = typeof err === 'string' ? err : 'Error al cargar las clases';
        this.isLoading = false;
        this.showError(this.error);
      }
    });
  }

  showClassDetails(cls: Class): void {
    this.dialog.open(ClassDetailDialogComponent, {
      width: '600px',
      data: { class: cls }
    });
  }

  joinClass(classId: string): void {
    this.classService.bookClass(classId).subscribe({
      next: () => {
        this.snackBar.open('Te has unido a la clase exitosamente', 'Cerrar', {
          duration: 3000
        });
        this.loadClasses(); // Recargar la lista
      },
      error: (err) => {
        this.showError(typeof err === 'string' ? err : 'Error al unirse a la clase');
      }
    });
  }

formatDate(date: Date | string | undefined): string {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return this.datePipe.transform(dateObj, 'dd/MM/yyyy') || '';
}

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}