import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LoadingStates } from 'src/app/global/global';
import { Simpatizante } from 'src/app/models/votante';
import { Candidatos } from 'src/app/models/candidato';
import { Visita } from 'src/app/models/visita';
import { VotoService} from 'src/app/core/services/voto.service';
import { Voto } from 'src/app/models/voto';
import { NgxSpinnerService } from 'ngx-spinner';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { PaginationInstance } from 'ngx-pagination';
import { SimpatizantesService } from 'src/app/core/services/simpatizantes.service';
@Component({
  selector: 'app-seguimiento-voto',
  templateUrl: './seguimiento-voto.component.html',
  styleUrls: ['./seguimiento-voto.component.css']
})
export class SeguimientoVotoComponent implements OnInit{
  @ViewChild('searchItem') searchItem!: ElementRef;
  @ViewChild('closebutton') closebutton!: ElementRef;

  seguimientoForm!: FormGroup;
  vistas: Visita [] = [];
  candidato: Candidatos[] = [];
  voto: Voto[] = [];
  votos!: Voto;
  candidatosSelect: any;
  simpatizantes: Simpatizante[] =[];
  isLoading = LoadingStates.neutro;
  isModalAdd = true;
  isClaveFilled = false;

  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    private formBuilder: FormBuilder,
    private votoService: VotoService,
    private spinnerService: NgxSpinnerService,
    private mensajeService: MensajeService,
    private simpatizantesService: SimpatizantesService,


  ) {
   this.creteForm();
   this.getVotantes();
  }

  ngOnInit(): void {

  }

  creteForm() {
    this.seguimientoForm = this.formBuilder.group({
      id: [null],
      estatusVoto: [true],
      imagenBase64: [''],
      simpatizante: ['']
    });
  }

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

  submit() {
    if (this.isModalAdd === false) {

      this.actualizarVisita();
    } else {
      this.agregar();

    }
  }

  resetForm() {
    this.closebutton.nativeElement.click();
    this.seguimientoForm.reset();
  }

  agregar() {
    this.votos = this.seguimientoForm.value as Voto;
    const simpatizanteId = this.seguimientoForm.get('simpatizante')?.value;


    this.votos.simpatizante = { id: simpatizanteId } as Simpatizante
    this.spinnerService.show();
    console.log('data:', this.votos);
    const imagenBase64 = this.seguimientoForm.get('imagenBase64')?.value;

    if (imagenBase64) {
      const formData = { ...this.votos, imagenBase64 };

      this.spinnerService.show();
      this.votoService.post(formData).subscribe({
        next: () => {
          this.spinnerService.hide();
          this.mensajeService.mensajeExito('Voto guardado correctamente');
          this.resetForm();
          this.configPaginator.currentPage = 1;
        },
        error: (error) => {
          this.spinnerService.hide();
          this.mensajeService.mensajeError(error);
        }
      });
    } else {
      console.error('Error: No se encontró una representación válida en base64 de la imagen.');
    }
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

  getVotantes() {
    this.isLoading = LoadingStates.trueLoading;
    this.simpatizantesService.getAll().subscribe(
      {
        next: (dataFromAPI) => {
          this.simpatizantes = dataFromAPI;
        },
        error: () => {
          this.isLoading = LoadingStates.errorLoading
        }
      }
    );
  }
}
