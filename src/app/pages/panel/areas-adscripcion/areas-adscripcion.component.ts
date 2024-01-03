import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingStates } from 'src/app/global/global';
import { AreaAdscripcion } from 'src/app/models/area-adscripcion';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { AreasAdscripcionService } from 'src/app/core/services/areas-adscripcion.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-areas-adscripcion',
  templateUrl: './areas-adscripcion.component.html',
  styleUrls: ['./areas-adscripcion.component.css']
})
export class AreasAdscripcionComponent {

  @ViewChild('closebutton') closebutton!: ElementRef;
  @ViewChild('searchItem') searchItem!: ElementRef;

  areaAdscripcion!: AreaAdscripcion;
  areaAdscripcionForm!: FormGroup;
  areasAdscripcion: AreaAdscripcion[] = [];
  areasAdscripcionFilter: AreaAdscripcion[] = [];
  isLoading = LoadingStates.neutro;
  isModalAdd: boolean = true;

  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    private spinnerService: NgxSpinnerService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    private areasAdscripcionService: AreasAdscripcionService,
  ) {
    this.areasAdscripcionService.refreshListAreasAdscripcion.subscribe(() => this.getAreasAdscripcion());
    this.getAreasAdscripcion();
    this.createForm();
  }

  estatusBtn = true;
  verdadero = "Activo";
  falso = "Inactivo";
  estatusTag = this.verdadero;
  setEstatus() {
    this.estatusTag = this.estatusBtn ? this.verdadero : this.falso;
  }


  createForm() {
    this.areaAdscripcionForm = this.formBuilder.group({
      id: [null],
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.pattern('^([a-zA-Z]{2})[a-zA-Z ]+$')]],
      descripcion: ['', [Validators.required, Validators.minLength(3), Validators.pattern('^([a-zA-Z]{3})[a-zA-Z ]+$')]],
      estatus: [true],
    });
  }

  getAreasAdscripcion() {
    this.isLoading = LoadingStates.trueLoading;
    this.areasAdscripcionService.getAll().subscribe(
      {
        next: (dataFromAPI) => {
          this.areasAdscripcion = dataFromAPI;
          this.areasAdscripcionFilter = this.areasAdscripcion;
          this.isLoading = LoadingStates.falseLoading;
        },
        error: () => {
          this.isLoading = LoadingStates.errorLoading;
        }
      }
    );
  }

  onPageChange(number: number) {
    this.configPaginator.currentPage = number;
  }

  handleChangeSearch(event: any) {
    const inputValue = event.target.value;
    this.areasAdscripcionFilter = this.areasAdscripcion.filter(i => i.nombre
      .toLowerCase().includes(inputValue.toLowerCase())
    );
    this.areasAdscripcionFilter = this.areasAdscripcion.filter(i => i.descripcion
      .toLowerCase().includes(inputValue.toLowerCase())
    );
    this.configPaginator.currentPage = 1;
  }

  id!: number;
  formData: any;

  setDataModalUpdate(dto: AreaAdscripcion) {
    this.isModalAdd = false;
    this.id = dto.id;
    this.areaAdscripcionForm.patchValue({
      id: dto.id,
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      estatus: dto.estatus,
    });
    this.formData = this.areaAdscripcionForm.value;
    console.log(this.areaAdscripcionForm.value);
  }


  editarArea() {
    const areaFormValue = { ...this.areaAdscripcionForm.value };
    this.areasAdscripcionService.put(this.id,areaFormValue).subscribe({
      next: () => {
        this.mensajeService.mensajeExito("Área actualizada correctamente");
        this.resetForm();
        console.log(areaFormValue);
      },
      error: (error) => {
        this.mensajeService.mensajeError("Error al actualizar Area");
        console.error(error);
        console.log(areaFormValue);
      }
    });
  }


  deleteItem(id: number, nameItem: string) {
    this.mensajeService.mensajeAdvertencia(
      `¿Estás seguro de eliminar área de adscripción: ${nameItem}?`,
      () => {
        this.areasAdscripcionService.delete(id).subscribe({
          next: () => {
            this.mensajeService.mensajeExito('Área de adscripción borrada correctamente');
            this.configPaginator.currentPage = 1;
            this.searchItem.nativeElement.value = '';
          },
          error: (error) => this.mensajeService.mensajeError(error)
        });
      }
    );
  }

  resetForm() {
    this.closebutton.nativeElement.click();
    this.areaAdscripcionForm.reset();
  }

  agregar() {
    this.areaAdscripcion = this.areaAdscripcionForm.value as AreaAdscripcion;
    this.spinnerService.show();
    this.areasAdscripcionService.post(this.areaAdscripcion).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Área de adscripción guardada correctamente');
        this.resetForm();
        this.configPaginator.currentPage = 1;
      },
      error: (error) => {
        this.spinnerService.hide();
        this.mensajeService.mensajeError(error);
      }
    });
  }

  isUpdating: boolean = false;

  submit() {
    if (this.isModalAdd === false) {

      this.editarArea();
    } else {
      this.agregar();

    }

  }

  handleChangeAdd() {
    if (this.areaAdscripcionForm) {
      this.areaAdscripcionForm.reset();
      const estatusControl = this.areaAdscripcionForm.get('estatus');
      if (estatusControl) {
        estatusControl.setValue(true);
      }
      this.isModalAdd = true;
    }
  }

  exportarDatosAExcel() {
    if (this.areasAdscripcion.length === 0) {
      console.warn('La lista de usuarios está vacía. No se puede exportar.');
      return;
    }

    const datosParaExportar = this.areasAdscripcion.map(areasadscripcion => {
      const estatus = areasadscripcion.estatus ? 'Activo' : 'Inactivo';
      return {
        'Id': areasadscripcion.id,
        'Nombre': areasadscripcion.nombre,
        'Descripcion': areasadscripcion.descripcion,
        'Estatus': estatus,

      };
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosParaExportar);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    this.guardarArchivoExcel(excelBuffer, 'areas_adscripcion.xlsx');
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

  // Remove the following code as it's unnecessary and may cause issues
  /*
  areas: any[] = [
    // Llama a un método de tu servicio para obtener los usuarios desde la base de datos
    this.areasadscripcionService.getAreasadscripcion().subscribe((data: any) => {
      this.areas = data;
      console.log(data)
    })
  ];

  filtrarAreas():  any {
    return this.areasadscripcion.filter(area =>
      area.nombre.toLowerCase().includes(this.buscar.toLowerCase(),)||
      area.descripcion.toLowerCase().includes(this.buscar.toLowerCase(),)
    );

  }

  actualizarFiltro(event: any): void {
    this.buscar = event.target.value;
    this.areasFiltradas = this.filtrarAreas();
  }
  */
}
