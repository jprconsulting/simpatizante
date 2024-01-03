import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Rol } from 'src/app/models/rol';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RolsService {
  route = `${environment.apiUrl}/rols`;

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<Rol[]>(`${this.route}/obtener-todos`);
  }

}
