import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatButtonModule,MatIconModule],
  template: `
    <div class="header">
      <h2>Gestión de Pagos</h2>
      <button mat-raised-button color="primary">
        <mat-icon>add</mat-icon> Nuevo Pago
      </button>
    </div>
    
    <mat-card>
      <mat-card-content>
        <p>Listado de pagos aparecerá aquí</p>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
  `]
})
export class PaymentsComponent {}