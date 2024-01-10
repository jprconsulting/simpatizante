import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Incidencia } from 'src/app/models/incidencias';

@Injectable({
  providedIn: 'root'
})
export class IncidenciaService {
  route = `${environment.apiUrl}/incidencias`;
  private _refreshListIncidencia$ = new Subject<Incidencia | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) { }

  get refreshListIncidencia() {
    return this._refreshListIncidencia$;
  }

  getById(id: number) {
    return this.http.get<Incidencia>(`${this.route}/obtener-por-id/${id}`);
  }

  getAll() {
    return this.http.get<Incidencia[]>(`${this.route}/obtener-todos`);
  }

  post(dto: Incidencia) {
    return this.http.post<Incidencia>(`${this.route}/crear`, dto)
      .pipe(
        tap(() => {
          this._refreshListIncidencia$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  put(id: number, dto: Incidencia) {
    return this.http.put<Incidencia>(`${this.route}/actualizar/${id}`, dto)
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
