import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Distrito } from 'src/app/models/distrito';

@Injectable({
  providedIn: 'root',
})
export class DistritoService {
  route = `${environment.apiUrl}/distritos`;
  private _refreshListDistritos$ = new Subject<Distrito | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) {}

  get refreshListDistrito() {
    return this._refreshListDistritos$;
  }

  getAll() {
    return this.http.get<Distrito[]>(`${this.route}/obtener-todos`);
  }
}
