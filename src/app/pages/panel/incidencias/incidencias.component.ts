import {  Component, ElementRef, Inject,  ViewChild } from '@angular/core';
import {  FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingStates } from 'src/app/global/global';
import { Indicadores } from 'src/app/models/indicadores';
import { Visita } from 'src/app/models/visita';
import { IndicadoresService } from 'src/app/core/services/indicadores.service';
import { Casillas } from 'src/app/models/casillas';
import { CasillasService } from 'src/app/core/services/casilla.service';
import { Incidencia } from 'src/app/models/incidencias';
import { IncidenciaService } from 'src/app/core/services/incidencias.service';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { AreasAdscripcionService } from 'src/app/core/services/areas-adscripcion.service';

@Component({
  selector: 'app-incidencias',
  templateUrl: './incidencias.component.html',
  styleUrls: ['./incidencias.component.css']
})


export class IncidenciasComponent  {

  @ViewChild('closebutton') closebutton!: ElementRef;
  @ViewChild('searchItem') searchItem!: ElementRef;

  incidenciasForm!: FormGroup;

  incidencia!: Incidencia;

  vistas: Visita [] = [];
  casillas: Casillas [] = [];
  incidencias: Incidencia [] = [];
  indicadores: Indicadores [] = [];
  isLoading = LoadingStates.neutro;
  isModalAdd = true;
  incidenciasFilter: Incidencia[] = [];
  idUpdate!: number;
  formData: any;

  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    private formBuilder: FormBuilder,
    private spinnerService: NgxSpinnerService,
    private mensajeService: MensajeService,
    private indicadoresService: IndicadoresService,
    private casillasService: CasillasService,
    private incidenciasService: IncidenciaService,
    private areasAdscripcionService: AreasAdscripcionService,
  ) {
   this.incidenciasService.refreshListIncidencia.subscribe(() => this.getIncidencias());
   this.creteForm();
   this.getIndicadores();
   this.getCasillas();
   this.getIncidencias();
   this.configPaginator.itemsPerPage = 10;
  }
  creteForm() {
    this.incidenciasForm = this.formBuilder.group({
      retroalimentacion: [''],
      indicador:  [Validators.required],
      casilla: [Validators.required],

    });
  }


  submit() {
    if (this.isModalAdd === false) {

      this.editarIncidencia();
    } else {
      this.agregar();

    }
  }

  handleChangeSearch(event: any) {
    const inputValue = event.target.value;
    this.incidenciasFilter = this.incidencias.filter(incidencia =>
      incidencia.retroalimentacion.toLowerCase().includes(inputValue.toLowerCase())||
      incidencia.indicador.descripcion.toLowerCase().includes(inputValue.toLowerCase())||
      incidencia.casilla.nombre.toLocaleLowerCase().includes(inputValue.toLowerCase())
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
    this.incidencia = this.incidenciasForm.value as Incidencia;
    const indicadorid = this.incidenciasForm.get('indicador')?.value;
    const casillaid = this.incidenciasForm.get('casilla')?.value;

    this.incidencia.casilla = {id: casillaid } as Casillas
    this.incidencia.indicador = { id: indicadorid } as Indicadores

    this.spinnerService.show();
    this.incidenciasService.post(this.incidencia).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Incidencia guardado correctamente');
        this.resetForm();
        this.configPaginator.currentPage = 1;
      },
      error: (error) => {
        this.spinnerService.hide();
        this.mensajeService.mensajeError(error);
      },
    });

  }

  setDataModalUpdate(dto: Incidencia){
    this.isModalAdd = false;
    this.idUpdate = dto.id;
    this.incidenciasForm.patchValue({
      id: dto.id,
      retroalimentacion: dto.retroalimentacion,
      indicador: dto.indicador.id,
      casilla: dto.casilla.id,
    });
    this.formData = this.incidenciasForm.value;
    console.log(this.incidenciasForm.value);
  }

  editarIncidencia() {
    this.incidencia = this.incidenciasForm.value as Incidencia;
    this.incidencia.id = this.idUpdate;

    const indicadorid = this.incidenciasForm.get('indicador')?.value;
    const casillaid = this.incidenciasForm.get('casilla')?.value;

    this.incidencia.casilla = {id: casillaid } as Casillas
    this.incidencia.indicador = { id: indicadorid } as Indicadores

    this.spinnerService.show();
    this.incidenciasService.put(this.idUpdate,this.incidencia).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Incidencia actualizada correctamente');
        this.resetForm();
      },
      error: (error) => {
        this.spinnerService.hide();
        this.mensajeService.mensajeError(error);
      },
    });
  }

  deleteItem(id: number) {
    this.mensajeService.mensajeAdvertencia(
      `¿Estás seguro de eliminar la incidencia?`,
      () => {
        this.incidenciasService.delete(id).subscribe({
          next: () => {
            this.mensajeService.mensajeExito('Incidencia borrada correctamente');
            this.configPaginator.currentPage = 1;
            this.searchItem.nativeElement.value = '';
          },
          error: (error) => this.mensajeService.mensajeError(error)
        });
      }
    );
  }


  getIncidencias() {
    this.isLoading = LoadingStates.trueLoading;
    this.incidenciasService.getAll().subscribe(
      {
        next: (dataFromAPI) => {
          this.incidencias = dataFromAPI;
          this.incidenciasFilter = this.incidencias;
          this.isLoading = LoadingStates.falseLoading;
        },
        error: () => {
          this.isLoading = LoadingStates.errorLoading;
        }
      }
    );
  }

  getIndicadores() {
    this.indicadoresService.getAll().subscribe(
      {
        next: (dataFromAPI) => {
          this.indicadores = dataFromAPI;},
      }
    );
  }

  getCasillas() {
    this.casillasService.getAll().subscribe(
      {
        next: (dataFromAPI) => {
          this.casillas = dataFromAPI;},
      }
    );
  }
}
