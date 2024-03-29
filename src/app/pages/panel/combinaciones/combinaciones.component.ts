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
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-combinaciones',
  templateUrl: './combinaciones.component.html',
  styleUrls: ['./combinaciones.component.css'],
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
  combinacionSelect!: Combinacion | undefined;
  id!: number;
  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    private spinnerService: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private candidaturaService: CandidaturaService,
    private combinacionService: CombinacionService,
    private mensajeService: MensajeService
  ) {
    this.combinacionService.refreshListCombinacion.subscribe(() =>
      this.getCombinaciones()
    );
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
          Validators.minLength(1),
          Validators.maxLength(50),
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
    this.combinacion = this.CombinacionForm.value as Combinacion;

    const tipo = this.CombinacionForm.get('candidatura')?.value;
    this.combinacion.candidatura = { id: tipo } as Candidatura;

    const imagenBase64 = this.CombinacionForm.get('imagenBase64')?.value;

    this.imgPreview = '';

    if (!imagenBase64) {
      let formData = {
        ...this.combinacion,
        imagenBase64,
        partidos: [] as string[], // Initialize 'partidos' property as an empty array
      };
      const tipo2 = this.CombinacionForm.get('partidos')?.value;
      const partidosList = tipo2 ? (tipo2 as string[]) : [];
      formData = { ...formData, partidos: partidosList };
      this.spinnerService.show();

      this.combinacionService.put(this.id, formData).subscribe({
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
      const tipo2 = this.CombinacionForm.get('partidos')?.value;
      const partidosList = tipo2 ? (tipo2 as string[]) : [];
      const formData = {
        ...this.combinacion,
        partidos: partidosList,
        imagenBase64,
      };
      this.spinnerService.show();

      this.combinacionService.put(this.id, formData).subscribe({
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
  setDataModalUpdate(dto: Combinacion) {
    this.isModalAdd = false;
    this.id = dto.id;

    const candidatura = this.combinacionesFilter.find(
      (candidatura) => candidatura.id === dto.id
    );

    this.imgPreview = candidatura!.logo;
    this.isUpdatingImg = true;

    this.CombinacionForm.patchValue({
      id: dto.id,
      candidatura: dto.candidatura.id,
      nombre: dto.nombre,
      partidos: dto.partidos,
      imagenBase64: '',
    });
    console.log('setDataUpdateVistaForm ', this.CombinacionForm.value);
    console.log('setDataUpdateDTO', dto);
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
  onSelectOperador(id: number | null) {
    this.combinacionSelect = this.combinaciones.find(
      (v) => v.candidatura.id === id
    );

    if (this.combinacionSelect) {
      const valueSearch2 = this.combinacionSelect.candidatura.id.toString();

      console.log('Search Value:', valueSearch2);

      this.combinacionesFilter = this.combinaciones.filter((c) =>
        c.candidatura.id.toString().includes(valueSearch2)
      );

      console.log('Filtered Votantes:', this.combinacionesFilter);

      this.configPaginator.currentPage = 1;
    }
  }
  onClear() {
    this.getCombinaciones();
  }
  handleChangeSearch(event: any) {
    const inputValue = event.target.value;
    const valueSearch = inputValue.toLowerCase();

    console.log('Search Value:', valueSearch);

    this.combinacionesFilter = this.combinaciones.filter((c) => {
      const candidaturaNombre = c.candidatura.nombre.toLowerCase();
      const partidos = c.partidos?.map((p) => p.toLowerCase()) || []; // Convert each string in partidos to lowercase

      return (
        c.nombre.toLowerCase().includes(valueSearch) ||
        candidaturaNombre.includes(valueSearch) ||
        partidos.some((p) => p.includes(valueSearch)) // Check if any element in partidos includes the search value
      );
    });

    console.log('Filtered Votantes:', this.combinacionesFilter);

    this.configPaginator.currentPage = 1;
  }
  exportarDatosAExcel() {
    if (this.combinaciones.length === 0) {
      console.warn(
        'La lista de simpatizantes está vacía, no se puede exportar.'
      );
      return;
    }

    const datosParaExportar = this.combinaciones.map((c) => {
      const partidoString = c.partidos?.join(', ');

      return {
        Nombre: c.nombre,
        coalicion: c.candidatura.nombre,
        Partido: partidoString,
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

    this.guardarArchivoExcel(excelBuffer, 'Combinaciones.xlsx');
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
  onPageChange(number: number) {
    this.configPaginator.currentPage = number;
  }
}
