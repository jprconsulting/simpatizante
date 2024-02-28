import { Component, ElementRef, Inject, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LoadingStates } from 'src/app/global/global';
import { Simpatizante } from 'src/app/models/votante';
import { Candidato } from 'src/app/models/candidato';
import { Visita } from 'src/app/models/visita';
import { VotoService} from 'src/app/core/services/voto.service';
import { Voto } from 'src/app/models/voto';
import { NgxSpinnerService } from 'ngx-spinner';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { PaginationInstance } from 'ngx-pagination';
import { SimpatizantesService } from 'src/app/core/services/simpatizantes.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-seguimiento-voto',
  templateUrl: './seguimiento-voto.component.html',
  styleUrls: ['./seguimiento-voto.component.css']
})
export class SeguimientoVotoComponent implements OnInit {
  @ViewChild('searchItem') searchItem!: ElementRef;
  @ViewChild('closebutton') closebutton!: ElementRef;

  seguimientoForm!: FormGroup;
  vistas: Visita [] = [];
  candidato: Candidato[] = [];
  votos: Voto[] = [];
  voto!: Voto;
  votosFilter: Voto[] = [];
  candidatosSelect: any;
  simpatizantes: Simpatizante[] = [];
  isLoading = LoadingStates.neutro;
  isModalAdd = true;
  isClaveFilled = false;
  isUpdatingImg = false;
  imgPreview = '';

  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    private formBuilder: FormBuilder,
    private votoService: VotoService,
    private spinnerService: NgxSpinnerService,
    private mensajeService: MensajeService,
    private simpatizantesService: SimpatizantesService,


  ) {
   this.votoService.refreshListVotos.subscribe(() => 
      this.getSimpatizantes()
    );
    this.creteForm();
    this.getVotantes();
    this.getSimpatizantes();
  }

  ngOnInit(): void {
    this.isModalAdd = false;
  }


  creteForm() {
    this.seguimientoForm = this.formBuilder.group({
      id: [null],
      estatusVoto: [true],
      simpatizante: [null, Validators.required],
      imagenBase64: ['',Validators.required],
      fechaHoraVot: ['']
    });
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

        this.seguimientoForm.patchValue({
          imagenBase64: base64WithoutPrefix // Contiene solo la representación en base64
        });
      };

      reader.readAsDataURL(file);
    }
  }

  
  idUpdate!: number;

  setDataModalUpdate(dto: Voto){
    this.isModalAdd = false;
    this.idUpdate = dto.id;
    this.isUpdatingImg = true;
    const voto = this.votosFilter.find( voto => voto.id === dto.id )

    this.imgPreview = voto!.foto;

    this.seguimientoForm.patchValue({
      id: dto.id,
      simpatizante: dto.simpatizante.id,
      estatusVoto: dto.estatusVoto,
      fechaHoraVot: dto.fechaHoraVot
    })

  }

  editarVoto(){
    this.voto = this.seguimientoForm.value as Voto;
    this.voto.id = this.idUpdate;
    const simpatizanteId = this.seguimientoForm.get('simpatizante')?.value;
    const imagenBase64 = this.seguimientoForm.get('imagenBase64')?.value;
    this.voto.simpatizante = { id: simpatizanteId } as Simpatizante

    this.imgPreview = '';

    this.spinnerService.show();

    if (imagenBase64) {
      const formData = { ...this.voto, imagenBase64 };

      this.spinnerService.show();
      this.votoService.put( this.idUpdate, formData ).subscribe({
        next: () => {
          this.spinnerService.hide();
          this.mensajeService.mensajeExito('Voto actualizado correctamente');
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


  submit() {
    if (this.isModalAdd === false) {

      this.editarVoto();

    } else {

      this.agregar();

    }
  }

  resetForm() {
    this.closebutton.nativeElement.click();
    this.seguimientoForm.reset();
  }

  agregar() {
    this.voto = this.seguimientoForm.value as Voto;

    const simpatizanteId = this.seguimientoForm.get('simpatizante')?.value;
    const imagenBase64 = this.seguimientoForm.get('imagenBase64')?.value;

    this.voto.simpatizante = { id: simpatizanteId } as Simpatizante;

    if (imagenBase64) {
      const formData = { ...this.voto, imagenBase64 };

      this.spinnerService.show();
      this.votoService.post( formData ).subscribe({
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

  
  getSimpatizantes(): void {
    this.isLoading = LoadingStates.trueLoading;
    this.votoService.getAll().subscribe(
      {
        next: ( dataFromAPI ) => {
          this.votos = dataFromAPI;
          this.votosFilter = this.votos;
          console.log("Votos Filter: ", this.votosFilter);
          
          this.isLoading = LoadingStates.falseLoading;
        },
        error: ( err ) => {
          this.isLoading = LoadingStates.errorLoading;
          console.log("getSimpatizantes: ", err );
          
        }
      } 
    )
  }


  onPageChange(number: number) {
    this.configPaginator.currentPage = number;
  }

  handleChangeAdd() {

    this.isUpdatingImg = false;

    if (this.seguimientoForm) {
      this.seguimientoForm.reset();
      const estatusControl = this.seguimientoForm.get('estatusVoto');
      
      if (estatusControl) {
        estatusControl.setValue(true);
      }
      this.isModalAdd = true;
    }

  }

  getVotantes() {
    this.simpatizantesService.getAll().subscribe(
      {
        next: (dataFromAPI) => {
          this.simpatizantes = dataFromAPI;
          console.log("Votantes: ", this.simpatizantes );
          
        }
      }
    );
  }


  handleChangeSearch( event: any){
    const inputValue = event.target.value;
    const valueSearch = inputValue.toLowerCase();

    this.votosFilter = this.votos.filter(Voto => 
      Voto.simpatizante.nombreCompleto.toLowerCase().includes(valueSearch) ||
      Voto.simpatizante.nombres.toLowerCase().includes(valueSearch) ||
      Voto.simpatizante.apellidoPaterno.toLowerCase().includes(valueSearch) ||
      Voto.simpatizante.apellidoMaterno.toLowerCase().includes(valueSearch)
    );

    console.log("Votantes filtrados: ", this.votosFilter);
    
    this.configPaginator.currentPage = 1;

  }



  deleteItem(id: number, nameItem: string){

    this.mensajeService.mensajeAdvertencia(
      `¿Estás seguro de eliminar el simpatizante: ${nameItem}?`,
      () => {
        console.log('Confirmation callback executed');
        this.votoService.delete(id).subscribe({
          next: () => {
            console.log('Delete success callback executed');
            this.mensajeService.mensajeExito('Simpatizante borrado correctamente');
            this.configPaginator.currentPage = 1;
            this.searchItem.nativeElement.value = '';

          },
          error: (error) => {
            console.log('Delete error callback executed', error);
            this.mensajeService.mensajeError(error);
          }
        });
      }
    );
  }

  exportarDatosAExcel() {
    if (this.votos.length === 0) {
      console.warn('La lista de votos está vacía. No se puede exportar.');
      return;
    }

    const datosParaExportar = this.votos.map((voto) => {
      const estatus = voto.estatusVoto ? 'Voto' : 'No Voto';
      const fechaRegistro = voto.fechaHoraVot
        ? new Date(voto.fechaHoraVot).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })
        : '';

      return {
        Nombres: voto.simpatizante.nombres,
        'Apellido paterno': voto.simpatizante.apellidoPaterno,
        'Apellido materno': voto.simpatizante.apellidoMaterno,
        'Fecha de registro': fechaRegistro,
        Voto: estatus,
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

    this.guardarArchivoExcel(excelBuffer, 'Votos.xlsx');
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



}


