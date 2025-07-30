// unauthorized.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-unauthorized',
  template: `
    <h1>Acceso no autorizado</h1>
    <p>No tienes permisos para acceder a esta página.</p>
    <a routerLink="/login">Volver al login</a>
  `,
  styles: []
})
export class UnauthorizedComponent {}