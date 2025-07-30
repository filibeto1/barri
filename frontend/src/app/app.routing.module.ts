import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { AdminComponent } from './admin/admin.component';
import { authGuard } from './auth/auth.guard';
import { roleGuard } from './auth/role.guard';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { ClassesComponent } from './admin/classes/classes.component';
import { ClassFormComponent } from './admin/classes/class-form/class-form.component';
import { CrearInstructorComponent } from './admin/crear-instructor/crear-instructor.component';
import { UserGuard } from './auth/user.guard';

const routes: Routes = [
  { 
    path: 'login', 
    component: LoginComponent
  },
  
  { 
    path: 'admin', 
    component: AdminComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'admin' },
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'classes', component: ClassesComponent },
      { path: 'classes/new', component: ClassFormComponent },
      { path: 'crear-instructor', component: CrearInstructorComponent },
      { path: 'instructores/editar/:id', component: CrearInstructorComponent },
      { path: 'instructores/crear', component: CrearInstructorComponent },
      {  
        path: 'instructores', 
        loadChildren: () => import('./admin/instructores/instructores.module').then(m => m.InstructoresModule)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { 
    path: 'user',
    loadChildren: () => import('./user/user.module').then(m => m.UserModule),
    canActivate: [authGuard, UserGuard] // Añade UserGuard aquí
  },
  { 
    path: 'dashboard', 
    redirectTo: 'user/dashboard', // Redirige al dashboard de usuario
    pathMatch: 'full'
  },
  { 
    path: '', 
    redirectTo: 'dashboard', 
    pathMatch: 'full' 
  },
  { 
    path: '**', 
    redirectTo: 'login' 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
