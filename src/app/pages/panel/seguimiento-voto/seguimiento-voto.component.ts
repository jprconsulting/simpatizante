import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LoadingStates } from 'src/app/global/global';
import { Simpatizante } from 'src/app/models/votante';
import { Candidatos } from 'src/app/models/candidato';
import { Visita } from 'src/app/models/visita';

@Component({
  selector: 'app-seguimiento-voto',
  templateUrl: './seguimiento-voto.component.html',
  styleUrls: ['./seguimiento-voto.component.css']
})
export class SeguimientoVotoComponent implements OnInit{
  seguimientoForm!: FormGroup;
  vistas: Visita [] = [];
  isLoading = LoadingStates.neutro;
  isModalAdd = true;
  @ViewChild('searchItem') searchItem!: ElementRef;
  constructor(
    private formBuilder: FormBuilder,
  ) {
   this.creteForm();
  }

  seguiForm2 = new FormGroup({
    clave: new FormControl('', [Validators.required]),
    // ...other controls
  });

  isClaveFilled = false;
  ngOnInit(): void {

  }

  candidato: Candidatos[] = [];
  candidatosSelect: any;
  simpatizantes: Simpatizante[] =[];

  onSelectCandidato(id: number) {
    if (id) {
      this.candidatosSelect = this.candidato.find(b => b.id === id);
    }
  }

  onFileChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;

    if (inputElement.files && inputElement.files.length > 0) {
      const file = inputElement.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        const base64String = reader.result as string;
        const base64WithoutPrefix = base64String.split(';base64,').pop() || '';

        this.seguimientoForm.patchValue({
          imagenBase64: base64WithoutPrefix // Contiene solo la representación en base64
        });
      };

      reader.readAsDataURL(file);
    }
  }


  creteForm() {
    this.seguimientoForm = this.formBuilder.group({
      id: [null],
      voto: [true],
      imagenBase64: ['']
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
    this.seguimientoForm.reset();
    this.isModalAdd = true;
    if (this.seguimientoForm) {
      this.seguimientoForm.reset();
      const estatusControl = this.seguimientoForm.get('voto');
      if (estatusControl) {
        estatusControl.setValue(true);
      }
      this.isModalAdd = true;
    }

  }


}
