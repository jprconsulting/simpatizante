import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Estado } from 'src/app/models/estados';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EstadoService {
  route = `${environment.apiUrl}/estados`;

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<Estado[]>(`${this.route}/obtener-todos`);
  }
}
