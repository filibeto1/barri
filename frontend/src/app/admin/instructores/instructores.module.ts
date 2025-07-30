import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ListarInstructoresComponent } from '../listar-instructores/listar-instructores.component';
import { CrearInstructorComponent } from '../crear-instructor/crear-instructor.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

const routes = [
  { path: '', component: ListarInstructoresComponent },
  { path: 'crear', component: CrearInstructorComponent },
  { path: 'editar/:id', component: CrearInstructorComponent }
];

@NgModule({

  imports: [
    CommonModule,
    ListarInstructoresComponent,
    RouterModule.forChild(routes),
    // Angular Material Modules
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ]
})
export class InstructoresModule { }