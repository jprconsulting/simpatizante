import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { catchError, tap } from 'rxjs/operators';
import { Voto } from 'src/app/models/voto';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VotoService {
  route = `${environment.apiUrl}/voto`;
  private _refreshListVotos$ = new Subject<Voto | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) { }

  get refreshListVotos() {
    return this._refreshListVotos$;
  }

  getById(id: number) {
    return this.http.get<Voto>(`${this.route}/obtener-por-id/${id}`);
  }

  getAll() {
    return this.http.get<Voto[]>(`${this.route}/obtener-todos`);
  }

  post(dto: Voto) {
    return this.http.post<Voto>(`${this.route}/crear`, dto)
      .pipe(
        tap(() => {
          this._refreshListVotos$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  put(id: number, dto: Voto) {
    return this.http.put<Voto>(`${this.route}/actualizar/${id}`, dto)
      .pipe(
        tap(() => {
          this._refreshListVotos$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  delete(id: number) {
    return this.http.delete(`${this.route}/eliminar/${id}`)
      .pipe(
        tap(() => {
          this._refreshListVotos$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

}
