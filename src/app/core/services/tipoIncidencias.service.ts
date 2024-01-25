import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { TipoIncidencia } from 'src/app/models/tipoIncidencias';

@Injectable({
  providedIn: 'root'
})
export class TipoIncidenciaService {
  route = `${environment.apiUrl}/Tipoincidencias`;
  private _refreshListIncidencia$ = new Subject<TipoIncidencia | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) { }

  get refreshListIncidencia() {
    return this._refreshListIncidencia$;
  }

  getById(id: number) {
    return this.http.get<TipoIncidencia>(`${this.route}/obtener-por-id/${id}`);
  }

  getAll() {
    return this.http.get<TipoIncidencia[]>(`${this.route}/obtener-todos`);
  }

  post(dto: TipoIncidencia) {
    return this.http.post<TipoIncidencia>(`${this.route}/crear`, dto)
      .pipe(
        tap(() => {
          this._refreshListIncidencia$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  put(id: number, dto: TipoIncidencia) {
    return this.http.put<TipoIncidencia>(`${this.route}/actualizar/${id}`, dto)
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
