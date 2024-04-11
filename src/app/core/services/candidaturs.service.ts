import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Observable, Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Candidatura } from 'src/app/models/candidatura';

@Injectable({
  providedIn: 'root',
})
export class CandidaturaService {
  route = `${environment.apiUrl}/candidaturas`;
  private _refreshListCandidatura$ = new Subject<Candidatura | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) {}

  get refreshListCandidatura() {
    return this._refreshListCandidatura$;
  }

  obtenerLogoPartido(nombrePartido: string): Observable<{ logoUrl: string }> {
    return this.http.get<{ logoUrl: string }>(
      `${this.route}/obtener-logo-por-nombre?nombre=${nombrePartido}`
    );
  }

  getById(id: number) {
    return this.http.get<Candidatura>(`${this.route}/obtener-por-id/${id}`);
  }
  getByNombre(nombre: string) {
    return this.http.get<Candidatura[]>(`${this.route}/obtener-por-nombre/${nombre}`);
  }

  getAll() {
    return this.http.get<Candidatura[]>(`${this.route}/obtener-todos`);
  }

  getAllPartidos() {
    return this.http.get<Candidatura[]>(
      `${this.route}/obtener-por-tipo-agrupacion-partido`
    );
  }

  getAllComun() {
    return this.http.get<Candidatura[]>(`${this.route}/obtener-por-tipo-comun`);
  }

  getAllCoalicion() {
    return this.http.get<Candidatura[]>(
      `${this.route}/obtener-por-tipo-coalicion`
    );
  }

  getAllIndependiente() {
    return this.http.get<Candidatura[]>(
      `${this.route}/obtener-por-tipo-independiente`
    );
  }

  post(dto: Candidatura) {
    return this.http.post<Candidatura>(`${this.route}/crear`, dto).pipe(
      tap(() => {
        this._refreshListCandidatura$.next(null);
      }),
      catchError(this.handleErrorService.handleError)
    );
  }

  put(id: number, dto: Candidatura) {
    return this.http
      .put<Candidatura>(`${this.route}/actualizar/${id}`, dto)
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
