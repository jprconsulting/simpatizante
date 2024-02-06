import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Operador } from 'src/app/models/operador';
import { Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OperadoresService {
  route = `${environment.apiUrl}/Operadores`;
  private _refreshListOperadores$ = new Subject<Operador | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) { }

  get refreshListOperadores() {
    return this._refreshListOperadores$;
  }

  getById(id: number) {
    return this.http.get<Operador>(`${this.route}/obtener-por-id/${id}`);
  }

  getAll() {
    return this.http.get<Operador[]>(`${this.route}/obtener-todos`);
  }

  getOperadoresPorCandidatoId(candidatoId: number) {
    return this.http.get<Operador[]>(`${this.route}/obtener-operadores-por-candidato-id/${candidatoId}`);
  }

  post(dto: Operador) {
    return this.http.post<Operador>(`${this.route}/crear`, dto)
      .pipe(
        tap(() => {
          this._refreshListOperadores$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  put(id: number, dto: Operador) {
    return this.http.put<Operador>(`${this.route}/actualizar/${id}`, dto)
      .pipe(
        tap(() => {
          this._refreshListOperadores$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  delete(id: number) {
    return this.http.delete(`${this.route}/eliminar/${id}`)
      .pipe(
        tap(() => {
          this._refreshListOperadores$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }
}
