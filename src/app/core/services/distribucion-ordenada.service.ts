import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { DistribucionOrdenada } from 'src/app/models/distribuciones-ordenadas';


@Injectable({
  providedIn: 'root'
})
export class DistribucionOrdenadaService {
  route = `${environment.apiUrl}/distribucion-ordenada`;
  private _refreshListDistribucionOrdenada$ = new Subject<DistribucionOrdenada | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) { }

  get refreshListDistribucionOrdenada() {
    return this._refreshListDistribucionOrdenada$;
  }

  getAll() {
    return this.http.get<DistribucionOrdenada[]>(`${this.route}/obtener-todos`);
  }

  post(dto: DistribucionOrdenada) {
    return this.http.post<DistribucionOrdenada>(`${this.route}/crear`, dto)
      .pipe(
        tap(() => {
          this._refreshListDistribucionOrdenada$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  put(id: number, dto: DistribucionOrdenada) {
    return this.http.put<DistribucionOrdenada>(`${this.route}/actualizar/${id}`, dto)
      .pipe(
        tap(() => {
          this._refreshListDistribucionOrdenada$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  delete(id: number) {
    return this.http.delete(`${this.route}/eliminar/${id}`)
      .pipe(
        tap(() => {
          this._refreshListDistribucionOrdenada$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

}
