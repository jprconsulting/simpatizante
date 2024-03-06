import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Combinacion } from 'src/app/models/combinacion';

@Injectable({
  providedIn: 'root',
})
export class CombinacionService {
  route = `${environment.apiUrl}/combinaciones`;
  private _refreshListCombinacion$ = new Subject<Combinacion | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) {}

  get refreshListCombinacion() {
    return this._refreshListCombinacion$;
  }

  getById(id: number) {
    return this.http.get<Combinacion>(`${this.route}/obtener-por-id/${id}`);
  }

  getAll() {
    return this.http.get<Combinacion[]>(`${this.route}/obtener-todos`);
  }

  post(dto: Combinacion) {
    return this.http.post<Combinacion>(`${this.route}/crear`, dto).pipe(
      tap(() => {
        this._refreshListCombinacion$.next(null);
      }),
      catchError(this.handleErrorService.handleError)
    );
  }

  put(id: number, dto: Combinacion) {
    return this.http
      .put<Combinacion>(`${this.route}/actualizar/${id}`, dto)
      .pipe(
        tap(() => {
          this._refreshListCombinacion$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  delete(id: number) {
    return this.http.delete(`${this.route}/eliminar/${id}`).pipe(
      tap(() => {
        this._refreshListCombinacion$.next(null);
      }),
      catchError(this.handleErrorService.handleError)
    );
  }
}
