import { TipoIncidencia } from 'src/app/models/tipoIncidencias';
import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingStates } from 'src/app/global/global';
import { Indicadores } from 'src/app/models/indicadores';
import { Visita } from 'src/app/models/visita';
import { IndicadoresService } from 'src/app/core/services/indicadores.service';
import { Casillas } from 'src/app/models/casillas';
import { CasillasService } from 'src/app/core/services/casilla.service';
import { IncidenciaService } from 'src/app/core/services/incidencias.service';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import * as XLSX from 'xlsx';
import { NgxGpAutocompleteDirective } from '@angular-magic/ngx-gp-autocomplete';
import { Incidencia } from 'src/app/models/incidencias';
import { ColorPickerService, Rgba } from 'ngx-color-picker';
import { Indicador } from 'src/app/models/indicador';

@Component({
  selector: 'app-tipo-incidencia',
  template: ` <color-picker [(color)]="color"></color-picker>`,
  templateUrl: './tipo-incidencia.component.html',
  styleUrls: ['./tipo-incidencia.component.css'],
})
export class TipoIncidenciasComponent implements OnInit {
  selectedColor: any;
  selectedColorCode: string = '#206bc4';
  [x: string]: any;

  @ViewChild('closebutton') closebutton!: ElementRef;
  @ViewChild('searchItem') searchItem!: ElementRef;
  @ViewChild('ngxPlaces') placesRef!: NgxGpAutocompleteDirective;
  @ViewChild('mapCanvas') mapCanvas!: ElementRef<HTMLElement>;
  @ViewChild('ubicacionInput', { static: false }) ubicacionInput!: ElementRef;

  incidenciasForm!: FormGroup;

  vistas: Visita[] = [];
  casillas: Casillas[] = [];
  indicadores: Indicadores[] = [];
  isLoading = LoadingStates.neutro;
  canvas!: HTMLElement;
  isModalAdd = true;
  incidenciasFilter: Indicadores[] = [];
  idUpdate!: number;
  formData: any;
  latitude: number = 19.316818295403003;
  longitude: number = -98.23837658175323;
  color: Rgba = { r: 255, g: 0, b: 0, a: 1 };

  options = {
    types: [],
    componentRestrictions: { country: 'MX' },
  };
  maps!: google.maps.Map;

  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    private formBuilder: FormBuilder,
    private spinnerService: NgxSpinnerService,
    private mensajeService: MensajeService,
    private indicadoresService: IndicadoresService,
    private casillasService: CasillasService,
    private IncidenciaService: IncidenciaService,
    private cpService: ColorPickerService
  ) {
    this.IncidenciaService.refreshListIncidencia.subscribe(() =>
      this.getIncidencias()
    );
    this.creteForm();
    this.getIncidencias();
    this.configPaginator.itemsPerPage = 10;
  }

  ngOnInit(): void {
    this.selectedColor = 0;
  }
  creteForm() {
    this.incidenciasForm = this.formBuilder.group({
      id: [null],
      retroalimentacion: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.pattern(
            /^([a-zA-ZÀ-ÿ\u00C0-\u00FF]{2})[a-zA-ZÀ-ÿ\u00C0-\u00FF ]+$/
          ),
        ],
      ],
      color: ['#000000', Validators.required],
    });
  }

  updateColorCode(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.selectedColorCode = target.value;
    }
  }

  convertColorToHex(color: Rgba): string {
    return this.cpService.rgbaToHex(color);
  }
  submit() {
    if (this.isModalAdd === false) {
      this.editarIncidencia();
    } else {
      this.agregar();
    }
  }

  cerrarModal() {
    const modal = document.getElementById('modal-imagen-ampliada');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
    }
  }

  handleChangeSearch(event: any) {
    const inputValue = event.target.value;
    this.incidenciasFilter = this.indicadores.filter((indicador) =>
      indicador.tipo.toLowerCase().includes(inputValue.toLowerCase())
    );
    this.configPaginator.currentPage = 1;
  }

  resetForm() {
    this.closebutton.nativeElement.click();
    this.incidenciasForm.reset();
  }
  onPageChange(number: number) {
    this.configPaginator.currentPage = number;
  }

  handleChangeAdd() {
    this.incidenciasForm.reset();
    this.isModalAdd = true;
  }

  agregar() {
    const nuevoIndicador: Indicadores = {
      id: 0, // El ID será asignado por el backend
      tipo: this.incidenciasForm.value.retroalimentacion,
      color: this.incidenciasForm.value.color,
    };

    this.indicadoresService.create(nuevoIndicador).subscribe({
      next: (data) => {
        // Manejar el éxito de la operación
        this.mensajeService.mensajeExito(
          'Tipo de incidencia agregada correctamente'
        );
        this.getIncidencias(); // Actualizar la lista de tipos de incidencias
        this.closebutton.nativeElement.click(); // Cerrar el modal
      },
      error: (error) => {
        this.spinnerService.hide();
        this.mensajeService.mensajeError(error);
      },
    });
  }
  id!: number;

  editarIncidencia() {
    const incidenciaId = this.incidenciasForm.get('id')?.value;
    const nuevoIndicador: Indicadores = {
      id: incidenciaId,
      tipo: this.incidenciasForm.value.retroalimentacion,
      color: this.incidenciasForm.value.color,
    };
    this.spinnerService.show();

    this.indicadoresService.update(incidenciaId, nuevoIndicador).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito(
          'Incidencia actualizada correctamente'
        );
        this.resetForm();
        this.getIncidencias();
        this.configPaginator.currentPage = 1;
      },
      error: (error) => {
        console.error('Error en la solicitud POST:', error);
        this.spinnerService.hide();
        this.mensajeService.mensajeError(error);
      },
    });
  }

  setDataModalUpdate(indicadores: Indicadores) {
    this.isModalAdd = false;

    this.incidenciasForm.patchValue({
      id: indicadores.id,
      retroalimentacion: indicadores.tipo,
      color: indicadores.color,
    });

    // El objeto que se enviará al editar la visita será directamente this.visitaForm.value
    console.log(this.incidenciasForm.value);
    console.log(indicadores);
  }

  deleteItem(id: number) {
    this.mensajeService.mensajeAdvertencia(
      `¿Estás seguro de eliminar el tipo de incidencia?`,
      () => {
        this.indicadoresService.delete(id).subscribe({
          next: () => {
            this.mensajeService.mensajeExito(
              'Incidencia borrada correctamente'
            );
            this.configPaginator.currentPage = 1;
            this.getIncidencias();
            this.searchItem.nativeElement.value = '';
          },
          error: (error: string) => this.mensajeService.mensajeError(error),
        });
      }
    );
  }

  getIncidencias() {
    this.isLoading = LoadingStates.trueLoading;
    this.indicadoresService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.indicadores = dataFromAPI;
        this.incidenciasFilter = this.indicadores;
        this.isLoading = LoadingStates.falseLoading;
      },
      error: () => {
        this.isLoading = LoadingStates.errorLoading;
      },
    });
  }
  getCasillas() {
    this.casillasService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.casillas = dataFromAPI;
      },
    });
  }
  exportarDatosAExcel() {
    if (this.indicadores.length === 0) {
      console.warn('La lista de usuarios está vacía. No se puede exportar.');
      return;
    }

    const datosParaExportar = this.indicadores.map((indicadores) => {
      return {
        Tipo: indicadores.tipo,
        'Total de incidencias': indicadores.totalIncidencias,
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

    this.guardarArchivoExcel(excelBuffer, 'incidencias.xlsx');
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
