import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, catchError, tap } from 'rxjs';
import { Indicadores } from 'src/app/models/indicadores';
import { HandleErrorService } from './handle-error.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class IndicadoresService {
  route = `${environment.apiUrl}/tipos-incidencias`;
  private _refreshListIncidencia$ = new Subject<Indicadores | null>();

  constructor(private http: HttpClient,
    private handleErrorService: HandleErrorService) {}

  getAll() {
    return this.http.get<Indicadores[]>(`${this.route}/obtener-todos`);
  }

  getByIncidencias(): Observable<Indicadores[]> {
    return this.http.get<Indicadores[]>(
      `${this.route}/obtener-por-incidencias`
    );
  }

  create(tipoIncidencia: Indicadores) {
    return this.http.post(`${this.route}/crear`, tipoIncidencia)
    .pipe(
      tap(() => {
        this._refreshListIncidencia$.next(null);
      }),
      catchError(this.handleErrorService.handleError)
    );
  }

  update(id: number, tipoIncidencia: Indicadores) {
    return this.http.put(`${this.route}/actualizar/${id}`, tipoIncidencia)
    .pipe(
      tap(() => {
        this._refreshListIncidencia$.next(null);
      }),
      catchError(this.handleErrorService.handleError)
    );
  }
  delete(id: number) {
    return this.http.delete(`${this.route}/eliminar/${id}`)
    .pipe(
        tap(() => {
          this._refreshListIncidencia$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }
}
