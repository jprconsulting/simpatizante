import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { CandidaturaService } from 'src/app/core/services/candidaturs.service';
import { CargoService } from 'src/app/core/services/cargo.service';
import { CasillasService } from 'src/app/core/services/casilla.service';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { MunicipiosService } from 'src/app/core/services/municipios.service';
import { ResultadoService } from 'src/app/core/services/resultados.service';
import { SeccionService } from 'src/app/core/services/seccion.service';
import { LoadingStates } from 'src/app/global/global';
import { Candidatura } from 'src/app/models/candidatura';
import { Cargo } from 'src/app/models/cargo';
import { Casillas } from 'src/app/models/casillas';
import { Municipio } from 'src/app/models/municipio';
import { Resultado } from 'src/app/models/resultados';
import { Seccion } from 'src/app/models/seccion';
import { Visita } from 'src/app/models/visita';

@Component({
  selector: 'app-resultados',
  templateUrl: './resultados.component.html',
  styleUrls: ['./resultados.component.css'],
})
export class ResultadosComponent {
  resultadosForm!: FormGroup;
  secciones: Seccion[] = [];
  resultado!: Resultado;
  casillas: Casillas[] = [];
  isLoading = LoadingStates.neutro;
  tipoelecion: Cargo[] = [];
  municipios: Municipio[] = [];
  candidaturasFilter: Candidatura[] = [];
  candidaturas: Candidatura[] = [];

  isModalAdd = true;
  @ViewChild('searchItem') searchItem!: ElementRef;
  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    private seccionesService: SeccionService,
    private tipoelecionService: CargoService,
    private spinnerService: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private seccionService: SeccionService,
    private casillasService: CasillasService,
    private municipiosService: MunicipiosService,
    private resultadoService: ResultadoService,
    private mensajeService: MensajeService,
    private candidaturaService: CandidaturaService
  ) {
    this.creteForm();
    this.getSecciones();
    this.getCasillas();
    this.getCargos();
    this.getCasillas();
    this.getMunicipios();
    this.getCandidatura();
  }

  isClaveFilled = false;
  ngOnInit(): void {}
  getCandidatura() {
    this.isLoading = LoadingStates.trueLoading;
    this.candidaturaService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.candidaturas = dataFromAPI;
        this.candidaturasFilter = this.candidaturas;
        this.isLoading = LoadingStates.falseLoading;
      },
      error: (err) => {
        this.isLoading = LoadingStates.errorLoading;
        if (err.status === 401) {
          this.mensajeService.mensajeSesionExpirada();
        }
      },
    });
  }
  getMunicipios() {
    this.municipiosService
      .getAll()
      .subscribe({ next: (dataFromAPI) => (this.municipios = dataFromAPI) });
  }
  getCargos() {
    this.tipoelecionService
      .getAll()
      .subscribe({ next: (dataFromAPI) => (this.tipoelecion = dataFromAPI) });
  }

  getCasillas() {
    this.casillasService
      .getAll()
      .subscribe({ next: (dataFromAPI) => (this.casillas = dataFromAPI) });
  }

  getSecciones() {
    this.seccionesService
      .getAll()
      .subscribe({ next: (dataFromAPI) => (this.secciones = dataFromAPI) });
    console.log(this.secciones);
  }

  onFileChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;

    if (inputElement.files && inputElement.files.length > 0) {
      const file = inputElement.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        const base64String = reader.result as string;
        const base64WithoutPrefix = base64String.split(';base64,').pop() || '';

        this.resultadosForm.patchValue({
          imagenBase64: base64WithoutPrefix, // Contiene solo la representación en base64
        });
      };

      reader.readAsDataURL(file);
    }
  }
  fetchMunicipios(id: number): void {
    console.log('udsh', id);
    this.seccionesService.getById(id).subscribe((secciones) => {
      const municipioId = secciones.municipio.id;
      console.log('oibjfd', municipioId);
      this.resultadosForm.patchValue({ municipio: municipioId });
    });
  }

  submit() {
    if (this.isModalAdd === false) {
      this.actualizarVisita();
    } else {
      this.agregar();
    }
  }
  agregar() {
    this.resultado = this.resultadosForm.value as Resultado;

    const seccion = this.resultadosForm.get('seccion')?.value;
    this.resultado.seccion = { id: seccion } as Seccion;

    const tipoelecion = this.resultadosForm.get('tipoelecion')?.value;
    this.resultado.tipoelecion = { id: tipoelecion } as Cargo;

    const casilla = this.resultadosForm.get('casilla')?.value;
    this.resultado.casilla = { id: casilla } as Casillas;

    const municipio = this.resultadosForm.get('municipio')?.value;
    this.resultado.municipio = { id: municipio } as Municipio;

    this.spinnerService.show();
    console.log(this.resultado);

    this.resultadoService.post(this.resultado).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Resultados guardados correctamente');
        this.resetForm();
        this.configPaginator.currentPage = 1;
      },
      error: (error) => {
        this.spinnerService.hide();
        this.mensajeService.mensajeError(error);
      },
    });
  }

  resetForm() {
    this.resultadosForm.reset();
  }
  actualizarVisita() {}
  onPageChange(number: number) {}
  handleChangeAdd() {
    this.resultadosForm.reset();
    this.isModalAdd = true;
    if (this.resultadosForm) {
      this.resultadosForm.reset();
      const estatusControl = this.resultadosForm.get('voto');
      if (estatusControl) {
        estatusControl.setValue(true);
      }
      this.isModalAdd = true;
    }
  }
  creteForm() {
    this.resultadosForm = this.formBuilder.group({
      id: [null],
      seccion: ['', Validators.required],
      tipoelecion: ['', Validators.required],
      casilla: ['', Validators.required],
      municipio: ['', Validators.required],
      boletas: ['', Validators.required],
      boletassobrantes: ['', Validators.required],
    });
  }
}
