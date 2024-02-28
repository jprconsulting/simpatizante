import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TipoAgrupaciones } from 'src/app/models/tipo-agrupaciones';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TipoAgrupacionesService {
  route = `${environment.apiUrl}/tipos-agrupaciones`;

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<TipoAgrupaciones[]>(`${this.route}/obtener-todos`);
  }
}
