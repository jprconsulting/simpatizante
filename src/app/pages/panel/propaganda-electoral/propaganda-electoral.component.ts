import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { MunicipiosService } from 'src/app/core/services/municipios.service';
import { PropagandaService } from 'src/app/core/services/programa-electoral.service';
import { CandidatosService } from 'src/app/core/services/candidatos.service';
import { LoadingStates } from 'src/app/global/global';
import { Municipio } from 'src/app/models/municipio';
import { Candidato } from 'src/app/models/candidato';
import { Propaganda } from 'src/app/models/propaganda-electoral';
import * as XLSX from 'xlsx';
import { Seccion } from 'src/app/models/seccion';
import { SeccionService } from 'src/app/core/services/seccion.service';

@Component({
  selector: 'app-propaganda-electoral',
  templateUrl: './propaganda-electoral.component.html',
  styleUrls: ['./propaganda-electoral.component.css'],
})
export class PropagandaElectoralComponent {
  @ViewChild('mapCanvas') mapCanvas!: ElementRef<HTMLElement>;
  @ViewChild('closebutton') closebutton!: ElementRef;
  @ViewChild('ubicacionInput', { static: false }) ubicacionInput!: ElementRef;
  @ViewChild('searchItem') searchItem!: ElementRef;
  propagandaForm!: FormGroup;
  isModalAdd = true;
  latitude: number = 19.316818295403003;
  longitude: number = -98.23837658175323;
  canvas!: HTMLElement;
  private map: any;
  private marker: any;
  maps!: google.maps.Map;
  municipios: Municipio[] = [];
  seccion: Seccion[] = [];
  Propagandas: Propaganda[] = [];
  candidatos: Candidato[] = [];
  PropagandasFilter: Propaganda[] = [];
  imagenAmpliada: string | null = null;
  isLoading = LoadingStates.neutro;
  id!: number;
  public isUpdatingfoto: boolean = false;
  propagandas!: Propaganda;
  public isUpdatingImg: boolean = false;
  public imgPreview: string = '';

  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    private spinnerService: NgxSpinnerService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    private municipiosService: MunicipiosService,
    private candidatosService: CandidatosService,
    private propagandaService: PropagandaService,
    private seccionService: SeccionService
  ) {
    this.propagandaService.refreshListpropagandas.subscribe(() =>
      this.getPropagandas()
    );
    this.creteForm();
    this.getMunicipios();
    this.getPropagandas();
    this.getCandidatos();
    this.getSeccion();
  }
  getPropagandas() {
    this.isLoading = LoadingStates.trueLoading;
    this.propagandaService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.Propagandas = dataFromAPI;
        this.PropagandasFilter = this.Propagandas;
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
  getSeccion() {
    this.isLoading = LoadingStates.trueLoading;
    this.seccionService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.seccion = dataFromAPI;
      },
    });
  }
  creteForm() {
    this.propagandaForm = this.formBuilder.group({
      id: [null],
      municipio: ['', Validators.required],
      folio: ['', [Validators.required, Validators.maxLength(10)]],
      dimensiones: [
        '',
        [
          Validators.required,
          Validators.maxLength(30),
          Validators.minLength(3),
        ],
      ],
      comentarios: [''],
      imagenBase64: [''],
      latitud: [],
      longitud: [],
      ubicacion: ['', Validators.required],
      candidato: ['', Validators.required],
      seccion: ['', Validators.required],
    });
  }

  getMunicipios() {
    this.municipiosService
      .getAll()
      .subscribe({ next: (dataFromAPI) => (this.municipios = dataFromAPI) });
  }

  getCandidatos() {
    this.candidatosService
      .getAll()
      .subscribe({ next: (dataFromAPI) => (this.candidatos = dataFromAPI) });
  }

  submit() {
    if (this.isModalAdd === false) {
      this.editar();
    } else {
      this.agregar();
    }
  }
  editar() {
    this.propagandas = this.propagandaForm.value as Propaganda;

    const tipo = this.propagandaForm.get('municipio')?.value;
    this.propagandas.municipio = { id: tipo } as Municipio;
    const candidato = this.propagandaForm.get('candidato')?.value;
    this.propagandas.candidato = { id: candidato } as Candidato;
    const seccionId = this.propagandaForm.get('seccion')?.value;
    this.propagandas.seccion = { id: seccionId } as Seccion;
    const imagenBase64 = this.propagandaForm.get('imagenBase64')?.value;

    this.imgPreview = '';

    if (!imagenBase64) {
      const formData = { ...this.propagandas };
      this.spinnerService.show();
      this.propagandaService.put(this.id, formData).subscribe({
        next: () => {
          this.spinnerService.hide();
          this.mensajeService.mensajeExito(
            'Propaganda electoral actualizada correctamente'
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
      const formData = {
        ...this.propagandas,
        imagenBase64,
      };
      this.spinnerService.show();
      this.propagandaService.put(this.id, formData).subscribe({
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
    }
  }
  agregar() {
    this.propagandas = this.propagandaForm.value as Propaganda;
    const tipo = this.propagandaForm.get('municipio')?.value;
    this.propagandas.municipio = { id: tipo } as Municipio;
    const candidato = this.propagandaForm.get('candidato')?.value;
    this.propagandas.candidato = { id: candidato } as Candidato;
    const seccionId = this.propagandaForm.get('seccion')?.value;
    this.propagandas.seccion = { id: seccionId } as Seccion;

    this.spinnerService.show();

    console.log('data:', this.propagandas);
    const imagenBase64 = this.propagandaForm.get('imagenBase64')?.value;

    if (imagenBase64) {
      let formData = { ...this.propagandas, imagenBase64 };
      this.spinnerService.show();
      this.propagandaService.post(formData).subscribe({
        next: () => {
          this.spinnerService.hide();
          this.mensajeService.mensajeExito(
            'Propaganda electoral guardada correctamente'
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
  setDataModalUpdate(dto: Propaganda) {
    this.isModalAdd = false;
    this.id = dto.id;

    const propaganda = this.PropagandasFilter.find((p) => p.id === dto.id);

    this.imgPreview = propaganda!.foto;
    this.isUpdatingImg = true;

    this.propagandaForm.patchValue({
      id: dto.id,
      candidato: dto.candidato.id,
      municipio: dto.municipio.id,
      seccion: dto.seccion.id,
      folio: dto.folio,
      dimensiones: dto.dimensiones,
      comentarios: dto.comentarios,
      latitud: dto.latitud,
      longitud: dto.longitud,
      ubicacion: dto.ubicacion,
      imagenBase64: '',
    });
    console.log('setDataUpdateForm ', this.propagandaForm.value);
    console.log('setDataUpdateDTO', dto);
  }

  deleteItem(id: number, nameItem: string) {
    this.mensajeService.mensajeAdvertencia(
      `¿Estás seguro de eliminar la propaganda electoral: ${nameItem}?`,
      () => {
        this.propagandaService.delete(id).subscribe({
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
  mostrarImagenAmpliada(rutaImagen: string) {
    this.imagenAmpliada = rutaImagen;
    const modal = document.getElementById('modal-imagen-ampliada');
    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
    }
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

        this.propagandaForm.patchValue({
          imagenBase64: base64WithoutPrefix, // Contiene solo la representación en base64
        });
      };
      this.isUpdatingfoto = false;
      reader.readAsDataURL(file);
    }
  }
  resetForm() {
    this.closebutton.nativeElement.click();
    this.propagandaForm.reset();
  }
  resetMap() {
    this.ubicacionInput.nativeElement.value = '';
    this.setCurrentLocation();
    this.getPropagandas();
    this.ngAfterViewInit();
  }

  handleChangeAdd() {
    if (this.propagandaForm) {
      this.propagandaForm.reset();
      this.isModalAdd = true;
      this.isUpdatingfoto = false;
      this.isUpdatingImg = false;
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
  setCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
      });
    }
  }
  getCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;

        const geocoder = new google.maps.Geocoder();
        const latLng = new google.maps.LatLng(this.latitude, this.longitude);
        this.adress();
      });
    }
  }
  adress() {
    const geocoder = new google.maps.Geocoder();
    const latLng = new google.maps.LatLng(this.latitude, this.longitude);

    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === 'OK') {
        if (results && results[0]) {
          const place = results[0];
          const formattedAddress = place.formatted_address || '';

          if (formattedAddress.toLowerCase().includes('tlax')) {
            if (place.formatted_address) {
              this.propagandaForm.patchValue({
                ubicacion: place.formatted_address,
                domicilio: place.formatted_address,
              });
            } else {
              console.log('No se pudo obtener la dirección.');
            }
            this.selectAddress(place);
          } else {
            window.alert('Por favor, selecciona una dirección en Tlaxcala.');
          }
        } else {
          console.error('No se encontraron resultados de geocodificación.');
        }
      } else {
        console.error(
          'Error en la solicitud de geocodificación inversa:',
          status
        );
      }
    });
  }
  selectAddress(place: google.maps.places.PlaceResult) {
    const formattedAddress = place.formatted_address || '';
    if (formattedAddress.toLowerCase().includes('tlax')) {
      if (!place.geometry) {
        window.alert("Autocomplete's returned place contains no geometry");
        return;
      }

      if (place.formatted_address) {
        this.propagandaForm.patchValue({
          domicilio: place.formatted_address,
        });
      }

      const selectedLat = place.geometry?.location?.lat() || this.latitude;
      const selectedLng = place.geometry?.location?.lng() || this.longitude;

      this.canvas.setAttribute('data-lat', selectedLat.toString());
      this.canvas.setAttribute('data-lng', selectedLng.toString());
      const newLatLng = new google.maps.LatLng(selectedLat, selectedLng);
      this.maps.setCenter(newLatLng);
      this.maps.setZoom(15);
      if (this.marker) {
        this.marker.setMap(null);
      }
      this.marker = new google.maps.Marker({
        position: newLatLng,
        map: this.maps,
        animation: google.maps.Animation.DROP,
        title: place.name,
      });
      this.propagandaForm.patchValue({
        longitud: selectedLng,
        latitud: selectedLat,
      });
    } else {
      window.alert('Por favor, selecciona una dirección en Tlaxcala.');
    }
  }
  selectAddress2(place: google.maps.places.PlaceResult) {
    const selectedLat = this.propagandaForm.value.latitud;
    const selectedLng = this.propagandaForm.value.longitud;

    this.canvas.setAttribute('data-lat', selectedLat.toString());
    this.canvas.setAttribute('data-lng', selectedLng.toString());
    const newLatLng = new google.maps.LatLng(selectedLat, selectedLng);
    this.maps.setCenter(newLatLng);
    this.maps.setZoom(15);
    if (this.marker) {
      this.marker.setMap(null);
    }
    this.marker = new google.maps.Marker({
      position: newLatLng,
      map: this.maps,
      animation: google.maps.Animation.DROP,
      title: this.propagandaForm.value.nombres,
    });
  }
  ngAfterViewInit() {
    this.canvas = this.mapCanvas.nativeElement;

    if (!this.canvas) {
      console.error('El elemento del mapa no fue encontrado');
      return;
    }
    const input = this.ubicacionInput.nativeElement;

    const autocomplete = new google.maps.places.Autocomplete(input, {
      fields: ['formatted_address', 'geometry', 'name'],
      types: ['geocode'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      this.selectAddress(place);
    });
    const myLatlng = new google.maps.LatLng(this.latitude, this.longitude);

    const mapOptions = {
      zoom: 13,
      scrollwheel: false,
      center: myLatlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: 'administrative',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#444444' }],
        },
        {
          featureType: 'landscape',
          elementType: 'all',
          stylers: [{ color: '#f2f2f2' }],
        },
        {
          featureType: 'poi',
          elementType: 'all',
          stylers: [{ visibility: 'off' }],
        },
        {
          featureType: 'road',
          elementType: 'all',
          stylers: [{ saturation: -100 }, { lightness: 45 }],
        },
        {
          featureType: 'road.highway',
          elementType: 'all',
          stylers: [{ visibility: 'simplified' }],
        },
        {
          featureType: 'road.arterial',
          elementType: 'labels.icon',
          stylers: [{ visibility: 'off' }],
        },
        {
          featureType: 'transit',
          elementType: 'all',
          stylers: [{ visibility: 'off' }],
        },
        {
          featureType: 'water',
          elementType: 'all',
          stylers: [{ color: '#0ba4e2' }, { visibility: 'on' }],
        },
      ],
    };

    this.maps = new google.maps.Map(this.canvas, mapOptions);

    google.maps.event.addListener(
      this.maps,
      'click',
      (event: google.maps.KmlMouseEvent) => {
        this.handleMapClick(event);
      }
    );
  }

  handleMapClick(
    event: google.maps.KmlMouseEvent | google.maps.IconMouseEvent
  ) {
    if (event.latLng) {
      this.latitude = event.latLng.lat();
      this.longitude = event.latLng.lng();
      this.propagandaForm.patchValue({
        latitud: this.latitude,
        longitud: this.longitude,
      });
    } else {
      console.error('No se pudo obtener la posición al hacer clic en el mapa.');
    }
    this.adress();
  }
  onPageChange(number: number) {
    this.configPaginator.currentPage = number;
  }
  handleChangeSearch(event: any) {
    const inputValue = event.target.value;
    const valueSearch = inputValue.toLowerCase();

    console.log('Search Value:', valueSearch);

    this.PropagandasFilter = this.Propagandas.filter(
      (p) =>
        p.dimensiones.toLowerCase().includes(valueSearch) ||
        p.municipio.nombre.toLowerCase().includes(valueSearch) ||
        p.folio.toLowerCase().includes(valueSearch) ||
        p.ubicacion.toString().includes(valueSearch)
    );

    console.log('Filtered:', this.PropagandasFilter);

    this.configPaginator.currentPage = 1;
  }
  exportarDatosAExcel() {
    if (this.Propagandas.length === 0) {
      console.warn(
        'La lista de simpatizantes está vacía, no se puede exportar.'
      );
      return;
    }

    const datosParaExportar = this.Propagandas.map((p) => {
      return {
        Folio: p.folio,
        Municipio: p.municipio.nombre,
        Dimensiones: p.dimensiones,
        Comentarios: p.comentarios,
        ubicacion: p.ubicacion,
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

    this.guardarArchivoExcel(excelBuffer, 'Propagandas.xlsx');
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
  mapa() {
    this.setCurrentLocation();
    const dummyPlace: google.maps.places.PlaceResult = {
      geometry: {
        location: new google.maps.LatLng(0, 0),
      },
      formatted_address: '',
      name: '',
    };

    this.selectAddress2(dummyPlace);
  }

  candidatoSelect!: Candidato | undefined;
  selectedCandidatosId: number | null = null;
  seccionesOperador: Seccion[] = [];
  Candidatomunicipio(id: number | null) {
    this.candidatoSelect = this.candidatos.find((o) => o.id === id);
    console.log(this.candidatoSelect, 'nsacd');
    if (
      this.candidatoSelect &&
      this.candidatoSelect.municipio?.id !== undefined
    ) {
      this.selectedCandidatosId = this.candidatoSelect.municipio?.id;

      this.seccionService.getMunicipioId(this.selectedCandidatosId).subscribe({
        next: (dataFromAPI) => {
          this.seccion = dataFromAPI;
          this.seccionesOperador = this.seccion;
        },
      });
    }
    if (
      this.candidatoSelect &&
      this.candidatoSelect.municipio?.id === undefined
    ) {
      this.getSeccion();
    }
  }
  onClearsecciones() {
    this.getSeccion();
    this.getPropagandas();
  }
  seccionMunicipio(id: number) {
    this.seccionService.getMunicipioId(id).subscribe({
      next: (dataFromAPI) => {
        this.seccion = dataFromAPI;
        this.seccionesOperador = this.seccion;
      },
    });
  }
}
