import { Component, Inject, ViewChild, ElementRef, OnInit } from '@angular/core';
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
  styleUrls: ['./operadores.component.css']
})
export class OperadoresComponent implements OnInit {

  @ViewChild('closebutton') closebutton!: ElementRef;
  @ViewChild('searchItem') searchItem!: ElementRef;

  operador!: Operador;
  operadorForm!: FormGroup;
  operadores: Operador[] = [];
  operadorFilter: Operador[] = [];
  isLoading = LoadingStates.neutro;
  generos: GenericType[] = [{ id: 1, name: 'Masculino' }, { id: 2, name: 'Femenino' }];
  secciones: Seccion[] = [];
  areasAdscripcion: AreaAdscripcion[] = [];
  isModalAdd = true;
  rolId = 0;
  seccionesFilter: Seccion[] = [];
  votantes: Simpatizante[] = [];
  simpatizantes: Simpatizante[] = [];
  candidatos: Candidato[] = [];
  currentUser!: AppUserAuth | null;
  readonlySelectCandidato = true;
  candidatoId = 0;


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
  ) {
    this.operadoresService.refreshListOperadores.subscribe(() => this.getOperadores());
    this.currentUser = securityService.getDataUser();
    this.creteForm();
    this.getCandidatos();
    this.getOperadores();
    this.getSecciones();

    if (this.currentUser?.rolId === RolesBD.candidato) {
      this.candidatoId = this.currentUser?.candidatoId;
    }

    this.readonlySelectCandidato = this.currentUser?.rolId !== RolesBD.administrador;

  }
  ngOnInit(): void {
    this.isModalAdd = false;
    this.loadSimpatizantes();
  }

  getGeneroName(id: number): string {
    const genero = this.generos.find(g => g.id === id);
    return genero ? genero.name : '';
  }

  getSecciones() {
    this.seccionesService.getAll().subscribe(
      {
        next: (dataFromAPI) => {
          this.secciones = dataFromAPI
        }
      });
    console.log(this.secciones)
  }



  creteForm() {
    this.operadorForm = this.formBuilder.group({
      id: [null],
      candidatoId: [null, Validators.required],
      nombres: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^([a-zA-ZÀ-ÿ\u00C0-\u00FF]{2})[a-zA-ZÀ-ÿ\u00C0-\u00FF ]+$/)]],
      apellidoPaterno: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^([a-zA-ZÀ-ÿ\u00C0-\u00FF]{2})[a-zA-ZÀ-ÿ\u00C0-\u00FF ]+$/)]],
      apellidoMaterno: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^([a-zA-ZÀ-ÿ\u00C0-\u00FF]{2})[a-zA-ZÀ-ÿ\u00C0-\u00FF ]+$/)]],
      fechaNacimiento: ['', Validators.required],
      seccionesIds: [[], Validators.required],
      estatus: [true],
    });
  }



  getOperadores() {
    this.isLoading = LoadingStates.trueLoading;
    this.operadoresService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.operadores = dataFromAPI;
        this.operadorFilter = this.operadores;
        this.isLoading = LoadingStates.falseLoading;
        this.obtenerSeccionesIdsDeOperadores();
      },
      error: () => {
        this.isLoading = LoadingStates.errorLoading;
      }
    });
  }

  getCandidatos() {
    this.candidatosService.getAll().subscribe({ next: (dataFromAPI) => this.candidatos = dataFromAPI });
  }

  obtenerSeccionesIdsDeOperadores() {
    this.operadores.forEach((operador) => {
      const seccionesIds = operador.secciones;
      this.seccionesFilter = this.secciones;
      console.log(`SeccionesIds del operador ${operador.id}:`, seccionesIds);
    });
  }

  onPageChange(number: number) {
    this.configPaginator.currentPage = number;
  }

  handleChangeSearch(event: any) {
    const inputValue = event.target.value;
    const valueSearch = inputValue.toLowerCase();
    this.operadorFilter = this.operadores.filter(operador =>
      operador.nombres.toLowerCase().includes(valueSearch) ||
      operador.apellidoPaterno.toLowerCase().includes(valueSearch) ||
      operador.fechaNacimiento.toString().includes(valueSearch) ||
      operador.apellidoMaterno.toLowerCase().includes(valueSearch)

    );
    this.configPaginator.currentPage = 1;
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
          error: (error) => this.mensajeService.mensajeError(error)
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
  mostrarImagenAmpliada2(seccion: string) {
    this.imagenAmpliada = seccion;
    const modal = document.getElementById('modal-simpatizantes');
    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
    }
  }
  cerrarModal2() {
    this.imagenAmpliada = null;
    const modal = document.getElementById('modal-simpatizantes');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
    }
  }

  loadSimpatizantes() {
    // Assuming you have a candidateId, replace it with the actual value
    const candidateId = 1; // Replace with the actual candidateId
    this.simpatizantesService.getSimpatizantesPorOperadorId(candidateId)
      .subscribe(data => {
        this.simpatizantes = data;
      });
  }


  exportarDatosAExcel() {
    if (this.operadores.length === 0) {
      console.warn('La lista de usuarios está vacía. No se puede exportar.');
      return;
    }

    const datosParaExportar = this.operadores.map(operador => {
      const estatus = operador.estatus ? 'Activo' : 'Inactivo';
      const fechaNacimiento = operador.fechaNacimiento ?
        new Date(operador.fechaNacimiento).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) :
        '';
      return {
        'Nombres': operador.nombres,
        'Apellido paterno': operador.apellidoPaterno,
        'Apellido materno': operador.apellidoMaterno,
        'Fecha de nacimiento': fechaNacimiento,
        'Estatus': estatus,
      };
    });
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosParaExportar);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    this.guardarArchivoExcel(excelBuffer, 'Operadores.xlsx');
  }

  guardarArchivoExcel(buffer: any, nombreArchivo: string) {
    const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
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
    this.imagenAmpliada = null;
    const modal = document.getElementById('modal-imagen-ampliada');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
    }
  }

}
