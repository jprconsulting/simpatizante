import { Component, ElementRef, Inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GenericType, LoadingStates } from 'src/app/global/global';
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
import { VotantesService } from 'src/app/core/services/votante.service';
import { Votante } from 'src/app/models/votante';


@Component({
  selector: 'app-beneficiarios',
  templateUrl: './votante.component.html',
  styleUrls: ['./votante.component.css']
})
export class VotanteComponent implements OnInit {

  @ViewChild('closebutton') closebutton!: ElementRef;
  @ViewChild('searchItem') searchItem!: ElementRef;
  @ViewChild('ngxPlaces') placesRef!: NgxGpAutocompleteDirective;
  @ViewChild('mapCanvas') mapCanvas!: ElementRef<HTMLElement>;
  @ViewChild('ubicacionInput', { static: false }) ubicacionInput!: ElementRef;


  municipiosSelect!: Municipio | undefined;
  canvas!: HTMLElement;
  votante!: Votante;
  votanteForm!: FormGroup;
  busqueda!: FormGroup;
  beneficiarios: Beneficiario[] = [];
  votantesFilter: Votante[] = [];
  isLoading = LoadingStates.neutro;
  isModalAdd: boolean = true;
  votantes: Votante [] = [];
  municipios: Municipio[] = [];
  seccion: Seccion[] = [];
  programaSocial: ProgramaSocial[] = [];
  estado: Estado[] = [];
  rolId = 0;
  generos: GenericType[] = [{ id: 1, name: 'Masculino' }, { id: 2, name: 'Femenino' }];
  estatusBtn = true;
  verdadero = "Activo";
  falso = "Inactivo";
  visibility = false
  estatusTag = this.verdadero;
  formData: any;
  id!: number;
  // MAPS
  latitude: number = 19.316818295403003;
  longitude: number = -98.23837658175323;
  options = {
    types: [],
    componentRestrictions: { country: 'MX' }
  };
  maps!: google.maps.Map;
  SocialForm: any;
  private map: any;
  private marker: any;
  constructor(private renderer: Renderer2,
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    @Inject('GENEROS') public objGeneros: any,
    private spinnerService: NgxSpinnerService,
    private beneficiariosService: BeneficiariosService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    private municipiosService: MunicipiosService,
    private seccionService: SeccionService,
    private estadoService: EstadoService,
    private programasSociales: ProgramaSocialService,
    private votantesService: VotantesService
  ) {
    this.beneficiariosService.refreshListBeneficiarios.subscribe(() => this.getVotantes());
    this.getVotantes();
    this.getMunicipios();
    this.creteForm();
    
  }


  ngOnInit() {
    this.getSeccion();
    this.getEstado();
    this.getProgramas();
  }

  resetMap() {
    this.ubicacionInput.nativeElement.value = '';
    this.setCurrentLocation();
    this.ngAfterViewInit()
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

  selectAddress(place: google.maps.places.PlaceResult) {
    if (!place.geometry) {
      window.alert("Autocomplete's returned place contains no geometry");
      return;
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
    this.votanteForm.patchValue({
      longitud: selectedLng,
      latitud: selectedLat
    });


  }
  selectAddress2(place: google.maps.places.PlaceResult) {
    const selectedLat = this.votanteForm.value.latitud;
    const selectedLng = this.votanteForm.value.longitud;

    this.canvas.setAttribute("data-lat", selectedLat.toString());
    this.canvas.setAttribute("data-lng", selectedLng.toString());
      const newLatLng = new google.maps.LatLng(selectedLat, selectedLng);
    this.maps.setCenter(newLatLng);
    this.maps.setZoom(15);
     const marker = new google.maps.Marker({
    position: newLatLng,
    map: this.maps,
    animation: google.maps.Animation.DROP,
    title: this.votanteForm.value.nombres, // Usa un campo relevante como título
  });
  this.votanteForm.patchValue({
    longitud: selectedLng,
    latitud: selectedLat
  });
  }

  setEstatus() {
    this.estatusTag = this.estatusBtn ? this.verdadero : this.falso;
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
  setCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
      });
    }
  }
  getMunicipios() {
    this.municipiosService.getAll().subscribe({ next: (dataFromAPI) => this.municipios = dataFromAPI });
  }

  getSeccion() {
    this.isLoading = LoadingStates.trueLoading;
    this.seccionService.getAll().subscribe(
      {
        next: (dataFromAPI) => {
          this.seccion = dataFromAPI;},
      }
    );
  }
  getEstado() {
    this.isLoading = LoadingStates.trueLoading;
    this.estadoService.getAll().subscribe(
      {
        next: (dataFromAPI) => {
          this.estado = dataFromAPI;},
         
      } 
    );
  }
  getProgramas() {
    this.isLoading = LoadingStates.trueLoading;
    this.programasSociales.getAll().subscribe(
      {
        next: (dataFromAPI) => {
          this.programaSocial = dataFromAPI;},
         
      } 
    );
  }

  
  creteForm() {
    this.votanteForm = this.formBuilder.group({
      id: [null],
      nombres: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^([a-zA-ZÀ-ÿ\u00C0-\u00FF]{2})[a-zA-ZÀ-ÿ\u00C0-\u00FF ]+$/)]],
      apellidoPaterno: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^([a-zA-ZÀ-ÿ\u00C0-\u00FF]{2})[a-zA-ZÀ-ÿ\u00C0-\u00FF ]+$/)]],
      apellidoMaterno: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^([a-zA-ZÀ-ÿ\u00C0-\u00FF]{2})[a-zA-ZÀ-ÿ\u00C0-\u00FF ]+$/)]],
      fechaNacimiento: ['', Validators.required],
      estadoId:['', Validators.required],
      seccion: ['', Validators.required],
      folio: ['', [Validators.required, Validators.minLength(8), Validators.pattern('^([0-9]{7})[0-9]+$')]],
      sexo: [null, Validators.required],
      curp: ['', [Validators.required, Validators.pattern(/^([a-zA-Z]{4})([0-9]{6})([a-zA-Z]{6})([0-9]{2})$/)]],
      estatus: [this.estatusBtn],
      programa: [''],
      municipioId: [null, Validators.required],
      domicilio: [null, Validators.required],
      latitud: [null, Validators.required],
      longitud: [null, Validators.required],
      edad: [null, [Validators.required]],
    });
  }

  mostrar(){
    this.visibility = true;
  }
  ocultar(){
    this.visibility = false;
    const radioElement = document.getElementById('flexRadioDefault2') as HTMLInputElement;

    if (radioElement) {
      radioElement.checked = true;
      radioElement.click();
    }
  }
  getVotantes() {
    this.isLoading = LoadingStates.trueLoading;
    this.votantesService.getAll().subscribe(
      {
        next: (dataFromAPI) => {
          this.votantes = dataFromAPI;
          this.votantesFilter = this.votantes;
          this.isLoading = LoadingStates.falseLoading;console.log('dfsjncjk', this.votantesFilter);
          
        },
        error: () => {
          this.isLoading = LoadingStates.errorLoading
        }
      }
    );
  }

  onPageChange(number: number) {
    this.configPaginator.currentPage = number;
  }
  
  handleChangeSearch(event: any) {
    const inputValue = event.target.value;
    const valueSearch = inputValue.toLowerCase();
  
    console.log('Search Value:', valueSearch);
  
    this.votantesFilter = this.votantes.filter(Votante =>
      Votante.nombres.toLowerCase().includes(valueSearch) ||
      this.getGeneroName(Votante.sexo).toLowerCase().includes(valueSearch) ||
      Votante.domicilio.toLowerCase().includes(valueSearch) ||
      Votante.fechaNacimiento.toLowerCase().includes(valueSearch) ||
      Votante.curp.toLowerCase().includes(valueSearch) ||
      Votante.id.toString().includes(valueSearch)
    );
  
    console.log('Filtered Votantes:', this.votantesFilter);
  
    this.configPaginator.currentPage = 1;
  }
  
  getGeneroName(id: number): string {
    const genero = this.generos.find(g => g.id === id);
    return genero ? genero.name : '';
  }

 
  onSelectmunicipios(id: number) {
    if (id) {
      this.municipiosSelect = this.municipios.find(b => b.id === id);
    }
  }
  setDataModalUpdate(votante: Votante) {
    this.isModalAdd = false;
    this.id = votante.id;
    const fechaFormateada = this.formatoFecha(votante.fechaNacimiento);
    
   
    const municipio = votante.municipio.id;
    this.onSelectmunicipios(municipio);
    this.votanteForm.patchValue({
      id: votante.id,
      nombres: votante.nombres,
      apellidoPaterno: votante.apellidoPaterno,
      apellidoMaterno: votante.apellidoMaterno,
      fechaNacimiento: fechaFormateada,
      domicilio: votante.domicilio,
      estatus: votante.estatus,
      latitud: votante.latitud,
      longitud: votante.longitud,
      municipioId: municipio,
      curp: votante.curp,
      sexo: votante.sexo,
      
    });

    console.log(votante);
    console.log(this.votanteForm.value);
  }

  actualizar() {
    this.votante = this.votanteForm.value as Votante;

    const programaSocialId = this.votanteForm.get('programaSocialId')?.value;
    const municipioId = this.votanteForm.get('municipioId')?.value;

    this.votante.programaSocial = { id: programaSocialId } as ProgramaSocial;
    this.votante.municipio = { id: municipioId } as Municipio;

    console.log(this.votante);

    this.spinnerService.show();
    console.log('data:', this.votante);

    this.votantesService.put(this.id, this.votante).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito("Beneficiario actualizado con éxito");
        this.resetForm();

        this.configPaginator.currentPage = 1;
      },
      error: (error) => {
        this.mensajeService.mensajeError("Error al actualizar el beneficiario");
        console.error(error);
      }
    });
  }
  formatoFecha(fecha: string): string {
    // Aquí puedes utilizar la lógica para formatear la fecha según tus necesidades
    const fechaFormateada = new Date(fecha).toISOString().split('T')[0];
    return fechaFormateada;
  }

  deleteItem(id: number, nameItem: string) {
    this.mensajeService.mensajeAdvertencia(
      `¿Estás seguro de eliminar el beneficiario: ${nameItem}?`,
      () => {
        this.votantesService.delete(id).subscribe({
          next: () => {
            this.mensajeService.mensajeExito('Beneficiario borrado correctamente');
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
    this.votanteForm.reset();
    
    
  }
  submit() {
    if (this.isModalAdd === false) {

      this.actualizar();
    } else {
      this.agregar();

    }
  }

  agregar() {
    this.votante = this.votanteForm.value as Votante;

    const programaSocialId = this.votanteForm.get('programaSocialId')?.value;
    const municipioId = this.votanteForm.get('municipioId')?.value;

    this.votante.programaSocial = { id: programaSocialId } as ProgramaSocial;
    this.votante.municipio = { id: municipioId } as Municipio;

    console.log(this.votante);

    this.spinnerService.show();
    this.votantesService.post(this.votante).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Beneficiario guardado correctamente');
        this.resetForm();
        this.configPaginator.currentPage = 1;
      },
      error: (error) => {
        this.spinnerService.hide();
        this.mensajeService.mensajeError(error);
      }
    });
  }

  handleChangeAdd() {
    if (this.votanteForm) {
      this.votanteForm.reset();
      const estatusControl = this.votanteForm.get('estatus');
      if (estatusControl) {
        estatusControl.setValue(true);
      }
      this.isModalAdd = true;
    }
  }
  exportarDatosAExcel() {
    if (this.beneficiarios.length === 0) {
      console.warn('La lista de usuarios está vacía. No se puede exportar.');
      return;
    }

    const datosParaExportar = this.beneficiarios.map(beneficiarios => {
      const estatus = beneficiarios.estatus ? 'Activo' : 'Inactivo';

      return {
        'Id': beneficiarios.id,
        'Nombre': beneficiarios.nombres,
        'ApellidoPaterno': beneficiarios.apellidoPaterno,
        'Apellido Materno': beneficiarios.apellidoMaterno,
        'FechaNacimiento': beneficiarios.strFechaNacimiento,
        'Curp': beneficiarios.curp,
        'Sexo': beneficiarios.sexo === 1 ? 'Masculino' : 'Femenino',
        'Domicilio': beneficiarios.domicilio,
        'Estatus': estatus,
      };
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosParaExportar);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    this.guardarArchivoExcel(excelBuffer, 'beneficiarios.xlsx');
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

  toggleEstatus() {
    const estatusControl = this.SocialForm.get('Estatus');

    if (estatusControl) {
      estatusControl.setValue(estatusControl.value === 1 ? 0 : 1);
    }
  }

  buscar: string = '';
  beneficiarioFiltrado: any[] = [];

  filtrarBeneficiario(): any {
    return this.beneficiarios.filter(beneficioario =>
      beneficioario.nombres.toLowerCase().includes(this.buscar.toLowerCase(),) ||
      beneficioario.apellidoMaterno.toLowerCase().includes(this.buscar.toLowerCase(),) ||
      beneficioario.apellidoMaterno.toLowerCase().includes(this.buscar.toLowerCase(),) ||
      beneficioario.curp.toLowerCase().includes(this.buscar.toLowerCase(),)
    );

  }
  actualizarFiltro(event: any): void {
    this.buscar = event.target.value;
    this.beneficiarioFiltrado = this.filtrarBeneficiario();
  }


}




