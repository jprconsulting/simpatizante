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
import { EstadoService } from 'src/app/core/services/estados.service';
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
import { Estado } from 'src/app/models/estados';
import { Municipio } from 'src/app/models/municipio';
import { Resultado } from 'src/app/models/resultados';
import { Seccion } from 'src/app/models/seccion';
import { TipoEleccion } from 'src/app/models/tipo-eleccion';
import { Visita } from 'src/app/models/visita';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-resultados',
  templateUrl: './resultados.component.html',
  styleUrls: ['./resultados.component.css'],
})
export class ResultadosComponent {
  @ViewChild('closebutton') closebutton!: ElementRef;
  resultadosForm!: FormGroup;
  sumaForm!: FormGroup;
  DistribucionCandidatura!: DistribucionCandidatura;
  secciones: Seccion[] = [];
  resultado!: Resultado;
  resultados: Resultado[] = [];
  resultadosFilter: Resultado[] = [];
  casillas: Casillas[] = [];
  isLoading = LoadingStates.neutro;
  tipoEleccionId: Cargo[] = [];
  partidosConLogo: { nombre: string; logoUrl: string }[] = [];
  municipios: Municipio[] = [];
  candidaturasFilter: Candidatura[] = [];
  candidaturas: Candidatura[] = [];
  tiposEleccion: TipoEleccion[] = [];
  seccionesOperador: Seccion[] = [];
  comunidades: Comunidad[] = [];
  distritos: Distrito[] = [];
  TipoSelect!: TipoEleccion | undefined;
  DistritoSelect!: Distrito | undefined;
  MunicipioSelect!: Municipio | undefined;
  ComunidadSelect!: Comunidad | undefined;
  EstadosSelect!: Estado | undefined;
  distribucionCandidatura: DistribucionCandidatura[] = [];
  distribucionCandidaturaFilter: DistribucionCandidatura[] = [];
  sumaDeValores: number = 0;
  valoresInput: number[] = [];
  isLoadingModalPartidos = LoadingStates.neutro;
  pagModalSecciones: number = 1;
  visibiliti = false;
  idUpdate!: number;
  sumaTotal: number = 0;
  estados: Estado[] = [];
  partidosData: { nombre: string; valor: number }[] = [];
  id!: number;

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
    private comunidadService: ComunidadService,
    private estadoService: EstadoService
  ) {
    this.resultadoService.refreshListPresultados.subscribe(() =>
      this.Resultados()
    );
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
    this.Resultados();
    this.getEstado();
  }

  getNombrePartido(partido: string): string {
    return partido.split('.jpg')[1].split('-')[1].trim();
  }

  getLogoUrl(partido: string): string {
    return partido.split('.jpg')[0] + '.jpg';
  }

  getPartido(partidoNombre: string): string | undefined {
    return this.partidosLista.find((partido) => partido === partidoNombre);
  }

  Resultados() {
    this.isLoading = LoadingStates.trueLoading;
    this.resultadoService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.resultados = dataFromAPI;
        this.resultadosFilter = this.resultados;
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
  getEstado() {
    this.isLoading = LoadingStates.trueLoading;
    this.estadoService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.estados = dataFromAPI;
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
      this.actualizar();
    } else {
      this.agregar();
    }
  }

  obtenerLogos(listaPartidos: string[]): void {
    this.partidosConLogo = []; // Limpiamos el arreglo antes de comenzar
    // Verificamos si la propiedad partidos está presente y no es nula

    if (listaPartidos && listaPartidos.length > 0) {
      // Iterar sobre los partidos y hacer las solicitudes de logo
      const solicitudes = listaPartidos.map((partido) => {
        console.log('Buscando logo para el partido:', partido);
        return this.candidaturaService.obtenerLogoPartido(partido).pipe(
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
        );
      });

      forkJoin(solicitudes).subscribe((partidosConLogo) => {
        this.partidosConLogo = partidosConLogo;
      });
    } else {
      // Si no hay partidos o la lista está vacía, podemos manejarlo de alguna manera
      console.log('No se encontraron partidos para obtener logos.');
    }
  }
  agregar() {
    this.resultado = this.resultadosForm.value as Resultado;

    const estado = this.resultadosForm.get('estado')?.value;
    this.resultado.estado = { id: estado } as Estado;
    const seccion = this.resultadosForm.get('seccion')?.value;
    this.resultado.seccion = { id: seccion } as Seccion;

    const tipoelecion = this.resultadosForm.get('tipoEleccion')?.value;
    this.resultado.tipoEleccion = { id: tipoelecion } as Cargo;

    const casilla = this.resultadosForm.get('casilla')?.value;
    this.resultado.casilla = { id: casilla } as Casillas;

    const distrito = this.resultadosForm.get('distrito')?.value;
    this.resultado.distrito = { id: distrito } as Distrito;

    const municipio = this.resultadosForm.get('municipio')?.value;
    this.resultado.municipio = { id: municipio } as Municipio;

    const comunidad = this.resultadosForm.get('comunidad')?.value;
    this.resultado.comunidad = { id: comunidad } as Comunidad;

    let listaActual = this.partidosData;

    let partidos = [];

    for (let i = 0; i < listaActual.length; i++) {
      partidos.push(listaActual[i].valor.toString());
    }

    console.log(partidos);

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
    this.closebutton.nativeElement.click();
    this.resultadosForm.reset();
    this.partidosLista = [''];
  }

  actualizar() {
    this.resultado = this.resultadosForm.value as Resultado;
    const resultadoId = this.resultadosForm.get('id')?.value;
    const estado = this.resultadosForm.get('estado')?.value;
    this.resultado.estado = { id: estado } as Estado;
    const seccion = this.resultadosForm.get('seccion')?.value;
    this.resultado.seccion = { id: seccion } as Seccion;
    const tipoeleccion = this.resultadosForm.get('tipoEleccion')?.value;
    this.resultado.tipoEleccion = { id: tipoeleccion } as Cargo;
    const casilla = this.resultadosForm.get('casilla')?.value;
    this.resultado.casilla = { id: casilla } as Casillas;
    const distrito = this.resultadosForm.get('distrito')?.value;
    this.resultado.distrito = { id: distrito } as Distrito;
    const municipio = this.resultadosForm.get('municipio')?.value;
    this.resultado.municipio = { id: municipio } as Municipio;
    const comunidad = this.resultadosForm.get('comunidad')?.value;
    this.resultado.comunidad = { id: comunidad } as Comunidad;

    let listaActual = this.partidosData;

    let partidos = [];

    for (let i = 0; i < listaActual.length; i++) {
      partidos.push(listaActual[i].valor.toString());
    }

    this.resultado.partidos = partidos; // Asignar la lista de partidos al resultado

    console.log('Resultado antes de enviar:', this.resultado);

    this.spinnerService.show();

    this.resultadoService.put(resultadoId, this.resultado).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Resultado actualizado correctamente');
        this.resetForm();
        this.configPaginator.currentPage = 1;
      },
      error: (error) => {
        this.spinnerService.hide();
        this.mensajeService.mensajeError(error);
      },
    });
  }

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
    this.partidosLista = [''];
  }
  creteForm() {
    this.resultadosForm = this.formBuilder.group({
      id: [null],
      seccion: ['', Validators.required],
      tipoEleccion: ['', Validators.required],
      casilla: ['', Validators.required],
      municipio: [''],
      boletasSobrantes: ['', Validators.required],
      distrito: [''],
      comunidad: [''],
      personasVotaron: ['', Validators.required],
      votosRepresentantes: ['', Validators.required],
      suma: [''],
      noRegistrado: [''],
      votosNulos: [''],
      estado: [''],
      partidos: [[]],
    });
  }

  getDistribucion() {
    this.isLoading = LoadingStates.trueLoading;
    this.distribucionCandidaturaService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.distribucionCandidatura = dataFromAPI;

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
  selectedTipoId: number | null = null;
  Distribuciones: DistribucionCandidatura[] = [];
  onSelectTipoE(id: number | null) {
    this.TipoSelect = this.tiposEleccion.find((v) => v.id === id);

    if (this.TipoSelect && this.TipoSelect?.id !== undefined) {
      this.selectedTipoId = this.TipoSelect?.id;

      this.distribucionCandidaturaService
        .getTipoId(this.selectedTipoId)
        .subscribe({
          next: (dataFromAPI) => {
            this.distribucionCandidatura = dataFromAPI;
            this.Distribuciones = this.distribucionCandidatura;

            console.log(this.distribucionCandidatura, 'hbvjds');
          },
        });
    }
    console.log('xbhwjnonononoo');
  }

  onSelectmunicipios(id: number | null) {
    this.MunicipioSelect = this.municipios.find((v) => v.id === id);

    if (this.MunicipioSelect) {
      const valueSearch2 = this.MunicipioSelect.id.toString();

      console.log('Search Value:', valueSearch2);
      this.distribucionCandidaturaFilter = this.Distribuciones.filter(
        (c) => c.municipio?.id === id
      );

      const coalicion = this.distribucionCandidaturaFilter.flatMap((item) =>
        Array.isArray(item.coalicion) ? item.coalicion : []
      );
      const comun = this.distribucionCandidaturaFilter.flatMap((item) =>
        Array.isArray(item.comun) ? item.comun : []
      );
      const partidos = this.distribucionCandidaturaFilter.flatMap((item) =>
        Array.isArray(item.partidos) ? item.partidos : []
      );
      const independiente = this.distribucionCandidaturaFilter.flatMap((item) =>
        Array.isArray(item.independiente) ? item.independiente : []
      );

      // Llamar a la función lista() con los datos filtrados y los datos adicionales
      const lista2 = this.lista2(partidos, coalicion, comun, independiente);
      console.log(lista2); // Imprimir la lista
      this.partidosLista = lista2;
      console.log(this.partidosLista, 'tyf');
      // Reiniciar la paginación a la página 1
      this.configPaginator.currentPage = 1;
    }
  }
  seccionMunicipio(id: number) {
    this.seccionService.getMunicipioId(id).subscribe({
      next: (dataFromAPI) => {
        this.secciones = dataFromAPI;
        this.seccionesOperador = this.secciones;
      },
    });
  }

  onSelectComunidades(id: number | null) {
    this.ComunidadSelect = this.comunidades.find((v) => v.id === id);

    if (this.ComunidadSelect) {
      const valueSearch2 = this.ComunidadSelect.id.toString();

      console.log('Search Value:', valueSearch2);
      this.distribucionCandidaturaFilter = this.distribucionCandidatura.filter(
        (c) => c.comunidad?.id === id
      );

      const coalicion = this.distribucionCandidaturaFilter.flatMap((item) =>
        Array.isArray(item.coalicion) ? item.coalicion : []
      );
      const comun = this.distribucionCandidaturaFilter.flatMap((item) =>
        Array.isArray(item.comun) ? item.comun : []
      );
      const partidos = this.distribucionCandidaturaFilter.flatMap((item) =>
        Array.isArray(item.partidos) ? item.partidos : []
      );
      const independiente = this.distribucionCandidaturaFilter.flatMap((item) =>
        Array.isArray(item.independiente) ? item.independiente : []
      );

      // Llamar a la función lista() con los datos filtrados y los datos adicionales
      const lista2 = this.lista2(partidos, coalicion, comun, independiente);
      console.log(lista2); // Imprimir la lista
      this.partidosLista = lista2;
      console.log(this.partidosLista, 'tyf');

      // Reiniciar la paginación a la página 1
      this.configPaginator.currentPage = 1;
    }
  }
  onSelectestado(id: number | null) {
    this.EstadosSelect = this.estados.find((v) => v.id === id);

    if (this.EstadosSelect) {
      const valueSearch2 = this.EstadosSelect.id.toString();

      console.log('Search Value:', valueSearch2);
      this.distribucionCandidaturaFilter = this.distribucionCandidatura.filter(
        (c) => c.estado?.id === id
      );

      const coalicion = this.distribucionCandidaturaFilter.flatMap((item) =>
        Array.isArray(item.coalicion) ? item.coalicion : []
      );
      const comun = this.distribucionCandidaturaFilter.flatMap((item) =>
        Array.isArray(item.comun) ? item.comun : []
      );
      const partidos = this.distribucionCandidaturaFilter.flatMap((item) =>
        Array.isArray(item.partidos) ? item.partidos : []
      );
      const independiente = this.distribucionCandidaturaFilter.flatMap((item) =>
        Array.isArray(item.independiente) ? item.independiente : []
      );

      // Llamar a la función lista() con los datos filtrados y los datos adicionales
      const lista2 = this.lista2(partidos, coalicion, comun, independiente);
      console.log(lista2); // Imprimir la lista
      this.partidosLista = lista2;
      console.log(this.partidosLista, 'tyf');

      // Reiniciar la paginación a la página 1
      this.configPaginator.currentPage = 1;
    }
  }
  onSelectdistrito(id: number | null) {
    // Buscar el distrito seleccionado en la lista de distritos
    const distritoSelect = this.distritos.find((v) => v.id === id);
    if (!distritoSelect) return;

    console.log('Search Value:', distritoSelect.id.toString());

    const resultadosFiltrados = this.Distribuciones.filter(
      (c) => c.distrito?.id === id
    );

    const coalicion = resultadosFiltrados.flatMap((item) =>
      Array.isArray(item.coalicion) ? item.coalicion : []
    );
    const comun = resultadosFiltrados.flatMap((item) =>
      Array.isArray(item.comun) ? item.comun : []
    );
    const partidos = resultadosFiltrados.flatMap((item) =>
      Array.isArray(item.partidos) ? item.partidos : []
    );
    const independiente = resultadosFiltrados.flatMap((item) =>
      Array.isArray(item.independiente) ? item.independiente : []
    );

    // Llamar a la función lista() con los datos filtrados y los datos adicionales
    const lista2 = this.lista2(partidos, coalicion, comun, independiente);
    console.log(lista2); // Imprimir la lista
    this.partidosLista = lista2;
    console.log(this.partidosLista, 'tyf');

    // Reiniciar la paginación a la página 1
    this.configPaginator.currentPage = 1;
  }

  lista2(
    partidos: string[],
    coalicion: string[],
    comun: string[],
    independiente: string[]
  ): string[] {
    // Inicializar la lista con los nombres de los partidos
    const listaPartidos: string[] = [...partidos];

    // Agregar los valores de coalicion, comun, e independiente solo si tienen elementos válidos
    coalicion.forEach((item) => {
      if (item) {
        listaPartidos.push(item);
      }
    });

    comun.forEach((item) => {
      if (item) {
        listaPartidos.push(item);
      }
    });

    independiente.forEach((item) => {
      if (item) {
        listaPartidos.push(item);
      }
    });

    return listaPartidos;
  }

  filtrarCandidaturas(id: number | null) {
    const distritoSelect = this.distritos.find((v) => v.id === id);
    if (!distritoSelect) return;

    console.log('Search Value:', distritoSelect.id.toString());

    // Guardar los resultados de la búsqueda en una variable local
    const resultadosFiltrados = this.Distribuciones.filter(
      (c) => c.distrito?.id === id
    );

    // Puedes utilizar 'resultadosFiltrados' en lugar de 'this.distribucionCandidaturaFilter' a partir de aquí
    console.log('Filtered Candidaturas:', resultadosFiltrados);

    this.configPaginator.currentPage = 1;
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
  partidosLista: string[] = [];

  verificar(): void {
    // Verificar si se ha seleccionado algún tipo de elección
    if (this.selectedTipoId === null) {
      console.log('No se ha seleccionado ningún tipo de elección.');
      return;
    }

    // Verificar si se ha seleccionado algún valor de demarcación
    const estado = this.resultadosForm.get('estado')?.value;
    const distrito = this.resultadosForm.get('distrito')?.value;
    const municipio = this.resultadosForm.get('municipio')?.value;
    const comunidad = this.resultadosForm.get('comunidad')?.value;

    if (!estado && !distrito && !municipio && !comunidad) {
      console.log('No se ha seleccionado ninguna demarcación.');
      return;
    }

    // Filtrar y mostrar los partidos según la demarcación seleccionada
    if (distrito) {
      this.onSelectdistrito(distrito);
    } else if (municipio) {
      this.onSelectmunicipios(municipio);
    } else if (comunidad) {
      this.onSelectComunidades(comunidad);
    } else if (estado) {
      this.onSelectestado(estado);
    }
  }

  getDistribucionId(distribucionId: number): void {
    this.isLoadingModalPartidos = LoadingStates.trueLoading;

    this.distribucionCandidaturaService.getById(distribucionId).subscribe({
      next: (dataFromAPI) => {
        if (dataFromAPI.partidos) {
          this.partidosLista = dataFromAPI.partidos;
        } else {
          console.error(
            'No se han recibido datos de partidos desde el servicio.'
          );
        }

        this.isLoadingModalPartidos = LoadingStates.falseLoading;
      },
      error: () => {
        this.isLoadingModalPartidos = LoadingStates.errorLoading;
      },
    });
  }

  checkValores() {
    const estado = this.resultadosForm.get('estado')?.value;
    const distrito = this.resultadosForm.get('distrito')?.value;
    const municipio = this.resultadosForm.get('municipio')?.value;
    const comunidad = this.resultadosForm.get('comunidad')?.value;

    if (distrito !== null && distrito !== undefined) {
      return true;
    } else if (municipio !== null && municipio !== undefined) {
      return true;
    } else if (comunidad !== null && comunidad !== undefined) {
      return true;
    } else if (estado !== null && estado !== undefined) {
      return true;
    } else {
      return false;
    }
  }
  lista(event: any, partidoItem: any, index: number) {
    const valor = parseFloat(event.target.value);
    if (!isNaN(valor)) {
      const nombrePartido: string = partidoItem;
      this.sumaDeValores += valor;
      this.partidosData.push({ nombre: nombrePartido, valor: valor });
      console.log(this.partidosData);

      this.resultadosForm.patchValue({
        suma: this.sumaDeValores.toString(),
      });
    }
  }

  nombrePartido: string = 'Candidato-no-registrado';
  nombrePartido2: string = 'Votos nulos';
  actualizarSuma2(event: any) {
    const valor = parseFloat(event.target.value);
    if (!isNaN(valor)) {
      this.sumaDeValores += valor;
      this.partidosData.push({
        nombre: this.nombrePartido,
        valor: valor,
      });
      console.log(this.partidosData);
      this.resultadosForm.patchValue({
        suma: this.sumaDeValores.toString(),
      });
    }
  }

  actualizarSuma3(event: any) {
    const valor = parseFloat(event.target.value);
    if (!isNaN(valor)) {
      this.sumaDeValores += valor;
      this.partidosData.push({
        nombre: this.nombrePartido2,
        valor: valor,
      });
      console.log(this.partidosData);
      this.resultadosForm.patchValue({
        suma: this.sumaDeValores.toString(),
      });
    }
  }
  deshabilitarTodosLosControles() {
    Object.keys(this.resultadosForm.controls).forEach((controlName) => {
      if (controlName !== 'curp') {
        this.resultadosForm.get(controlName)?.disable();
      }
    });
  }
  deleteItem(id: number) {
    this.mensajeService.mensajeAdvertencia(`¿Estás seguro de eliminar?`, () => {
      this.resultadoService.delete(id).subscribe({
        next: () => {
          this.mensajeService.mensajeExito(
            'Resultado pre-eliminar borrado correctamente'
          );
          this.configPaginator.currentPage = 1;
          this.searchItem.nativeElement.value = '';
        },
        error: (error) => this.mensajeService.mensajeError(error),
      });
    });
  }
  handleChangeSearch(event: any) {
    const inputValue = event.target.value;
    const valueSearch = inputValue.toLowerCase();
    this.resultadosFilter = this.resultados.filter(
      (programa) =>
        programa.tipoEleccion.nombre.toLowerCase().includes(valueSearch) ||
        programa.seccion.claveYNombre.toString().includes(valueSearch) ||
        programa.casilla.nombre.toString().includes(valueSearch) ||
        programa.distrito.nombre.toString().includes(valueSearch) ||
        programa.suma.toString().includes(valueSearch)
    );
    this.configPaginator.currentPage = 1;
  }
  exportarDatosAExcel() {
    if (this.resultados.length === 0) {
      console.warn('La lista de reasultados está vacía. No se puede exportar.');
      return;
    }

    const datosParaExportar = this.resultados.map((resultados) => {
      const partidos = resultados.partidos.map((s) => s).join(', ');
      const distrito = resultados.distrito?.nombre || 'N/R';
      const municipio = resultados.municipio?.nombre || 'N/R';
      const comunidad = resultados.comunidad?.nombre || 'N/R';
      return {
        'Tipo de eleccion': resultados.tipoEleccion.nombre,
        Disdtrito: distrito,
        Municipio: municipio,
        Comunidad: comunidad,
        Seccion: resultados.seccion.claveYNombre,
        Casilla: resultados.casilla.nombre,
        'Boletas sobrantes': resultados.boletasSobrantes,
        'Personas votaron': resultados.personasVotaron,
        'Votos representantes': resultados.votosRepresentantes,
        Suma: resultados.suma,
        Partidos: partidos,
      };
    });

    const worksheet: XLSX.WorkSheet =
      XLSX.utils.json_to_sheet(datosParaExportar);
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ['data'],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    this.guardarArchivoExcel(excelBuffer, 'Resultados.xlsx');
  }

  guardarArchivoExcel(buffer: any, nombreArchivo: string) {
    const data: Blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url: string = window.URL.createObjectURL(data);
    const a: HTMLAnchorElement = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  setDataModalUpdate(dto: Resultado) {
    this.isModalAdd = false;
    this.idUpdate = dto.id;
    this.visibiliti = true;

    // Filtrar solo el primer número de cada partido y eliminar los espacios en blanco adicionales
    const partidosFormatted = dto.partidos
      .map((partido) => partido.trim().split(',')[0].trim()) // Tomar solo el primer número de cada partido
      .filter((numero) => !isNaN(Number(numero))); // Filtrar solo los números

    this.resultadosForm.patchValue({
      id: dto.id,
      seccion: dto.seccion.id,
      casilla: dto.casilla.id,
      estado: dto.estado?.id,
      municipio: dto.municipio?.id,
      boletasSobrantes: dto.boletasSobrantes,
      distrito: dto.distrito?.id,
      comunidad: dto.comunidad?.id,
      personasVotaron: dto.personasVotaron,
      votosRepresentantes: dto.votosRepresentantes,
      suma: dto.suma,
      votosNulos: dto.votosNulos,
      noRegistrado: dto.noRegistrado,
      partidos: partidosFormatted,
    });
  }
}
