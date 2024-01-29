import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Indicadores } from 'src/app/models/indicadores';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class IndicadoresService {
  route = `${environment.apiUrl}/tipos-incidencias`;

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<Indicadores[]>(`${this.route}/obtener-todos`);
  }
}
