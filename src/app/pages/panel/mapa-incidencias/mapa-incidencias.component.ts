import { AfterViewInit, Component } from '@angular/core';
import { IncidenciaService } from 'src/app/core/services/incidencias.service';
import { IndicadoresService } from 'src/app/core/services/indicadores.service';
import { Incidencia } from 'src/app/models/incidencias';
import { Indicadores } from 'src/app/models/indicadores';
declare const google: any;

@Component({
  selector: 'app-mapa-incidencias',
  templateUrl: './mapa-incidencias.component.html',
  styleUrls: ['./mapa-incidencias.component.css'],
})
export class MapaIncidenciasComponent implements AfterViewInit {
  map: any = {};
  infowindow = new google.maps.InfoWindow();
  markers: google.maps.Marker[] = [];
  indicadores: Indicadores[] = [];
  incidencias: Incidencia[] = [];
  incidenciasFiltradas: Incidencia[] = [];

  constructor(
    private indicadorService: IndicadoresService,
    private incidenciasService: IncidenciaService
  ) {
    this.loadIndicadores();
    this.getIndicadores();
    this.getIncidencias();
  }

  ngAfterViewInit() {
    const mapElement = document.getElementById('map-canvas') || null;
    const lat = mapElement?.getAttribute('data-lat') || null;
    const lng = mapElement?.getAttribute('data-lng') || null;
    const myLatlng = new google.maps.LatLng(lat, lng);

    const mapOptions = {
      zoom: 10,
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

  loadIndicadores(): void {
    this.indicadorService.getByIncidencias().subscribe(
      (data: Indicadores[]) => {
        this.indicadores = data;
      },
      (error) => {
        console.error(error);
      }
    );
  }

  getIndicadores() {
    this.indicadorService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.indicadores = dataFromAPI;
      },
    });
  }

  getIncidencias() {
    this.incidenciasService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.incidencias = dataFromAPI;
        this.incidenciasFiltradas = this.incidencias;
        this.setAllMarkers();
      },
    });
  }

  onSelectIncidencias(id: number) {
    if (id) {
      this.clearMarkers();
      this.incidencias
        .filter((b) => b.tipoIncidencia.id == id)
        .forEach((incidencica) => {
          this.setInfoWindow(
            this.getMarker(incidencica),
            this.getContentString(incidencica)
          );
        });
    }
  }

  setAllMarkers() {
    this.clearMarkers();
    this.incidencias.forEach((incidencia) => {
      this.setInfoWindow(
        this.getMarker(incidencia),
        this.getContentString(incidencia)
      );
    });
  }

  getContentString(incidencias: Incidencia) {
    return `
      <div style="width: 350px; height: auto;" class=" text-center">
          <!--<img class="rounded-circle" style="width: 130px; height: 130px; object-fit: cover;"
            src="../../../../assets/images/casilla.png"
            alt="Sunset in the mountains">-->
            <div class="px-4 py-4">
          <p style="font-weight:  bolder;" class=" ">
            Casilla:
            <p class="text-muted ">
              ${incidencias.casilla.nombre}
            </p>
          </p>
          <p style="font-weight:  bolder;" class=" ">
            Tipo de incidencia:
            <p class="text-muted ">
              ${incidencias.tipoIncidencia.tipo}
            </p>
          </p>
          <p style="font-weight:  bolder;" class=" ">
            Retroalimentación:
            <p class="text-muted ">
              ${incidencias.retroalimentacion}
            </p>
          </p>
          <p style="font-weight:  bolder;" class="">
            Dirección:
            <p class=" text-muted">
              ${incidencias.direccion}
            </p>
          </p>
        </div>
      </div>
    `;
  }

  getMarker(incidencias: Incidencia) {
    const marker = new google.maps.Marker({
      position: new google.maps.LatLng(
        incidencias.latitud,
        incidencias.longitud
      ),
      map: this.map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: incidencias.tipoIncidencia.color,
        fillOpacity: 1,
        scale: 6,
        strokeWeight: 0,
      },
      title: `${incidencias.tipoIncidencia.tipo}`,
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

  onClear() {
    this.setAllMarkers();
  }

  clearMarkers() {
    this.markers.forEach((marker) => {
      marker.setMap(null);
    });
    this.markers = [];
  }
}
