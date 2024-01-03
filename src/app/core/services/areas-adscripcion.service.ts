import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { AreaAdscripcion } from 'src/app/models/area-adscripcion';
import { Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AreasAdscripcionService {
  route = `${environment.apiUrl}/areas-adscripcion`;
  private _refreshListAreasAdscripcion$ = new Subject<AreaAdscripcion | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) { }

  get refreshListAreasAdscripcion() {
    return this._refreshListAreasAdscripcion$;
  }

  getById(id: number) {
    return this.http.get<AreaAdscripcion>(`${this.route}/obtener-por-id/${id}`);
  }

  getAll() {
    return this.http.get<AreaAdscripcion[]>(`${this.route}/obtener-todos`);
  }

  post(dto: AreaAdscripcion) {
    return this.http.post<AreaAdscripcion>(`${this.route}/crear`, dto)
      .pipe(
        tap(() => {
          this._refreshListAreasAdscripcion$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  put(id: number, dto: AreaAdscripcion) {
    return this.http.put<AreaAdscripcion>(`${this.route}/actualizar/${id}`, dto)
      .pipe(
        tap(() => {
          this._refreshListAreasAdscripcion$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  delete(id: number) {
    return this.http.delete(`${this.route}/eliminar/${id}`)
      .pipe(
        tap(() => {
          this._refreshListAreasAdscripcion$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }
}
