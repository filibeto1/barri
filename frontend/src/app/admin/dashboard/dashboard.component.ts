import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  // Datos para las clases (pueden venir de un servicio)
  upcomingClasses = [
    {
      time: '08:00',
      name: 'CrossFit Advanced',
      location: 'Sala 3',
      trainer: 'Coach Martínez',
      trainerImage: 'https://images.pexels.com/photos/1229356/pexels-photo-1229356.jpeg'
    },
    {
      time: '09:30',
      name: 'Spinning Intervals',
      location: 'Sala Cardio',
      trainer: 'Coach Rodríguez',
      trainerImage: 'https://i.pinimg.com/736x/1d/bc/ef/1dbcef30ca20a90b82c60490804de803.jpg'
    },
    {
      time: '12:00',
      name: 'Yoga Power',
      location: 'Sala Mind',
      trainer: 'Coach García',
      trainerImage: 'https://media.gq.com.mx/photos/625db17471f363f634bce022/16:9/w_2560%2Cc_limit/ejercicio-1388957838.jpg'
    },
    {
      time: '18:00',
      name: 'HIIT Training',
      location: 'Sala Functional',
      trainer: 'Coach López',
      trainerImage: 'https://static.vecteezy.com/system/resources/previews/017/504/043/non_2x/bodybuilding-emblem-and-gym-logo-design-template-vector.jpg'
    }
  ];
}