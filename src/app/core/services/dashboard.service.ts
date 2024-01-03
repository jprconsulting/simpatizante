import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Estadistica, TotalGeneral } from 'src/app/models/estadistica';
import { ProgramaSocialEstadistica } from 'src/app/models/programa-social';
import { GeneralWordCloud, WordCloud } from 'src/app/models/word-cloud';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  route = `${environment.apiUrl}/dashboard`;

  private dataWordCloudSubject = new BehaviorSubject<WordCloud[]>([]);
  dataWordCloud$ = this.dataWordCloudSubject.asObservable();
  
  constructor( private http: HttpClient) { }

  updateWordCloud(newData: WordCloud[]) {
    this.dataWordCloudSubject.next(newData);
  }

  getTotalBeneficiariosPorProgramaSocial() {
    return this.http.get<ProgramaSocialEstadistica[]>(`${this.route}/total-beneficiarios-por-programa-social`);
  }

  getTotalVisitasPorProgramaSocial() {
    return this.http.get<Estadistica[]>(`${this.route}/total-visitas-por-programa-social`);
  }

  getTotalBeneficiariosPorMunicipio() {
    return this.http.get<Estadistica[]>(`${this.route}/total-beneficiarios-por-municipio`);
  }

  getTotalGeneral() {
    return this.http.get<TotalGeneral>(`${this.route}/total-general`);
  }

  getWordCloud() {
    return this.http.get<GeneralWordCloud>(`${this.route}/obtener-nube-palabras`);
  }
}
