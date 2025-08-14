import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GymService {
  private apiUrl = `${environment.apiUrl}/gym`;

  constructor(private http: HttpClient) {}

  getMembers() {
    return this.http.get(`${this.apiUrl}/members`);
  }

  addMember(member: any) {
    return this.http.post(`${this.apiUrl}/members`, member);
  }

  getClasses() {
    return this.http.get(`${this.apiUrl}/classes`);
  }

  // Más métodos según necesidades...
}