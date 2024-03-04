import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Pais } from 'src/app/models/pais';

@Injectable({
  providedIn: 'root',
})
export class PaisService {
  route = `${environment.apiUrl}/paises`;
  private _refreshListPaises$ = new Subject<Pais | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) {}

  get refreshListUsuarios() {
    return this._refreshListPaises$;
  }

  getAll() {
    return this.http.get<Pais[]>(`${this.route}/obtener-todos`);
  }
}
