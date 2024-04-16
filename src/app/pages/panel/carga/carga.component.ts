import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { CargaService } from 'src/app/core/services/carga.service';
import { MensajeService } from 'src/app/core/services/mensaje.service';

@Component({
  selector: 'app-carga',
  templateUrl: './carga.component.html',
  styleUrls: ['./carga.component.css'],
})
export class CargaComponent {
  @ViewChild('closebutton') closebutton!: ElementRef;
  @ViewChild('searchItem') searchItem!: ElementRef;

  cargaForm!: FormGroup;
  busqueda!: FormGroup;

  isModalAdd: boolean = true;
  formData: any;

  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    private spinnerService: NgxSpinnerService,
    private cargaService: CargaService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder
  ) {
    this.createForm();
  }

  createForm() {
    this.cargaForm = this.formBuilder.group({
      id: [null],
      csv: [''],
    });
  }

  resetForm() {
    this.closebutton.nativeElement.click();
    this.cargaForm.reset();
  }

  submit() {
    this.agregar();
  }

  agregar() {
    const formData = new FormData();
    formData.append('file', this.formData);

    this.spinnerService.show();
    this.cargaService.cargarCsv(formData).subscribe({
      next: (response) => {
        this.spinnerService.hide();
        console.log('Respuesta del servidor:', response); // Console log de la respuesta completa del servidor
        let mensaje = '';
        if (typeof response === 'string') {
          mensaje = response; // Si la respuesta es un string, lo consideramos como el mensaje
        } else if (
          typeof response === 'object' &&
          response !== null &&
          'message' in response
        ) {
          mensaje = response; // Si la respuesta es un objeto y tiene una propiedad 'message', la usamos como el mensaje
        } else {
          mensaje = 'Error: Respuesta del servidor inesperada'; // En caso contrario, mostramos un mensaje genérico
        }
        this.mensajeService.mensajeExito('CSV guardado correctamente');
        this.mensajeService.mensajeExito(mensaje); // Muestra el mensaje del servidor
        this.resetForm();
        this.configPaginator.currentPage = 1;
      },
      error: (error) => {
        this.spinnerService.hide();
        console.error('Error al cargar el archivo CSV:', error); // Console log del error
        this.mensajeService.mensajeError(error);
      },
    });
  }

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.formData = file;
    }
  }
}
