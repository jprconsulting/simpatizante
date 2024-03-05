import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { CandidaturaService } from 'src/app/core/services/candidaturs.service';

import { DistritoService } from 'src/app/core/services/distrito.service';
import { MunicipiosService } from 'src/app/core/services/municipios.service';
import { ComunidadService } from 'src/app/core/services/comunidad.service';
import { TipoEleccionService } from 'src/app/core/services/tipo-elecciones.service';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { TipoAgrupacionesService } from 'src/app/core/services/tipo-agrupaciones.service';

import { LoadingStates } from 'src/app/global/global';
import { Candidatura } from 'src/app/models/candidatura';
import { Distrito } from 'src/app/models/distrito';
import { Municipio } from 'src/app/models/municipio';
import { Comunidad } from 'src/app/models/comunidad';

import { TipoAgrupaciones } from 'src/app/models/tipo-agrupaciones';
import * as XLSX from 'xlsx';
import { TipoEleccion } from 'src/app/models/tipo-eleccion';
import { DistribucionCandidatura } from '../../../models/distribucion-candidatura';
import { DistribucionCandidaturaService } from 'src/app/core/services/distribucion-candidatura.service';

@Component({
  selector: 'app-distribucion-candidatura',
  templateUrl: './distribucion-candidatura.component.html',
  styleUrls: ['./distribucion-candidatura.component.css'],
})
export class DistribucionCandidaturaComponent {
  @ViewChild('closebutton') closebutton!: ElementRef;
  @ViewChild('searchItem') searchItem!: ElementRef;
  distribucion!: DistribucionCandidatura;
  DistribucionForm!: FormGroup;
  isModalAdd = true;
  agrupaciones: TipoAgrupaciones[] = [];
  partidos: Candidatura[] = [];
  comun: Candidatura[] = [];
  coalicion: Candidatura[] = [];
  independiente: Candidatura[] = [];
  candidaturas: Candidatura[] = [];
  public isUpdatingImg: boolean = false;
  public imgPreview: string = '';
  isLoading = LoadingStates.neutro;
  agrupacionSelect: any;
  candidaturasFilter: Candidatura[] = [];
  imagenAmpliada: string | null = null;
  id!: number;
  selectedAgrupacion: any;
  searchText: string = '';
  distritos: Distrito[] = [];
  municipios: Municipio[] = [];
  tiposEleccion: TipoEleccion[] = [];
  comunidades: Comunidad[] = [];
  distribucionCandidatura: DistribucionCandidatura[] = [];
  distribucionCandidaturaFilter: DistribucionCandidatura[] = [];

  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    private spinnerService: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private tipoagrupacionesService: TipoAgrupacionesService,
    private candidaturaService: CandidaturaService,
    private distritoService: DistritoService,
    private municipiosService: MunicipiosService,
    private comunidadService: ComunidadService,
    private tipoEleccionService: TipoEleccionService,
    private distribucionCandidaturaService: DistribucionCandidaturaService,

    private mensajeService: MensajeService
  ) {
    this.candidaturaService.refreshListCandidatura.subscribe(() =>
      this.getCandidatura()
    );
    this.creteForm();
    this.getAgrupaciones();
    this.getCandidatura();
    this.getPartidos();
    this.getMunicipio();
    this.getTipoEleccion();
    this.getDistritos();
    this.getComunidad();
    this.getDistribucion();
    this.getComun();
    this.getCoalicion();
    this.getIndependiente();
  }
  creteForm() {
    this.DistribucionForm = this.formBuilder.group({
      id: [null],
      tipoEleccion: [null, Validators.required],
      partidos: [null],
      distrito: [null],
      municipio: [null],
      comunidad: [null],
      coalicion: [null],
      comun: [null],
      independiente: [null],
    });
  }

  getTipoEleccion() {
    this.isLoading = LoadingStates.trueLoading;
    this.tipoEleccionService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.tiposEleccion = dataFromAPI;
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

  getComunidad() {
    this.isLoading = LoadingStates.trueLoading;
    this.comunidadService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.comunidades = dataFromAPI;
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

  getMunicipio() {
    this.isLoading = LoadingStates.trueLoading;
    this.municipiosService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.municipios = dataFromAPI;
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

  getDistritos() {
    this.isLoading = LoadingStates.trueLoading;
    this.distritoService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.distritos = dataFromAPI;
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

  getCandidatura() {
    this.isLoading = LoadingStates.trueLoading;
    this.candidaturaService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.candidaturas = dataFromAPI;
        this.candidaturasFilter = this.candidaturas;
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

  getDistribucion() {
    this.isLoading = LoadingStates.trueLoading;
    this.distribucionCandidaturaService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.distribucionCandidatura = dataFromAPI;
        this.distribucionCandidaturaFilter = this.distribucionCandidatura;
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

  candidaturaSelect!: Candidatura | undefined;
  onSelectOperador(id: number | null) {
    this.candidaturaSelect = this.candidaturas.find(
      (v) => v.tipoAgrupacionPolitica.id === id
    );

    if (this.candidaturaSelect) {
      const valueSearch2 =
        this.candidaturaSelect.tipoAgrupacionPolitica.id.toString();

      console.log('Search Value:', valueSearch2);

      this.candidaturasFilter = this.candidaturas.filter((candidaturas) =>
        candidaturas.tipoAgrupacionPolitica.id.toString().includes(valueSearch2)
      );

      console.log('Filtered Votantes:', this.candidaturasFilter);

      this.configPaginator.currentPage = 1;
    }
  }
  onClear() {
    this.getCandidatura();
  }
  mostrarImagenAmpliada(rutaImagen: string) {
    this.imagenAmpliada = rutaImagen;
    const modal = document.getElementById('modal-imagen-ampliada');
    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
    }
  }

  getAgrupaciones() {
    this.tipoagrupacionesService
      .getAll()
      .subscribe({ next: (dataFromAPI) => (this.agrupaciones = dataFromAPI) });
  }

  getPartidos() {
    this.candidaturaService
      .getAllPartidos()
      .subscribe({ next: (dataFromAPI) => (this.partidos = dataFromAPI) });
  }

  getComun() {
    this.candidaturaService
      .getAllComun()
      .subscribe({ next: (dataFromAPI) => (this.comun = dataFromAPI) });
  }

  getCoalicion() {
    this.candidaturaService
      .getAllCoalicion()
      .subscribe({ next: (dataFromAPI) => (this.coalicion = dataFromAPI) });
  }

  getIndependiente() {
    this.candidaturaService
      .getAllIndependiente()
      .subscribe({ next: (dataFromAPI) => (this.independiente = dataFromAPI) });
  }

  handleChangeAdd() {
    this.isUpdatingImg = false;
    this.DistribucionForm.reset();
    this.isModalAdd = true;
    const estatusControl = this.DistribucionForm.get('estatus');
    if (estatusControl) {
      estatusControl.setValue(true);
    }
    this.DistribucionForm.get('tipoAgrupacionPolitica')?.valueChanges.subscribe(
      (value) => {
        if (value === 1 || value === 4) {
          this.DistribucionForm.get('partidos')?.setValue(''); // Reinicia el valor de la segunda casilla si no cumple la condición
        }
      }
    );
  }

  onSelectCandidato(id: number) {
    if (id) {
      this.agrupacionSelect = this.agrupaciones.find((b) => b.id === id);
    }
  }

  resetForm() {
    this.closebutton.nativeElement.click();
    this.DistribucionForm.reset();
    this.getPartidos();
  }

  submit() {
    if (this.isModalAdd === false) {
      this.actualizar();
    } else {
      this.agregar();
    }
  }

  agregar() {
    this.distribucion = this.DistribucionForm.value as DistribucionCandidatura;
    const tipo = this.DistribucionForm.get('tipoEleccion')?.value;
    this.distribucion.tipoEleccion = { id: tipo } as TipoAgrupaciones;
    const distrito = this.DistribucionForm.get('distrito')?.value;
    this.distribucion.distrito = { id: distrito } as Distrito;
    const municipio = this.DistribucionForm.get('muncipio')?.value;
    this.distribucion.municipio = { id: municipio } as Municipio;
    const comunidad = this.DistribucionForm.get('comunidad')?.value;
    this.distribucion.comunidad = { id: distrito } as Comunidad;
    this.spinnerService.show();
    console.log('data:', this.distribucion);

    const partidos = this.DistribucionForm.get('partidos')?.value;
    const coalicion = this.DistribucionForm.get('coalicion')?.value;
    const independiente = this.DistribucionForm.get('independiente')?.value;
    const comun = this.DistribucionForm.get('comun')?.value;

    // Combinar los valores de todos los selectores en una sola lista
    const allPartidos = [...partidos, ...coalicion, ...independiente, ...comun];

    // Asignar la lista de partidos al objeto distribucion
    this.distribucion.partidos = allPartidos;

    this.spinnerService.show();
    this.distribucionCandidaturaService.post(this.distribucion).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Distribución guardada correctamente');
        this.resetForm();
        this.configPaginator.currentPage = 1;
      },
      error: (error) => {
        this.spinnerService.hide();
        this.mensajeService.mensajeError(error);
      },
    });
  }

  actualizar() {
    this.distribucion = this.DistribucionForm.value as DistribucionCandidatura;

    const tipo = this.DistribucionForm.get('tipoAgrupacionPolitica')?.value;
    this.distribucion.tipoEleccion = { id: tipo } as TipoAgrupaciones;

    const tipo2 = this.DistribucionForm.get('partidos')?.value;
    const partidosList = tipo2 ? (tipo2 as string[]) : undefined;
    const formData = { ...this.distribucion, partidos: partidosList };

    this.spinnerService.show();

    this.distribucionCandidaturaService.put(this.id, formData).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito(
          'Candidatura actualizada correctamente'
        );
        this.resetForm();
        this.configPaginator.currentPage = 1;
      },
      error: (error) => {
        this.spinnerService.hide();
        this.mensajeService.mensajeError(error);
      },
    });
  }

  setDataModalUpdate(dto: Candidatura) {
    this.isModalAdd = false;
    this.id = dto.id;

    const candidatura = this.candidaturasFilter.find(
      (candidatura) => candidatura.id === dto.id
    );

    this.imgPreview = candidatura!.logo;
    this.isUpdatingImg = true;

    this.DistribucionForm.patchValue({
      id: dto.id,

      nombre: dto.nombre,
      acronimo: dto.acronimo,
      tipoAgrupacionPolitica: dto.tipoAgrupacionPolitica.id,
      partidos: dto.partidos,
      estatus: dto.estatus,
      orden: dto.orden,
      imagenBase64: '',
    });
    console.log('setDataUpdateVistaForm ', this.DistribucionForm.value);
    console.log('setDataUpdateDTO', dto);
  }

  handleChangeSearch(event: any) {
    const inputValue = event.target.value;
    const valueSearch = inputValue.toLowerCase();

    console.log('Search Value:', valueSearch);

    this.candidaturasFilter = this.candidaturas.filter(
      (candidaturas) =>
        candidaturas.nombre.toLowerCase().includes(valueSearch) ||
        candidaturas.tipoAgrupacionPolitica.nombre
          .toLowerCase()
          .includes(valueSearch)
    );

    console.log('Filtered Votantes:', this.candidaturasFilter);

    this.configPaginator.currentPage = 1;
  }
  exportarDatosAExcel() {
    if (this.candidaturas.length === 0) {
      console.warn(
        'La lista de simpatizantes está vacía, no se puede exportar.'
      );
      return;
    }

    const datosParaExportar = this.candidaturas.map((candidatura) => {
      const estatus = candidatura.estatus ? 'Activo' : 'Inactivo';
      const partidoString = candidatura.partidos?.join(', ');

      return {
        'Agupacion politica': candidatura.tipoAgrupacionPolitica.nombre,
        Nombre: candidatura.nombre,
        Acronimo: candidatura.acronimo,
        Partido: partidoString,
        Orden: candidatura.orden,
        Estatus: estatus,
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

    this.guardarArchivoExcel(excelBuffer, 'Candidaturas.xlsx');
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

  deleteItem(id: number) {
    this.mensajeService.mensajeAdvertencia(
      `¿Estás seguro de eliminar la distribución?`,
      () => {
        this.candidaturaService.delete(id).subscribe({
          next: () => {
            this.mensajeService.mensajeExito(
              'Distribución borrada correctamente'
            );
            this.configPaginator.currentPage = 1;
            this.searchItem.nativeElement.value = '';
          },
          error: (error) => this.mensajeService.mensajeError(error),
        });
      }
    );
  }

  onPageChange(number: number) {
    this.configPaginator.currentPage = number;
  }
}
