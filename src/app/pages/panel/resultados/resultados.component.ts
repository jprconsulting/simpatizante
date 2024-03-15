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
import { catchError, forkJoin, map, of } from 'rxjs';
import { CandidaturaService } from 'src/app/core/services/candidaturs.service';
import { CargoService } from 'src/app/core/services/cargo.service';
import { CasillasService } from 'src/app/core/services/casilla.service';
import { ComunidadService } from 'src/app/core/services/comunidad.service';
import { DistribucionCandidaturaService } from 'src/app/core/services/distribucion-candidatura.service';
import { DistritoService } from 'src/app/core/services/distrito.service';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { MunicipiosService } from 'src/app/core/services/municipios.service';
import { ResultadoService } from 'src/app/core/services/resultados.service';
import { SeccionService } from 'src/app/core/services/seccion.service';
import { TipoEleccionService } from 'src/app/core/services/tipo-elecciones.service';
import { LoadingStates } from 'src/app/global/global';
import { Candidatura } from 'src/app/models/candidatura';
import { Cargo } from 'src/app/models/cargo';
import { Casillas } from 'src/app/models/casillas';
import { Comunidad } from 'src/app/models/comunidad';
import { DistribucionCandidatura } from 'src/app/models/distribucion-candidatura';
import { Distrito } from 'src/app/models/distrito';
import { Municipio } from 'src/app/models/municipio';
import { Resultado } from 'src/app/models/resultados';
import { Seccion } from 'src/app/models/seccion';
import { TipoEleccion } from 'src/app/models/tipo-eleccion';
import { Visita } from 'src/app/models/visita';

@Component({
  selector: 'app-resultados',
  templateUrl: './resultados.component.html',
  styleUrls: ['./resultados.component.css'],
})
export class ResultadosComponent {
  resultadosForm!: FormGroup;
  sumaForm!: FormGroup;
  myGroup!: FormGroup;
  DistribucionCandidatura!: DistribucionCandidatura;
  secciones: Seccion[] = [];
  resultado!: Resultado;
  casillas: Casillas[] = [];
  isLoading = LoadingStates.neutro;
  tipoEleccionId: Cargo[] = [];
  partidosConLogo: { nombre: string; logoUrl: string }[] = [];
  municipios: Municipio[] = [];
  candidaturasFilter: Candidatura[] = [];
  candidaturas: Candidatura[] = [];
  tiposEleccion: TipoEleccion[] = [];
  comunidades: Comunidad[] = [];
  distritos: Distrito[] = [];
  TipoSelect!: TipoEleccion | undefined;
  DistritoSelect!: Distrito | undefined;
  MunicipioSelect!: Municipio | undefined;
  ComunidadSelect!: Comunidad | undefined;
  distribucionCandidatura: DistribucionCandidatura[] = [];
  distribucionCandidaturaFilter: DistribucionCandidatura[] = [];
  sumaDeValores: number = 0;
  valoresInput: number[] = [];
  isLoadingModalPartidos = LoadingStates.neutro;
  pagModalSecciones: number = 1;
  visibiliti = false;
  sumaTotal: number = 0;
  partidosData: { nombre: string; valor: number }[] = [];

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
    private candidaturaService: CandidaturaService,
    private tipoEleccionService: TipoEleccionService,
    private distritoService: DistritoService,
    private distribucionCandidaturaService: DistribucionCandidaturaService,
    private comunidadService: ComunidadService
  ) {
    this.creteForm();
    this.getSecciones();
    this.getCasillas();
    this.getCasillas();
    this.getMunicipios();
    this.getCandidatura();
    this.getTipoEleccion();
    this.getDistribucion();
    this.getDistritos();
    this.getComunidad();
    this.creteForm2();
  }
  creteForm2() {
    this.sumaForm = this.formBuilder.group({
      Candidatonoregistrado: [''],
      Votosnulos: [''],
    });
  }

  mostrar() {
    this.visibiliti = true;
  }
  isClaveFilled = false;
  ngOnInit(): void {}

  getComunidad() {
    this.isLoading = LoadingStates.trueLoading;
    this.comunidadService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.comunidades = dataFromAPI;
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
  getDistritos() {
    this.isLoading = LoadingStates.trueLoading;
    this.distritoService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.distritos = dataFromAPI;
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
  getTipoEleccion() {
    this.isLoading = LoadingStates.trueLoading;
    this.tipoEleccionService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.tiposEleccion = dataFromAPI;
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

    const tipoelecion = this.resultadosForm.get('tipoEleccion')?.value;
    this.resultado.tipoEleccion = { id: tipoelecion } as Cargo;

    const casilla = this.resultadosForm.get('casilla')?.value;
    this.resultado.casilla = { id: casilla } as Casillas;

    const distrito = this.resultadosForm.get('distrito')?.value;
    this.resultado.distrito = { id: distrito } as Distrito;

    let listaActual = this.partidosData;

    let partidos = [];

    for (let i = 0; i < listaActual.length; i++) {
      partidos.push(listaActual[i].nombre);
      partidos.push(listaActual[i].valor.toString()); // Convertir el valor a cadena si es necesario
    }

    console.log(partidos); // Output: ["pan", "10", "kfc", "10", "pan", "10"]

    let formData = {
      ...this.resultado,
      partidos: partidos,
    };

    // Tu lista actual
    this.spinnerService.show();
    console.log(formData);

    this.resultadoService.post(formData).subscribe({
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
    this.visibiliti = false;
    this.sumaTotal = 0;
    this.sumaDeValores = 0;
  }
  creteForm() {
    this.resultadosForm = this.formBuilder.group({
      id: [null],
      seccion: ['', Validators.required],
      tipoEleccion: ['', Validators.required],
      casilla: ['', Validators.required],

      boletasSobrantes: ['', Validators.required],
      distrito: [''],

      personasVotaron: ['', Validators.required],
      votosRepresentantes: ['', Validators.required],
      suma: [''],
    });
  }

  getDistribucion() {
    this.isLoading = LoadingStates.trueLoading;
    this.distribucionCandidaturaService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.distribucionCandidatura = dataFromAPI;
        this.obtenerLogosPartidos();
        this.distribucionCandidaturaFilter = this.distribucionCandidatura;
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
  onSelectTipoE(id: number | null) {
    this.TipoSelect = this.tiposEleccion.find((v) => v.id === id);

    if (this.TipoSelect) {
      const valueSearch2 = this.TipoSelect.id.toString();

      console.log('Search Value:', valueSearch2);

      this.distribucionCandidaturaFilter = this.distribucionCandidatura.filter(
        (c) => c.tipoEleccion.id === id
      );

      console.log('Filtered Candidaturas:', this.distribucionCandidaturaFilter);

      this.configPaginator.currentPage = 1;
    }
  }

  onSelectmunicipios(id: number | null) {
    this.MunicipioSelect = this.municipios.find((v) => v.id === id);

    if (this.MunicipioSelect) {
      const valueSearch2 = this.MunicipioSelect.id.toString();

      console.log('Search Value:', valueSearch2);
      this.distribucionCandidaturaFilter = this.distribucionCandidatura.filter(
        (c) => c.municipio?.id === id
      );

      console.log('Filtered Candidaturas:', this.distribucionCandidaturaFilter);

      this.configPaginator.currentPage = 1;
    }
  }
  onSelectComunidades(id: number | null) {
    this.ComunidadSelect = this.comunidades.find((v) => v.id === id);

    if (this.ComunidadSelect) {
      const valueSearch2 = this.ComunidadSelect.id.toString();

      console.log('Search Value:', valueSearch2);
      this.distribucionCandidaturaFilter = this.distribucionCandidatura.filter(
        (c) => c.comunidad?.id === id
      );

      console.log('Filtered Candidaturas:', this.distribucionCandidaturaFilter);

      this.configPaginator.currentPage = 1;
    }
  }
  onSelectdistrito(id: number | null) {
    this.filtrarCandidaturas(id);
  }

  filtrarCandidaturas(id: number | null) {
    const distritoSelect = this.distritos.find((v) => v.id === id);
    if (!distritoSelect) return;

    console.log('Search Value:', distritoSelect.id.toString());

    // Guardar los resultados de la búsqueda en una variable local
    const resultadosFiltrados = this.distribucionCandidatura.filter(
      (c) => c.distrito?.id === id
    );

    // Puedes utilizar 'resultadosFiltrados' en lugar de 'this.distribucionCandidaturaFilter' a partir de aquí
    console.log('Filtered Candidaturas:', resultadosFiltrados);

    // Después de aplicar el filtro por distrito, llamamos a la función para obtener los logos de los partidos
    this.obtenerLogosPartidos();

    this.configPaginator.currentPage = 1;
  }

  obtenerLogosPartidos(): void {
    this.partidosConLogo = []; // Limpiamos el arreglo antes de comenzar

    // Verificamos si la propiedad partidos está presente y no es nula
    if (
      this.distribucionCandidaturaFilter &&
      this.distribucionCandidaturaFilter.length > 0
    ) {
      const partidos = this.distribucionCandidaturaFilter.reduce(
        (acumulador: string[], candidatura) => {
          if (candidatura.partidos) {
            return acumulador.concat(candidatura.partidos);
          }
          return acumulador;
        },
        []
      );

      const solicitudes = partidos.map((partido) =>
        this.candidaturaService.obtenerLogoPartido(partido).pipe(
          map((respuesta) => ({
            nombre: partido,
            logoUrl: respuesta.logoUrl,
          })),
          catchError((error) => {
            console.error(
              `Error al obtener el logo para el partido ${partido}:`,
              error
            );
            // Devolver un objeto con la URL de un logo por defecto en caso de error
            return of({
              nombre: partido,
              logoUrl: 'URL del logo por defecto',
            });
          })
        )
      );

      forkJoin(solicitudes).subscribe((partidosConLogo) => {
        this.partidosConLogo = partidosConLogo;
      });
    } else {
      // Si no hay candidaturas filtradas o la lista está vacía, podemos manejarlo de alguna manera
      console.log('No se encontraron candidaturas para obtener logos.');
    }
  }

  getLogo(partido: string): { nombre: string; logoUrl: string } | undefined {
    return this.partidosConLogo.find(
      (partidoConLogo) => partidoConLogo.nombre === partido
    );
  }

  verPartidosDistribucion(distribucionId: number) {
    this.pagModalSecciones = 1;

    this.getDistribucionId(distribucionId);

    const modal = document.getElementById('modal-imagen-ampliada');
    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
    }
  }

  getDistribucionId(distribucionId: number): void {
    this.isLoadingModalPartidos = LoadingStates.trueLoading;

    this.distribucionCandidaturaService.getById(distribucionId).subscribe({
      next: (dataFromAPI) => {
        this.DistribucionCandidatura = dataFromAPI;

        this.obtenerLogosPartidos();

        this.isLoadingModalPartidos = LoadingStates.falseLoading;
      },
      error: () => {
        this.isLoadingModalPartidos = LoadingStates.errorLoading;
      },
    });
  }

  checkValores() {
    const distrito = this.resultadosForm.get('distrito')?.value;
    const municipio = this.resultadosForm.get('municipio')?.value;
    const comunidad = this.resultadosForm.get('comunidad')?.value;

    // Verifica si alguno de los valores es null o undefined
    if (distrito !== null && distrito !== undefined) {
      return true; // Mostrar el div si todas las condiciones son verdaderas
    } else if (municipio !== null && municipio !== undefined) {
      return true; // Mostrar el div si todas las condiciones son verdaderas
    } else if (comunidad !== null && comunidad !== undefined) {
      return true; // Mostrar el div si todas las condiciones son verdaderas
    } else {
      return false; // Ocultar el div si alguna de las condiciones es falsa
    }
  }
  lista(event: any, partidoItem: any) {
    const valor = parseFloat(event.target.value);
    if (!isNaN(valor)) {
      const nombrePartido: string = partidoItem;
      this.sumaDeValores += valor;
      this.partidosData.push({ nombre: nombrePartido, valor: valor });
      console.log(this.partidosData);
    }
  }

  nombrePartido: string = 'Candidato-no-registrado';
  nombrePartido2: string = 'Votos nulos';
  actualizarSuma2(event: any) {
    const valor = parseFloat(event.target.value);
    const Candidatonoregistrado = this.sumaForm.get(
      'Candidatonoregistrado'
    )?.value;
    if (Candidatonoregistrado != null) {
      const valorTotal = this.sumaDeValores + Candidatonoregistrado;
      this.partidosData.push({
        nombre: this.nombrePartido,
        valor: Candidatonoregistrado,
      });
      console.log(this.partidosData);
    }
  }
  actualizarSuma3(event: any) {
    const valor = parseFloat(event.target.value);
    const Votosnulos = this.sumaForm.get('Votosnulos')?.value;
    if (Votosnulos != null) {
      const valorTotal = this.sumaDeValores + Votosnulos;
      this.partidosData.push({
        nombre: this.nombrePartido2,
        valor: Votosnulos,
      });
      console.log(this.partidosData);
    }
  }

  deshabilitarTodosLosControles() {
    Object.keys(this.resultadosForm.controls).forEach((controlName) => {
      if (controlName !== 'curp') {
        this.resultadosForm.get(controlName)?.disable();
      }
    });
  }

  calcularSuma(): void {
    const votaronValue = this.resultadosForm.get('votosRepresentantes')?.value;
    const representantesValue =
      this.resultadosForm.get('personasVotaron')?.value;

    // Realizar la suma de los valores
    this.sumaTotal = parseInt(votaronValue) + parseInt(representantesValue);
  }
}
