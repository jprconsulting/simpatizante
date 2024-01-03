import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Usuario } from 'src/app/models/usuario';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  route = `${environment.apiUrl}/usuarios`;
  private _refreshListUsuarios$ = new Subject<Usuario | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) { }

  get refreshListUsuarios() {
    return this._refreshListUsuarios$;
  }

  getById(id: number) {
    return this.http.get<Usuario>(`${this.route}/obtener-por-id/${id}`);
  }

  getAll() {
    return this.http.get<Usuario[]>(`${this.route}/obtener-todos`);
  }

  post(dto: Usuario) {
    return this.http.post<Usuario>(`${this.route}/crear`, dto)
      .pipe(
        tap(() => {
          this._refreshListUsuarios$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  put(id: number, dto: Usuario) {
    return this.http.put<Usuario>(`${this.route}/actualizar/${id}`, dto)
      .pipe(
        tap(() => {
          this._refreshListUsuarios$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  delete(id: number) {
    return this.http.delete(`${this.route}/eliminar/${id}`)
      .pipe(
        tap(() => {
          this._refreshListUsuarios$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }
}
