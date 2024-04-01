import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { DistribucionCandidatura } from 'src/app/models/distribucion-candidatura';

@Injectable({
  providedIn: 'root',
})
export class DistribucionCandidaturaService {
  route = `${environment.apiUrl}/distribucion-candidaturas`;
  private _refreshListCandidatura$ =
    new Subject<DistribucionCandidatura | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) {}

  get refreshListCandidatura() {
    return this._refreshListCandidatura$;
  }
  getTipoId(id: number) {
    return this.http.get<DistribucionCandidatura[]>(`${this.route}/obtener-por-Tipo/${id}`);
  }
  getById(id: number) {
    return this.http.get<DistribucionCandidatura>(
      `${this.route}/obtener-por-id/${id}`
    );
  }

  getAll() {
    return this.http.get<DistribucionCandidatura[]>(
      `${this.route}/obtener-todos`
    );
  }

  post(dto: DistribucionCandidatura) {
    return this.http
      .post<DistribucionCandidatura>(`${this.route}/crear`, dto)
      .pipe(
        tap(() => {
          this._refreshListCandidatura$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  put(id: number, dto: DistribucionCandidatura) {
    return this.http
      .put<DistribucionCandidatura>(`${this.route}/actualizar/${id}`, dto)
      .pipe(
        tap(() => {
          this._refreshListCandidatura$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  delete(id: number) {
    return this.http.delete(`${this.route}/eliminar/${id}`).pipe(
      tap(() => {
        this._refreshListCandidatura$.next(null);
      }),
      catchError(this.handleErrorService.handleError)
    );
  }
}
