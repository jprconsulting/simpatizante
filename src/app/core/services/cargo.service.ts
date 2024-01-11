import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {  Cargo } from 'src/app/models/cargo';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CargoService {
  route = `${environment.apiUrl}/cargos`;

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<Cargo[]>(`${this.route}/obtener-todos`);
  }
}
