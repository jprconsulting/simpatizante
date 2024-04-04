import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Comunidad } from 'src/app/models/comunidad';

@Injectable({
  providedIn: 'root',
})
export class ComunidadService {
  route = `${environment.apiUrl}/comunidades`;
  private _refreshListComunidades$ = new Subject<Comunidad | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) {}

  get refreshListComunidades() {
    return this._refreshListComunidades$;
  }

  getAll() {
    return this.http.get<Comunidad[]>(`${this.route}/obtener-todos`);
  }

  getMunicipioId(id: number) {
    return this.http.get<Comunidad[]>(`${this.route}/por-municipio/${id}`);
  }
}
