import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { LoadingStates } from 'src/app/global/global';
import { Visita } from 'src/app/models/visita';
import { Beneficiario } from 'src/app/models/beneficiario';
import { BeneficiariosService } from 'src/app/core/services/beneficiarios.service';
import { VisitasService } from 'src/app/core/services/visitas.service';

import { ProgramaSocial } from 'src/app/models/programa-social';
import * as XLSX from 'xlsx';
import { CandidatosService } from 'src/app/core/services/candidatos.service';
import { Candidatos } from 'src/app/models/candidato';
import { Operadores } from 'src/app/models/operadores';
import { OperadoresService } from 'src/app/core/services/operadores.service';
import { Votante } from 'src/app/models/votante';
import { VotantesService } from 'src/app/core/services/votante.service';

@Component({
  selector: 'app-visitas',
  templateUrl: './visitas.component.html',
  styleUrls: ['./visitas.component.css']
})
export class VisitasComponent {

  @ViewChild('closebutton') closebutton!: ElementRef;
  @ViewChild('searchItem') searchItem!: ElementRef;

  visita!: Visita;
  visitaForm!: FormGroup;
  visitas: Visita[] = [];
  visitasFilter: Visita[] = [];
  isLoading = LoadingStates.neutro;
  programasSociales: ProgramaSocial[] = [];
  simpatizantes: Votante[] =[];
  candidatoSelect!: Candidatos | undefined;
  candidato: Candidatos[] = [];
  operador: Operadores[] = [];
  isModalAdd = true;
  imagenAmpliada: string | null = null;
  mostrarModal = false;
  selectedProgramaSocial: number = 0;
  candidatosSelect: any;


  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    private spinnerService: NgxSpinnerService,
    private visitasService: VisitasService,
    private candidatosService: CandidatosService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    private operadoresService: OperadoresService,
    private votantesService: VotantesService,

  ) {
    this.visitasService.refreshListVisitas.subscribe(() => this.getVisitas());
    this.getVisitas();
    this.creteForm();
    this.getCandidatos();
    this.getOperadores();
    this.getSimpatizante();
  }
  getSimpatizante() {
    this.votantesService.getAll().subscribe(
      {
        next: (dataFromAPI) => {
          this.simpatizantes = dataFromAPI; console.log('simpatizante',this.simpatizantes)
        },
        error: (error) => {
          console.error(error);
        }
      }
    );
  }
  getOperadores() {
    this.operadoresService.getAll().subscribe(
      {
        next: (dataFromAPI) => {
          this.operador = dataFromAPI; console.log('operadores',this.operador)
        },
        error: (error) => {
          console.error(error);
        }
      }
    );
  }
  getCandidatos() {
    this.candidatosService.getAll().subscribe(
      {
        next: (dataFromAPI) => {
          this.candidato = dataFromAPI; console.log('candidatos',this.candidato)
        },
        error: (error) => {
          console.error(error);
        }
      }
    );
  }
  creteForm() {
    this.visitaForm = this.formBuilder.group({
      id:[null],
      servicio:['', [Validators.required, Validators.minLength(3), Validators.pattern(/^([a-zA-ZÀ-ÿ\u00C0-\u00FF]{2})[a-zA-ZÀ-ÿ\u00C0-\u00FF ]+$/)]],
      descripcion:  ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^([a-zA-ZÀ-ÿ\u00C0-\u00FF]{2})[a-zA-ZÀ-ÿ\u00C0-\u00FF ]+$/)]],
      imagenBase64: ['', Validators.required],
      votante:[null]
    });
  }


  getVisitas() {
    this.isLoading = LoadingStates.trueLoading;
    this.visitasService.getAll().subscribe(
      {
        next: (dataFromAPI) => {
          this.visitas = dataFromAPI;
          this.visitasFilter = this.visitas;
          this.isLoading = LoadingStates.falseLoading;

        },
        error: () => {
          this.isLoading = LoadingStates.errorLoading;
        }
      }
    );
  }


  onPageChange(number: number) {
    this.configPaginator.currentPage = number;
  }

  handleChangeSearch(event: any) {
    const inputValue = event.target.value.toLowerCase();
    this.visitasFilter = this.visitas.filter(visita =>
      visita.votante.nombreCompleto.toLocaleLowerCase().includes(inputValue.toLowerCase())
    );

    this.configPaginator.currentPage = 1;
  }

  id!: number;
  formData: any;

  setDataModalUpdate(dto: Visita) {
    this.isModalAdd = false;
    this.id = dto.id;
    this.visitaForm.patchValue({
      id: dto.id,
      descripcion: dto.descripcion,
      servicio: dto.servicio,
      votante: dto.votante.id,
      imagenBase64: dto.imagenBase64
    });

    // El objeto que se enviará al editar la visita será directamente this.visitaForm.value
    console.log(this.visitaForm.value);
    console.log(dto);
  }



  deleteItem(id: number) {
    this.mensajeService.mensajeAdvertencia(
      `¿Estás seguro de eliminar la visita:?`,
      () => {
        this.visitasService.delete(id).subscribe({
          next: () => {
            this.mensajeService.mensajeExito('Visita borrada correctamente');
            this.configPaginator.currentPage = 1;
            this.searchItem.nativeElement.value = '';
          },
          error: (error) => this.mensajeService.mensajeError(error)
        });
      }
    );
  }

  resetForm() {
    this.closebutton.nativeElement.click();
    this.visitaForm.reset();
  }
  isUpdating: boolean = false;

  submit() {
    if (this.isModalAdd === false) {

      this.actualizarVisita();
    } else {
      this.agregar();

    }

  }

  agregar() {
    this.visita = this.visitaForm.value as Visita;
    const simpatizanteId = this.visitaForm.get('votante')?.value;


    this.visita.votante = { id: simpatizanteId } as Votante
    this.spinnerService.show();
    console.log('data:', this.visita);
    const imagenBase64 = this.visitaForm.get('imagenBase64')?.value;

    if (imagenBase64) {
      const formData = { ...this.visita, imagenBase64 };

      this.spinnerService.show();
      this.visitasService.post(formData).subscribe({
        next: () => {
          this.spinnerService.hide();
          this.mensajeService.mensajeExito('Visita guardada correctamente');
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
    this.visita = this.visitaForm.value as Visita;
    const simpatizanteId = this.visitaForm.get('votante')?.value;


    this.visita.votante = { id: simpatizanteId } as Votante

    const imagenBase64 = this.visitaForm.get('imagenBase64')?.value;

    if (imagenBase64) {
      const formData = { ...this.visita, imagenBase64 };
      this.spinnerService.show();

      this.visitasService.put(this.id, formData).subscribe({
        next: () => {
          this.spinnerService.hide();
          this.mensajeService.mensajeExito('Visita actualizada correctamente');
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


  handleChangeAdd() {
    this.visitaForm.reset();
    this.isModalAdd = true;
    this.candidatosSelect = undefined;
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

        this.visitaForm.patchValue({
          imagenBase64: base64WithoutPrefix // Contiene solo la representación en base64
        });
      };

      reader.readAsDataURL(file);
    }
  }


  readFileAsDataURL(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Error al leer el archivo como URL de datos.'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Error al leer el archivo.'));
      };

      reader.readAsDataURL(new Blob([filePath]));
    });
  }

  obtenerRutaImagen(nombreArchivo: string): string {
    const rutaBaseAPI = 'https://localhost:7224/';
    if (nombreArchivo) {
      return `${rutaBaseAPI}images/${nombreArchivo}`;
    }
    return ''; // O una URL predeterminada si no hay nombre de archivo
  }

  mostrarImagenAmpliada(rutaImagen: string) {
    this.imagenAmpliada = rutaImagen;
    const modal = document.getElementById('modal-imagen-ampliada');
    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
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

  exportarDatosAExcel() {
    if (this.visitas.length === 0) {
      console.warn('La lista de visitas está vacía. No se puede exportar.');
      return;
    }

    const datosParaExportar = this.visitas.map(visita => {
      return {
        'Nombre': visita.votante.nombres,       
        'servicio': visita.servicio,
        'descripcion': visita.descripcion,
      };
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosParaExportar);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    this.guardarArchivoExcel(excelBuffer, 'visitas.xlsx');
  }

  guardarArchivoExcel(buffer: any, nombreArchivo: string) {
    const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url: string = window.URL.createObjectURL(data);
    const a: HTMLAnchorElement = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    a.click();
    window.URL.revokeObjectURL(url);
  }

}

