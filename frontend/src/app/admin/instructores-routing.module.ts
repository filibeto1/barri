import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListarInstructoresComponent } from './listar-instructores/listar-instructores.component';
import { CrearInstructorComponent } from './crear-instructor/crear-instructor.component';

const routes: Routes = [
  { path: '', component: ListarInstructoresComponent },
  { path: 'crear', component: CrearInstructorComponent },
  { path: 'editar/:id', component: CrearInstructorComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InstructoresRoutingModule { }