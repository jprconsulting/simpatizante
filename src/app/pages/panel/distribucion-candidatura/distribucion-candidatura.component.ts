import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { CandidaturaService } from 'src/app/core/services/candidaturs.service';

import { EstadoService } from 'src/app/core/services/estados.service';
import { DistritoService } from 'src/app/core/services/distrito.service';
import { MunicipiosService } from 'src/app/core/services/municipios.service';
import { ComunidadService } from 'src/app/core/services/comunidad.service';
import { TipoEleccionService } from 'src/app/core/services/tipo-elecciones.service';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { TipoAgrupacionesService } from 'src/app/core/services/tipo-agrupaciones.service';

import { LoadingStates } from 'src/app/global/global';
import { Candidatura } from 'src/app/models/candidatura';
import { Estado } from 'src/app/models/estados';
import { Distrito } from 'src/app/models/distrito';
import { Municipio } from 'src/app/models/municipio';
import { Comunidad } from 'src/app/models/comunidad';

import { TipoAgrupaciones } from 'src/app/models/tipo-agrupaciones';
import * as XLSX from 'xlsx';
import { TipoEleccion } from 'src/app/models/tipo-eleccion';
import { DistribucionCandidatura } from '../../../models/distribucion-candidatura';
import { DistribucionCandidaturaService } from 'src/app/core/services/distribucion-candidatura.service';
import { concatMap, map, mergeMap, toArray } from 'rxjs/operators';
import { forkJoin, Observable, of, from } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-distribucion-candidatura',
  templateUrl: './distribucion-candidatura.component.html',
  styleUrls: ['./distribucion-candidatura.component.css'],
})
export class DistribucionCandidaturaComponent {
  @ViewChild('closebutton') closebutton!: ElementRef;
  @ViewChild('searchItem') searchItem!: ElementRef;
  distribucion!: DistribucionCandidatura;
  distribucion2!: DistribucionCandidatura;
  DistribucionCandidatura!: DistribucionCandidatura;
  DistribucionForm!: FormGroup;
  isModalAdd = true;
  agrupaciones: TipoAgrupaciones[] = [];
  partidos: Candidatura[] = [];
  comun: Candidatura[] = [];
  coalicion: Candidatura[] = [];
  independiente: Candidatura[] = [];
  candidaturas: Candidatura[] = [];
  public isUpdatingImg: boolean = false;
  isLoading = LoadingStates.neutro;
  agrupacionSelect: any;
  candidaturasFilter: Candidatura[] = [];
  imagenAmpliada: string | null = null;
  id!: number;
  estados: Estado[] = [];
  distritos: Distrito[] = [];
  municipios: Municipio[] = [];
  tiposEleccion: TipoEleccion[] = [];
  comunidades: Comunidad[] = [];
  distribucionCandidatura: DistribucionCandidatura[] = [];
  distribucionCandidaturaFilter: DistribucionCandidatura[] = [];
  isLoadingModalPartidos = LoadingStates.neutro;
  pagModalSecciones: number = 1;
  initialValueModalSearchPartidos: string = '';
  partidosConLogo: { nombre: string; logoUrl: string }[] = [];

  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    private spinnerService: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private tipoagrupacionesService: TipoAgrupacionesService,
    private candidaturaService: CandidaturaService,
    private estadoService: EstadoService,
    private distritoService: DistritoService,
    private municipiosService: MunicipiosService,
    private comunidadService: ComunidadService,
    private tipoEleccionService: TipoEleccionService,
    private distribucionCandidaturaService: DistribucionCandidaturaService,

    private mensajeService: MensajeService
  ) {
    this.candidaturaService.refreshListCandidatura.subscribe(() =>
      this.getCandidatura()
    );
    this.distribucionCandidaturaService.refreshListCandidatura.subscribe(() =>
      this.getDistribucion()
    );
    this.creteForm();
    this.getAgrupaciones();
    this.getCandidatura();
    this.getPartidos();
    this.getMunicipio();
    this.getTipoEleccion();
    this.getEstado();
    this.getDistritos();
    this.getComunidad();
    this.getDistribucion();
    this.getComun();
    this.getCoalicion();
    this.getIndependiente();
  }

  getNombrePartido(partido: string): string {
    return partido.split('.jpg')[1].split('-')[1].trim();
  }

  getLogoUrl(partido: string): string {
    return partido.split('.jpg')[0] + '.jpg';
  }

  creteForm() {
    this.DistribucionForm = this.formBuilder.group({
      id: [null],
      tipoEleccion: [null, Validators.required],
      partidos: [null],
      estado: [null],
      distrito: [null],
      municipio: [null],
      comunidad: [null],
      coalicion: [null],
      comun: [null],
      independiente: [null],
    });
  }

  getPartido(partidoNombre: string): string | undefined {
    return this.partidosLista.find((partido) => partido === partidoNombre);
  }

  getLogo(partido: string): { nombre: string; logoUrl: string } | undefined {
    return this.partidosConLogo.find(
      (partidoConLogo) => partidoConLogo.nombre === partido
    );
  }

  obtenerLogosPartidos(listaPartidos: string[]): void {
    this.partidosConLogo = []; // Limpiamos el arreglo antes de comenzar
    // Verificamos si la propiedad partidos está presente y no es nula

    if (listaPartidos && listaPartidos.length > 0) {
      // Iterar sobre los partidos y hacer las solicitudes de logo
      const solicitudes = listaPartidos.map((partido) => {
        console.log('Buscando logo para el partido:', partido);
        return this.candidaturaService.obtenerLogoPartido(partido).pipe(
          map((respuesta) => ({
            nombre: partido,
            logoUrl: respuesta.logoUrl,
          })),
          catchError((error) => {
            console.error(
              `Error al obtener el logo para el partido ${partido}:`,
              error
            );
            // Devolver un objeto con la URL de un logo por defecto en caso de error
            return of({
              nombre: partido,
              logoUrl: 'URL del logo por defecto',
            });
          })
        );
      });

      forkJoin(solicitudes).subscribe((partidosConLogo) => {
        this.partidosConLogo = partidosConLogo;
      });
    } else {
      // Si no hay partidos o la lista está vacía, podemos manejarlo de alguna manera
      console.log('No se encontraron partidos para obtener logos.');
    }
  }
  getTipoEleccion() {
    this.isLoading = LoadingStates.trueLoading;
    this.tipoEleccionService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.tiposEleccion = dataFromAPI;
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

  getComunidad() {
    this.isLoading = LoadingStates.trueLoading;
    this.comunidadService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.comunidades = dataFromAPI;
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

  getMunicipio() {
    this.isLoading = LoadingStates.trueLoading;
    this.municipiosService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.municipios = dataFromAPI;
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

  getDistritos() {
    this.isLoading = LoadingStates.trueLoading;
    this.distritoService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.distritos = dataFromAPI;
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

  getEstado() {
    this.isLoading = LoadingStates.trueLoading;
    this.estadoService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.estados = dataFromAPI;
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

  getCandidatura() {
    this.isLoading = LoadingStates.trueLoading;
    this.candidaturaService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.candidaturas = dataFromAPI;
        this.candidaturasFilter = this.candidaturas;
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

  partidosLista: string[] = [];
  getDistribucionId(distribucionId: number): void {
    this.isLoadingModalPartidos = LoadingStates.trueLoading;

    this.distribucionCandidaturaService.getById(distribucionId).subscribe({
      next: (dataFromAPI) => {
        this.DistribucionCandidatura = dataFromAPI;

        this.isLoadingModalPartidos = LoadingStates.falseLoading;

        // Verificar que coalicion, comun, partidos e independiente sean arrays antes de llamar a la función lista
        const coalicion = Array.isArray(dataFromAPI.coalicion)
          ? dataFromAPI.coalicion
          : [];
        const comun = Array.isArray(dataFromAPI.comun) ? dataFromAPI.comun : [];
        const partidos = Array.isArray(dataFromAPI.partidos)
          ? dataFromAPI.partidos
          : [];
        const independiente = Array.isArray(dataFromAPI.independiente)
          ? dataFromAPI.independiente
          : [];

        // Llamar a la función lista() con los datos recibidos y los datos adicionales
        const lista = this.lista(partidos, coalicion, comun, independiente);
        console.log(lista); // Imprimir la lista
        this.partidosLista = this.lista(
          partidos,
          coalicion,
          comun,
          independiente
        );
        this.obtenerLogosPartidos(lista);
      },
      error: () => {
        this.isLoadingModalPartidos = LoadingStates.errorLoading;
      },
    });
  }

  lista(
    partidos: string[],
    coalicion: string[],
    comun: string[],
    independiente: string[]
  ): string[] {
    // Inicializar la lista con los nombres de los partidos
    const listaPartidos: string[] = [...partidos];

    // Agregar los valores de coalicion, comun, e independiente solo si tienen elementos válidos
    coalicion.forEach((item) => {
      if (item) {
        listaPartidos.push(item);
      }
    });

    comun.forEach((item) => {
      if (item) {
        listaPartidos.push(item);
      }
    });

    independiente.forEach((item) => {
      if (item) {
        listaPartidos.push(item);
      }
    });

    return listaPartidos;
  }

  verPartidosDistribucion(distribucionId: number) {
    this.pagModalSecciones = 1;

    this.getDistribucionId(distribucionId);

    const modal = document.getElementById('modal-imagen-ampliada');
    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
    }
  }

  getDistribucion() {
    this.isLoading = LoadingStates.trueLoading;
    this.distribucionCandidaturaService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.distribucionCandidatura = dataFromAPI;
        this.distribucionCandidaturaFilter = this.distribucionCandidatura;
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

  candidaturaSelect!: Candidatura | undefined;
  onSelectOperador(id: number | null) {
    this.candidaturaSelect = this.candidaturas.find(
      (v) => v.tipoAgrupacionPolitica.id === id
    );

    if (this.candidaturaSelect) {
      const valueSearch2 =
        this.candidaturaSelect.tipoAgrupacionPolitica.id.toString();

      console.log('Search Value:', valueSearch2);

      this.candidaturasFilter = this.candidaturas.filter((candidaturas) =>
        candidaturas.tipoAgrupacionPolitica.id.toString().includes(valueSearch2)
      );

      console.log('Filtered Votantes:', this.candidaturasFilter);

      this.configPaginator.currentPage = 1;
    }
  }
  onClear() {
    this.getCandidatura();
  }

  getAgrupaciones() {
    this.tipoagrupacionesService
      .getAll()
      .subscribe({ next: (dataFromAPI) => (this.agrupaciones = dataFromAPI) });
  }

  getPartidos() {
    this.candidaturaService
      .getAllPartidos()
      .subscribe({ next: (dataFromAPI) => (this.partidos = dataFromAPI) });
  }

  getComun() {
    this.candidaturaService
      .getAllComun()
      .subscribe({ next: (dataFromAPI) => (this.comun = dataFromAPI) });
  }

  getCoalicion() {
    this.candidaturaService
      .getAllCoalicion()
      .subscribe({ next: (dataFromAPI) => (this.coalicion = dataFromAPI) });
  }

  getIndependiente() {
    this.candidaturaService
      .getAllIndependiente()
      .subscribe({ next: (dataFromAPI) => (this.independiente = dataFromAPI) });
  }

  handleChangeAdd() {
    this.isUpdatingImg = false;
    this.DistribucionForm.reset();
    this.isModalAdd = true;
    const estatusControl = this.DistribucionForm.get('estatus');
    if (estatusControl) {
      estatusControl.setValue(true);
    }
  }

  onSelectCandidato(id: number) {
    if (id) {
      this.agrupacionSelect = this.agrupaciones.find((b) => b.id === id);
    }
  }

  resetForm() {
    this.closebutton.nativeElement.click();
    this.DistribucionForm.reset();
  }

  submit() {
    if (this.isModalAdd === false) {
      this.actualizar();
    } else {
      this.agregar();
    }
  }

  concatenarNombreYLogo(partido: any): string {
    return `${partido.nombre} - ${partido.logo}`;
  }

  agregar() {
    this.distribucion = this.DistribucionForm.value as DistribucionCandidatura;
    const tipo = this.DistribucionForm.get('tipoEleccion')?.value;
    this.distribucion.tipoEleccion = { id: tipo } as TipoAgrupaciones;

    this.distribucion.estado = { id: 29 } as Estado;

    const distrito = this.DistribucionForm.get('distrito')?.value;
    this.distribucion.distrito = { id: distrito } as Distrito;

    const municipio = this.DistribucionForm.get('municipio')?.value;
    this.distribucion.municipio = { id: municipio } as Municipio;

    const comunidad = this.DistribucionForm.get('comunidad')?.value;
    this.distribucion.comunidad = { id: comunidad } as Comunidad;
    this.spinnerService.show();

    // Obtener los partidos y construir la lista de partidos
    const partidos = this.DistribucionForm.get('partidos')?.value;
    const listaPartidos = partidos.map(
      (partido: any) => partido.logo + '-' + partido.nombre
    );
    this.distribucion.partidos = listaPartidos;

    // Obtener las coaliciones y construir la lista de coaliciones
    const coalicion = this.DistribucionForm.get('coalicion')?.value;
    if (coalicion) {
      const listaCoalicion = coalicion.map(
        (coalicionItem: any) => coalicionItem.logo + '-' + coalicionItem.nombre
      );
      this.distribucion.coalicion = listaCoalicion;
    } else {
      this.distribucion.coalicion = [];
    }

    // Obtener los partidos independientes y construir la lista de partidos independientes
    const independiente = this.DistribucionForm.get('independiente')?.value;
    if (independiente) {
      const listaIndependiente = independiente.map(
        (independienteItem: any) =>
          independienteItem.logo + '-' + independienteItem.nombre
      );
      this.distribucion.independiente = listaIndependiente;
    } else {
      this.distribucion.independiente = [];
    }

    // Obtener los partidos comunes y construir la lista de partidos comunes
    const comun = this.DistribucionForm.get('comun')?.value;
    if (comun) {
      const listaComun = comun.map(
        (comunItem: any) => comunItem.logo + '-' + comunItem.nombre
      );
      this.distribucion.comun = listaComun;
    } else {
      this.distribucion.comun = [];
    }

    console.log('data:', this.distribucion);

    this.spinnerService.show();
    this.distribucionCandidaturaService.post(this.distribucion).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Distribución guardada correctamente');
        this.resetForm();
        this.getDistribucion();
        this.configPaginator.currentPage = 1;
      },
      error: (error) => {
        this.spinnerService.hide();
        this.mensajeService.mensajeError(error);
      },
    });
  }

  actualizar() {
    this.distribucion = this.DistribucionForm.value as DistribucionCandidatura;
    const tipo = this.DistribucionForm.get('tipoEleccion')?.value;
    this.distribucion.tipoEleccion = { id: tipo } as TipoAgrupaciones;
    this.distribucion.estado = { id: 29 } as Estado;
    const distrito = this.DistribucionForm.get('distrito')?.value;
    this.distribucion.distrito = { id: distrito } as Distrito;
    const municipio = this.DistribucionForm.get('municipio')?.value;
    this.distribucion.municipio = { id: municipio } as Municipio;
    const comunidad = this.DistribucionForm.get('comunidad')?.value;
    this.distribucion.comunidad = { id: comunidad } as Comunidad;

    const partidos = this.DistribucionForm.get('partidos')?.value;

    const coalicion = this.DistribucionForm.get('coalicion')?.value;
    const independiente = this.DistribucionForm.get('independiente')?.value;
    const comun = this.DistribucionForm.get('comun')?.value;
    console.log(partidos, 'partidos');
    console.log(coalicion, 'coalicion');
    console.log(independiente, 'independiente');
    console.log(comun, 'comun');
    const requests = [];

    if (partidos && partidos.length > 0) {
      requests.push(this.getCandidaturas(partidos));
    } else {
      requests.push(of([]));
    }

    if (coalicion && coalicion.length > 0) {
      requests.push(this.getCandidaturas(coalicion));
    } else {
      requests.push(of([]));
    }

    if (independiente && independiente.length > 0) {
      requests.push(this.getCandidaturas(independiente));
    } else {
      requests.push(of([]));
    }

    if (comun && comun.length > 0) {
      requests.push(this.getCandidaturas(comun));
    } else {
      requests.push(of([]));
    }

    forkJoin(requests).subscribe((responses: any) => {
      const [
        partidosResultados,
        coalicionResultados,
        independienteResultados,
        comunResultados,
      ] = responses;

      this.distribucion.partidos = partidosResultados;
      this.distribucion.coalicion = coalicionResultados;
      this.distribucion.independiente = independienteResultados;
      this.distribucion.comun = comunResultados;

      console.log(partidosResultados, 'partidos3');
      console.log(coalicionResultados, 'coalicion3');
      console.log(independienteResultados, 'independiente3');
      console.log(comunResultados, 'comun3');

      console.log('Data:', this.distribucion);
      this.put(this.distribucion);
    });
  }
  getCandidaturas(candidaturas: any[]): Observable<string[]> {
    const observables = candidaturas.map((candidatura: any) =>
      this.candidaturaService.getByNombre(candidatura)
    );

    return forkJoin(observables).pipe(
      map((responses: any[]) => {
        const formattedResponses = responses.map(
          (dataFromAPI) => `${dataFromAPI.logo}-${dataFromAPI.nombre}` // Ajuste aquí
        );
        console.log('Respuestas exitosas:', formattedResponses);
        return formattedResponses;
      }),
      catchError((error) => {
        console.error('Error en la solicitud:', error);
        // Si ocurre un error, devolver un mensaje de error como cadena
        const formattedErrors = candidaturas
          .map(
            (coalicionItem) => `${coalicionItem.logo}-${coalicionItem.nombre}` // Ajuste aquí
          )
          .join(', ');
        console.log('Respuestas error:', formattedErrors);
        return of([formattedErrors]); // Devolver un array con el mensaje de error
      })
    );
  }

  put(data: any) {
    console.log('data2', data);
    console.log('data3', this.distribucion2);
    this.distribucionCandidaturaService.put(this.id, data).subscribe({
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

  setDataModalUpdate(dto: DistribucionCandidatura) {
    this.isModalAdd = false;
    this.id = dto.id;

    const candidatura = this.candidaturasFilter.find(
      (candidatura) => candidatura.id === dto.id
    );
    this.isUpdatingImg = true;

    // Realizar transformación para mostrar al usuario
    const nombresPartidos =
      dto.partidos?.map((url: string) => {
        const partes = url.split('-');
        return partes[partes.length - 1];
      }) || []; // Si dto.partidos es null o undefined, asigna un array vacío

    const nombresCoalicion =
      dto.coalicion?.map((url: string) => {
        const partes = url.split('-');
        return partes[partes.length - 1];
      }) || [];

    const nombresIndependiente =
      dto.independiente?.map((url: string) => {
        const partes = url.split('-');
        return partes[partes.length - 1];
      }) || [];

    const nombresComun =
      dto.comun?.map((url: string) => {
        const partes = url.split('-');
        return partes[partes.length - 1];
      }) || [];

    this.DistribucionForm.patchValue({
      id: dto.id,
      tipoEleccion: dto.tipoEleccion.id,
      partidos: nombresPartidos,
      coalicion: nombresCoalicion,
      independiente: nombresIndependiente,
      comun: nombresComun,
      estado: dto.estado?.id,
      distrito: dto.distrito?.id,
      municipio: dto.municipio?.id,
      comunidad: dto.comunidad?.id,
    });

    console.log('setDataUpdateVistaForm ', this.DistribucionForm.value);
    console.log('setDataUpdateDTO', dto);
  }

  handleChangeSearch(event: any) {
    const inputValue = event.target.value;
    const valueSearch = inputValue.toLowerCase();

    console.log('Search Value:', valueSearch);

    this.distribucionCandidaturaFilter = this.distribucionCandidatura.filter(
      (distribucion) =>
        distribucion.tipoEleccion.nombre.toLowerCase().includes(valueSearch) ||
        distribucion.distrito?.nombre.toLowerCase().includes(valueSearch) ||
        distribucion.municipio?.nombre.toLowerCase().includes(valueSearch) ||
        distribucion.comunidad?.nombre.toLowerCase().includes(valueSearch) ||
        distribucion.estado?.nombre.toLowerCase().includes(valueSearch)
    );

    console.log('Filtered Votantes:', this.distribucionCandidaturaFilter);

    this.configPaginator.currentPage = 1;
  }
  exportarDatosAExcel() {
    if (this.candidaturas.length === 0) {
      console.warn(
        'La lista de distribución está vacía, no se puede exportar.'
      );
      return;
    }

    const datosParaExportar = this.distribucionCandidatura.map(
      (distribucionCandidatura) => {
        const nombresPartidos = distribucionCandidatura.partidos?.map(
          (url: string) => {
            const partes = url.split('-');
            return partes[partes.length - 1];
          }
        );
        const nombrescoalicion = distribucionCandidatura.coalicion?.map(
          (url: string) => {
            const partes = url.split('-');
            return partes[partes.length - 1];
          }
        );
        const nombresindependiente = distribucionCandidatura.independiente?.map(
          (url: string) => {
            const partes = url.split('-');
            return partes[partes.length - 1];
          }
        );
        const nombrescomun = distribucionCandidatura.comun?.map(
          (url: string) => {
            const partes = url.split('-');
            return partes[partes.length - 1];
          }
        );

        return {
          'Tipo elección': distribucionCandidatura.tipoEleccion.nombre,
          Estado: distribucionCandidatura.estado?.nombre,
          Distrito: distribucionCandidatura.distrito?.nombre,
          Municipio: distribucionCandidatura.municipio?.nombre,
          Comunidad: distribucionCandidatura.comunidad?.nombre,
          Partido: nombresPartidos?.join(', '),
          'Candidatura común': nombrescomun?.join(', '),
          Coalición: nombrescoalicion?.join(', '),
          'Candidatura independiente': nombresindependiente?.join(', '),
        };
      }
    );

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

    this.guardarArchivoExcel(excelBuffer, 'Distribuciones.xlsx');
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

  deleteItem(id: number) {
    this.mensajeService.mensajeAdvertencia(
      `¿Estás seguro de eliminar la distribución?`,
      () => {
        this.distribucionCandidaturaService.delete(id).subscribe({
          next: () => {
            this.mensajeService.mensajeExito(
              'Distribución borrada correctamente'
            );
            this.getDistribucion();
            this.configPaginator.currentPage = 1;
            this.searchItem.nativeElement.value = '';
          },
          error: (error) => this.mensajeService.mensajeError(error),
        });
      }
    );
  }

  onPageChange(number: number) {
    this.configPaginator.currentPage = number;
  }

  clearInputModalSearch() {
    this.initialValueModalSearchPartidos = '';
  }

  cerrarModal() {
    this.clearInputModalSearch();
    this.imagenAmpliada = null;
    const modal = document.getElementById('modal-imagen-ampliada');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
    }
  }
}
