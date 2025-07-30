import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
interface Payment {
  id: string;
  date: string;
  amount: number;
  method: string;
  status: 'completed' | 'pending' | 'failed';
  invoice: string;
}

@Component({
  selector: 'app-user-payments',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './user-payments.component.html',
  styleUrls: ['./user-payments.component.css']
})
export class UserPaymentsComponent {
  payments: Payment[] = [
    {
      id: 'PMT-78945',
      date: '15/07/2023',
      amount: 1200,
      method: 'Tarjeta Visa',
      status: 'completed',
      invoice: '#INV-2023-78945'
    },
    {
      id: 'PMT-78944',
      date: '15/06/2023',
      amount: 1200,
      method: 'Tarjeta Visa',
      status: 'completed',
      invoice: '#INV-2023-78944'
    },
    {
      id: 'PMT-78943',
      date: '15/05/2023',
      amount: 1100,
      method: 'Transferencia',
      status: 'completed',
      invoice: '#INV-2023-78943'
    },
    {
      id: 'PMT-78942',
      date: '15/04/2023',
      amount: 1100,
      method: 'Transferencia',
      status: 'completed',
      invoice: '#INV-2023-78942'
    },
    {
      id: 'PMT-78941',
      date: '15/03/2023',
      amount: 1000,
      method: 'Efectivo',
      status: 'completed',
      invoice: '#INV-2023-78941'
    }
  ];

  displayedColumns: string[] = ['id', 'date', 'amount', 'method', 'status', 'actions'];

  getStatusClass(status: string): string {
    switch(status) {
      case 'completed': return 'status-completed';
      case 'pending': return 'status-pending';
      case 'failed': return 'status-failed';
      default: return '';
    }
  }

  downloadInvoice(invoiceId: string): void {
    console.log('Descargando factura:', invoiceId);
    // Lógica para descargar factura
  }

  viewPaymentDetails(paymentId: string): void {
    console.log('Viendo detalles del pago:', paymentId);
    // Lógica para ver detalles
  }
}