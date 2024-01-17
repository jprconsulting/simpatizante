import {  Component, ElementRef, Inject,  OnInit,  ViewChild } from '@angular/core';
import {  FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingStates } from 'src/app/global/global';
import { Indicadores } from 'src/app/models/indicadores';
import { Visita } from 'src/app/models/visita';
import { IndicadoresService } from 'src/app/core/services/indicadores.service';
import { Casillas } from 'src/app/models/casillas';
import { CasillasService } from 'src/app/core/services/casilla.service';
import { Incidencia } from 'src/app/models/incidencias';
import { IncidenciaService } from 'src/app/core/services/incidencias.service';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { AreasAdscripcionService } from 'src/app/core/services/areas-adscripcion.service';
import * as XLSX from 'xlsx';
import { NgxGpAutocompleteDirective } from '@angular-magic/ngx-gp-autocomplete';

@Component({
  selector: 'app-incidencias',
  templateUrl: './incidencias.component.html',
  styleUrls: ['./incidencias.component.css']
})


export class IncidenciasComponent implements OnInit {

  @ViewChild('closebutton') closebutton!: ElementRef;
  @ViewChild('searchItem') searchItem!: ElementRef;
  @ViewChild('ngxPlaces') placesRef!: NgxGpAutocompleteDirective;
  @ViewChild('mapCanvas') mapCanvas!: ElementRef<HTMLElement>;
  @ViewChild('ubicacionInput', { static: false }) ubicacionInput!: ElementRef;


  incidenciasForm!: FormGroup;

  incidencia!: Incidencia;

  vistas: Visita [] = [];
  casillas: Casillas [] = [];
  incidencias: Incidencia [] = [];
  indicadores: Indicadores [] = [];
  isLoading = LoadingStates.neutro;
  canvas!: HTMLElement;
  isModalAdd = true;
  incidenciasFilter: Incidencia[] = [];
  idUpdate!: number;
  formData: any;
  latitude: number = 19.316818295403003;
  longitude: number = -98.23837658175323;
  options = {
    types: [],
    componentRestrictions: { country: 'MX' }
  };
  maps!: google.maps.Map;

  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    private formBuilder: FormBuilder,
    private spinnerService: NgxSpinnerService,
    private mensajeService: MensajeService,
    private indicadoresService: IndicadoresService,
    private casillasService: CasillasService,
    private incidenciasService: IncidenciaService,
  ) {
   this.incidenciasService.refreshListIncidencia.subscribe(() => this.getIncidencias());
   this.creteForm();
   this.getIndicadores();
   this.getCasillas();
   this.getIncidencias();
   this.configPaginator.itemsPerPage = 10;
  }
  ngOnInit(): void {

  }
  creteForm() {
    this.incidenciasForm = this.formBuilder.group({
      id:[null],
      retroalimentacion: [''],
      tipoIncidencia:  [null,Validators.required],
      casilla: [null,Validators.required],
      imagenBase64: ['',Validators.required],
      direccion: [null, Validators.required],
      latitud: [null, Validators.required],
      longitud: [null, Validators.required],
    });
  }

  resetMap() {
    this.ubicacionInput.nativeElement.value = '';
    this.setCurrentLocation();
    this.ngAfterViewInit()
  }

  setCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
      });
    }
  }

  mapa() {
    this.setCurrentLocation();

    // Puedes proporcionar un valor predeterminado o nulo, según tus necesidades
    const dummyPlace: google.maps.places.PlaceResult = {
      geometry: {
        location: new google.maps.LatLng(0, 0), // Coordenadas predeterminadas o nulas
      },
      formatted_address: '',
      name: '',
      // Otras propiedades según tus necesidades
    };

    this.selectAddress2(dummyPlace);
  }



  ngAfterViewInit() {
    this.canvas = this.mapCanvas.nativeElement;

    if (!this.canvas) {
      console.error("El elemento del mapa no fue encontrado");
      return;
    }

    const myLatlng = new google.maps.LatLng(this.latitude, this.longitude);

    const mapOptions = {
      zoom: 13,
      scrollwheel: false,
      center: myLatlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: "administrative",
          elementType: "labels.text.fill",
          stylers: [{ color: "#444444" }],
        },
        {
          featureType: "landscape",
          elementType: "all",
          stylers: [{ color: "#f2f2f2" }],
        },
        {
          featureType: "poi",
          elementType: "all",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "road",
          elementType: "all",
          stylers: [{ saturation: -100 }, { lightness: 45 }],
        },
        {
          featureType: "road.highway",
          elementType: "all",
          stylers: [{ visibility: "simplified" }],
        },
        {
          featureType: "road.arterial",
          elementType: "labels.icon",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "transit",
          elementType: "all",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "water",
          elementType: "all",
          stylers: [{ color: "#0ba4e2" }, { visibility: "on" }],
        },
      ],
    };

    this.maps = new google.maps.Map(this.canvas, mapOptions);
  }

  selectAddress(place: google.maps.places.PlaceResult) {
    if (!place.geometry) {
      window.alert("Autocomplete's returned place contains no geometry");
      return;
    }

    if (place.formatted_address) {
      this.incidenciasForm.patchValue({
        direccion: place.formatted_address
      });
    }
    const selectedLat = place.geometry?.location?.lat() || this.latitude;
    const selectedLng = place.geometry?.location?.lng() || this.longitude;

    this.canvas.setAttribute("data-lat", selectedLat.toString());
    this.canvas.setAttribute("data-lng", selectedLng.toString());

    const newLatLng = new google.maps.LatLng(selectedLat, selectedLng);
    this.maps.setCenter(newLatLng);
    this.maps.setZoom(15);
    const marker = new google.maps.Marker({
      position: newLatLng,
      map: this.maps,
      animation: google.maps.Animation.DROP,
      title: place.name,
    });
    this.incidenciasForm.patchValue({
      longitud: selectedLng,
      latitud: selectedLat
    });


  }

  selectAddress2(place: google.maps.places.PlaceResult) {
    const selectedLat = this.incidenciasForm.value.latitud;
    const selectedLng = this.incidenciasForm.value.longitud;

    this.canvas.setAttribute("data-lat", selectedLat.toString());
    this.canvas.setAttribute("data-lng", selectedLng.toString());
      const newLatLng = new google.maps.LatLng(selectedLat, selectedLng);
    this.maps.setCenter(newLatLng);
    this.maps.setZoom(15);
     const marker = new google.maps.Marker({
    position: newLatLng,
    map: this.maps,
    animation: google.maps.Animation.DROP,
    title: this.incidenciasForm.value.nombre, // Usa un campo relevante como título
  });
  this.incidenciasForm.patchValue({
    longitud: selectedLng,
    latitud: selectedLat
  });
  }

  submit() {
    if (this.isModalAdd === false) {

      this.editarIncidencia();
    } else {
      this.agregar();

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

        this.incidenciasForm.patchValue({
          imagenBase64: base64WithoutPrefix// Contiene solo la representación en base64
        });
      };

      reader.readAsDataURL(file);
    }
  }

  imagenAmpliada: string | null = null;
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

  handleChangeSearch(event: any) {
    const inputValue = event.target.value;
    this.incidenciasFilter = this.incidencias.filter(incidencia =>
      incidencia.retroalimentacion.toLowerCase().includes(inputValue.toLowerCase())||
      incidencia.tipoIncidencia.tipo.toLowerCase().includes(inputValue.toLowerCase())||
      incidencia.casilla.nombre.toLocaleLowerCase().includes(inputValue.toLowerCase())||
      incidencia.direccion.toLowerCase().includes(inputValue)
    );
    this.configPaginator.currentPage = 1;
  }

  resetForm() {
    this.closebutton.nativeElement.click();
    this.incidenciasForm.reset();
  }
  onPageChange(number: number) {
    this.configPaginator.currentPage = number;
  }

  handleChangeAdd() {
    this.incidenciasForm.reset();
    this.isModalAdd = true;

  }

  agregar() {
    this.incidencia = this.incidenciasForm.value as Incidencia;
    const indicadorid = this.incidenciasForm.get('tipoIncidencia')?.value;
    const casillaid = this.incidenciasForm.get('casilla')?.value;
    const imagenBase64 = this.incidenciasForm.get('imagenBase64')?.value;

    this.incidencia.casilla = {id: casillaid } as Casillas
    this.incidencia.tipoIncidencia = { id: indicadorid } as Indicadores

    if (imagenBase64) {
      const formData = { ...this.incidencia, imagenBase64 };

      this.spinnerService.show();
      this.incidenciasService.post(formData).subscribe({
        next: () => {
          this.spinnerService.hide();
          this.mensajeService.mensajeExito('Incidencia guardado correctamente');
          this.resetForm();
          this.configPaginator.currentPage = 1;
        },
        error: (error) => {
          this.spinnerService.hide();
          this.mensajeService.mensajeError(error);
          console.error('Error: No se encontró una representación válida en base64 de la imagen.');
        }
      });
    } else {
      console.error('Error: No se encontró una representación válida en base64 de la imagen.');
    }

  }
  id!: number;

  editarIncidencia() {
    const indicadorid = this.incidenciasForm.get('tipoIncidencia')?.value;
    const casillaid = this.incidenciasForm.get('casilla')?.value;
    const imagenBase64 = this.incidenciasForm.get('imagenBase64')?.value;

    const incidenciaId = this.incidenciasForm.get('id')?.value; // Obtener el ID de la incidencia directamente del formulario

    this.incidencia = this.incidenciasForm.value as Incidencia;
    this.incidencia.casilla = {id: casillaid} as Casillas;
    this.incidencia.tipoIncidencia = {id: indicadorid} as Indicadores;

    if (imagenBase64) {
       const formData = { ...this.incidencia, imagenBase64 };
       this.spinnerService.show();

       this.incidenciasService.put(incidenciaId, formData).subscribe({
          next: () => {
             this.spinnerService.hide();
             this.mensajeService.mensajeExito('Incidencia actualizada correctamente');
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

  setDataModalUpdate(dto: Incidencia){
    this.isModalAdd = false;
    this.idUpdate = dto.id;
    this.incidenciasForm.patchValue({
      id: dto.id,
      retroalimentacion: dto.retroalimentacion,
      tipoIncidencia: dto.tipoIncidencia.id,
      casilla: dto.casilla.id,
      imagenBase64: dto.imagenBase64,
      direccion: dto.direccion,
      latitud: dto.latitud,
      longitud: dto.longitud,

    });

    // El objeto que se enviará al editar la visita será directamente this.visitaForm.value
    console.log(this.incidenciasForm.value);
    console.log(dto);
  }



  deleteItem(id: number) {
    this.mensajeService.mensajeAdvertencia(
      `¿Estás seguro de eliminar la incidencia?`,
      () => {
        this.incidenciasService.delete(id).subscribe({
          next: () => {
            this.mensajeService.mensajeExito('Incidencia borrada correctamente');
            this.configPaginator.currentPage = 1;
            this.searchItem.nativeElement.value = '';
          },
          error: (error) => this.mensajeService.mensajeError(error)
        });
      }
    );
  }


  getIncidencias() {
    this.isLoading = LoadingStates.trueLoading;
    this.incidenciasService.getAll().subscribe(
      {
        next: (dataFromAPI) => {
          this.incidencias = dataFromAPI;
          this.incidenciasFilter = this.incidencias;
          this.isLoading = LoadingStates.falseLoading;
        },
        error: () => {
          this.isLoading = LoadingStates.errorLoading;
        }
      }
    );
  }

  getIndicadores() {
    this.indicadoresService.getAll().subscribe(
      {
        next: (dataFromAPI) => {
          this.indicadores = dataFromAPI;},
      }
    );
  }

  getCasillas() {
    this.casillasService.getAll().subscribe(
      {
        next: (dataFromAPI) => {
          this.casillas = dataFromAPI;},
      }
    );
  }
  exportarDatosAExcel() {
    if (this.incidencias.length === 0) {
      console.warn('La lista de usuarios está vacía. No se puede exportar.');
      return;
    }

    const datosParaExportar = this.incidencias.map(incidencias => {
      return {
        'Id': incidencias.id,
        'casilla': incidencias.casilla.nombre,
        'tipo de incidencia': incidencias.tipoIncidencia.tipo,
      };
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosParaExportar);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    this.guardarArchivoExcel(excelBuffer, 'incidencias.xlsx');
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
