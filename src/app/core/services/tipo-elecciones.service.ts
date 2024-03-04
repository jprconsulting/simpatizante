import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { TipoEleccion } from 'src/app/models/tipo-eleccion';

@Injectable({
  providedIn: 'root',
})
export class TipoEleccionService {
  route = `${environment.apiUrl}/tipos-elecciones`;
  private _refreshListTiposEleccion$ = new Subject<TipoEleccion | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) {}

  get refreshListTiposEleccion() {
    return this._refreshListTiposEleccion$;
  }

  getAll() {
    return this.http.get<TipoEleccion[]>(`${this.route}/obtener-todos`);
  }
}
