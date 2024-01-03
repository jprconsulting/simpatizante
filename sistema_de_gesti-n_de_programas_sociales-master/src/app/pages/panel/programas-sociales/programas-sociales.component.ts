import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingStates } from 'src/app/global/global';
import { AreaAdscripcion } from 'src/app/models/area-adscripcion';
import { ProgramaSocial } from 'src/app/models/programa-social';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { ProgramasSocialesService } from 'src/app/core/services/programas-sociales.service';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { AreasAdscripcionService } from 'src/app/core/services/areas-adscripcion.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-programas-sociales',
  templateUrl: './programas-sociales.component.html',
  styleUrls: ['./programas-sociales.component.css']
})
export class ProgramasSocialesComponent {

  @ViewChild('closebutton') closebutton!: ElementRef;
  @ViewChild('searchItem') searchItem!: ElementRef;

  programaSocial!: ProgramaSocial;
  programaSocialForm!: FormGroup;
  busqueda!: FormGroup;
  programasSociales: ProgramaSocial[] = [];
  programasSocialesFilter: ProgramaSocial[] = [];
  isLoading = LoadingStates.neutro;

  areasAdscripcion: AreaAdscripcion[] = [];
  isModalAdd: boolean = true;
  formData: any;
  rolId = 0;
  defaultColor = '#206bc4';
  id!: number;
  estatusBtn = true;
  verdadero = "Activo";
  falso = "Inactivo";
  estatusTag = this.verdadero;
  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    private spinnerService: NgxSpinnerService,
    private programasSocialesService: ProgramasSocialesService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    private areasAdscripcionService: AreasAdscripcionService,
  ) {
    this.programasSocialesService.refreshListProgramasSociales.subscribe(() => this.getProgramasSociales());
    this.getProgramasSociales();
    this.getAreasAdscripcion();
    this.creteForm();
  }

  getAreasAdscripcion() {
    this.areasAdscripcionService.getAll().subscribe({ next: (dataFromAPI) => this.areasAdscripcion = dataFromAPI });
  }

  creteForm() {
    this.programaSocialForm = this.formBuilder.group({
      id: [null],
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.pattern('^([a-zA-Z]{2})[a-zA-Z ]+$')]],
      descripcion: [''],
      color: ['', Validators.required],
      estatus: [true],
      acronimo: ['', [Validators.required, Validators.minLength(2), Validators.pattern('^([a-zA-Z]{2})[a-zA-Z ]+$')]],
      areaAdscripcionId: [null, Validators.required],
    });
  }



  getProgramasSociales() {
    this.isLoading = LoadingStates.trueLoading;
    this.programasSocialesService.getAll().subscribe(
      {
        next: (dataFromAPI) => {
          this.programasSociales = dataFromAPI;
          this.programasSocialesFilter = this.programasSociales;
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
    this.programasSocialesFilter = this.programasSociales.filter(programa =>
      programa.nombre.toLowerCase().includes(valueSearch) ||
      programa.descripcion.toLowerCase().includes(valueSearch) ||
      programa.acronimo.toLowerCase().includes(valueSearch) ||
      programa.areaAdscripcion?.nombre.toLowerCase().includes(valueSearch) ||
      programa.id.toString().includes(valueSearch)
    );
    this.configPaginator.currentPage = 1;
  }


  actualizar() {
    const socialFormValue = { ...this.programaSocialForm.value };
  console.log('ded',socialFormValue)
    const selectedArea = this.areasAdscripcion.find(area => area.id === socialFormValue.areaAdscripcionId);
    if (selectedArea) {
      socialFormValue.areaAdscripcion = selectedArea; // Utiliza el objeto completo
    }
    this.programasSocialesService.put(this.id, socialFormValue).subscribe({
      next: () => {
        this.mensajeService.mensajeExito("Programa social actualizado con éxito");
        this.resetForm();
        this.configPaginator.currentPage = 1;
      },
      error: (error) => {
        this.mensajeService.mensajeError("Error al actualizar programa social");
        console.error(error);
      }
    });
  }


    setDataModalUpdate(dto: ProgramaSocial) {
      this.isModalAdd = false;
      this.id = dto.id;
      this.programaSocialForm.patchValue({
        id: dto.id,
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        color: dto.color,
        estatus: dto.estatus,
        acronimo: dto.acronimo,
        areaAdscripcionId: dto.areaAdscripcion.id
      });
      this.formData = this.programaSocialForm.value;
      console.log(dto)

    }
  deleteItem(id: number, nameItem: string) {
    this.mensajeService.mensajeAdvertencia(
      `¿Estás seguro de eliminar el programa social: ${nameItem}?`,
      () => {
        this.programasSocialesService.delete(id).subscribe({
          next: () => {
            this.mensajeService.mensajeExito('Programa social borrado correctamente');
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
    this.programaSocialForm.reset();
  }
  submit() {
    if (this.isModalAdd === false) {

      this.actualizar();
    } else {
      this.agregar();

    }
  }


  agregar() {
    this.programaSocial = this.programaSocialForm.value as ProgramaSocial;

    const areaAdscripcionId = this.programaSocialForm.get('areaAdscripcionId')?.value;
    this.programaSocial.areaAdscripcion = { id: areaAdscripcionId } as AreaAdscripcion;

    this.spinnerService.show();
    this.programasSocialesService.post(this.programaSocial).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Programa social guardado correctamente');
        this.resetForm();
        this.configPaginator.currentPage = 1;
      },
      error: (error) => {
        this.spinnerService.hide();
        this.mensajeService.mensajeError(error);
      }
    });
  }

  handleChangeAdd() {
    if (this.programaSocialForm) {
      this.programaSocialForm.reset();
      const estatusControl = this.programaSocialForm.get('estatus');
      if (estatusControl) {
        estatusControl.setValue(true);
      }
      this.isModalAdd = true;
    }
  }


 setEstatus() {
    this.estatusTag = this.estatusBtn ? this.verdadero : this.falso;
  }
  exportarDatosAExcel() {
    if (this.programasSociales.length === 0) {
      console.warn('La lista de usuarios está vacía. No se puede exportar.');
      return;
    }

    const datosParaExportar = this.programasSociales.map(programasSociales => {
      const estatus = programasSociales.estatus ? 'Activo' : 'Inactivo';
      return {
        'Id': programasSociales.id,
        'Nombre': programasSociales.nombre,
        'Descripcion': programasSociales.descripcion,
        'Color': programasSociales.color,
        'Acronimo': programasSociales.acronimo,
        'Estatus': estatus,
      };
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosParaExportar);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    this.guardarArchivoExcel(excelBuffer, 'Programas sociales.xlsx');
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

  toggleEstatus() {
    const estatusControl = this.programaSocialForm.get('Estatus');

    if (estatusControl) {
      estatusControl.setValue(estatusControl.value === 1 ? 0 : 1);
    }
  }

  buscar: string = '';
  beneficiarioFiltrado: any[] = [];

  filtrarBeneficiario(): any {
    return this.programasSociales.filter(programasSociales =>
      programasSociales.nombre.toLowerCase().includes(this.buscar.toLowerCase(),) ||
      programasSociales.descripcion.toLowerCase().includes(this.buscar.toLowerCase(),) ||
      programasSociales.acronimo.toLowerCase().includes(this.buscar.toLowerCase(),) ||
      programasSociales.areaAdscripcion.nombre.toLowerCase().includes(this.buscar.toLowerCase(),)
    );

  }
  actualizarFiltro(event: any): void {
    this.buscar = event.target.value;
    this.beneficiarioFiltrado = this.filtrarBeneficiario();
  }


}

