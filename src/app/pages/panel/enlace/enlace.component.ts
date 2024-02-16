import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { OperadoresService } from 'src/app/core/services/operadores.service';
import { LoadingStates, RolesBD } from 'src/app/global/global';
import { Operador } from 'src/app/models/operador';
import * as XLSX from 'xlsx';

import { AppUserAuth } from 'src/app/models/login';
import { SecurityService } from 'src/app/core/services/security.service';
import { Enlace } from 'src/app/models/enlace';
import { EnlacesService } from 'src/app/core/services/enlaces.service';

@Component({
  selector: 'app-enlace',
  templateUrl: './enlace.component.html',
  styleUrls: ['./enlace.component.css']
})
export class EnlaceComponent {
  @ViewChild('closebutton') closebutton!: ElementRef;
  @ViewChild('searchItem') searchItem!: ElementRef;
  dataObject!: AppUserAuth | null;
  enlace!: Enlace;
  enlaceForm!: FormGroup;
  enlaces: Enlace[] = [];
  enlaceFilter: Enlace[] = [];
  isLoading = LoadingStates.neutro;

  operadores: Operador[] = [];
  isModalAdd = true;

  currentUser!: AppUserAuth | null;
  readonlySelectOperador = true;
  operadorId = 0;
  candidatoId = 0;


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
    this.enlacesService.refreshListEnlaces.subscribe(() => this.getEnlaces());
    this.currentUser = securityService.getDataUser();
    this.creteForm();
    this.getEnlaces();

    this.isModalAdd = false;

    if (this.currentUser?.rolId === RolesBD.operador) {
      this.operadorId = this.currentUser?.operadorId;
      console.log(this.operadorId);
      this.operadores.push({
        id: this.operadorId,
        nombreCompleto: this.currentUser?.nombreCompleto,
      } as Operador);
      console.log(this.operadores);
    }

    if (this.currentUser?.rolId === RolesBD.candidato) {
      this.readonlySelectOperador = false;
      this.candidatoId = this.currentUser?.candidatoId;
      this.getOperadoresPorCandidatoId();
    }

    if (this.currentUser?.rolId === RolesBD.administrador) {
      this.readonlySelectOperador = false;
      this.getTodosOperadores();
    }

  }

  creteForm() {
    this.enlaceForm = this.formBuilder.group({
      id: [null],
      nombres: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^([a-zA-ZÀ-ÿ\u00C0-\u00FF]{2})[a-zA-ZÀ-ÿ\u00C0-\u00FF ]+$/)]],
      apellidoPaterno: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^([a-zA-ZÀ-ÿ\u00C0-\u00FF]{2})[a-zA-ZÀ-ÿ\u00C0-\u00FF ]+$/)]],
      apellidoMaterno: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^([a-zA-ZÀ-ÿ\u00C0-\u00FF]{2})[a-zA-ZÀ-ÿ\u00C0-\u00FF ]+$/)]],
      operadorId: [null, Validators.required],
      telefono: [''],
    });
  }

  getTodosOperadores() {
    this.operadoresService.getAll().subscribe({ next: (dataFromAPI) => this.operadores = dataFromAPI });
  }

  getOperadoresPorCandidatoId() {
    this.operadoresService
      .getOperadoresPorCandidatoId(this.candidatoId)
      .subscribe({ next: (dataFromAPI) => (this.operadores = dataFromAPI) });
  }
  getEnlaces() {
    this.dataObject = this.securityService.getDataUser();
    console.log(this.dataObject);
    this.isLoading = LoadingStates.trueLoading;
    const isAdmin = this.dataObject && this.dataObject.rol === 'Administrador';
    if (isAdmin) {
      this.isLoading = LoadingStates.trueLoading;
      this.enlacesService.getAll().subscribe({
        next: (dataFromAPI) => {
          this.enlaces = dataFromAPI;
          this.enlaceFilter = this.enlaces;
          this.isLoading = LoadingStates.falseLoading;
        },
        error: () => {
          this.isLoading = LoadingStates.errorLoading;
        }
      })
    }
    const Operador = this.dataObject && this.dataObject.rol === 'Operador';

    if (Operador) {
      const id = this.dataObject && this.dataObject.operadorId;
      console.log(id);
      if (id) {
        this.isLoading = LoadingStates.trueLoading;
        this.enlacesService
          .getPorOperador(id)
          .subscribe({
            next: (dataFromAPI) => {
              this.enlaces = dataFromAPI;
              this.enlaceFilter = this.enlaces;
              this.isLoading = LoadingStates.falseLoading;
            },
            error: () => {
              this.isLoading = LoadingStates.errorLoading;
            }
          })
      }
    }
    const isCandidato = this.dataObject && this.dataObject.rol === 'Candidato';

    if (isCandidato) {
      const id = this.dataObject && this.dataObject.candidatoId;
      console.log(id);
      if (id) {
        this.isLoading = LoadingStates.trueLoading;
        this.enlacesService
          .getPorCandidato(id)
          .subscribe({
            next: (dataFromAPI) => {
              this.enlaces = dataFromAPI;
              this.enlaceFilter = this.enlaces;
              this.isLoading = LoadingStates.falseLoading;
            },
            error: () => {
              this.isLoading = LoadingStates.errorLoading;
            }
          })
      }
    }
  }


  onPageChange(number: number) {
    this.configPaginator.currentPage = number;
  }

  handleChangeSearch(event: any) {
    const inputValue = event.target.value;
    const valueSearch = inputValue.toLowerCase();
    this.enlaceFilter = this.enlaces.filter(enlace =>
      enlace.nombres.toLowerCase().includes(valueSearch) ||
      enlace.apellidoPaterno.toLowerCase().includes(valueSearch) ||
      enlace.apellidoMaterno.toLowerCase().includes(valueSearch) ||
      enlace.telefono.toString().includes(valueSearch)
    );
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
    this.enlaceForm.patchValue({
      id: dto.id,
      nombres: dto.nombres,
      apellidoPaterno: dto.apellidoPaterno,
      apellidoMaterno: dto.apellidoMaterno,
      operadorId: dto.operador.id,
      telefono: dto.telefono
    });

  }

  editarOperador() {
    this.enlace = this.enlaceForm.value as Enlace;
    const operadorId = this.enlaceForm.get('operadorId')?.value;
    this.enlace.operador = { id: operadorId } as Operador;

    this.spinnerService.show();
    this.enlacesService.put(this.idUpdate, this.enlace).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Enlace actualizado correctamente');
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
      `¿Estás seguro de eliminar el enlace: ${nameItem}?`,
      () => {
        this.enlacesService.delete(id).subscribe({
          next: () => {
            this.mensajeService.mensajeExito('Enlace borrado correctamente');
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
    const operadorId = this.enlaceForm.get('operadorId')?.value;
    this.enlace.operador = { id: operadorId } as Operador;
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
    this.enlaceForm.reset();
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
      if (this.currentUser?.rolId === RolesBD.operador) {
        this.enlaceForm.controls['operadorId'].setValue(this.operadorId);
      }
      this.isModalAdd = true;
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

}
