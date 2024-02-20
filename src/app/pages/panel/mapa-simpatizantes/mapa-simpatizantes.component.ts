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
  infowindow = new google.maps.InfoWindow();
  markers: google.maps.Marker[] = [];
  map: any = {};
  simpatizantesFiltrados: Simpatiza[] = [];
  secciones: Seccion[] = [];

  constructor(
    private simpatizantesService: SimpatizantesService,
    private seccionService: SeccionService
  ) {
    this.getsimpatizantes();
    this.getSecciones();
  }
  setAllMarkers() {
    this.clearMarkers();
    this.simpatizantes.forEach((simpatizantes) => {
      this.setInfoWindow(
        this.getMarker(simpatizantes),
        this.getContentString(simpatizantes.simpatizante)
      );
    });
  }

  clearMarkers() {
    this.markers.forEach((marker) => {
      marker.setMap(null);
    });
    this.markers = [];
  }

  getMarker(simpatizante: Simpatiza) {
    const marker = new google.maps.Marker({
      position: new google.maps.LatLng(
        simpatizante.simpatizante.latitud,
        simpatizante.simpatizante.longitud
      ),
      map: this.map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 7,
        fillColor: simpatizante.color,
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

  getContentString(simpatizante: Simpatizante) {
    return `
    <div style="width: 450px; height: auto;" class=" text-center">
      <img class="rounded-circle" style="width: 100px; height: 100px; object-fit: cover;"
        src="${
          simpatizante.genero.id === 1
            ? '../../../../assets/images/hombre.png'
            : '../../../../assets/images/mujer.png'
        }"
        alt="Sunset in the mountains">

      <div class="px-4 py-4">
        <p style="font-weight:  bolder;" class=" ">
          Nombre:
          <p class="text-muted ">
            ${simpatizante.nombreCompleto}
          </p>
        </p>
        <p style="font-weight:  bolder;" class="">
          Programa inscrito:
          <p class=" text-muted">
          ${
            simpatizante.programaSocial
              ? simpatizante.programaSocial.nombre
              : 'No hay programa social'
          }
          </p>
        </p>
        <p style="font-weight:  bolder;" class="" >
          Dirección:
          <p class="text-muted">
            ${simpatizante.domicilio}
          </p>
        </p>
      </div>
    </div>
  `;
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
  getsimpatizantes() {
    this.simpatizantesService.getAll2().subscribe({
      next: (dataFromAPI) => {
        this.simpatizantes = dataFromAPI;
        this.simpatizantesFiltrados = this.simpatizantes;
        this.setAllMarkers();
      },
    });
  }
  onSelectSeccion(id: number) {
    if (id) {
      this.clearMarkers();

      // Filtrar los simpatizantes por municipio y asignar el resultado a simpatizantesFiltrados
      this.simpatizantesFiltrados = this.simpatizantes.filter(
        (v) => v.simpatizante.seccion.id === id
      );

      this.simpatizantesFiltrados.forEach((simpatizante) => {
        this.setInfoWindow(
          this.getMarker(simpatizante),
          this.getContentString(simpatizante.simpatizante)
        );
      });
    }
  }

  onClear() {
    this.setAllMarkers();
  }
}
