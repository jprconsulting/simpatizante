import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Operadores } from 'src/app/models/operadores';
import { Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OperadoresService {
  route = `${environment.apiUrl}/Operadores`;
  private _refreshListOperadores$ = new Subject<Operadores | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) { }

  get refreshListAreasAdscripcion() {
    return this._refreshListOperadores$;
  }

  getById(id: number) {
    return this.http.get<Operadores>(`${this.route}/obtener-por-id/${id}`);
  }

  getAll() {
    return this.http.get<Operadores[]>(`${this.route}/obtener-todos`);
  }

  post(dto: Operadores) {
    return this.http.post<Operadores>(`${this.route}/crear`, dto)
      .pipe(
        tap(() => {
          this._refreshListOperadores$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  put(id: number, dto: Operadores) {
    return this.http.put<Operadores>(`${this.route}/actualizar/${id}`, dto)
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
