
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Casillas } from 'src/app/models/casillas';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CasillasService {
  route = `${environment.apiUrl}/casillas`;

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<Casillas[]>(`${this.route}/obtener-todos`);
  }
}