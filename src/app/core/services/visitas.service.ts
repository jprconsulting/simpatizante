import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Visita } from 'src/app/models/visita';
import { GeneralWordCloud, WordCloud } from 'src/app/models/word-cloud';

@Injectable({
  providedIn: 'root'
})
export class VisitasService {
  route = `${environment.apiUrl}/visitas`;
  private _refreshListVisitas$ = new Subject<Visita | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) { } 

  get refreshListVisitas() {
    return this._refreshListVisitas$;
  }

  getById(id: number) {
    return this.http.get<Visita>(`${this.route}/obtener-por-id/${id}`);
  }

  getAll() {
    return this.http.get<Visita[]>(`${this.route}/obtener-todos`);
  }

  post(dto: Visita) {
    return this.http.post<Visita>(`${this.route}/crear`, dto)
      .pipe(
        tap(() => {
          this._refreshListVisitas$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  put(id: number, dto: Visita) {
    return this.http.put<Visita>(`${this.route}/actualizar/${id}`, dto)
      .pipe(
        tap(() => {
          this._refreshListVisitas$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  delete(id: number) {
    return this.http.delete(`${this.route}/eliminar/${id}`)
      .pipe(
        tap(() => {
          this._refreshListVisitas$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }  

}
