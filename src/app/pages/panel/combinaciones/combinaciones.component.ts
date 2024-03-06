import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { CandidaturaService } from 'src/app/core/services/candidaturs.service';
import { CombinacionService } from 'src/app/core/services/combinacion.service';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { LoadingStates } from 'src/app/global/global';
import { Candidatura } from 'src/app/models/candidatura';
import { Combinacion } from 'src/app/models/combinacion';
import { TipoAgrupaciones } from 'src/app/models/tipo-agrupaciones';

@Component({
  selector: 'app-combinaciones',
  templateUrl: './combinaciones.component.html',
  styleUrls: ['./combinaciones.component.css']
})
export class CombinacionesComponent {
  @ViewChild('closebutton') closebutton!: ElementRef;
  @ViewChild('searchItem') searchItem!: ElementRef;
  CombinacionForm!: FormGroup;
  partidos: Candidatura[] = [];
  candidatura: Candidatura[] = [];
  isModalAdd = true;
  public isUpdatingImg: boolean = false;
  public imgPreview: string = '';
  imagenAmpliada: string | null = null;
  isLoading = LoadingStates.neutro;
  combinaciones: Combinacion[] = [];
  combinacionesFilter: Combinacion[] = [];
  combinacion!: Combinacion;

  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    private spinnerService: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private candidaturaService: CandidaturaService,
    private combinacionService: CombinacionService,
    private mensajeService: MensajeService
  ) {
    this.getPartidos();
    this.creteForm();
    this.getCandidatura();
    this.getCombinaciones();
  }
  creteForm() {
    this.CombinacionForm = this.formBuilder.group({
      id: [null],
      candidatura: ['', Validators.required],
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
      .getAllCoalicion()
      .subscribe({ next: (dataFromAPI) => (this.candidatura = dataFromAPI) });
  }
  submit() {
    if (this.isModalAdd === false) {
      this.actualizar();
    } else {
      this.agregar();
    }
  }
  agregar() {
    this.combinacion = this.CombinacionForm.value as Combinacion;
    const tipo = this.CombinacionForm.get('candidatura')?.value;
    this.combinacion.candidatura = { id: tipo } as Candidatura;

    this.spinnerService.show();
    console.log('data:', this.combinacion);
    const imagenBase64 = this.CombinacionForm.get('imagenBase64')?.value;

    if (imagenBase64) {
        let formData = {
            ...this.combinacion,
            imagenBase64,
            partidos: [] as string[], // Initialize 'partidos' property as an empty array
        };

        const tipo2 = this.CombinacionForm.get('partidos')?.value;
        const partidosList = tipo2 ? (tipo2 as string[]) : [];
        formData = { ...formData, partidos: partidosList };

        // Elimina la propiedad 'id' del objeto formData
        

        this.spinnerService.show();
        this.combinacionService.post(formData).subscribe({
            next: () => {
                this.spinnerService.hide();
                this.mensajeService.mensajeExito('Candidatura guardada correctamente');
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
        this.mensajeService.mensajeError('Error: No se encontró una representación válida de la imagen.');
    }
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
  getCombinaciones() {
    this.isLoading = LoadingStates.trueLoading;
    this.combinacionService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.combinaciones = dataFromAPI;
        this.combinacionesFilter = this.combinaciones;
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
  mostrarImagenAmpliada(rutaImagen: string) {
    this.imagenAmpliada = rutaImagen;
    const modal = document.getElementById('modal-imagen-ampliada');
    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
    }
  }
  deleteItem(id: number, nameItem: string) {
    this.mensajeService.mensajeAdvertencia(
      `¿Estás seguro de eliminar la combinacion: ${nameItem}?`,
      () => {
        this.combinacionService.delete(id).subscribe({
          next: () => {
            this.mensajeService.mensajeExito(
              'Combinacion borrada correctamente'
            );
            this.configPaginator.currentPage = 1;
            this.searchItem.nativeElement.value = '';
          },
          error: (error) => this.mensajeService.mensajeError(error),
        });
      }
    );
  }

}
