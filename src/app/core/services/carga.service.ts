import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CargaService {
  route = `${environment.apiUrl}/CsvSimpatizante`;

  constructor(private http: HttpClient) {}

  cargarCsv(formData: FormData): Observable<string> {
    return this.http.post<string>(`${this.route}/cargar-csv`, formData, {
      responseType: 'text' as 'json',
    });
  }
}
