import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class MensajeService {

  constructor() { }

  mensajeError(titulo: string) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: titulo
    })
  }

  mensajeExito(titulo: string) {
    Swal.fire({
      position: 'center',
      icon: 'success',
      title: titulo,
      showConfirmButton: false,
      timer: 3000
    })
  }

  mensajeAdvertencia(
    titulo: string,
    onConfirm: () => void
  ) {
    Swal.fire({
      title: titulo,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, borrarlo!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        onConfirm();
      }
    });
  }
}
