import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-container">
      <h2>Mi Perfil</h2>
      
      <div class="profile-section">
        <h3>Información Básica</h3>
        <div class="profile-info">
          <div class="info-item">
            <label>Nombre:</label>
            <span>{{ user.name }}</span>
          </div>
          <div class="info-item">
            <label>Email:</label>
            <span>{{ user.email }}</span>
          </div>
          <div class="info-item">
            <label>Teléfono:</label>
            <span>{{ user.phone || 'No proporcionado' }}</span>
          </div>
        </div>
      </div>

      <div class="profile-section">
        <h3>Actualizar Información</h3>
        <form (ngSubmit)="onSubmit()" class="profile-form">
          <div class="form-group">
            <label for="name">Nombre:</label>
            <input type="text" id="name" [(ngModel)]="editUser.name" name="name">
          </div>
          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" [(ngModel)]="editUser.email" name="email">
          </div>
          <div class="form-group">
            <label for="phone">Teléfono:</label>
            <input type="tel" id="phone" [(ngModel)]="editUser.phone" name="phone">
          </div>
          <button type="submit" class="save-button">Guardar Cambios</button>
        </form>
      </div>

      <div class="profile-section" *ngIf="user.membership">
        <h3>Membresía</h3>
        <p>Tipo: {{ user.membership.type }}</p>
        <p>Válida hasta: {{ user.membership.expiry | date }}</p>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      font-family: Arial, sans-serif;
    }
    
    .profile-section {
      margin-bottom: 30px;
      padding: 20px;
      border: 1px solid #eee;
      border-radius: 8px;
      background-color: #f9f9f9;
    }
    
    .profile-info {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 15px;
    }
    
    .info-item {
      display: contents;
    }
    
    .info-item label {
      font-weight: bold;
    }
    
    .form-group {
      margin-bottom: 15px;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    
    .form-group input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .save-button {
      background-color: #4CAF50;
      color: white;
      padding: 10px 15px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }
    
    .save-button:hover {
      background-color: #45a049;
    }
  `]
})
export class UserProfileComponent implements OnInit {
  user: any = {
    name: 'Usuario Ejemplo',
    email: 'usuario@example.com',
    phone: '',
    membership: {
      type: 'Premium',
      expiry: new Date(2024, 11, 31)
    }
  };

  editUser: any = {};

  ngOnInit() {
    // Inicializar los datos de edición con los datos actuales del usuario
    this.editUser = { ...this.user };
  }

  onSubmit() {
    // Actualizar los datos del usuario con los datos editados
    this.user = { ...this.editUser };
    // Aquí normalmente harías una llamada HTTP para guardar los cambios en el servidor
    console.log('Datos actualizados:', this.user);
    alert('Perfil actualizado correctamente');
  }
}