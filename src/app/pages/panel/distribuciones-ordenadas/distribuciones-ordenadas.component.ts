import { Component, ElementRef, Inject, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { CandidaturaService } from 'src/app/core/services/candidaturs.service';
import { CombinacionService } from 'src/app/core/services/combinacion.service';
import { DistribucionCandidaturaService } from 'src/app/core/services/distribucion-candidatura.service';
import { DistribucionOrdenadaService } from 'src/app/core/services/distribucion-ordenada.service';
import { DistritoService } from 'src/app/core/services/distrito.service';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { TipoAgrupacionesService } from 'src/app/core/services/tipo-agrupaciones.service';
import { LoadingStates } from 'src/app/global/global';
import { Candidatura } from 'src/app/models/candidatura';
import { Combinacion } from 'src/app/models/combinacion';
import { DistribucionCandidatura } from 'src/app/models/distribucion-candidatura';
import { DistribucionOrdenada } from 'src/app/models/distribuciones-ordenadas';
import { TipoAgrupaciones } from 'src/app/models/tipo-agrupaciones';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-distribuciones-ordenadas',
  templateUrl: './distribuciones-ordenadas.component.html',
  styleUrls: ['./distribuciones-ordenadas.component.css']
})
export class DistribucionesOrdenadasComponent {
  @ViewChild('closebutton') closebutton!: ElementRef;
  DistribucionesForm!: FormGroup;
  estatusBtn = true;
  verdadero = 'Activo';
  falso = 'Inactivo';
  visibility = false;
  estatusTag = this.verdadero;
  isModalAdd: boolean = true;
  imagenAmpliada: string | null = null;
  public isUpdatingImg: boolean = false;
  public imgPreview: string = '';
  public isUpdatingfoto: boolean = false;
  isLoading = LoadingStates.neutro;
  distribucionC: DistribucionCandidatura[] = [];
  distribuciones: DistribucionOrdenada [] = [];
  distribucion!: DistribucionOrdenada;
  DistribucionesFilter: DistribucionOrdenada [] = [];
  combinacion: Combinacion [] = [];
  TipoAgrupaciones: TipoAgrupaciones [] = [];
  candidatura: Candidatura [] = [];


  
  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    private spinnerService: NgxSpinnerService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    private distribucionordenadaService: DistribucionOrdenadaService,
    private distribuciondandidaturaService: DistribucionCandidaturaService,
    private combinacionservice: CombinacionService,
    private candidaturaservice: CandidaturaService,
    private tipoagrupacionesservice: TipoAgrupacionesService,
  ) {
    this.distribucionordenadaService.refreshListDistribucionOrdenada.subscribe(() =>
    this.getdistribuciones()
    );
    this.creteForm();
    this.getdistribuciones();
    this.getdistribucionC();
    this.getCombinacion();
    this.getCandidatura();
    this.gettipoagrupacionesservice();
  }
  creteForm() {
    this.DistribucionesForm = this.formBuilder.group({
      id: [null],
      InputId: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.pattern(/^[0-9]{2}$/),
          Validators.maxLength(5)
        ],
      ],
      orden: [this.estatusBtn],
      distribucionCandidatura: ['', Validators.required],
      tipoAgrupacionPolitica: ['', Validators.required],
      candidatura: ['', Validators.required],
      combinacion: ['', Validators.required],
      PadreId: ['', [Validators.required,Validators.pattern(/^[0-9]{2}$/),Validators.maxLength(5),Validators.minLength(2),]],
      NombreCandidatura: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.pattern(
            /^([a-zA-ZÀ-ÿ\u00C0-\u00FF]{1})[a-zA-ZÀ-ÿ\u00C0-\u00FF ]+$/
          ),
          Validators.maxLength(25)
        ],
      ],
      imagenBase64: [''],
    });
  }
  getdistribuciones() {
    this.isLoading = LoadingStates.trueLoading;
    this.distribucionordenadaService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.distribuciones = dataFromAPI;
        this.DistribucionesFilter = this.distribuciones;
        this.isLoading = LoadingStates.falseLoading;
      },
      error: (err) => {
        this.isLoading = LoadingStates.errorLoading;
        if (err.status === 401) {
          this.mensajeService.mensajeSesionExpirada();
        }
      },
    });
  }
  getdistribucionC() {
    this.distribuciondandidaturaService
      .getAll()
      .subscribe({ next: (dataFromAPI) => (this.distribucionC = dataFromAPI) });
  }
  getCombinacion() {
    this.combinacionservice
      .getAll()
      .subscribe({ next: (dataFromAPI) => (this.combinacion = dataFromAPI) });
  }
  gettipoagrupacionesservice() {
    this.tipoagrupacionesservice
      .getAll()
      .subscribe({ next: (dataFromAPI) => (this.TipoAgrupaciones = dataFromAPI) });
  }

  getCandidatura() {
    this.candidaturaservice
      .getAll()
      .subscribe({ next: (dataFromAPI) => (this.candidatura = dataFromAPI) });
  }
  submit() {
    if (this.isModalAdd === false) {
      this.actualizar();
    } else {
      this.agregar();
    }
  }
  resetForm() {
    this.closebutton.nativeElement.click();
    this.DistribucionesForm.reset();
  }
  agregar(){
    this.distribucion = this.DistribucionesForm.value as DistribucionOrdenada;
    const imagenBase64 = this.DistribucionesForm.get('imagenBase64')?.value;
    
    const distribucionid = this.DistribucionesForm.get('distribucionCandidatura')?.value;
    const TipoAgrupacionesId = this.DistribucionesForm.get('tipoAgrupacionPolitica')?.value;
    const Candidaturaid = this.DistribucionesForm.get('candidatura')?.value;
    const CombinacionId = this.DistribucionesForm.get('combinacion')?.value;

    this.distribucion.distribucionCandidatura = { id: distribucionid } as DistribucionCandidatura;
    this.distribucion.tipoAgrupacionPolitica = { id: TipoAgrupacionesId } as TipoAgrupaciones;
    this.distribucion.candidatura = { id: Candidaturaid } as Candidatura;
    this.distribucion.combinacion = { id: CombinacionId } as Combinacion;
   
    if (imagenBase64) {
      const formData = { ...this.distribucion, imagenBase64};
      this.spinnerService.show();
      this.distribucionordenadaService.post(formData).subscribe({
        next: () => {
          this.spinnerService.hide();
          this.mensajeService.mensajeExito('Candidato guardado correctamente');
          this.resetForm();
          this.configPaginator.currentPage = 1;
        },
        error: (error) => {
          this.spinnerService.hide();
          this.mensajeService.mensajeError(error);
        },
      });
    } else {
      this.spinnerService.hide();
      this.mensajeService.mensajeError(
        'Error: No se encontró una representación válida de la imagen.'
      );
    }
  }
  actualizar(){
    
  }
  setEstatus() {
    this.estatusTag = this.estatusBtn ? this.verdadero : this.falso;
}

handleChangeAdd() {
 
    const estatusControl = this.DistribucionesForm.get('estatus');
    if (estatusControl) {
      estatusControl.setValue(true);
    }
    this.isModalAdd = true;
    
}
cerrarModal() {
  this.imagenAmpliada = null;
  const modal = document.getElementById('modal-imagen-ampliada');
  if (modal) {
    modal.classList.remove('show');
    modal.style.display = 'none';
  }
}
onFileChange(event: Event) {
  const inputElement = event.target as HTMLInputElement;
  this.isUpdatingImg = false;
  if (inputElement.files && inputElement.files.length > 0) {
    const file = inputElement.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const base64String = reader.result as string;
      const base64WithoutPrefix = base64String.split(';base64,').pop() || '';

      this.DistribucionesForm.patchValue({
        imagenBase64: base64WithoutPrefix, // Contiene solo la representación en base64
      });
    };
    this.isUpdatingfoto = false;
    reader.readAsDataURL(file);
  }
}
mostrarImagenAmpliada(rutaImagen: string) {
  this.imagenAmpliada = rutaImagen;
  const modal = document.getElementById('modal-imagen-ampliada');
  if (modal) {
    modal.classList.add('show');
    modal.style.display = 'block';
  }
}
handleChangeSearch(event: any) {
  const inputValue = event.target.value;
  const valueSearch = inputValue.toLowerCase();

  this.DistribucionesFilter = this.distribuciones.filter(
    (d) =>
      d.nombreCandidatura.toLowerCase().includes(valueSearch) ||
      d.tipoAgrupacionPolitica.nombre.toLowerCase().includes(valueSearch) ||
      d.candidatura.nombre.toLowerCase().includes(valueSearch) 
  );

  this.configPaginator.currentPage = 1;
}
exportarDatosAExcel() {
  if (this.distribuciones.length === 0) {
    console.warn('La lista de candidatos está vacía. No se puede exportar.');
    return;
  }

  const datosParaExportar = this.distribuciones.map((d) => {
    const orden = d.orden ? 'Activo' : 'Inactivo';
    
    return {
      'Nombre de candidatura': d.nombreCandidatura,
      'InputId': d.inputId,
      'Distribucion candidatura': d.distribucionCandidatura.tipoEleccion.nombre,
      'Orden': orden,
      'Tipo de agrupacion politica': d.tipoAgrupacionPolitica.nombre,
      'Candidatura': d.candidatura.nombre,
      'Combinacion': d.combinacion.nombre,
      'PadreId': d.PadreId
      
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

  this.guardarArchivoExcel(excelBuffer, 'Distribuciones-Ordenadas.xlsx');
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
