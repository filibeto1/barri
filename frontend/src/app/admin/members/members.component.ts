// members.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GymService } from '../../services/gym.service';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule],
  template: `
    <div class="header">
      <h2>Gestión de Miembros</h2>
      <button mat-raised-button color="primary">
        <mat-icon>add</mat-icon> Nuevo Miembro
      </button>
    </div>
    
    <table mat-table [dataSource]="members">
      <!-- Columnas -->
      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef>Nombre</th>
        <td mat-cell *matCellDef="let member">{{member.name}}</td>
      </ng-container>
      
      <ng-container matColumnDef="email">
        <th mat-header-cell *matHeaderCellDef>Email</th>
        <td mat-cell *matCellDef="let member">{{member.email}}</td>
      </ng-container>
      
      <ng-container matColumnDef="membershipType">
        <th mat-header-cell *matHeaderCellDef>Tipo de Membresía</th>
        <td mat-cell *matCellDef="let member">{{member.membershipType}}</td>
      </ng-container>
      
      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef>Acciones</th>
        <td mat-cell *matCellDef="let member">
          <button mat-icon-button color="primary">
            <mat-icon>edit</mat-icon>
          </button>
          <button mat-icon-button color="warn">
            <mat-icon>delete</mat-icon>
          </button>
        </td>
      </ng-container>
      
      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
    </table>
  `,
  styles: [`
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    
    table {
      width: 100%;
    }
  `]
})
// ... (el resto del código se mantiene igual)
export class MembersComponent implements OnInit {
  members: any[] = []; // Cambiar 'Object' por 'any[]' para el tipado correcto
  displayedColumns = ['name', 'email', 'membershipType', 'actions'];

  constructor(private gymService: GymService) {}

  ngOnInit() {
    this.loadMembers();
  }

  loadMembers() {
    this.gymService.getMembers().subscribe({
      next: (data: any) => this.members = data, // Especificar tipo 'any' para los datos
      error: (err) => console.error('Error loading members', err)
    });
  }
}