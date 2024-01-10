import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CasillasService } from 'src/app/core/services/casilla.service';
import { SeccionService } from 'src/app/core/services/seccion.service';
import { LoadingStates } from 'src/app/global/global';
import { Casillas } from 'src/app/models/casillas';
import { Seccion } from 'src/app/models/seccion';
import { Visita } from 'src/app/models/visita';

@Component({
  selector: 'app-resultados',
  templateUrl: './resultados.component.html',
  styleUrls: ['./resultados.component.css']
})
export class ResultadosComponent {
  seguimientoForm!: FormGroup;
  secciones: Seccion[] = [];
  casillas: Casillas[]=[];
  isLoading = LoadingStates.neutro;
  isModalAdd = true;
  @ViewChild('searchItem') searchItem!: ElementRef;
  constructor(
    private formBuilder: FormBuilder,
    private seccionesService: SeccionService,
    private casillasService: CasillasService,
  ) {
   this.creteForm();
   this.getSecciones();
   this.getCasillas();
  }

  seguiForm2 = new FormGroup({
    clave: new FormControl('', [Validators.required]),
    // ...other controls
  });

  isClaveFilled = false;
  ngOnInit(): void {

  }

  getCasillas() {
    this.casillasService.getAll().subscribe({ next: (dataFromAPI) => this.casillas = dataFromAPI });
  }

  getSecciones() {
    this.seccionesService.getAll().subscribe({ next: (dataFromAPI) => this.secciones = dataFromAPI });
    console.log(this.secciones)
  }

  onFileChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;

    if (inputElement.files && inputElement.files.length > 0) {
      const file = inputElement.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        const base64String = reader.result as string;
        const base64WithoutPrefix = base64String.split(';base64,').pop() || '';

        this.seguimientoForm.patchValue({
          imagenBase64: base64WithoutPrefix // Contiene solo la representación en base64
        });
      };

      reader.readAsDataURL(file);
    }
  }


  creteForm() {
    this.seguimientoForm = this.formBuilder.group({
      id: [null],
      voto: [true],
      imagenBase64: ['']
    });
  }

  submit() {
    if (this.isModalAdd === false) {

      this.actualizarVisita();
    } else {
      this.agregar();

    }

  } agregar() {

  }
  actualizarVisita() {

  }
  onPageChange(number: number) {

  }
  handleChangeAdd() {
    this.seguimientoForm.reset();
    this.isModalAdd = true;
    if (this.seguimientoForm) {
      this.seguimientoForm.reset();
      const estatusControl = this.seguimientoForm.get('voto');
      if (estatusControl) {
        estatusControl.setValue(true);
      }
      this.isModalAdd = true;
    }

  }



}
