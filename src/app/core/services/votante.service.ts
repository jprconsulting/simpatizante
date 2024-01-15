import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Simpatizante } from 'src/app/models/Simpatizante';
import { Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VotantesService {
  route = `${environment.apiUrl}/votantes`;
  private _refreshListVotante$ = new Subject<Simpatizante | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) { }

  get refreshListAreasAdscripcion() {
    return this._refreshListVotante$;
  }

  getById(id: number) {
    return this.http.get<Simpatizante>(`${this.route}/obtener-por-id/${id}`);
  }

  getAll() {
    return this.http.get<Simpatizante[]>(`${this.route}/obtener-todos`);
  }

  post(dto: Simpatizante) {
    return this.http.post<Simpatizante>(`${this.route}/crear`, dto)
      .pipe(
        tap(() => {
          this._refreshListVotante$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  put(id: number, dto: Simpatizante) {
    return this.http.put<Simpatizante>(`${this.route}/actualizar/${id}`, dto)
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
