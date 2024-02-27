import { AfterViewInit, Component } from '@angular/core';
import { color } from 'highcharts';
import { MunicipiosService } from 'src/app/core/services/municipios.service';
import { SeccionService } from 'src/app/core/services/seccion.service';
import { SimpatizantesService } from 'src/app/core/services/simpatizantes.service';
import { Simpatiza } from 'src/app/models/mapa';
import { Municipio } from 'src/app/models/municipio';
import { Seccion } from 'src/app/models/seccion';
import { Simpatizante } from 'src/app/models/votante';
declare const google: any;

@Component({
  selector: 'app-mapa-simpatizantes',
  templateUrl: './mapa-simpatizantes.component.html',
  styleUrls: ['./mapa-simpatizantes.component.css'],
})
export class MapaSimpatizantesComponent implements AfterViewInit {
  simpatizantes: Simpatiza[] = [];
  simpatizantes2: Simpatizante[] = [];
  infowindow = new google.maps.InfoWindow();
  markers: google.maps.Marker[] = [];
  map: any = {};
  simpatizantesFiltrados: Simpatiza[] = [];
  secciones: Seccion[] = [];
  constructor(
    private simpatizantesService: SimpatizantesService,
    private seccionService: SeccionService
  ) {
    this.getSimpatizantes();
    this.getSecciones();
  }

  clearMarkers() {
    this.markers.forEach((marker) => {
      marker.setMap(null);
    });
    this.markers = [];
  }
  getMarker2(simpatizante: Simpatizante) {
    const fillColor = 'orange';

    const marker = new google.maps.Marker({
      position: new google.maps.LatLng(
        simpatizante.latitud,
        simpatizante.longitud
      ),
      map: this.map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 7,
        fillColor: 'orange',
        fillOpacity: 1,
        strokeWeight: 0,
      },
      title: `${simpatizante.seccion.clave}`,
    });

    this.markers.push(marker);
    return marker;
  }

  getMarker(simpatizante: Simpatiza): google.maps.Marker {
    const fillColor = simpatizante.color || 'orange'; // Usar naranja si no hay color asignado

    const marker = new google.maps.Marker({
      position: new google.maps.LatLng(
        simpatizante.simpatizante.latitud,
        simpatizante.simpatizante.longitud
      ),
      map: this.map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 6,
        fillColor: fillColor,
        fillOpacity: 1,
        strokeWeight: 0,
      },
      title: `${simpatizante.simpatizante.seccion.clave}`,
    });

    this.markers.push(marker);
    return marker;
  }

  setInfoWindow(marker: any, contentString: string) {
    google.maps.event.addListener(marker, 'click', () => {
      if (this.infowindow && this.infowindow.getMap()) {
        this.infowindow.close();
      }
      this.infowindow.setContent(contentString);
      this.infowindow.setPosition(marker.getPosition());
      this.infowindow.open(this.map, marker);
    });
  }

  getSecciones() {
    this.seccionService
      .getAll()
      .subscribe({ next: (dataFromAPI) => (this.secciones = dataFromAPI) });
  }

  getContentString(simpatizante: Simpatiza): string {
    // Verificar si simpatizante y simpatizante.simpatizante están definidos antes de acceder a las propiedades
    if (simpatizante && simpatizante.simpatizante) {
      let generoImage = '';

      switch (simpatizante.simpatizante.genero.id) {
        case 1:
          generoImage = '../../../../assets/images/hombre.png';
          break;
        case 2:
          generoImage = '../../../../assets/images/mujer.png';
          break;
        default:
          generoImage = '../../../../assets/images/binario.png'; // Manejo de casos no esperados
      }

      return `
        <div style="width: 450px; height: auto;" class="text-center">
          <img class="rounded-circle" style="width: 100px; height: 100px; object-fit: cover;"
            src="${generoImage}"
            alt="Imagen de género">
  
          <div class="px-4 py-4">
            <p style="font-weight: bolder;">
              Nombre:
              <p class="text-muted">
                ${simpatizante.simpatizante.nombreCompleto || 'No disponible'}
              </p>
            </p>
            <p style="font-weight: bolder;">
              Programa inscrito:
              <p class="text-muted">
                ${
                  simpatizante.simpatizante.programaSocial
                    ? simpatizante.simpatizante.programaSocial.nombre
                    : 'No hay programa social'
                }
              </p>
            </p>
            <p style="font-weight: bolder;">
              Dirección:
              <p class="text-muted">
                ${simpatizante.simpatizante.domicilio || 'No disponible'}
              </p>
            </p>
          </div>
        </div>
      `;
    } else {
      return 'Información no disponible';
    }
  }

  ngAfterViewInit() {
    const mapElement = document.getElementById('map-canvas') || null;
    const lat = mapElement?.getAttribute('data-lat') || null;
    const lng = mapElement?.getAttribute('data-lng') || null;
    const myLatlng = new google.maps.LatLng(lat, lng);

    const mapOptions = {
      zoom: 10.1,
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
    this.map = new google.maps.Map(mapElement, mapOptions);
  }
  getSimpatizantes() {
    this.simpatizantesService.getAll2().subscribe({
      next: (dataFromAPI) => {
        this.combineResults(dataFromAPI);
        this.simpatizantesFiltrados = this.simpatizantes;
      },
    });
  }

  combineResults(dataFromAPI: Simpatiza[]): void {
    const simpatizantesCombinados: {
      simpatizante: Simpatizante;
      color: string | null;
      simpatiza: boolean | null;
    }[] = [];

    this.simpatizantesService.getAll().subscribe({
      next: (dataFromAPI2) => {
        const simpatizantesMapeados: Simpatizante[] = dataFromAPI2.map(
          (simpatizante) => ({
            ...simpatizante,
          })
        );

        for (const simpatizante of simpatizantesMapeados) {
          const result = {
            simpatizante,
            simpatiza: null,
            color: null,
          };

          simpatizantesCombinados.push(result);
        }
        const simpatizantesMapeadosf: Simpatiza[] = dataFromAPI.map(
          (simpatiza) => simpatiza
        );
        const simpatizantesCombinados2 = [
          ...simpatizantesCombinados,
          ...simpatizantesMapeadosf,
        ];

        console.log('si?', simpatizantesCombinados2);
        this.setAllMarkers(simpatizantesCombinados2);
      },
    });
  }

  filterMarkersBySeccion(id: number): void {
    const simpatizantesCombinados: {
      simpatizante: Simpatizante;
      color: string | null;
      simpatiza: boolean | null;
    }[] = [];

    this.simpatizantesService.getAll().subscribe({
      next: (dataFromAPI2) => {
        const simpatizantesMapeados: Simpatizante[] = dataFromAPI2.map(
          (simpatizante) => ({
            ...simpatizante,
          })
        );

        for (const simpatizante of simpatizantesMapeados) {
          const result = {
            simpatizante,
            simpatiza: null,
            color: null,
          };

          simpatizantesCombinados.push(result);
        }
        this.simpatizantesService.getAll2().subscribe({
          next: (dataFromAPI) => {
            const simpatizantesMapeadosf: Simpatiza[] = dataFromAPI.map(
              (simpatiza) => simpatiza
            );
            const simpatizantesCombinados2 = [
              ...simpatizantesCombinados,
              ...simpatizantesMapeadosf,
            ];

            console.log('si?', simpatizantesCombinados2);
            this.clearMarkers();

            // Filtra los simpatizantes por sección y asigna el resultado a simpatizantesFiltrados
            const simpatizantesFiltrados = simpatizantesCombinados2.filter(
              (v) => v.simpatizante.seccion.id === id
            );

            // Imprime los resultados filtrados en la consola
            console.log('Simpatizantes Filtrados:', simpatizantesFiltrados);

            // Configura los marcadores y las ventanas de información con los resultados filtrados
            simpatizantesFiltrados.forEach((simpatizante) => {
              this.setInfoWindow(
                this.getMarker(simpatizante),
                this.getContentString(simpatizante)
              );
            });

            // Imprime los datos combinados y el ID de la sección en la consola
            console.log('simpatizantesCombinados2:', simpatizantesCombinados2);
            console.log('ID de Sección:', id);

            // Establece todos los marcadores con los datos combinados
            this.setAllMarkers(simpatizantesFiltrados);
          },
        });
      },
    });
  }

  setAllMarkers(simpatizantesCombinados: Simpatiza[]): void {
    simpatizantesCombinados.forEach((simpatizante) => {
      this.setInfoWindow(
        this.getMarker(simpatizante),
        this.getContentString(simpatizante)
      );
    });
  }

  getSimpatizantes2() {
    this.simpatizantesService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.simpatizantes2 = dataFromAPI;
        this.combineResults([]);
        this.simpatizantesFiltrados = this.simpatizantes;
      },
    });
  }

  onClear() {
    this.getSimpatizantes();
    this.getSimpatizantes();
  }
}
