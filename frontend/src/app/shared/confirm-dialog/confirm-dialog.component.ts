import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dialog-container">
      <div mat-dialog-title class="dialog-header">
        <mat-icon class="warning-icon" color="warn">warning</mat-icon>
        <h2>{{ data.titulo || 'Confirmar acción' }}</h2>
      </div>

      <mat-dialog-content class="dialog-content">
        <p>{{ data.mensaje }}</p>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-stroked-button [mat-dialog-close]="false" color="primary">
          <mat-icon>cancel</mat-icon>
          {{ data.cancelText || 'Cancelar' }}
        </button>
        <button mat-raised-button [mat-dialog-close]="true" color="warn" cdkFocusInitial>
          <mat-icon>check_circle</mat-icon>
          {{ data.confirmText || 'Confirmar' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 16px;
      max-width: 400px;
    }
    
    .dialog-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }
    
    .warning-icon {
      margin-right: 8px;
    }
    
    .dialog-content {
      margin: 16px 0;
      font-size: 16px;
      line-height: 1.5;
    }
    
    .dialog-actions {
      padding: 16px 0 0 0;
      gap: 8px;
      
      button {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      titulo?: string;
      mensaje: string;
      confirmText?: string;
      cancelText?: string;
    }
  ) {}
}