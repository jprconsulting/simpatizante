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
import { LoadingStates, RolesBD } from 'src/app/global/global';
import { Operador } from 'src/app/models/operador';
import * as XLSX from 'xlsx';
import { AppUserAuth } from 'src/app/models/login';
import { SecurityService } from 'src/app/core/services/security.service';
import { Promotor } from 'src/app/models/promotor';
import { PromotoresService } from 'src/app/core/services/promotores.service';

@Component({
  selector: 'app-promotor',
  templateUrl: './promotor.component.html',
  styleUrls: ['./promotor.component.css'],
})
export class PromotorComponent implements OnInit {
  @ViewChild('closebutton') closebutton!: ElementRef;
  @ViewChild('searchItem') searchItem!: ElementRef;
  dataObject!: AppUserAuth | null;
  promotor!: Promotor;
  promotorForm!: FormGroup;
  promotores: Promotor[] = [];
  promotoresFilter: Promotor[] = [];
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
    private pomotoresService: PromotoresService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    private securityService: SecurityService
  ) {
    this.pomotoresService.refreshListPromotores.subscribe(() =>
      this.getPromotores()
    );
    this.currentUser = securityService.getDataUser();
    this.creteForm();
    this.getPromotores();

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

  ngOnInit(): void {
    this.configPaginator.currentPage = 1;
  }

  creteForm() {
    this.promotorForm = this.formBuilder.group({
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
      operadoresIds: [[], Validators.required],
      telefono: [''],
    });
  }

  getTodosOperadores() {
    this.operadoresService
      .getAll()
      .subscribe({ next: (dataFromAPI) => (this.operadores = dataFromAPI) });
  }

  getOperadoresPorCandidatoId() {
    this.operadoresService
      .getOperadoresPorCandidatoId(this.candidatoId)
      .subscribe({ next: (dataFromAPI) => (this.operadores = dataFromAPI) });
  }
  getPromotores() {
    this.dataObject = this.securityService.getDataUser();
    console.log(this.dataObject);
    this.isLoading = LoadingStates.trueLoading;
    const isAdmin = this.dataObject && this.dataObject.rolId === 1;
    if (isAdmin) {
      this.isLoading = LoadingStates.trueLoading;
      this.pomotoresService.getAll().subscribe({
        next: (dataFromAPI) => {
          this.promotores = dataFromAPI;
          this.promotoresFilter = this.promotores;
          this.isLoading = LoadingStates.falseLoading;
        },
        error: (err ) => {
          this.isLoading = LoadingStates.errorLoading;
          if ( err.status === 401 ){
            this.mensajeService.mensajeSesionExpirada();
          }

        },
      });
    }
    const Operador = this.dataObject && this.dataObject.rolId === 2;

    if (Operador) {
      const id = this.dataObject && this.dataObject.operadorId;
      console.log(id);
      if (id) {
        this.isLoading = LoadingStates.trueLoading;
        this.pomotoresService.getPorOperador(id).subscribe({
          next: (dataFromAPI) => {
            this.promotores = dataFromAPI;
            this.promotoresFilter = this.promotores;
            this.isLoading = LoadingStates.falseLoading;
          },
          error: () => {
            this.isLoading = LoadingStates.errorLoading;
          },
        });
      }
    }
    const isCandidato = this.dataObject && this.dataObject.rolId === 3;

    if (isCandidato) {
      const id = this.dataObject && this.dataObject.candidatoId;
      console.log(id);
      if (id) {
        this.isLoading = LoadingStates.trueLoading;
        this.pomotoresService.getPorCandidato(id).subscribe({
          next: (dataFromAPI) => {
            this.promotores = dataFromAPI;
            this.promotoresFilter = this.promotores;
            this.isLoading = LoadingStates.falseLoading;
          },
          error: () => {
            this.isLoading = LoadingStates.errorLoading;
          },
        });
      }
    }
  }

  onPageChange(number: number) {
    this.configPaginator.currentPage = number;
  }

  handleChangeSearch(event: any) {
    const inputValue = event.target.value;
    const valueSearch = inputValue.toLowerCase();
    this.promotoresFilter = this.promotores.filter(
      (promotor) =>
        promotor.nombres.toLowerCase().includes(valueSearch) ||
        promotor.apellidoPaterno.toLowerCase().includes(valueSearch) ||
        promotor.apellidoMaterno.toLowerCase().includes(valueSearch) ||
        promotor.telefono.toString().includes(valueSearch)
    );
    this.configPaginator.currentPage = 1;
  }

  idUpdate!: number;

  formatoFecha(fecha: string): string {
    // Aquí puedes utilizar la lógica para formatear la fecha según tus necesidades
    const fechaFormateada = new Date(fecha).toISOString().split('T')[0];
    return fechaFormateada;
  }

  setDataModalUpdate(dto: Promotor) {
    this.isModalAdd = false;
    this.idUpdate = dto.id;

    console.log(dto.operadores.map((o) => o.id));

    this.promotorForm.patchValue({
      id: dto.id,
      nombres: dto.nombres,
      apellidoPaterno: dto.apellidoPaterno,
      apellidoMaterno: dto.apellidoMaterno,
      telefono: dto.telefono,
      operadoresIds: dto.operadores.map((o) => o.id),
    });
  }

  editarOperador() {
    this.promotor = this.promotorForm.value as Promotor;

    const operadoresIds = this.promotorForm.get('operadoresIds')?.value;
    this.promotor.operadoresIds = operadoresIds as number[];

    this.spinnerService.show();
    this.pomotoresService.put(this.idUpdate, this.promotor).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Promotor actualizado correctamente');
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
      `¿Estás seguro de eliminar el promotor: ${nameItem}?`,
      () => {
        this.pomotoresService.delete(id).subscribe({
          next: () => {
            this.mensajeService.mensajeExito('Promotor borrado correctamente');
            this.configPaginator.currentPage = 1;
            this.searchItem.nativeElement.value = '';
          },
          error: (error) => this.mensajeService.mensajeError(error),
        });
      }
    );
  }

  agregar() {
    this.promotor = this.promotorForm.value as Promotor;

    const operadoresIds = this.promotorForm.get('operadoresIds')?.value;
    this.promotor.operadoresIds = operadoresIds as number[];

    this.spinnerService.show();
    console.log(this.promotor);

    this.pomotoresService.post(this.promotor).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Pomotor guardado correctamente');
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
    this.promotorForm.reset();
  }

  submit() {
    if (this.isModalAdd === false) {
      this.editarOperador();
    } else {
      this.agregar();
    }
  }

  handleChangeAdd() {
    if (this.promotorForm) {
      this.promotorForm.reset();
      if (this.currentUser?.rolId === RolesBD.operador) {
        this.promotorForm.controls['operadoresIds'].setValue([this.operadorId]);
      }
      this.isModalAdd = true;
    }
  }

  exportarDatosAExcel() {
    if (this.promotores.length === 0) {
      console.warn('La lista de usuarios está vacía. No se puede exportar.');
      return;
    }

    const operadoresNombres = this.promotores.map(
      (operador) => operador.nombreCompleto
    );

    const datosParaExportar = this.promotores.map((promotor) => {
      const operadoresNombres = promotor.operadores
        .map((operador) => operador.nombreCompleto)
        .join(', ');
      return {
        Nombre: promotor.nombres,
        'Apellido paterno': promotor.apellidoPaterno,
        'Apellido materno': promotor.apellidoMaterno,
        Teléfono: promotor.telefono,
        'Operador(s)': operadoresNombres,
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

    this.guardarArchivoExcel(excelBuffer, 'Promotores.xlsx');
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
}
