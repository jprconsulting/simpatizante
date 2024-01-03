import { ErrorHandler, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HandleErrorService implements ErrorHandler {

  constructor() { }

  handleError(error: HttpErrorResponse) {

    if (error.status === 0)
      return throwError(() => "Sin conexión a API");

    if (error.status === 400)
      return throwError(() => "Dato no válido");

    if (error.status === 401)
      return throwError(() => "Usuario o Contraseña incorrectos");

    if (error.status === 404)
      return throwError(() => "Registro no encontrado");

    if (error.status === 409)
      return throwError(() => "Ya se encuentra registrado");

    if (error.status === 500)
      return throwError(() => "Error interno del servidor");

    return throwError(() => error.message);
  }

}