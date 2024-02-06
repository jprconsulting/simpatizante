import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Candidato } from 'src/app/models/candidato';

@Injectable({
  providedIn: 'root'
})
export class CandidatosService {
  route = `${environment.apiUrl}/candidato`;
  private _refreshListCandidatos$ = new Subject<Candidato | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) { }

  get refreshListCandidatos() {
    return this._refreshListCandidatos$;
  }

  getById(id: number) {
    return this.http.get<Candidato>(`${this.route}/obtener-por-id/${id}`);
  }

  getAll() {
    return this.http.get<Candidato[]>(`${this.route}/obtener-todos`);
  }

  post(dto: Candidato) {
    return this.http.post<Candidato>(`${this.route}/crear`, dto)
      .pipe(
        tap(() => {
          this._refreshListCandidatos$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  put(id: number, dto: Candidato) {
    return this.http.put<Candidato>(`${this.route}/actualizar/${id}`, dto)
      .pipe(
        tap(() => {
          this._refreshListCandidatos$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  delete(id: number) {
    return this.http.delete(`${this.route}/eliminar/${id}`)
      .pipe(
        tap(() => {
          this._refreshListCandidatos$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }
}
