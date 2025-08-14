import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Class } from '../../../../models/class.model';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-class-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './class-detail-dialog.component.html',
  styleUrls: ['./class-detail-dialog.component.scss']
})
export class ClassDetailDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { class: Class }) {}
}