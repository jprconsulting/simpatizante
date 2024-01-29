import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Seccion } from 'src/app/models/seccion';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SeccionService {
  route = `${environment.apiUrl}/secciones`;

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<Seccion[]>(`${this.route}/obtener-todos`);
  }
  getById(id: number) {
    return this.http.get<Seccion>(`${this.route}/obtener-por-id/${id}`);
  }
}
