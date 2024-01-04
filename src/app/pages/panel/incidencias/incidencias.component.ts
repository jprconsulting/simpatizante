import { AfterViewInit, Component, ElementRef, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingStates } from 'src/app/global/global';
import { Visita } from 'src/app/models/visita';

@Component({
  selector: 'app-incidencias',
  templateUrl: './incidencias.component.html',
  styleUrls: ['./incidencias.component.css']
})


export class IncidenciasComponent {
  incidenciasForm!: FormGroup;
  vistas: Visita [] = [];
  isLoading = LoadingStates.neutro;
  isModalAdd = true;
  @ViewChild('searchItem') searchItem!: ElementRef;
  constructor(
    private formBuilder: FormBuilder,
  ) {
   this.creteForm();
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
   
  }
  actualizarVisita() {

  }
  onPageChange(number: number) {
    
  }
  handleChangeAdd() {
    this.incidenciasForm.reset();
    this.isModalAdd = true;

  }
  

}
