import { ErrorHandler, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { SecurityService } from './security.service';
import { Router } from '@angular/router';
import { AppUserAuth } from 'src/app/models/login';

@Injectable({
  providedIn: 'root',
})
export class HandleErrorService implements ErrorHandler {
  constructor() {}

  handleError(error: HttpErrorResponse) {
    if (error.status === 0) return throwError(() => 'Sin conexión a API');

    if (error.status === 400) return throwError(() => 'Dato no válido');

    if (error.status === 401) {
      return throwError(() => 'Sesión expirada');
    }

    if (error.status === 404) return throwError(() => 'Registro no encontrado');
    if (error.status === 405)
      return throwError(() => 'Usuario y/o contraseña incorrectos');
    if (error.status === 419)
      return throwError(() => 'El usuario tiene una sesión activa');

    if (error.status === 409)
      return throwError(() => 'Ya se encuentra registrado');

    if (error.status === 500)
      return throwError(() => 'Error interno del servidor');

    if (error.status === 502)
      return throwError(
        () => 'No se puede eliminar debido a que tiene dependencias'
      );

    return throwError(() => error.message);
  }
}
