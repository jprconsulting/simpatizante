import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Genero } from 'src/app/models/genero';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeneroService {
  route = `${environment.apiUrl}/genero`;

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<Genero[]>(`${this.route}/obtener-todos`);
  }
}
