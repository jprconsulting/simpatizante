import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Simpatizante } from 'src/app/models/votante';
import { Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Simpatiza } from 'src/app/models/mapa';

@Injectable({
  providedIn: 'root'
})
export class SimpatizantesService {
  route = `${environment.apiUrl}/simpatizantes`;
  private _refreshListSimpatizante$ = new Subject<Simpatizante | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) { }

  get refreshListSimpatizantes() {
    return this._refreshListSimpatizante$;
  }

  validarSimpatizantePorCURP(curp: string) {
    return this.http.get<Simpatizante>(`${this.route}/validar-simpatizante-por-curp/${curp}`);
  }

  validarSimpatizantePorClaveElector(claveElector: string) {
    return this.http.get<Simpatizante>(`${this.route}/validar-simpatizante-por-clave-elector/${claveElector}`);
  }

  getById(id: number) {
    return this.http.get<Simpatizante>(`${this.route}/obtener-por-id/${id}`);
  }

  getSimpatizantesPorCandidatoId(candidatoId: number) {
    return this.http.get<Simpatizante[]>(`${this.route}/obtener-simpatizantes-por-candidato-id/${candidatoId}`);
  }

  getSimpatizantesPorOperadorId(operadorId: number) {
    return this.http.get<Simpatizante[]>(`${this.route}/obtener-simpatizantes-por-operador-id/${operadorId}`);
  }

  getAll() {
    return this.http.get<Simpatizante[]>(`${this.route}/obtener-todos`);
  }
  getAll2() {
    return this.http.get<Simpatiza[]>(`${this.route}/mapa`);
  }

  post(dto: Simpatizante) {
    return this.http.post<Simpatizante>(`${this.route}/crear`, dto)
      .pipe(
        tap(() => {
          this._refreshListSimpatizante$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  put(id: number, dto: Simpatizante) {
    return this.http.put<Simpatizante>(`${this.route}/actualizar/${id}`, dto)
      .pipe(
        tap(() => {
          this._refreshListSimpatizante$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  delete(id: number) {
    return this.http.delete(`${this.route}/eliminar/${id}`)
      .pipe(
        tap(() => {
          this._refreshListSimpatizante$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }
}
