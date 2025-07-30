import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserGuard } from '../auth/user.guard';
import { UserLayoutComponent } from './layout/user-layout.component';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    RouterModule.forChild([
      {
        path: '',
        component: UserLayoutComponent,
        canActivate: [UserGuard],
        children: [
          { 
            path: 'dashboard',
            loadComponent: () => import('./dashboard/user-dashboard.component').then(m => m.UserDashboardComponent)
          },
      {
        path: 'classes',
        loadComponent: () => import('./classes/user-classes/user-classes.component').then(m => m.UserClassesComponent)
      },
          {
            path: 'trainers',
            loadComponent: () => import('./trainers/user-trainers.component').then(m => m.UserTrainersComponent)
          },
          {
            path: 'profile',
            loadComponent: () => import('./profile/user-profile.component').then(m => m.UserProfileComponent)
          },
          {
            path: 'payments',
            loadComponent: () => import('./payments/user-payments.component').then(m => m.UserPaymentsComponent)
          },
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
      }
    ])
  ]
})
export class UserModule { }