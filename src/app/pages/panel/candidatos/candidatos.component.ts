import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GenericType, LoadingStates } from 'src/app/global/global';
import { AreaAdscripcion } from 'src/app/models/area-adscripcion';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { AreasAdscripcionService } from 'src/app/core/services/areas-adscripcion.service';
import * as XLSX from 'xlsx';
import { CargoService } from 'src/app/core/services/cargo.service';
import { Cargo } from 'src/app/models/cargo';
@Component({
  selector: 'app-candidatos',
  templateUrl: './candidatos.component.html',
  styleUrls: ['./candidatos.component.css']
})
export class CandidatosComponent {

  @ViewChild('closebutton') closebutton!: ElementRef;
  @ViewChild('searchItem') searchItem!: ElementRef;

  areaAdscripcion!: AreaAdscripcion;
  candidatoForm!: FormGroup;
  generos: GenericType[] = [{ id: 1, name: 'Masculino' }, { id: 2, name: 'Femenino' }];
  areasAdscripcion: AreaAdscripcion[] = [];
  areasAdscripcionFilter: AreaAdscripcion[] = [];
  cargos: Cargo[] = [];
  isLoading = LoadingStates.neutro;
  isModalAdd: boolean = true;

  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    @Inject('GENEROS') public objGeneros: any,
    private spinnerService: NgxSpinnerService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    private cargoService: CargoService,
    private areasAdscripcionService: AreasAdscripcionService,
  ) {
    this.areasAdscripcionService.refreshListAreasAdscripcion.subscribe(() => this.getCandidatos());
    this.getCandidatos();
    this.createForm();
  }

  estatusBtn = true;
  verdadero = "Activo";
  falso = "Inactivo";
  estatusTag = this.verdadero;
  setEstatus() {
    this.estatusTag = this.estatusBtn ? this.verdadero : this.falso;
  }

  getGeneroName(id: number): string {
    const genero = this.generos.find(g => g.id === id);
    return genero ? genero.name : '';
  }

  onFileChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;

    if (inputElement.files && inputElement.files.length > 0) {
      const file = inputElement.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        const base64String = reader.result as string;
        const base64WithoutPrefix = base64String.split(';base64,').pop() || '';

        this.candidatoForm.patchValue({
          imagenBase64foto: base64WithoutPrefix// Contiene solo la representación en base64
        });
      };

      reader.readAsDataURL(file);
    }
  }

  onFileChange2(event: Event) {
    const inputElement = event.target as HTMLInputElement;

    if (inputElement.files && inputElement.files.length > 0) {
      const file = inputElement.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        const base64String = reader.result as string;
        const base64WithoutPrefix = base64String.split(';base64,').pop() || '';

        this.candidatoForm.patchValue({// Contiene solo la representación en base64
          imagenBase64emblema: base64WithoutPrefix // Contiene solo la representación en base64
        });
      };

      reader.readAsDataURL(file);
    }
  }

  createForm() {
    this.candidatoForm = this.formBuilder.group({
      id: [null],
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^([a-zA-ZÀ-ÿ\u00C0-\u00FF]{2})[a-zA-ZÀ-ÿ\u00C0-\u00FF ]+$/)]],
      apellidoPaterno: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^([a-zA-ZÀ-ÿ\u00C0-\u00FF]{2})[a-zA-ZÀ-ÿ\u00C0-\u00FF ]+$/)]],
      apellidoMaterno: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^([a-zA-ZÀ-ÿ\u00C0-\u00FF]{2})[a-zA-ZÀ-ÿ\u00C0-\u00FF ]+$/)]],
      fechaNacimiento: ['', Validators.required],
      sexo: [null, Validators.required],
      sobrenombre: ['',[Validators.required, Validators.minLength(2), Validators.pattern('^([a-zA-Z]{2})[a-zA-Z ]+$')]],
      cargo: ['',[Validators.required, Validators.minLength(2), Validators.pattern('^([a-zA-Z]{2})[a-zA-Z ]+$')]],
      estatus: [true],
      imagenBase64foto: [''],
      imagenBase64emblema: ['']
    });
  }

  getCandidatos() {
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

  getCargo() {
    this.cargoService.getAll().subscribe(
      {
        next: (dataFromAPI) => {
          this.cargos = dataFromAPI;},
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
    this.candidatoForm.patchValue({
      id: dto.id,
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      estatus: dto.estatus,
    });
    this.formData = this.candidatoForm.value;
    console.log(this.candidatoForm.value);
  }


  editarArea() {
    const areaFormValue = { ...this.candidatoForm.value };
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
    this.candidatoForm.reset();
  }

  agregar() {
    this.areaAdscripcion = this.candidatoForm.value as AreaAdscripcion;
    this.spinnerService.show();
    console.log(this.candidatoForm)
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


  submit() {
    if (this.isModalAdd === false) {

      this.editarArea();
    } else {
      this.agregar();

    }

  }

  handleChangeAdd() {
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

}
