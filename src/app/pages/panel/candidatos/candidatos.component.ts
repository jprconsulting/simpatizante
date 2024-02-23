import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GenericType, LoadingStates } from 'src/app/global/global';
import { AreaAdscripcion } from 'src/app/models/area-adscripcion';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import * as XLSX from 'xlsx';
import { CargoService } from 'src/app/core/services/cargo.service';
import { Cargo } from 'src/app/models/cargo';
import { Candidato } from 'src/app/models/candidato';
import { CandidatosService } from 'src/app/core/services/candidatos.service';
import { SimpatizantesService } from 'src/app/core/services/simpatizantes.service';
import { Simpatizante } from 'src/app/models/votante';
import { GeneroService } from 'src/app/core/services/genero.service';
import { Genero } from 'src/app/models/genero';

@Component({
  selector: 'app-candidatos',
  templateUrl: './candidatos.component.html',
  styleUrls: ['./candidatos.component.css'],
})
export class CandidatosComponent implements OnInit {
  @ViewChild('closebutton') closebutton!: ElementRef;
  @ViewChild('searchItem') searchItem!: ElementRef;

  candidatos!: Candidato;
  candidatoForm!: FormGroup;
  generos: Genero[] = [];
  areasAdscripcion: AreaAdscripcion[] = [];
  candidatoFilter: Candidato[] = [];
  cargos: Cargo[] = [];
  candidato: Candidato[] = [];
  isLoading = LoadingStates.neutro;
  isLoadingModalSimpatizantes = LoadingStates.neutro;
  isModalAdd: boolean = true;
  idUpdate!: number;
  votantes: Simpatizante[] = [];
  simpatizantesFilter: Simpatizante[] = [];
  simpatizantes: Simpatizante[] = [];
  simpatizanteFilter: Simpatizante[] = [];
  errorMessage!: string;
  sinSimpatizantes: boolean = false;
  pagModalPromovidos: number = 1;
  initialValueModalSearch: string = '';

  public imgPreview: string = '';
  public emblemaPreview: string = '';
  public isUpdatingImg: boolean = false;
  public isUpdatingEmblema: boolean = false;

  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    @Inject('GENEROS') public objGeneros: any,
    private spinnerService: NgxSpinnerService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    private cargoService: CargoService,
    private candidatosService: CandidatosService,
    private simpatizantesService: SimpatizantesService,
    private generoService: GeneroService
  ) {
    this.candidatosService.refreshListCandidatos.subscribe(() =>
      this.getCandidatos()
    );
    this.getCandidatos();
    this.createForm();
    this.getCargos();
    this.getGeneros();
  }

  ngOnInit(): void {
    this.configPaginator.currentPage = 1;
  }

  estatusBtn = true;
  verdadero = 'Activo';
  falso = 'Inactivo';
  estatusTag = this.verdadero;

  setEstatus() {
    this.estatusTag = this.estatusBtn ? this.verdadero : this.falso;
  }

  imagenAmpliada: string | null = null;

  mostrarImagenAmpliada(rutaImagen: string) {
    this.imagenAmpliada = rutaImagen;
    const modal = document.getElementById('modal-imagen-ampliada');
    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
    }
  }

  cerrarModal() {
    this.imagenAmpliada = null;
    const modal = document.getElementById('modal-imagen-ampliada');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
    }
  }

  readFileAsDataURL(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Error al leer el archivo como URL de datos.'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Error al leer el archivo.'));
      };

      reader.readAsDataURL(new Blob([filePath]));
    });
  }

  getCargos() {
    this.cargoService
      .getAll()
      .subscribe({ next: (dataFromAPI) => (this.cargos = dataFromAPI) });
  }

  getGeneros() {
    this.generoService
      .getAll()
      .subscribe({ next: (dataFromAPI) => (this.generos = dataFromAPI) });
  }

  loadSimpatizantes(candidatoId: number) {
    this.isLoadingModalSimpatizantes = LoadingStates.trueLoading;
    this.simpatizantesService
      .getSimpatizantesPorCandidatoId(candidatoId)
      .subscribe({
        next: (dataFromAPI) => {
          this.sinSimpatizantes = false;
          this.simpatizantes = dataFromAPI;
          this.simpatizanteFilter = this.simpatizantes;
          this.isLoadingModalSimpatizantes = LoadingStates.falseLoading;

          console.log('SimpatizanteFilter', this.simpatizanteFilter);
        },
        error: () => {
          this.sinSimpatizantes = true;
          this.isLoadingModalSimpatizantes = LoadingStates.errorLoading;
        },
      });
  }

  onFileChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.isUpdatingImg = false;

    if (inputElement.files && inputElement.files.length > 0) {
      const file = inputElement.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        const base64String = reader.result as string;
        const base64WithoutPrefix = base64String.split(';base64,').pop() || '';

        this.candidatoForm.patchValue({
          imagenBase64: base64WithoutPrefix, // Contiene solo la representación en base64
        });
      };

      reader.readAsDataURL(file);
    }
  }

  onFileChange2(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.isUpdatingEmblema = false;
    if (inputElement.files && inputElement.files.length > 0) {
      const file = inputElement.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        const base64String = reader.result as string;
        const base64WithoutPrefix = base64String.split(';base64,').pop() || '';

        this.candidatoForm.patchValue({
          // Contiene solo la representación en base64
          emblemaBase64: base64WithoutPrefix, // Contiene solo la representación en base64
        });
      };

      reader.readAsDataURL(file);
    }
  }

  createForm() {
    this.candidatoForm = this.formBuilder.group({
      id: [null],
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
      generoId: [null, Validators.required],
      sobrenombre: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.pattern('^([a-zA-Z]{2})[a-zA-Z ]+$'),
        ],
      ],
      cargo: [null, Validators.required],
      estatus: [true],
      imagenBase64: ['', Validators.required],
      emblemaBase64: ['', Validators.required],
    });
  }

  getCandidatos() {
    this.isLoading = LoadingStates.trueLoading;
    this.candidatosService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.candidato = dataFromAPI;
        this.candidatoFilter = this.candidato;
        this.isLoading = LoadingStates.falseLoading;
      },
      error: ( err ) => {
        this.isLoading = LoadingStates.errorLoading;
        if ( err.status === 401 ){
          this.mensajeService.mensajeSesionExpirada();
        }
      },
    });
  }

  formatoFecha(fecha: string): string {
    // Aquí puedes utilizar la lógica para formatear la fecha según tus necesidades
    const fechaFormateada = new Date(fecha).toISOString().split('T')[0];
    return fechaFormateada;
  }

  onPageChange(number: number) {
    this.configPaginator.currentPage = number;
  }

  handleChangeSearch(event: any) {
    const inputValue = event.target.value;
    const valueSearch = inputValue.toLowerCase();

    this.candidatoFilter = this.candidato.filter(
      (Candidato) =>
        Candidato.nombres.toLowerCase().includes(valueSearch) ||
        Candidato.apellidoPaterno.toLowerCase().includes(valueSearch) ||
        Candidato.apellidoMaterno.toLowerCase().includes(valueSearch) ||
        Candidato.cargo.nombre.toLowerCase().includes(valueSearch) ||
        Candidato.sobrenombre.toLowerCase().includes(valueSearch) ||
        Candidato.fechaNacimiento.toLowerCase().includes(valueSearch) ||
        Candidato.genero.nombre.toLowerCase().includes(valueSearch) ||
        Candidato.edad.toString().includes(valueSearch)
    );

    this.configPaginator.currentPage = 1;
  }

  handleChangeSearchModal(event: any) {
    const inputValue = event.target.value;
    const valueSearch = inputValue.toLowerCase();

    this.simpatizanteFilter = this.simpatizantes.filter(
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

  clearInputModalSearch() {
    this.initialValueModalSearch = '';
  }

  formData: any;

  setDataModalUpdate(dto: Candidato) {
    this.isModalAdd = false;
    this.idUpdate = dto.id;
    const fechaFormateada = this.formatoFecha(dto.fechaNacimiento);
    const candidato = this.candidatoFilter.find(
      (candidato) => candidato.id === dto.id
    );

    this.imgPreview = candidato!.foto;
    this.emblemaPreview = candidato!.emblema;
    this.isUpdatingImg = true;
    this.isUpdatingEmblema = true;

    console.log('fasfdsfd', dto.imagenBase64);
    console.log('fasfdsfd', dto.emblemaBase64);

    this.candidatoForm.patchValue({
      id: dto.id,
      nombres: dto.nombres,
      estatus: dto.estatus,
      apellidoPaterno: dto.apellidoPaterno,
      apellidoMaterno: dto.apellidoMaterno,
      generoId: dto.genero.id,
      fechaNacimiento: fechaFormateada,
      sobrenombre: dto.sobrenombre,
      cargo: dto.cargo.id,
      imagenBase64: '',
      emblemaBase64: '',
    });
  }

  editarCandidato() {
    this.candidatos = this.candidatoForm.value as Candidato;
    const candidatoId = this.candidatoForm.get('id')?.value;
    const cargoid = this.candidatoForm.get('cargo')?.value;
    const generoId = this.candidatoForm.get('generoId')?.value;
    const imagenBase64 = this.candidatoForm.get('imagenBase64')?.value;
    const emblemaBase64 = this.candidatoForm.get('emblemaBase64')?.value;

    console.log(imagenBase64);
    console.log(emblemaBase64);

    this.imgPreview = '';
    this.emblemaPreview = '';

    this.candidatos.cargo = { id: cargoid } as Cargo;
    this.candidatos.genero = { id: generoId } as Genero;

    if (!imagenBase64 && !emblemaBase64) {
      const formData = { ...this.candidatos };

      this.spinnerService.show();

      this.candidatosService.put(candidatoId, formData).subscribe({
        next: () => {
          this.spinnerService.hide();
          this.mensajeService.mensajeExito(
            'Candidato actualizado correctamente'
          );
          this.resetForm();
          this.configPaginator.currentPage = 1;
        },
        error: (error) => {
          this.spinnerService.hide();
          this.mensajeService.mensajeError(error);
        },
      });
    } else if (imagenBase64 && emblemaBase64) {
      const formData = { ...this.candidatos, imagenBase64, emblemaBase64 };
      this.spinnerService.show();

      this.candidatosService.put(candidatoId, formData).subscribe({
        next: () => {
          this.spinnerService.hide();
          this.mensajeService.mensajeExito(
            'Candidato actualizado correctamente'
          );
          this.resetForm();
          this.configPaginator.currentPage = 1;
        },
        error: (error) => {
          this.spinnerService.hide();
          this.mensajeService.mensajeError(error);
        },
      });
    } else {
      console.error(
        'Error: No se encontró una representación válida en base64 de la imagen.'
      );
    }
  }

  deleteItem(id: number, nameItem: string) {
    this.mensajeService.mensajeAdvertencia(
      `¿Estás seguro de eliminar el candidato: ${nameItem}?`,
      () => {
        this.candidatosService.delete(id).subscribe({
          next: () => {
            this.mensajeService.mensajeExito('Candidato borrado correctamente');
            this.configPaginator.currentPage = 1;
            this.searchItem.nativeElement.value = '';
          },
          error: (error) => this.mensajeService.mensajeError(error),
        });
      }
    );
  }

  resetForm() {
    this.closebutton.nativeElement.click();
    this.candidatoForm.reset();
  }

  agregar() {
    this.candidatos = this.candidatoForm.value as Candidato;
    const imagenBase64 = this.candidatoForm.get('imagenBase64')?.value;
    const emblemaBase64 = this.candidatoForm.get('emblemaBase64')?.value;
    const cargoid = this.candidatoForm.get('cargo')?.value;
    const generoId = this.candidatoForm.get('generoId')?.value;

    this.candidatos.cargo = { id: cargoid } as Cargo;
    this.candidatos.genero = { id: generoId } as Genero;

    if (imagenBase64 && emblemaBase64) {
      const formData = { ...this.candidatos, imagenBase64, emblemaBase64 };
      this.spinnerService.show();
      this.candidatosService.post(formData).subscribe({
        next: () => {
          this.spinnerService.hide();
          this.mensajeService.mensajeExito('Candidato guardado correctamente');
          this.resetForm();
          this.configPaginator.currentPage = 1;
        },
        error: (error) => {
          this.spinnerService.hide();
          this.mensajeService.mensajeError(error);
        },
      });
    } else {
      console.error(
        'Error: No se encontró una representación válida en base64 de la imagen.'
      );
    }
  }

  submit() {
    if (this.isModalAdd === false) {
      this.editarCandidato();
    } else {
      this.agregar();
    }
  }
  showModal = false;

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  modalSimpatizantes(id: number) {
    this.pagModalPromovidos = 1;

    const modal = document.getElementById('modal-simpatizantes');
    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
    }

    this.loadSimpatizantes(id);
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

  handleChangeAdd() {
    this.isUpdatingImg = false;
    this.isUpdatingEmblema = false;
    if (this.candidatoForm) {
      this.candidatoForm.reset();
      const estatusControl = this.candidatoForm.get('estatus');
      if (estatusControl) {
        estatusControl.setValue(true);
      }
      this.isModalAdd = true;
    }
  }

  exportarDatosAExcel() {
    if (this.candidato.length === 0) {
      console.warn('La lista de candidatos está vacía. No se puede exportar.');
      return;
    }

    const datosParaExportar = this.candidato.map((candidato) => {
      const estatus = candidato.estatus ? 'Activo' : 'Inactivo';
      const fechaNacimiento = candidato.fechaNacimiento
        ? new Date(candidato.fechaNacimiento).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })
        : '';
      return {
        Nombres: candidato.nombres,
        'Apellido paterno': candidato.apellidoPaterno,
        'Apellido materno': candidato.apellidoMaterno,
        'Fecha nacimiento': fechaNacimiento,
        Genero: candidato.genero.nombre,
        Sobrenombre: candidato.sobrenombre,
        Cargo: candidato.cargo.nombre,
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

    this.guardarArchivoExcel(excelBuffer, 'Candidatos.xlsx');
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

  exportarDatosAExcelPromovidos() {
    if (this.simpatizanteFilter.length === 0) {
      console.warn(
        'La lista de simpatizantes está vacía, no se puede exportar.'
      );
      return;
    }

    const datosParaExportar = this.simpatizantes.map((votante) => {
      const estatus = votante.estatus ? 'Activo' : 'Inactivo';
      const fechaFormateada = new Date(votante.fechaNacimiento)
        .toISOString()
        .split('T')[0];

      // Manejo del promotor
      const promotorNombreCompleto =
        votante.promotor?.nombreCompleto || 'Sin promotor';
      const programaSocial =
        votante.programaSocial?.nombre || 'Sin programa social';

      return {
        Nombre: votante.nombres,
        'Apellido paterno': votante.apellidoPaterno,
        'Apellido materno': votante.apellidoMaterno,
        'Fecha de nacimiento': fechaFormateada,
        Edad: votante.edad,
        CURP: votante.curp,
        Genero: votante.genero.nombre,
        Domicilio: votante.domicilio,
        Municipio: votante.municipio.nombre,
        Estado: votante.estado.nombre,
        Seccion: votante.seccion.clave,
        Promotor: promotorNombreCompleto,
        Operador: votante.operador.nombreCompleto,
        'Numero de teléfono': votante.numerotel,
        'Programa Social': programaSocial,
        'Tercer nivel de referencia': votante.tercerNivelContacto,
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

    this.guardarArchivoExcelpromovidos(excelBuffer, 'Promovidos.xlsx');
  }

  guardarArchivoExcelpromovidos(buffer: any, nombreArchivo: string) {
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
}
