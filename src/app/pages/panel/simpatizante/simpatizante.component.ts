import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GenericType, LoadingStates, RolesBD } from 'src/app/global/global';
import { Beneficiario } from 'src/app/models/beneficiario';
import { Municipio } from 'src/app/models/municipio';
import { ProgramaSocial } from 'src/app/models/programa-social';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { BeneficiariosService } from 'src/app/core/services/beneficiarios.service';
import { ProgramaSocialService } from 'src/app/core/services/programas.services';
import { MunicipiosService } from 'src/app/core/services/municipios.service';
import { NgxGpAutocompleteDirective } from '@angular-magic/ngx-gp-autocomplete';
import * as XLSX from 'xlsx';
import { Seccion } from 'src/app/models/seccion';
import { SeccionService } from 'src/app/core/services/seccion.service';
import { Estado } from 'src/app/models/estados';
import { EstadoService } from 'src/app/core/services/estados.service';
import { SimpatizantesService } from 'src/app/core/services/simpatizantes.service';
import { Simpatizante } from 'src/app/models/votante';
import { Operador } from 'src/app/models/operador';
import { OperadoresService } from 'src/app/core/services/operadores.service';
import { SecurityService } from 'src/app/core/services/security.service';
import { AppUserAuth } from 'src/app/models/login';
import { GeneroService } from 'src/app/core/services/genero.service';
import { Genero } from 'src/app/models/genero';

@Component({
  selector: 'app-beneficiarios',
  templateUrl: './simpatizante.component.html',
  styleUrls: ['./simpatizante.component.css'],
})
export class SimpatizanteComponent {
  @ViewChild('closebutton') closebutton!: ElementRef;
  @ViewChild('searchItem') searchItem!: ElementRef;
  @ViewChild('ngxPlaces') placesRef!: NgxGpAutocompleteDirective;
  @ViewChild('mapCanvas') mapCanvas!: ElementRef<HTMLElement>;
  @ViewChild('ubicacionInput', { static: false }) ubicacionInput!: ElementRef;

  programasocial: any;
  municipiosSelect!: Municipio | undefined;
  votantesSelect!: Simpatizante | undefined;
  canvas!: HTMLElement;
  votante!: Simpatizante;
  simpatizanteForm!: FormGroup;
  busqueda!: FormGroup;
  beneficiarios: Beneficiario[] = [];
  operadoresOriginales: Simpatizante[] = [];
  votantesFilter: Simpatizante[] = [];
  isLoading = LoadingStates.neutro;
  isModalAdd: boolean = true;
  votantes: Simpatizante[] = [];
  municipios: Municipio[] = [];
  seccion: Seccion[] = [];
  programaSocial: ProgramaSocial[] = [];
  estado: Estado[] = [];
  generos: Genero[] = [];
  operadores: Operador[] = [];
  rolId = 0;
  readonlySelectOperador = true;
  currentUser!: AppUserAuth | null;
  candidatoId = 0;
  operadorId = 0;
  estatusBtn = true;
  verdadero = 'Activo';
  falso = 'Inactivo';
  visibility = false;
  estatusTag = this.verdadero;
  formData: any;
  id!: number;
  // MAPS
  latitude: number = 19.316818295403003;
  longitude: number = -98.23837658175323;
  options = {
    types: ['address'],
    componentRestrictions: { country: 'MX' },
  };
  maps!: google.maps.Map;
  SocialForm: any;
  private map: any;
  private marker: any;

  existeClaveElector: boolean | null = null;


  constructor(
    private renderer: Renderer2,
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    @Inject('GENEROS') public objGeneros: any,
    private spinnerService: NgxSpinnerService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    private municipiosService: MunicipiosService,
    private seccionService: SeccionService,
    private estadoService: EstadoService,
    private serviceGenero: GeneroService,
    private programasSociales: ProgramaSocialService,
    private operadoresService: OperadoresService,
    private simpatizantesService: SimpatizantesService,
    private securityService: SecurityService
  ) {
    this.simpatizantesService.refreshListSimpatizantes.subscribe(() =>
      this.getVotantes()
    );
    this.currentUser = securityService.getDataUser();
    this.getVotantes();
    this.getMunicipios();
    this.creteForm();
    this.getSeccion();
    this.getEstado();
    this.getMunicipios();
    this.getProgramas();
    this.getSeccion();
    this.getGenero();

    if (this.currentUser?.rolId === RolesBD.operador) {
      this.operadorId = this.currentUser?.operadorId;
      console.log('asdfads', this.operadorId);
      this.operadores.push({
        id: this.operadorId,
        nombreCompleto: this.currentUser?.nombreCompleto,
      } as Operador);
    }

    if (this.currentUser?.rolId === RolesBD.candidato) {
      this.readonlySelectOperador = false;
      this.candidatoId = this.currentUser?.candidatoId;
      this.getOperadoresPorCandidatoId();
    }

    if (this.currentUser?.rolId === RolesBD.administrador) {
      this.readonlySelectOperador = false;
      this.getTodosOperadores();
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
  onSelectOperador(id: number | null) {
    this.votantesSelect = this.votantes.find((v) => v.operador.id === id);

    if (this.votantesSelect) {
      const valueSearch2 =
        this.votantesSelect.operador.nombreCompleto.toLowerCase();

      console.log('Search Value:', valueSearch2);

      this.votantesFilter = this.votantes.filter((Votante) =>
        Votante.operador.nombreCompleto.toLowerCase().includes(valueSearch2)
      );

      console.log('Filtered Votantes:', this.votantesFilter);

      this.configPaginator.currentPage = 1;
    }
  }

  resetMap() {
    this.ubicacionInput.nativeElement.value = '';
    this.setCurrentLocation();
    this.ngAfterViewInit();
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

  selectAddress(place: google.maps.places.PlaceResult) {
    if (!place.geometry) {
      window.alert("Autocomplete's returned place contains no geometry");
      return;
    }

    if (place.formatted_address) {
      this.simpatizanteForm.patchValue({
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
    this.simpatizanteForm.patchValue({
      longitud: selectedLng,
      latitud: selectedLat,
    });
  }
  onClear() {
    if (this.votantes) {
      this.getVotantes();
    }
  }

  selectAddress2(place: google.maps.places.PlaceResult) {
    const selectedLat = this.simpatizanteForm.value.latitud;
    const selectedLng = this.simpatizanteForm.value.longitud;

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
      title: this.simpatizanteForm.value.nombres,
    });
  }

  setEstatus() {
    this.estatusTag = this.estatusBtn ? this.verdadero : this.falso;
  }

  ngAfterViewInit() {
    this.canvas = this.mapCanvas.nativeElement;

    if (!this.canvas) {
      console.error('El elemento del mapa no fue encontrado');
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
      this.simpatizanteForm.patchValue({
        latitud: this.latitude,
        longitud: this.longitude,
      });
    } else {
      console.error('No se pudo obtener la posición al hacer clic en el mapa.');
    }
    this.adress();
  }

  adress() {
    const geocoder = new google.maps.Geocoder();
    const latLng = new google.maps.LatLng(this.latitude, this.longitude);
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === 'OK') {
        if (results && results[0]) {
          const place = results[0];
          if (place.formatted_address) {
            this.simpatizanteForm.patchValue({
              domicilio: place.formatted_address,
            });
          } else {
            console.log('No se pudo obtener la dirección.');
          }
          this.selectAddress(place);
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

  setCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
      });
    }
  }
  getMunicipios() {
    this.municipiosService
      .getAll()
      .subscribe({ next: (dataFromAPI) => (this.municipios = dataFromAPI) });
  }

  getSeccion() {
    this.isLoading = LoadingStates.trueLoading;
    this.seccionService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.seccion = dataFromAPI;
      },
    });
  }
  getEstado() {
    this.isLoading = LoadingStates.trueLoading;
    this.estadoService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.estado = dataFromAPI;
      },
    });
  }
  getGenero() {
    this.isLoading = LoadingStates.trueLoading;
    this.serviceGenero.getAll().subscribe({
      next: (dataFromAPI) => {
        this.generos = dataFromAPI;
      },
    });
  }
  getProgramas() {
    this.isLoading = LoadingStates.trueLoading;
    this.programasSociales.getAll().subscribe({
      next: (dataFromAPI) => {
        this.programaSocial = dataFromAPI;
      },
    });
  }

  getTodosOperadores() {
    this.operadoresService
      .getAll()
      .subscribe({ next: (dataFromAPI) => (this.operadores = dataFromAPI) });
  }

  getOperadoresPorCandidatoId() {
    this.operadoresService
      .getOperadoresPorCandidatoId(this.candidatoId)
      .subscribe({ next: (dataFromAPI) => (this.operadores = dataFromAPI) });
  }

  deshabilitarTodosLosControles() {
    Object.keys(this.simpatizanteForm.controls).forEach(controlName => {
      if (controlName !== 'claveElector') {
        this.simpatizanteForm.get(controlName)?.disable();
      }
    });
  }

  habilitarTodosLosControles() {
    Object.keys(this.simpatizanteForm.controls).forEach(controlName => {
      this.simpatizanteForm.get(controlName)?.enable();
    });
  }

  validarClaveElector() {
    const claveElector = this.simpatizanteForm.get('claveElector')?.value as string;

    this.simpatizantesService.validarSimpatizantePorClaveElector(claveElector).subscribe(
      {
        next: () => {
          this.existeClaveElector = true;
          this.deshabilitarTodosLosControles();
        },
        error: () => {
          this.habilitarTodosLosControles();
          this.existeClaveElector = false;
        }
      }
    );
  }

  // ([0-9]{6})([a-zA-Z]{6})([0-9]{2})$

  creteForm() {
    this.simpatizanteForm = this.formBuilder.group({
      id: [null],
      claveElector: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /[A-Z]{6}[0-9]{8}[A-Z]{1}[0-9]{3}/g
          ),
        ]
      ],
      operadorId: [null],
      nombres: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.pattern(
            /^([a-zA-ZÀ-ÿ\u00C0-\u00FF]{2})[a-zA-ZÀ-ÿ\u00C0-\u00FF ]+$/
          ),
        ],
      ],
      apellidoPaterno: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.pattern(
            /^([a-zA-ZÀ-ÿ\u00C0-\u00FF]{2})[a-zA-ZÀ-ÿ\u00C0-\u00FF ]+$/
          ),
        ],
      ],
      apellidoMaterno: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.pattern(
            /^([a-zA-ZÀ-ÿ\u00C0-\u00FF]{2})[a-zA-ZÀ-ÿ\u00C0-\u00FF ]+$/
          ),
        ],
      ],
      estado: ['29'],
      seccion: [null, Validators.required],
      generoId: [null, Validators.required],
      curp: ['', [Validators.pattern(/^([a-zA-Z]{4})/)]],
      estatus: [this.estatusBtn],
      programaSocial: [''],
      municipio: [29],
      domicilio: [''],
      latitud: ['', Validators.required],
      longitud: ['', Validators.required],
    });
  }

  mostrar() {
    this.visibility = true;
    this.programasocial = 'null';
  }
  ocultar() {
    this.visibility = false;
    const radioElement = document.getElementById(
      'flexRadioDefault2'
    ) as HTMLInputElement;

    if (radioElement) {
      radioElement.checked = true;
      radioElement.click();
    }
    this.programasocial = null;
  }
  getVotantes() {
    this.isLoading = LoadingStates.trueLoading;
    this.simpatizantesService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.votantes = dataFromAPI;
        this.votantesFilter = this.votantes;
        this.isLoading = LoadingStates.falseLoading;
      },
      error: () => {
        this.isLoading = LoadingStates.errorLoading;
      },
    });
  }

  onPageChange(number: number) {
    this.configPaginator.currentPage = number;
  }

  handleChangeSearch(event: any) {
    const inputValue = event.target.value;
    const valueSearch = inputValue.toLowerCase();

    console.log('Search Value:', valueSearch);

    this.votantesFilter = this.votantes.filter(
      (Votante) =>
        Votante.nombreCompleto.toLowerCase().includes(valueSearch) ||
        Votante.genero.nombre.toLowerCase().includes(valueSearch) ||
        Votante.municipio.nombre.toLowerCase().includes(valueSearch) ||
        Votante.seccion.clave.toString().includes(valueSearch) ||
        Votante.edad.toString().includes(valueSearch)
    );

    console.log('Filtered Votantes:', this.votantesFilter);

    this.configPaginator.currentPage = 1;
  }

  getGeneroName(id: number): string {
    const genero = this.generos.find((g) => g.id === id);
    return genero ? genero.nombre : '';
  }

  onSelectmunicipios(id: number) {
    if (id) {
      this.municipiosSelect = this.municipios.find((b) => b.id === id);
    }
  }

  idUpdate!: number;

  setDataModalUpdate(dto: Simpatizante) {
    if (dto.programaSocial === null) {
      this.ocultar();
    } else {
      this.mostrar();
    }
    this.isModalAdd = false;
    this.idUpdate = dto.id;
    this.simpatizanteForm.patchValue({
      id: dto.id,
      operadorId: dto.operador.id,
      nombres: dto.nombres,
      apellidoPaterno: dto.apellidoPaterno,
      apellidoMaterno: dto.apellidoMaterno,
      domicilio: dto.domicilio,
      estatus: dto.estatus,
      latitud: dto.latitud,
      longitud: dto.longitud,
      municipio: dto.municipio.id,
      estado: dto.estado.id,
      curp: dto.curp,
      generoId: dto.genero.id,
      claveElector: dto.claveElector,
      seccion: dto.seccion.id,
      programaSocial: dto.programaSocial ? dto.programaSocial.id : null,
    });

    console.log(dto);
    console.log(this.simpatizanteForm.value);
  }

  actualizar() {
    this.votante = this.simpatizanteForm.value as Simpatizante;
    const votanteId = this.simpatizanteForm.get('id')?.value;

    const programaSocialId = this.simpatizanteForm.get('programaSocial')?.value;
    const municipioId = this.simpatizanteForm.get('municipio')?.value;
    const estadoId = this.simpatizanteForm.get('estado')?.value;
    const seccionId = this.simpatizanteForm.get('seccion')?.value;
    const operadorId = this.simpatizanteForm.get('operadorId')?.value;
    const generoId = this.simpatizanteForm.get('generoId')?.value;

    this.votante.municipio = { id: 33 } as Municipio;
    this.votante.estado = { id: 29 } as Estado;
    this.votante.seccion = { id: seccionId } as Seccion;
    this.votante.operador = { id: operadorId } as Operador;
    this.votante.genero = { id: generoId } as Genero;
    this.votante.programaSocial = programaSocialId
      ? ({ id: programaSocialId } as ProgramaSocial)
      : null;

    this.spinnerService.show();
    console.log(this.votante);
    this.simpatizantesService.put(votanteId, this.votante).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Promovido actualizado con éxito');
        this.resetForm();

        this.configPaginator.currentPage = 1;
      },
      error: (error) => {
        this.spinnerService.hide();
        this.mensajeService.mensajeError('Error al actualizar el promovido');
        console.error(error);
      },
    });
  }
  formatoFecha(fecha: string): string {
    // Aquí puedes utilizar la lógica para formatear la fecha según tus necesidades
    const fechaFormateada = new Date(fecha).toISOString().split('T')[0];
    return fechaFormateada;
  }

  deleteItem(id: number, nameItem: string) {
    this.mensajeService.mensajeAdvertencia(
      `¿Estás seguro de eliminar el promovido: ${nameItem}?`,
      () => {
        console.log('Confirmation callback executed');
        this.spinnerService.show();
        this.simpatizantesService.delete(id).subscribe({
          next: () => {
            console.log('Delete success callback executed');
            this.spinnerService.hide();
            this.mensajeService.mensajeExito(
              'Promovido borrado correctamente'
            );
            this.configPaginator.currentPage = 1;
            this.searchItem.nativeElement.value = '';
          },
          error: (error) => {
            this.spinnerService.hide();
            console.log('Delete error callback executed', error);
            this.mensajeService.mensajeError(error);
          },
        });
      }
    );
  }

  resetForm() {
    this.closebutton.nativeElement.click();
    this.simpatizanteForm.reset();
  }
  submit() {
    if (this.isModalAdd === false) {
      this.actualizar();
    } else {
      this.agregar();
    }
  }

  agregar() {
    this.votante = this.simpatizanteForm.value as Simpatizante;

    const programaSocialId = this.simpatizanteForm.get('programaSocial')?.value;
    const municipioId = this.simpatizanteForm.get('municipio')?.value;
    const estadoId = this.simpatizanteForm.get('estado')?.value;
    const seccionId = this.simpatizanteForm.get('seccion')?.value;
    const operadorId = this.simpatizanteForm.get('operadorId')?.value;
    const generoId = this.simpatizanteForm.get('generoId')?.value;

    this.votante.programaSocial = programaSocialId
      ? ({ id: programaSocialId } as ProgramaSocial)
      : null;
    this.votante.municipio = { id: 33 } as Municipio;
    this.votante.estado = { id: 29 } as Estado;
    this.votante.seccion = { id: seccionId } as Seccion;
    this.votante.operador = { id: operadorId } as Operador;
    this.votante.genero = { id: generoId } as Genero;

    console.log(this.votante);

    this.spinnerService.show();
    this.simpatizantesService.post(this.votante).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Promovido guardado correctamente');
        this.resetForm();
        this.configPaginator.currentPage = 1;
      },
      error: (error) => {
        console.error('Error en la solicitud POST:', error);
        this.spinnerService.hide();
        this.mensajeService.mensajeError(error);
      },
    });
  }

  handleChangeAdd() {
    if (this.simpatizanteForm) {
      this.simpatizanteForm.reset();

      if (this.currentUser?.rolId === RolesBD.operador) {
        this.simpatizanteForm.controls['operadorId'].setValue(this.operadorId);
      }

      const estatusControl = this.simpatizanteForm.get('estatus');
      if (estatusControl) {
        estatusControl.setValue(true);
      }
      this.isModalAdd = true;
    }
  }
  exportarDatosAExcel() {
    if (this.votantes.length === 0) {
      console.warn(
        'La lista de simpatizantes está vacía, no se puede exportar.'
      );
      return;
    }

    const datosParaExportar = this.votantes.map((votante) => {
      const estatus = votante.estatus ? 'Activo' : 'Inactivo';
      const fechaFormateada = new Date(votante.fechaNacimiento).toISOString().split('T')[0];
      return {
        Nombre: votante.nombres,
        'Apellido paterno': votante.apellidoPaterno,
        'Apellido materno': votante.apellidoMaterno,
        'Fecha de nacimiento': fechaFormateada,
        Edad: votante.edad,
        CURP: votante.curp,
        Genero: votante.genero.nombre,
        Domicilio: votante.domicilio,
        'Clave de Elector': votante.claveElector,
        Municipio: votante.municipio.nombre,
        Estado: votante.estado.nombre,
        Seccion: votante.seccion.clave,
        'Programa Social': votante.programaSocial?.nombre,
        Estatus: estatus,
        Operador: votante.operador.nombreCompleto
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

    this.guardarArchivoExcel(excelBuffer, 'Promovidos.xlsx');
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

  toggleEstatus() {
    const estatusControl = this.SocialForm.get('Estatus');

    if (estatusControl) {
      estatusControl.setValue(estatusControl.value === 1 ? 0 : 1);
    }
  }

  buscar: string = '';
  beneficiarioFiltrado: any[] = [];

  filtrarBeneficiario(): any {
    return this.beneficiarios.filter(
      (beneficioario) =>
        beneficioario.nombres
          .toLowerCase()
          .includes(this.buscar.toLowerCase()) ||
        beneficioario.apellidoMaterno
          .toLowerCase()
          .includes(this.buscar.toLowerCase()) ||
        beneficioario.apellidoMaterno
          .toLowerCase()
          .includes(this.buscar.toLowerCase()) ||
        beneficioario.curp.toLowerCase().includes(this.buscar.toLowerCase())
    );
  }
  actualizarFiltro(event: any): void {
    this.buscar = event.target.value;
    this.beneficiarioFiltrado = this.filtrarBeneficiario();
  }
}
