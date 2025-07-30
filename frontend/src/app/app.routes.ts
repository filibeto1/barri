import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { roleGuard } from './auth/role.guard';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { UnauthorizedComponent } from './shared/unauthorized/unauthorized.component';
import { AdminComponent } from './admin/admin.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'admin' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
{
  path: 'classes',
  children: [
    { 
      path: '', 
      loadComponent: () =>
        import('./admin/classes/classes.component').then(m => m.ClassesComponent)
    },
    { 
      path: 'new',
      loadComponent: () =>
        import('./admin/classes/new-class/new-class.component').then(m => m.NewClassComponent)
    },
    {
      path: 'edit/:id',
      loadComponent: () =>
        import('./admin/classes/edit-class/edit-class.component').then(m => m.EditClassComponent)
    }
  ]
},
      {
        path: 'crear-instructor',
        loadComponent: () =>
          import('./admin/crear-instructor/crear-instructor.component').then(m => m.CrearInstructorComponent)
      },
      {
        path: 'instructores',
        loadChildren: () =>
          import('./admin/instructores/instructores.module').then(m => m.InstructoresModule)
      },
      {
        path: 'listar-instructores',
        loadComponent: () =>
          import('./admin/listar-instructores/listar-instructores.component').then(m => m.ListarInstructoresComponent)
      },
      {
        path: 'members',
        loadComponent: () =>
          import('./admin/members/members.component').then(m => m.MembersComponent)
      },
      {
        path: 'payments',
        loadComponent: () =>
          import('./admin/payments/payments.component').then(m => m.PaymentsComponent)
      }
    ]
  },
  // Rutas completas para usuarios normales
  {
    path: 'user',
    canActivate: [authGuard],
    loadComponent: () => import('./user/layout/user-layout.component').then(m => m.UserLayoutComponent),
    children: [
      { 
        path: 'dashboard', 
        loadComponent: () => 
          import('./user/dashboard/user-dashboard.component').then(m => m.UserDashboardComponent) 
      },

      {
        path: 'trainers',
        loadComponent: () =>
          import('./user/trainers/user-trainers.component').then(m => m.UserTrainersComponent)
      },
      // Nueva ruta para el componente de videos
      {
        path: 'videos',
        loadComponent: () =>
          import('./user/videos/videos.component').then(m => m.VideosComponent)
      },
            {
        path: 'classes',
        loadComponent: () =>
          import('./user/classes/user-classes/user-classes.component').then(m => m.UserClassesComponent)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./user/profile/user-profile.component').then(m => m.UserProfileComponent)
      },
      {
        path: 'payments',
        loadComponent: () =>
          import('./user/payments/user-payments.component').then(m => m.UserPaymentsComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];