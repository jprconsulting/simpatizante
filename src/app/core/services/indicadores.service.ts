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

  create(tipoIncidencia: Indicadores) {
    return this.http.post(`${this.route}/crear`, tipoIncidencia);
  }

  update(id: number, tipoIncidencia: Indicadores) {
    return this.http.put(`${this.route}/actualizar/${id}`, tipoIncidencia);
  }

  delete(id: number) {
    return this.http.delete(`${this.route}/eliminar/${id}`);
  }
}

