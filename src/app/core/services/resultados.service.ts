import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Resultado } from 'src/app/models/resultados';

@Injectable({providedIn: 'root'})
export class ResultadoService {
  route = `${environment.apiUrl}/resultados-pre-eliminares`;
  private _refreshListResultados$ = new Subject<Resultado | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) { }

  get refreshListPresultados() {
    return this._refreshListResultados$;
  }
 
  getAll() {
    return this.http.get<Resultado[]>(`${this.route}/obtener-todos`);
  }
 
  post(dto: Resultado) {
    return this.http.post<Resultado>(`${this.route}/crear`, dto)
      .pipe(
        tap(() => {
          this._refreshListResultados$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  put(id: number, dto: Resultado) {
    return this.http.put<Resultado>(`${this.route}/actualizar/${id}`, dto)
      .pipe(
        tap(() => {
          this._refreshListResultados$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  delete(id: number) {
    return this.http.delete(`${this.route}/eliminar/${id}`)
      .pipe(
        tap(() => {
          this._refreshListResultados$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

}
