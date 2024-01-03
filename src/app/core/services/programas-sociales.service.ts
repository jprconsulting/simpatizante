import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ProgramaSocial } from 'src/app/models/programa-social';

@Injectable({
  providedIn: 'root'
})
export class ProgramasSocialesService {
  route = `${environment.apiUrl}/programas-sociales`;
  private _refreshListProgramasSociales$ = new Subject<ProgramaSocial | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) { }

  get refreshListProgramasSociales() {
    return this._refreshListProgramasSociales$;
  }

  getById(id: number) {
    return this.http.get<ProgramaSocial>(`${this.route}/obtener-por-id/${id}`);
  }

  getAll() {
    return this.http.get<ProgramaSocial[]>(`${this.route}/obtener-todos`);
  }

  post(dto: ProgramaSocial) {
    return this.http.post<ProgramaSocial>(`${this.route}/crear`, dto)
      .pipe(
        tap(() => {
          this._refreshListProgramasSociales$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  put(id: number, dto: ProgramaSocial) {
    return this.http.put<ProgramaSocial>(`${this.route}/actualizar/${id}`, dto)
      .pipe(
        tap(() => {
          this._refreshListProgramasSociales$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  delete(id: number) {
    return this.http.delete(`${this.route}/eliminar/${id}`)
      .pipe(
        tap(() => {
          this._refreshListProgramasSociales$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

}
