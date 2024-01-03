import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Subject, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Beneficiario, DataMapa, TotalBeneficiariosMunicipio } from 'src/app/models/beneficiario';

@Injectable({
  providedIn: 'root'
})
export class BeneficiariosService {
  route = `${environment.apiUrl}/beneficiarios`;
  private _refreshListBeneficiarios$ = new Subject<Beneficiario | null>();

  private dataMapaSubject = new BehaviorSubject<DataMapa[]>([]);
  dataMapa$ = this.dataMapaSubject.asObservable();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) { }

  updateDataMapa(newData: DataMapa[]): void {
    this.dataMapaSubject.next(newData);
  }


  get refreshListBeneficiarios() {
    return this._refreshListBeneficiarios$;
  }

  getById(id: number) {
    return this.http.get<Beneficiario>(`${this.route}/obtener-por-id/${id}`);
  }

  getAll() {
    return this.http.get<Beneficiario[]>(`${this.route}/obtener-todos`);
  }

  post(dto: Beneficiario) {
    return this.http.post<Beneficiario>(`${this.route}/crear`, dto)
      .pipe(
        tap(() => {
          this._refreshListBeneficiarios$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  put(id: number, dto: Beneficiario) {
    return this.http.put<Beneficiario>(`${this.route}/actualizar/${id}`, dto)
      .pipe(
        tap(() => {
          this._refreshListBeneficiarios$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  delete(id: number) {
    return this.http.delete(`${this.route}/eliminar/${id}`)
      .pipe(
        tap(() => {
          this._refreshListBeneficiarios$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  getTotalBeneficiariosPorMunicipio() {
    return this.http.get<TotalBeneficiariosMunicipio[]>(`${this.route}/total-beneficiarios-por-municipio`);
  }

}
