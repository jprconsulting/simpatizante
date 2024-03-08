import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Propaganda } from 'src/app/models/propaganda-electoral';


@Injectable({
  providedIn: 'root'
})
export class PropagandaService {
  route = `${environment.apiUrl}/propagandas`;
  private _refreshListpropagandas$ = new Subject<Propaganda | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) { }

  get refreshListpropagandas() {
    return this._refreshListpropagandas$;
  }

  getById(id: number) {
    return this.http.get<Propaganda>(`${this.route}/obtener-por-id/${id}`);
  }

  getAll() {
    return this.http.get<Propaganda[]>(`${this.route}/obtener-todos`);
  }

  post(dto: Propaganda) {
    return this.http.post<Propaganda>(`${this.route}/crear`, dto)
      .pipe(
        tap(() => {
          this._refreshListpropagandas$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  put(id: number, dto: Propaganda) {
    return this.http.put<Propaganda>(`${this.route}/actualizar/${id}`, dto)
      .pipe(
        tap(() => {
          this._refreshListpropagandas$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  delete(id: number) {
    return this.http.delete(`${this.route}/eliminar/${id}`)
      .pipe(
        tap(() => {
          this._refreshListpropagandas$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

}
