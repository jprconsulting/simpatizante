import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { CandidaturaService } from 'src/app/core/services/candidaturs.service';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { TipoAgrupacionesService } from 'src/app/core/services/tipo-agrupaciones.service';
import { LoadingStates } from 'src/app/global/global';
import { Candidatura } from 'src/app/models/candidatura';
import { TipoAgrupaciones } from 'src/app/models/tipo-agrupaciones';
@Component({
  selector: 'app-candidaturas',
  templateUrl: './candidaturas.component.html',
  styleUrls: ['./candidaturas.component.css'],
})
export class CandidaturasComponent {
  @ViewChild('closebutton') closebutton!: ElementRef;
  @ViewChild('searchItem') searchItem!: ElementRef;
  candidatura!: Candidatura;
  CandidaturaForm!: FormGroup;
  isModalAdd = true;
  agrupaciones: TipoAgrupaciones[] = [];
  candidaturas: Candidatura[] = [];
  public isUpdatingImg: boolean = false;
  public imgPreview: string = '';
  isLoading = LoadingStates.neutro;
  agrupacionSelect: any;
  candidaturasFilter: Candidatura[] = [];
  imagenAmpliada: string | null = null;
  id!: number;

  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    private spinnerService: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private tipoagrupacionesService: TipoAgrupacionesService,
    private candidaturaService: CandidaturaService,
    private mensajeService: MensajeService
  ) {
    this.candidaturaService.refreshListCandidatura.subscribe(() =>
      this.getCandidatura()
    );
    this.creteForm();
    this.getAgrupaciones();
    this.getCandidatura();
  }
  creteForm() {
    this.CandidaturaForm = this.formBuilder.group({
      id: [null],
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
      acronimo: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(
            /^([a-zA-ZÀ-ÿ\u00C0-\u00FF]{2})[a-zA-ZÀ-ÿ\u00C0-\u00FF ]+$/
          ),
        ],
      ],
      imagenBase64: [''],
      tipoAgrupacionPolitica: [null, Validators.required],
      partidos: [null],
      estatus: [true],
      orden: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.pattern(/^([0-9])+$/),
        ],
      ],
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
      error: () => {
        this.isLoading = LoadingStates.errorLoading;
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
  getAgrupaciones() {
    this.tipoagrupacionesService
      .getAll()
      .subscribe({ next: (dataFromAPI) => (this.agrupaciones = dataFromAPI) });
  }
  handleChangeAdd() {
    this.isUpdatingImg = false;
    this.CandidaturaForm.reset();
    this.isModalAdd = true;
    const estatusControl = this.CandidaturaForm.get('estatus');
    if (estatusControl) {
      estatusControl.setValue(true);
    }
    this.CandidaturaForm.get('tipoAgrupacionPolitica')?.valueChanges.subscribe(
      (value) => {
        if (value === 1 || value === 4) {
          this.CandidaturaForm.get('partidos')?.setValue(''); // Reinicia el valor de la segunda casilla si no cumple la condición
        }
      }
    );
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

        this.CandidaturaForm.patchValue({
          imagenBase64: base64WithoutPrefix, // Contiene solo la representación en base64
        });
      };

      reader.readAsDataURL(file);
    }
  }
  onSelectCandidato(id: number) {
    if (id) {
      this.agrupacionSelect = this.agrupaciones.find((b) => b.id === id);
    }
  }
  resetForm() {
    this.closebutton.nativeElement.click();
    this.CandidaturaForm.reset();
  }
  submit() {
    if (this.isModalAdd === false) {
      this.actualizar();
    } else {
      this.agregar();
    }
  }

  agregar() {
    this.candidatura = this.CandidaturaForm.value as Candidatura;
    const tipo = this.CandidaturaForm.get('tipoAgrupacionPolitica')?.value;
    this.candidatura.tipoAgrupacionPolitica = { id: tipo } as TipoAgrupaciones;

    this.spinnerService.show();
    console.log('data:', this.candidatura);
    const imagenBase64 = this.CandidaturaForm.get('imagenBase64')?.value;
    if (imagenBase64) {
      const formData = { ...this.candidatura, imagenBase64 };

      this.spinnerService.show();
      this.candidaturaService.post(formData).subscribe({
        next: () => {
          this.spinnerService.hide();
          this.mensajeService.mensajeExito(
            'Candidatura guardada correctamente'
          );
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
  actualizar() {
    this.candidatura = this.CandidaturaForm.value as Candidatura;

    const tipo = this.CandidaturaForm.get('tipoAgrupacionPolitica')?.value;
    this.candidatura.tipoAgrupacionPolitica = { id: tipo } as TipoAgrupaciones;
    const imagenBase64 = this.CandidaturaForm.get('imagenBase64')?.value;

    this.imgPreview = '';

    if (!imagenBase64) {
      const formData = { ...this.candidatura };

      this.spinnerService.show();

      this.candidaturaService.put(this.id, formData).subscribe({
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
    } else if (imagenBase64) {
      const formData = { ...this.candidatura, imagenBase64 };
      this.spinnerService.show();

      this.candidaturaService.put(this.id, formData).subscribe({
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
    } else {
      this.spinnerService.hide();
      this.mensajeService.mensajeError(
        'Error: No se encontró una representación válida de la imagen.'
      );
    }
  }
  setDataModalUpdate(dto: Candidatura) {
    this.isModalAdd = false;
    this.id = dto.id;

    const candidatura = this.candidaturasFilter.find(
      (candidatura) => candidatura.id === dto.id
    );

    this.imgPreview = candidatura!.logo;
    this.isUpdatingImg = true;

    this.CandidaturaForm.patchValue({
      id: dto.id,

      nombre: dto.nombre,
      acronimo: dto.acronimo,
      tipoAgrupacionPolitica: dto.tipoAgrupacionPolitica.id,
      partidos: dto.partidos,
      estatus: dto.estatus,
      orden: dto.orden,
      imagenBase64: '',
    });
    console.log('setDataUpdateVistaForm ', this.CandidaturaForm.value);
    console.log('setDataUpdateDTO', dto);
  }

  handleChangeSearch(event: any) {}
  exportarDatosAExcel() {}
  deleteItem(id: number, nameItem: string) {
    this.mensajeService.mensajeAdvertencia(
      `¿Estás seguro de eliminar la visita: ${nameItem}?`,
      () => {
        this.candidaturaService.delete(id).subscribe({
          next: () => {
            this.mensajeService.mensajeExito(
              'Candidatura borrada correctamente'
            );
            this.configPaginator.currentPage = 1;
            this.searchItem.nativeElement.value = '';
          },
          error: (error) => this.mensajeService.mensajeError(error),
        });
      }
    );
  }
  cerrarModal() {
    this.imagenAmpliada = null;
    const modal = document.getElementById('modal-imagen-ampliada');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
    }
  }
  onPageChange(number: number) {
    this.configPaginator.currentPage = number;
  }
}
