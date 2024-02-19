import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Promotor } from 'src/app/models/promotor';
import { Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class PromotoresService {
  route = `${environment.apiUrl}/promotores`;
  private _refreshListPromotores$ = new Subject<Promotor | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) { }

  get refreshListPromotores() {
    return this._refreshListPromotores$;
  }

  getAll() {
    return this.http.get<Promotor[]>(`${this.route}/obtener-todos`);
  }
  getPorCandidato(id: number) {
    return this.http.get<Promotor[]>(`${this.route}/por-candidato/${id}`);
  }
  getPorOperador(id: number) {
    return this.http.get<Promotor[]>(`${this.route}/por-operador/${id}`);
  }


  post(dto: Promotor) {
    return this.http.post<Promotor>(`${this.route}/crear`, dto)
      .pipe(
        tap(() => {
          this._refreshListPromotores$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  put(id: number, dto: Promotor) {
    return this.http.put<Promotor>(`${this.route}/actualizar/${id}`, dto)
      .pipe(
        tap(() => {
          this._refreshListPromotores$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  delete(id: number) {
    return this.http.delete(`${this.route}/eliminar/${id}`)
      .pipe(
        tap(() => {
          this._refreshListPromotores$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

}
