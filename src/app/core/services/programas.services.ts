import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ProgramaSocial } from 'src/app/models/programa-social';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProgramaSocialService {
  route = `${environment.apiUrl}/programas`;

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<ProgramaSocial[]>(`${this.route}/obtener-todos`);
  }
}