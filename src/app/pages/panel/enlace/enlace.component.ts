import { Component, Inject, ViewChild, ElementRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { OperadoresService } from 'src/app/core/services/operadores.service';
import { LoadingStates, RolesBD } from 'src/app/global/global';
import { Operador } from 'src/app/models/operador';
import * as XLSX from 'xlsx';

import { Candidato } from 'src/app/models/candidato';
import { AppUserAuth } from 'src/app/models/login';
import { SecurityService } from 'src/app/core/services/security.service';
import { Enlace } from 'src/app/models/enlace';
import { EnlacesService } from 'src/app/core/services/enlaces.service';

@Component({
  selector: 'app-enlace',
  templateUrl: './enlace.component.html',
  styleUrls: ['./enlace.component.css']
})
export class EnlaceComponent implements OnInit {
  @ViewChild('closebutton') closebutton!: ElementRef;
  @ViewChild('searchItem') searchItem!: ElementRef;

  operador!: Operador;
  enlace!: Enlace;
  operadorForm!: FormGroup;
  enlaceForm!: FormGroup;
  operadores: Operador[] = [];
  enlaces: Enlace[] = [];
  operadorFilter: Operador[] = [];
  enlaceFilter: Enlace[] = [];
  isLoading = LoadingStates.neutro;
  isModalAdd = true;
  rolId = 0;

  currentUser!: AppUserAuth | null;
  readonlySelectOperador = true;
  operadorId = 0;


  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    @Inject('GENEROS') public objGeneros: any,
    private spinnerService: NgxSpinnerService,
    private operadoresService: OperadoresService,
    private enlacesService: EnlacesService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    private securityService: SecurityService,
  ) {
    this.operadoresService.refreshListOperadores.subscribe(() => this.getEnlaces());
    this.currentUser = securityService.getDataUser();
    this.creteForm();
    this.getEnlaces();

  }

  ngOnInit(): void {
    this.isModalAdd = false;
  }



  creteForm() {
    this.enlaceForm = this.formBuilder.group({
      id: [null],
      nombres: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^([a-zA-ZÀ-ÿ\u00C0-\u00FF]{2})[a-zA-ZÀ-ÿ\u00C0-\u00FF ]+$/)]],
      apellidoPaterno: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^([a-zA-ZÀ-ÿ\u00C0-\u00FF]{2})[a-zA-ZÀ-ÿ\u00C0-\u00FF ]+$/)]],
      apellidoMaterno: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^([a-zA-ZÀ-ÿ\u00C0-\u00FF]{2})[a-zA-ZÀ-ÿ\u00C0-\u00FF ]+$/)]],
    });
  }



  getOperadores() {
    this.operadoresService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.operadores = dataFromAPI;
        this.operadorFilter = this.operadores;
      }
    });
  }

  getEnlaces() {
    this.isLoading = LoadingStates.trueLoading;
    this.enlacesService.getAll().subscribe({
      next: ( dataFromAPI ) => {
        this.enlaces = dataFromAPI;
        this.enlaceFilter = this.enlaces;
        this.isLoading = LoadingStates.falseLoading;

      },
      error: () =>{
        this.isLoading = LoadingStates.errorLoading;
      }
    })
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

  handleChangeSearchModal(event: any) {
    const inputValue = event.target.value;
    const valueSearch = inputValue.toLowerCase();

    this.enlaceFilter = this.enlaces.filter(Enlace =>
      Enlace.nombres.toLowerCase().includes(valueSearch) ||
      Enlace.apellidoPaterno.toLowerCase().includes(valueSearch) ||
      Enlace.apellidoMaterno.toLowerCase().includes(valueSearch)
    )

    this.configPaginator.currentPage = 1;
  }

  idUpdate!: number;

  formatoFecha(fecha: string): string {
    // Aquí puedes utilizar la lógica para formatear la fecha según tus necesidades
    const fechaFormateada = new Date(fecha).toISOString().split('T')[0];
    return fechaFormateada;
  }

  setDataModalUpdate(dto: Enlace) {

    this.isModalAdd = false;
    this.idUpdate = dto.id;

    this.operadorForm.patchValue({
      id: dto.id,
      nombres: dto.nombres,
      apellidoPaterno: dto.apellidoPaterno,
      apellidoMaterno: dto.apellidoMaterno,
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
    this.enlace = this.enlaceForm.value as Enlace;
    this.spinnerService.show();
    console.log(this.enlace);

    this.enlacesService.post(this.enlace).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Enlace guardado correctamente');
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
    if (this.enlaceForm) {
      this.enlaceForm.reset();

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


  imagenAmpliada: string | null = null;



  cerrarModal() {
    this.imagenAmpliada = null;
    const modal = document.getElementById('modal-imagen-ampliada');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
    }
  }

}
