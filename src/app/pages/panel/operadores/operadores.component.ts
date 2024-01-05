import { Component, Inject, ViewChild, ElementRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs';
import { AreasAdscripcionService } from 'src/app/core/services/areas-adscripcion.service';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { RolsService } from 'src/app/core/services/rols.service';
import { SeccionService } from 'src/app/core/services/seccion.service';
import { UsuariosService } from 'src/app/core/services/usuarios.service';
import { GenericType, LoadingStates } from 'src/app/global/global';
import { AreaAdscripcion } from 'src/app/models/area-adscripcion';
import { Rol } from 'src/app/models/rol';
import { Seccion } from 'src/app/models/seccion';
import { Usuario } from 'src/app/models/usuario';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-operadores',
  templateUrl: './operadores.component.html',
  styleUrls: ['./operadores.component.css']
})
export class OperadoresComponent implements OnInit{

  @ViewChild('closebutton') closebutton!: ElementRef;
  @ViewChild('searchItem') searchItem!: ElementRef;

  usuario!: Usuario;
  operadorForm!: FormGroup;
  usuarios: Usuario[] = [];
  usuariosFilter: Usuario[] = [];
  isLoading = LoadingStates.neutro;
  generos: GenericType[] = [{ id: 1, name: 'Masculino' }, { id: 2, name: 'Femenino' }];
  secciones: Seccion[] = [];
  areasAdscripcion: AreaAdscripcion[] = [];
  isModalAdd = true;
  rolId = 0;

  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    @Inject('GENEROS') public objGeneros: any,
    private spinnerService: NgxSpinnerService,
    private usuarioService: UsuariosService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    private areasAdscripcionService: AreasAdscripcionService,
    private seccionesService: SeccionService,
  ) {
    this.usuarioService.refreshListUsuarios.subscribe(() => this.getUsuarios());
    this.getUsuarios();
    this.getSecciones();
    this.getAreasAdscripcion();
    this.creteForm();
  }
  ngOnInit(): void {
    this.isModalAdd = false;
  }

  getGeneroName(id: number): string {
    const genero = this.generos.find(g => g.id === id);
    return genero ? genero.name : '';
  }

  getSecciones() {
    this.seccionesService.getAll().subscribe({ next: (dataFromAPI) => this.secciones = dataFromAPI });
    console.log(this.secciones)
  }

  getAreasAdscripcion() {
    this.areasAdscripcionService.getAll().subscribe({ next: (dataFromAPI) => this.areasAdscripcion = dataFromAPI });
  }

  creteForm() {
    this.operadorForm = this.formBuilder.group({
      id: [null],
      nombre: ['', [Validators.required,Validators.minLength(2), Validators.pattern(/^([a-zA-ZÀ-ÿ\u00C0-\u00FF]{2})[a-zA-ZÀ-ÿ\u00C0-\u00FF ]+$/)]],
      apellidoPaterno: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^([a-zA-ZÀ-ÿ\u00C0-\u00FF]{2})[a-zA-ZÀ-ÿ\u00C0-\u00FF ]+$/)]],
      apellidoMaterno: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^([a-zA-ZÀ-ÿ\u00C0-\u00FF]{2})[a-zA-ZÀ-ÿ\u00C0-\u00FF ]+$/)]],
      sexo: ['', [Validators.required, Validators.email, Validators.pattern('^[a-zA-Z0-9.%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$')]],
      fechaNacimiento: ['', Validators.required],
      secciones: [null, Validators.required],
      estatus: [true],
    });
  }



  getUsuarios() {
    this.isLoading = LoadingStates.trueLoading;
    this.usuarioService.getAll().subscribe(
      {
        next: (dataFromAPI) => {
          this.usuarios = dataFromAPI;
          this.usuariosFilter = this.usuarios;
          this.isLoading = LoadingStates.falseLoading;

        },
        error: () => {
          this.isLoading = LoadingStates.errorLoading
        }
      }
    );
  }

  onPageChange(number: number) {
    this.configPaginator.currentPage = number;
  }

  handleChangeSearch(event: any) {
    const inputValue = event.target.value;
    const valueSearch = inputValue.toLowerCase();
    this.usuariosFilter = this.usuarios.filter(usuario =>
      usuario.nombreCompleto.toLowerCase().includes(valueSearch) ||
      usuario.apellidoPaterno.toLowerCase().includes(valueSearch) ||
      usuario.rol.nombreRol.toLowerCase().includes(valueSearch) ||
      usuario.areaAdscripcion?.nombre.toLowerCase().includes(valueSearch) ||
      usuario.correo.toLowerCase().includes(valueSearch) ||
      usuario.id.toString().includes(valueSearch)
    );
    this.configPaginator.currentPage = 1;
  }

  idUpdate!: number;

  setDataModalUpdate(dto: Usuario) {
    this.isModalAdd = false;
    this.idUpdate = dto.id;
    this.operadorForm.patchValue({
      id: dto.id,
      nombre: dto.nombre,
      apellidoPaterno: dto.apellidoPaterno,
      apellidoMaterno: dto.apellidoMaterno,
      correo: dto.correo,
      password: dto.password,
      estatus: dto.estatus,
      rolId: dto.rol.id,
      areaAdscripcionId: dto.areaAdscripcion?.id
    });
  }

  editarUsuario() {
    this.usuario = this.operadorForm.value as Usuario;

    const rolId = this.operadorForm.get('rolId')?.value;
    const areaAdscripcionId = this.operadorForm.get('areaAdscripcionId')?.value;

    this.usuario.rol = { id: rolId } as Rol;
    this.usuario.areaAdscripcion = { id: areaAdscripcionId } as AreaAdscripcion;

    this.spinnerService.show();
    this.usuarioService.put(this.idUpdate, this.usuario).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Usuario actualizado correctamente');
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
      `¿Estás seguro de eliminar el usuario: ${nameItem}?`,
      () => {
        this.usuarioService.delete(id).subscribe({
          next: () => {
            this.mensajeService.mensajeExito('Usuario borrado correctamente');
            this.configPaginator.currentPage = 1;
            this.searchItem.nativeElement.value = '';
          },
          error: (error) => this.mensajeService.mensajeError(error)
        });
      }
    );
  }

  agregar() {
    this.usuario = this.operadorForm.value as Usuario;
    const rolId = this.operadorForm.get('rolId')?.value;
    const areaAdscripcionId = this.operadorForm.get('areaAdscripcionId')?.value;
    this.usuario.rol = { id: rolId } as Rol;
    this.usuario.areaAdscripcion = { id: areaAdscripcionId } as AreaAdscripcion;

    this.spinnerService.show();
    this.usuarioService.post(this.usuario).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Usuario guardado correctamente');
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
      this.editarUsuario();
    } else {
      this.agregar();

    }
  }

  handleChangeAdd() {
    if (this.operadorForm) {
      this.operadorForm.reset();
      const estatusControl = this.operadorForm.get('estatus');
      if (estatusControl) {
        estatusControl.setValue(true);
      }
      this.isModalAdd = true;
    }
  }

  exportarDatosAExcel() {
    if (this.usuarios.length === 0) {
      console.warn('La lista de usuarios está vacía. No se puede exportar.');
      return;
    }

    const datosParaExportar = this.usuarios.map(usuario => {
      const estatus = usuario.estatus ? 'Activo' : 'Inactivo';
      return {
        'Id': usuario.id,
        'Nombre': usuario.nombre,
        'Apellido Paterno': usuario.apellidoPaterno,
        'Apellido Materno': usuario.apellidoMaterno,
        'Correo': usuario.correo,
        'Estatus': estatus,
      };
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosParaExportar);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    this.guardarArchivoExcel(excelBuffer, 'usuarios.xlsx');
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


  selectedSecciones1 = [3];
  secciones1 = [
      { id: 1, name: 'Sección1' },
      { id: 2, name: 'Sección2' },
      { id: 3, name: 'Sección3' },
      { id: 4, name: 'Sección4', disabled: true },
  ];

  toggleDisabled() {
    const car: any = this.secciones[1];
    car.disabled = !car.disabled;
  }
}
