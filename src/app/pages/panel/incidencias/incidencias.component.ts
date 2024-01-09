import { AfterViewInit, Component, ElementRef, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingStates } from 'src/app/global/global';
import { Indicadores } from 'src/app/models/indicadores';
import { Visita } from 'src/app/models/visita';
import { IndicadoresService } from 'src/app/core/services/indicadores.service';
import { Casillas } from 'src/app/models/casillas';
import { CasillasService } from 'src/app/core/services/casilla.service';
import { Incidencia } from 'src/app/models/incidencias';

@Component({
  selector: 'app-incidencias',
  templateUrl: './incidencias.component.html',
  styleUrls: ['./incidencias.component.css']
})


export class IncidenciasComponent {
  incidenciasForm!: FormGroup;
  vistas: Visita [] = [];
  casillas: Casillas [] = [];
  incidencias: Incidencia [] = [];
  indicadores: Indicadores [] = [];
  incidencia!: Incidencia;
  isLoading = LoadingStates.neutro;
  isModalAdd = true;
  @ViewChild('searchItem') searchItem!: ElementRef;
  constructor(
    private formBuilder: FormBuilder,
    private indicadoresService: IndicadoresService,
    private casillasService: CasillasService,
  ) {
   this.creteForm();
   this.getIndicadores();
   this.getCasillas();
  }
  creteForm() {
    this.incidenciasForm = this.formBuilder.group({
      id: [null],
      tipo:  ['', [Validators.required]],
      casilla: ['', [Validators.required]],
      retroalimentacion: ['']
    });
  }
  submit() {
    if (this.isModalAdd === false) {

      this.actualizarVisita();
    } else {
      this.agregar();

    }
     
  } agregar() {
    this.incidencia = this.incidenciasForm.value as Incidencia;

  }
  actualizarVisita() {

  }
  onPageChange(number: number) {
    
  }
  handleChangeAdd() {
    this.incidenciasForm.reset();
    this.isModalAdd = true;

  }
  
  getIndicadores() {
    this.isLoading = LoadingStates.trueLoading;
    this.indicadoresService.getAll().subscribe(
      {
        next: (dataFromAPI) => {
          this.indicadores = dataFromAPI;},
      }
    );
  }
  getCasillas() {
    this.isLoading = LoadingStates.trueLoading;
    this.casillasService.getAll().subscribe(
      {
        next: (dataFromAPI) => {
          this.casillas = dataFromAPI;},
      }
    );
  }
}
