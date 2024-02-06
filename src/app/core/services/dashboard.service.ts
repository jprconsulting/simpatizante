import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Estadistica, TotalGeneral } from 'src/app/models/estadistica';
import { GeneralWordCloud, WordCloud } from 'src/app/models/word-cloud';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  route = `${environment.apiUrl}/dashboard`;

  private dataWordCloudSubject = new BehaviorSubject<WordCloud[]>([]);
  dataWordCloud$ = this.dataWordCloudSubject.asObservable();

  constructor(private http: HttpClient) { }

  updateWordCloud(newData: WordCloud[]) {
    this.dataWordCloudSubject.next(newData);
  }



  getTotalSimpatizantesPorProgramaSocial() {
    return this.http.get<Estadistica[]>(`${this.route}/total-Simpatizantes-por-programa-social`);
  }

  getTotalSimpatizantesPorEdad() {
    return this.http.get<Estadistica[]>(`${this.route}/total-Simpatizantes-por-edad`);
  }

  getTotalGeneral() {
    return this.http.get<TotalGeneral>(`${this.route}/total-general`);
  }
  getSimpatizantesPorGenero() {
    return this.http.get<Estadistica[]>(`${this.route}/total-Simpatizantes-por-genero`);
  }

  getWordCloud() {
    return this.http.get<GeneralWordCloud>(`${this.route}/obtener-nube-palabras`);
  }
}
