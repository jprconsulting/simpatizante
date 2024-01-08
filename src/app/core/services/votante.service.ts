import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Votante } from 'src/app/models/votante';
import { Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VotantesService {
  route = `${environment.apiUrl}/votantes`;
  private _refreshListVotante$ = new Subject<Votante | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) { }

  get refreshListAreasAdscripcion() {
    return this._refreshListVotante$;
  }

  getById(id: number) {
    return this.http.get<Votante>(`${this.route}/obtener-por-id/${id}`);
  }

  getAll() {
    return this.http.get<Votante[]>(`${this.route}/obtener-todos`);
  }

  post(dto: Votante) {
    return this.http.post<Votante>(`${this.route}/crear`, dto)
      .pipe(
        tap(() => {
          this._refreshListVotante$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  put(id: number, dto: Votante) {
    return this.http.put<Votante>(`${this.route}/actualizar/${id}`, dto)
      .pipe(
        tap(() => {
          this._refreshListVotante$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  delete(id: number) {
    return this.http.delete(`${this.route}/eliminar/${id}`)
      .pipe(
        tap(() => {
          this._refreshListVotante$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }
}
