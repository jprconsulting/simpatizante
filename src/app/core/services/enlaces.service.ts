import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Enlace } from 'src/app/models/enlace';
import { Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class EnlacesService {
  route = `${environment.apiUrl}/enlaces`;
  private _refreshListEnlace$ = new Subject<Enlace | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) { }

  get refreshListEnlaces() {
    return this._refreshListEnlace$;
  }

  getAll() {
    return this.http.get<Enlace[]>(`${this.route}/obtener-todos`);
  }

  post(dto: Enlace) {
    return this.http.post<Enlace>(`${this.route}/crear`, dto)
      .pipe(
        tap(() => {
          this._refreshListEnlace$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  put(id: number, dto: Enlace) {
    return this.http.put<Enlace>(`${this.route}/actualizar/${id}`, dto)
      .pipe(
        tap(() => {
          this._refreshListEnlace$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  delete(id: number) {
    return this.http.delete(`${this.route}/eliminar/${id}`)
      .pipe(
        tap(() => {
          this._refreshListEnlace$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

}
