import {
  Component,
  Inject,
  ViewChild,
  ElementRef,
  OnInit,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { OperadoresService } from 'src/app/core/services/operadores.service';
import { SeccionService } from 'src/app/core/services/seccion.service';
import { GenericType, LoadingStates, RolesBD } from 'src/app/global/global';
import { Operador } from 'src/app/models/operador';
import { Seccion } from 'src/app/models/seccion';
import * as XLSX from 'xlsx';
import { SimpatizantesService } from 'src/app/core/services/simpatizantes.service';
import { Simpatizante } from 'src/app/models/votante';
import { CandidatosService } from 'src/app/core/services/candidatos.service';
import { Candidato } from 'src/app/models/candidato';
import { AppUserAuth } from 'src/app/models/login';
import { SecurityService } from 'src/app/core/services/security.service';
import { MunicipiosService } from 'src/app/core/services/municipios.service';
import { Municipio } from 'src/app/models/municipio';

@Component({
  selector: 'app-operadores',
  templateUrl: './operadores.component.html',
  styleUrls: ['./operadores.component.css'],
})
export class OperadoresComponent implements OnInit {
  @ViewChild('closebutton') closebutton!: ElementRef;
  @ViewChild('searchItem') searchItem!: ElementRef;

  operador!: Operador;
  seccionesId!: Operador;
  seccionesOperador: Seccion[] = [];
  seccionesOperadorFilter: Seccion[] = [];
  isLoadingModalSeccionesOperador = LoadingStates.neutro;
  operadorForm!: FormGroup;
  operadores: Operador[] = [];
  operadorFilter: Operador[] = [];
  isLoading = LoadingStates.neutro;
  generos: GenericType[] = [
    { id: 1, name: 'Masculino' },
    { id: 2, name: 'Femenino' },
  ];
  seccionesRegistradas: Seccion[] = [];
  secciones: Seccion[] = [];
  isModalAdd = true;
  rolId = 0;
  seccionesFilter: Seccion[] = [];
  votantes: Simpatizante[] = [];
  isLoadingModalPromovidosOperador = LoadingStates.neutro;
  simpatizantes: Simpatizante[] = [];
  simpatizantesOperador: Simpatizante[] = [];
  sinSimpatizantes: boolean = true;
  candidatos: Candidato[] = [];
  currentUser!: AppUserAuth | null;
  readonlySelectCandidato = true;
  candidatoId = 0;
  pagModalSecciones: number = 1;
  pagModalPromovidos: number = 1;
  initialValueModalSearchSecciones: string = '';
  initialValueModalSearchPromovidos: string = '';
  dataObject!: AppUserAuth | null;
  operadorSelect!: Operador | undefined;
  candidatoSelect!: Candidato | undefined;
  sindataMessage = '';
  selectedMunicipioId: number | null = null;
  municipios: Municipio[] = [];
  mapaForm!: FormGroup;

  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    @Inject('GENEROS') public objGeneros: any,
    private spinnerService: NgxSpinnerService,
    private operadoresService: OperadoresService,
    private candidatosService: CandidatosService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    private seccionesService: SeccionService,
    private simpatizantesService: SimpatizantesService,
    private securityService: SecurityService,
    private municipiosService: MunicipiosService
  ) {
    this.operadoresService.refreshListOperadores.subscribe(() =>
      this.getOperadores()
    );
    this.currentUser = securityService.getDataUser();
    this.creteForm();
    this.getCandidatos();
    this.getOperadores();
    this.getSeccionesRegistradas();
    this.getMunicipios();
    this.creteForm2();
    this.dataObject = this.securityService.getDataUser();
    console.log(this.dataObject);
    this.isLoading = LoadingStates.trueLoading;
    const isAdmin = this.dataObject && this.dataObject.rolId === 5;

    if (this.currentUser?.rolId === RolesBD.candidato) {
      this.candidatoId = this.currentUser?.candidatoId;
    }

    this.readonlySelectCandidato =
      this.currentUser?.rolId !== RolesBD.administrador;
    if (this.currentUser?.rolId === RolesBD.candidato) {
      this.mapaForm.controls['candidatoId'].setValue(this.candidatoId);
    }
  }

  ngOnInit(): void {
    this.isModalAdd = false;
    this.configPaginator.currentPage = 1;
  }

  getMunicipios() {
    this.municipiosService
      .getAll()
      .subscribe({ next: (dataFromAPI) => (this.municipios = dataFromAPI) });
  }
  creteForm2() {
    this.mapaForm = this.formBuilder.group({
      candidatoId: [],
    });
  }
  verSeccionesOperador(operadorId: number) {
    this.pagModalSecciones = 1;

    this.getSeccionesOperadorId(operadorId);

    const modal = document.getElementById('modal-imagen-ampliada');
    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
    }
  }

  mostrarSimpatizantesAsociadosModal(operadorId: number) {
    this.pagModalPromovidos = 1;

    this.getSimpatizantesOperadorId(operadorId);

    const modal = document.getElementById('modal-simpatizantes');
    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
    }
  }

  getGeneroName(id: number): string {
    const genero = this.generos.find((g) => g.id === id);
    return genero ? genero.name : '';
  }

  getSimpatizantesOperadorId(operadorId: number) {
    this.isLoadingModalPromovidosOperador = LoadingStates.trueLoading;

    this.simpatizantesService
      .getSimpatizantesPorOperadorId(operadorId)
      .subscribe({
        next: (dataFromAPI) => {
          this.sinSimpatizantes = false;
          this.simpatizantes = dataFromAPI;
          this.simpatizantesOperador = this.simpatizantes;
          this.isLoadingModalPromovidosOperador = LoadingStates.falseLoading;
        },
        error: () => {
          this.sinSimpatizantes = true;
          this.isLoadingModalPromovidosOperador = LoadingStates.errorLoading;
        },
      });
  }

  getSeccionesOperadorId(operadorId: number) {
    this.isLoadingModalSeccionesOperador = LoadingStates.trueLoading;

    this.operadoresService.getById(operadorId).subscribe({
      next: (dataFromAPI) => {
        this.seccionesId = dataFromAPI;
        this.secciones = this.seccionesId.secciones;
        this.seccionesOperador = this.secciones;
        this.isLoadingModalSeccionesOperador = LoadingStates.falseLoading;
      },
      error: () => {
        this.isLoadingModalSeccionesOperador = LoadingStates.errorLoading;
      },
    });
  }

  getSeccionesRegistradas() {
    this.seccionesService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.seccionesRegistradas = dataFromAPI;
      },
    });
    console.log(this.seccionesRegistradas);
  }

  creteForm() {
    this.operadorForm = this.formBuilder.group({
      id: [null],
      candidatoId: [null, Validators.required],
      nombres: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(22),
          Validators.pattern(
            /^([a-zA-ZÀ-ÿ\u00C0-\u00FF]{2})[a-zA-ZÀ-ÿ\u00C0-\u00FF ]+$/
          ),
        ],
      ],
      apellidoPaterno: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(17),
          Validators.pattern(
            /^([a-zA-ZÀ-ÿ\u00C0-\u00FF]{2})[a-zA-ZÀ-ÿ\u00C0-\u00FF ]+$/
          ),
        ],
      ],
      apellidoMaterno: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(17),
          Validators.pattern(
            /^([a-zA-ZÀ-ÿ\u00C0-\u00FF]{2})[a-zA-ZÀ-ÿ\u00C0-\u00FF ]+$/
          ),
        ],
      ],
      municipio: [[], Validators.required],
      fechaNacimiento: ['', Validators.required],
      seccionesIds: [[], Validators.required],
      estatus: [true],
    });
  }
  getOperadores() {
    this.dataObject = this.securityService.getDataUser();
    console.log(this.dataObject);
    this.isLoading = LoadingStates.trueLoading;
    const isAdmin = this.dataObject && this.dataObject.rolId === 5;
    if (isAdmin) {
      this.operadoresService.getAll().subscribe({
        next: (dataFromAPI) => {
          this.operadores = dataFromAPI;
          this.operadorFilter = this.operadores;
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
    const isCandidato = this.dataObject && this.dataObject.rolId === 7;

    if (isCandidato) {
      const id = this.dataObject && this.dataObject.candidatoId;
      console.log(id);
      if (id) {
        this.isLoading = LoadingStates.trueLoading;
        this.operadoresService.getOperadoresPorCandidatoId(id).subscribe({
          next: (dataFromAPI) => {
            this.operadores = dataFromAPI;
            this.operadorFilter = this.operadores;
            this.isLoading = LoadingStates.falseLoading;
          },
          error: () => {
            this.isLoading = LoadingStates.errorLoading;
          },
        });
      }
    }
  }

  getCandidatos() {
    this.candidatosService
      .getAll()
      .subscribe({ next: (dataFromAPI) => (this.candidatos = dataFromAPI) });
  }

  onPageChange(number: number) {
    this.configPaginator.currentPage = number;
  }

  clearInputModalSearch() {
    this.initialValueModalSearchSecciones = '';
    this.initialValueModalSearchPromovidos = '';
  }

  handleChangeSearch(event: any) {
    const inputValue = event.target.value;
    const valueSearch = inputValue.toLowerCase();
    this.operadorFilter = this.operadores.filter(
      (operador) =>
        operador.nombres.toLowerCase().includes(valueSearch) ||
        operador.apellidoPaterno.toLowerCase().includes(valueSearch) ||
        operador.fechaNacimiento.toString().includes(valueSearch) ||
        operador.apellidoMaterno.toLowerCase().includes(valueSearch) ||
        operador.edad.toString().includes(valueSearch) ||
        operador.candidato.nombreCompleto.toString().includes(valueSearch)
    );
    this.configPaginator.currentPage = 1;
  }

  handleChangeSearchModalSimpatizantesAsociados(event: any) {
    const inputValue = event.target.value;
    const valueSearch = inputValue.toLowerCase();

    this.simpatizantesOperador = this.simpatizantes.filter(
      (Simpatizante) =>
        Simpatizante.nombres.toLowerCase().includes(valueSearch) ||
        Simpatizante.apellidoPaterno.toLowerCase().includes(valueSearch) ||
        Simpatizante.apellidoMaterno.toLowerCase().includes(valueSearch) ||
        Simpatizante.fechaNacimiento.toLowerCase().includes(valueSearch) ||
        Simpatizante.genero.nombre.toLowerCase().includes(valueSearch) ||
        Simpatizante.domicilio.toLowerCase().includes(valueSearch) ||
        Simpatizante.programaSocial?.nombre.toLowerCase().includes(valueSearch)
    );

    this.pagModalPromovidos = 1;
  }

  handleChangeSearchModalSeccionesAsociadas(event: any) {
    const inputValue = event.target.value;
    const valueSearch = inputValue.toLowerCase();

    this.seccionesOperador = this.secciones.filter(
      (Seccion) =>
        Seccion.claveYNombre.toLocaleLowerCase().includes(valueSearch) ||
        Seccion.municipio.nombre.toLocaleLowerCase().includes(valueSearch)
    );

    this.pagModalSecciones = 1;
  }

  idUpdate!: number;

  formatoFecha(fecha: string): string {
    // Aquí puedes utilizar la lógica para formatear la fecha según tus necesidades
    const fechaFormateada = new Date(fecha).toISOString().split('T')[0];
    return fechaFormateada;
  }

  setDataModalUpdate(dto: Operador) {
    this.isModalAdd = false;
    this.idUpdate = dto.id;
    const fechaFormateada = this.formatoFecha(dto.fechaNacimiento);
    this.operadorForm.patchValue({
      id: dto.id,
      candidatoId: dto.candidato.id,
      nombres: dto.nombres,
      apellidoPaterno: dto.apellidoPaterno,
      apellidoMaterno: dto.apellidoMaterno,
      fechaNacimiento: fechaFormateada,
      estatus: dto.estatus,
      municipio: dto.municipio.id,
      seccionesIds: dto.secciones.map((s) => s.id),
    });
  }

  editarOperador() {
    this.operador = this.operadorForm.value as Operador;
    this.operador.id = this.idUpdate;
    const seccionesIds = this.operadorForm.get('seccionesIds')?.value;
    this.operador.seccionesIds = seccionesIds as number[];
    const candidatoId = this.operadorForm.get('candidatoId')?.value;
    this.operador.candidato = { id: candidatoId } as Candidato;
    const municipioId = this.operadorForm.get('municipio')?.value;
    this.operador.municipio = { id: municipioId } as Municipio;
    this.spinnerService.show();
    this.operadoresService.put(this.idUpdate, this.operador).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Operador actualizado correctamente');
        this.resetForm();
      },
      error: (error) => {
        this.spinnerService.hide();
        this.mensajeService.mensajeError(error);
      },
    });
  }

  deleteItem(id: number, nameItem: string) {
    this.mensajeService.mensajeAdvertencia(
      `¿Estás seguro de eliminar el operador: ${nameItem}?`,
      () => {
        this.operadoresService.delete(id).subscribe({
          next: () => {
            this.mensajeService.mensajeExito('Operador borrado correctamente');
            this.configPaginator.currentPage = 1;
            this.searchItem.nativeElement.value = '';
          },
          error: (error) => this.mensajeService.mensajeError(error),
        });
      }
    );
  }

  agregar() {
    this.operador = this.operadorForm.value as Operador;
    const seccionesIds = this.operadorForm.get('seccionesIds')?.value;
    this.operador.seccionesIds = seccionesIds as number[];
    const candidatoId = this.operadorForm.get('candidatoId')?.value;
    this.operador.candidato = { id: candidatoId } as Candidato;
    const municipioId = this.operadorForm.get('municipio')?.value;
    this.operador.municipio = { id: municipioId } as Municipio;
    this.spinnerService.show();
    this.operadoresService.post(this.operador).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Operador guardado correctamente');
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
    this.operadorForm.reset();
  }

  submit() {
    if (this.isModalAdd === false) {
      this.editarOperador();
    } else {
      this.agregar();
    }
  }

  handleChangeAdd() {
    if (this.operadorForm) {
      this.operadorForm.reset();

      if (this.currentUser?.rolId === RolesBD.candidato) {
        this.operadorForm.controls['candidatoId'].setValue(this.candidatoId);
      }

      const estatusControl = this.operadorForm.get('estatus');
      if (estatusControl) {
        estatusControl.setValue(true);
      }
      this.isModalAdd = true;
    }
  }

  showModal = false;

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  cerrarModal2() {
    this.clearInputModalSearch();
    this.imagenAmpliada = null;
    const modal = document.getElementById('modal-simpatizantes');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
    }
  }

  exportarDatosAExcel() {
    if (this.operadores.length === 0) {
      console.warn('La lista de usuarios está vacía. No se puede exportar.');
      return;
    }

    const datosParaExportar = this.operadores.map((operador) => {
      const estatus = operador.estatus ? 'Activo' : 'Inactivo';
      const fechaNacimiento = operador.fechaNacimiento
        ? new Date(operador.fechaNacimiento).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })
        : '';
      const secciones = operador.secciones
        .map((s) => s.claveYNombre)
        .join(', ');
      return {
        Nombres: operador.nombres,
        'Apellido paterno': operador.apellidoPaterno,
        'Apellido materno': operador.apellidoMaterno,
        'Fecha de nacimiento': fechaNacimiento,
        Candidato: operador.candidato.nombreCompleto,
        Municipio: operador.municipio,
        Secciones: secciones,
        Estatus: estatus,
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

    this.guardarArchivoExcel(excelBuffer, 'Operadores.xlsx');
  }

  exportarDatosAExcelSimpatizantesAsociados() {
    if (this.sinSimpatizantes) {
      console.warn(
        'La lista de promovidos asociados está vacía. No se puede exportar.'
      );
      return;
    }

    const datosParaExportar = this.simpatizantesOperador.map((simpatizante) => {
      const promotorNombreCompleto =
        simpatizante.promotor?.nombreCompleto || 'Sin promotor';
      const programaSocial =
        simpatizante.programaSocial?.nombre || 'Sin programa social';
      const estatus = simpatizante.estatus ? 'Activo' : 'Inactivo';
      const fechaNacimiento = simpatizante.fechaNacimiento
        ? new Date(simpatizante.fechaNacimiento).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })
        : '';

      return {
        'Nombre Completo': simpatizante.nombreCompleto,
        'Fecha de nacimiento': fechaNacimiento,
        Domicilio: simpatizante.domicilio,
        Genero: simpatizante.genero.nombre,
        'Programa Social': programaSocial,
        Edad: simpatizante.edad,
        CURP: simpatizante.curp,
        Municipio: simpatizante.municipio.nombre,
        Estado: simpatizante.estado.nombre,
        Seccion: simpatizante.seccion.clave,
        Promotor: promotorNombreCompleto,
        Operador: simpatizante.operador.nombreCompleto,
        'Numero de teléfono': simpatizante.numerotel,
        'Tercer nivel de referencia': simpatizante.tercerNivelContacto,
        Estatus: estatus,
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

    this.guardarArchivoExcel(excelBuffer, 'PromovidosAOperadores.xlsx');
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

  toggleDisabled() {
    const car: any = this.secciones[1];
    car.disabled = !car.disabled;
  }
  imagenAmpliada: string | null = null;

  obtenerRutaImagen(nombreArchivo: string): string {
    const rutaBaseAPI = 'https://localhost:7224/';
    if (nombreArchivo) {
      return `${rutaBaseAPI}images/${nombreArchivo}`;
    }
    return ''; // O una URL predeterminada si no hay nombre de archivo
  }

  mostrarImagenAmpliada(seccion: string) {
    this.imagenAmpliada = seccion;
    const modal = document.getElementById('modal-imagen-ampliada');
    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
    }
  }

  cerrarModal() {
    this.clearInputModalSearch();
    this.imagenAmpliada = null;
    const modal = document.getElementById('modal-imagen-ampliada');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
    }
  }
  seleccionarTodo() {
    const todasLasOpciones = this.seccionesRegistradas.map((item) => item.id);

    if (this.operadorForm !== null && this.operadorForm !== undefined) {
      const seccionesIdsControl = this.operadorForm.get('seccionesIds');

      if (seccionesIdsControl !== null && seccionesIdsControl !== undefined) {
        seccionesIdsControl.setValue(todasLasOpciones);
      }
    }
  }
  onSelectCandidato(id: number | null) {
    this.operadorSelect = this.operadores.find((o) => o.candidato.id === id);

    if (this.operadorSelect) {
      const valueSearch2 =
        this.operadorSelect.candidato.nombreCompleto.toLowerCase();
      console.log('Search Value:', valueSearch2);

      // Filtrar los votantes
      this.operadorFilter = this.operadores.filter((o) =>
        o.candidato.nombreCompleto.toLowerCase().includes(valueSearch2)
      );
      this.sindataMessage = '';
      console.log('Filtered Votantes:', this.operadorFilter);

      // Verificar si votantesFilter es null o vacío
      if (!this.operadorFilter || this.operadorFilter.length === 0) {
        this.operadorFilter = [];
      }
      this.configPaginator.currentPage = 1;
    } else {
      this.sindataMessage = 'No se encontraron operadores.';
      // Si no se encuentra el votante seleccionado, establecer votantesFilter como un array vacío
      this.operadorFilter = [];
    }
  }
  onClear() {
    if (this.votantes) {
      this.getOperadores();
    }
    this.sindataMessage = '';
  }

  Candidatomunicipio(id: number | null) {
    this.candidatoSelect = this.candidatos.find((o) => o.id === id);
    console.log(this.candidatoSelect, 'nsacd');
    if (
      this.candidatoSelect &&
      this.candidatoSelect.municipio?.id !== undefined
    ) {
      this.selectedMunicipioId = this.candidatoSelect.municipio?.id;

      this.seccionesService.getMunicipioId(this.selectedMunicipioId).subscribe({
        next: (dataFromAPI) => {
          this.seccionesRegistradas = dataFromAPI;
          this.seccionesOperador = this.seccionesRegistradas;
        },
      });
    }
    if (
      this.operadorSelect &&
      this.operadorSelect.candidato.municipio?.id === undefined
    ) {
      this.getSeccionesRegistradas();
    }
  }
  onClearsecciones() {
    this.getSeccionesRegistradas();
  }

  seccionMunicipio(id: number) {
    this.seccionesService.getMunicipioId(id).subscribe({
      next: (dataFromAPI) => {
        this.seccionesRegistradas = dataFromAPI;
        this.seccionesOperador = this.secciones;
      },
    });
  }
}
