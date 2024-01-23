import { Component, Inject, ViewChild, ElementRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs';
import { AreasAdscripcionService } from 'src/app/core/services/areas-adscripcion.service';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { OperadoresService } from 'src/app/core/services/operadores.service';
import { RolsService } from 'src/app/core/services/rols.service';
import { SeccionService } from 'src/app/core/services/seccion.service';
import { UsuariosService } from 'src/app/core/services/usuarios.service';
import { GenericType, LoadingStates } from 'src/app/global/global';
import { AreaAdscripcion } from 'src/app/models/area-adscripcion';
import { Operadores } from 'src/app/models/operadores';
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

  operador!:Operadores;
  operadorForm!: FormGroup;
  operadores: Operadores[] = [];
  operadorFilter: Operadores[] = [];
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
    private operadoresService: OperadoresService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    private areasAdscripcionService: AreasAdscripcionService,
    private seccionesService: SeccionService,
  ) {
    this.operadoresService.refreshListOperadores.subscribe(() => this.getOperadores());
    this.getOperadores();
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
      nombres: ['', [Validators.required,Validators.minLength(2), Validators.pattern(/^([a-zA-ZÀ-ÿ\u00C0-\u00FF]{2})[a-zA-ZÀ-ÿ\u00C0-\u00FF ]+$/)]],
      apellidoPaterno: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^([a-zA-ZÀ-ÿ\u00C0-\u00FF]{2})[a-zA-ZÀ-ÿ\u00C0-\u00FF ]+$/)]],
      apellidoMaterno: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^([a-zA-ZÀ-ÿ\u00C0-\u00FF]{2})[a-zA-ZÀ-ÿ\u00C0-\u00FF ]+$/)]],
      fechaNacimiento: ['', Validators.required],
      /*secciones: [[], Validators.required],*/
      estatus: [true],
    });
  }



  getOperadores() {
    this.isLoading = LoadingStates.trueLoading;
    this.operadoresService.getAll().subscribe(
      {
        next: (dataFromAPI) => {
          this.operadores = dataFromAPI;
          this.operadorFilter = this.operadores;
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
    this.operadorFilter = this.operadores.filter(operador =>
      operador.nombres.toLowerCase().includes(valueSearch) ||
      operador.apellidoPaterno.toLowerCase().includes(valueSearch) ||
      operador.fechaNacimiento.toString().includes(valueSearch)||
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

  setDataModalUpdate(dto: Operadores) {
    this.isModalAdd = false;
    this.idUpdate = dto.id;
    const fechaFormateada = this.formatoFecha(dto.fechaNacimiento);
    this.operadorForm.patchValue({
      id: dto.id,
      nombres: dto.nombres,
      apellidoPaterno: dto.apellidoPaterno,
      apellidoMaterno: dto.apellidoMaterno,
      fechaNacimiento: fechaFormateada,
      estatus: dto.estatus,
    });
  }

  editarOperador() {
    this.operador = this.operadorForm.value as Operadores;
    this.operador.id = this.idUpdate;
    const seccionid = this.operadorForm.get('seccion')?.value;

    this.operador.seccion = {id: seccionid } as Seccion;
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
    this.operador = this.operadorForm.value as Operadores;
    const seccionid = this.operadorForm.get('seccion')?.value;
    const seccionesValue = this.operadorForm.get('secciones')?.value;

    this.operador.seccion = {id: seccionid } as Seccion;
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
      const estatusControl = this.operadorForm.get('estatus');
      if (estatusControl) {
        estatusControl.setValue(true);
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
        return {
          'Id': operador.id,
          'Nombres': operador.nombres,
          'Apellido Paterno': operador.apellidoPaterno,
          'Apellido Materno': operador.apellidoMaterno,
          'sexo': operador.sexo,
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
