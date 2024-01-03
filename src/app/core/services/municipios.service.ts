import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Municipio } from 'src/app/models/municipio';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MunicipiosService {
  route = `${environment.apiUrl}/municipios`;

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<Municipio[]>(`${this.route}/obtener-todos`);
  }
}
