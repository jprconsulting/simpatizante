import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { CandidaturaService } from 'src/app/core/services/candidaturs.service';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { Candidatura } from 'src/app/models/candidatura';

@Component({
  selector: 'app-combinaciones',
  templateUrl: './combinaciones.component.html',
  styleUrls: ['./combinaciones.component.css']
})
export class CombinacionesComponent {
  @ViewChild('closebutton') closebutton!: ElementRef;
  CombinacionForm!: FormGroup;
  partidos: Candidatura[] = [];
  candidatura: Candidatura[] = [];
  isModalAdd = true;
  public isUpdatingImg: boolean = false;
  public imgPreview: string = '';
  imagenAmpliada: string | null = null;

  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    private spinnerService: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private candidaturaService: CandidaturaService,
    private mensajeService: MensajeService
  ) {
    this.getPartidos();
    this.creteForm();
    this.getCandidatura();
  }
  creteForm() {
    this.CombinacionForm = this.formBuilder.group({
      id: [null],
      coalicion: ['', Validators.required],
      nombre: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(
            /^([a-zA-ZÀ-ÿ\u00C0-\u00FF]{2})[a-zA-ZÀ-ÿ\u00C0-\u00FF ]+$/
          ),
        ],
      ],
      partidos: ['', Validators.required],
      imagenBase64: [''],
    });
  }
  getPartidos() {
    this.candidaturaService
      .getAllPartidos()
      .subscribe({ next: (dataFromAPI) => (this.partidos = dataFromAPI) });
  }
  getCandidatura() {
    this.candidaturaService
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
  agregar(){

  }
  actualizar(){

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

        this.CombinacionForm.patchValue({
          imagenBase64: base64WithoutPrefix, // Contiene solo la representación en base64
        });
      };

      reader.readAsDataURL(file);
    }
  }
  cerrarModal() {
    this.imagenAmpliada = null;
    const modal = document.getElementById('modal-imagen-ampliada');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
    }
  }
  resetForm() {
    this.closebutton.nativeElement.click();
    this.CombinacionForm.reset();
  }
  handleChangeAdd() {
    this.isUpdatingImg = false;
    this.resetForm();
    this.isModalAdd = true;
  }
}
