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
import { AreaAdscripcion } from 'src/app/models/area-adscripcion';
import { Operador } from 'src/app/models/operador';
import { Seccion } from 'src/app/models/seccion';
import * as XLSX from 'xlsx';
import { SimpatizantesService } from 'src/app/core/services/simpatizantes.service';
import { Simpatizante } from 'src/app/models/votante';
import { CandidatosService } from 'src/app/core/services/candidatos.service';
import { Candidato } from 'src/app/models/candidato';
import { AppUserAuth } from 'src/app/models/login';
import { SecurityService } from 'src/app/core/services/security.service';

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
  areasAdscripcion: AreaAdscripcion[] = [];
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
    private securityService: SecurityService
  ) {
    this.operadoresService.refreshListOperadores.subscribe(() =>
      this.getOperadores()
    );
    this.currentUser = securityService.getDataUser();
    this.creteForm();
    this.getCandidatos();
    this.getOperadores();
    this.getSeccionesRegistradas();

    if (this.currentUser?.rolId === RolesBD.candidato) {
      this.candidatoId = this.currentUser?.candidatoId;

    }

    this.readonlySelectCandidato =
      this.currentUser?.rolId !== RolesBD.administrador;
  }
  ngOnInit(): void {
    this.isModalAdd = false;
    this.configPaginator.currentPage = 1;
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
          Validators.pattern(
            /^([a-zA-ZÀ-ÿ\u00C0-\u00FF]{2})[a-zA-ZÀ-ÿ\u00C0-\u00FF ]+$/
          ),
        ],
      ],
      fechaNacimiento: ['', Validators.required],
      seccionesIds: [[], Validators.required],
      estatus: [true],
    });
  }
  getOperadores() {
    this.dataObject = this.securityService.getDataUser();
    console.log(this.dataObject);
    this.isLoading = LoadingStates.trueLoading;
    const isAdmin = this.dataObject && this.dataObject.rolId === 1;
    if (isAdmin) {
      this.operadoresService.getAll().subscribe({
        next: (dataFromAPI) => {
          this.operadores = dataFromAPI;
          this.operadorFilter = this.operadores;
          this.isLoading = LoadingStates.falseLoading;
        },
        error: (err) => {
          this.isLoading = LoadingStates.errorLoading;
          if ( err.status === 401 ){
            this.mensajeService.mensajeSesionExpirada();
          }
        },
      });
    }
    const isCandidato = this.dataObject && this.dataObject.rolId === 3;

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
        operador.edad.toString().includes(valueSearch)
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
}
