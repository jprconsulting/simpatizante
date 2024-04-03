import { AfterViewInit, Component } from '@angular/core';
import { IncidenciaService } from 'src/app/core/services/incidencias.service';
import { PropagandaService } from 'src/app/core/services/programa-electoral.service';
import { Propaganda } from 'src/app/models/propaganda-electoral';
import { Indicadores } from 'src/app/models/indicadores';
import { Candidato } from 'src/app/models/candidato';
import { CandidatosService } from 'src/app/core/services/candidatos.service';
import { Seccion } from 'src/app/models/seccion';
import { SeccionService } from 'src/app/core/services/seccion.service';

declare const google: any;

@Component({
  selector: 'app-mapa-propaganda',
  templateUrl: './mapa-propaganda.component.html',
  styleUrls: ['./mapa-propaganda.component.css'],
})
export class MapaPropagandaComponent implements AfterViewInit {
  map: any = {};
  infowindow = new google.maps.InfoWindow();
  markers: google.maps.Marker[] = [];
  propagandas: Propaganda[] = [];
  propagandasFiltradas: Propaganda[] = [];
  candidatos: Candidato[] = [];
  secciones: Seccion[] = [];

  constructor(
    private candidatosService: CandidatosService,
    private propagandasService: PropagandaService,
    private seccionService: SeccionService
  ) {
    this.getPropagandas();
    this.getCandidatos();
    this.getSecciones();
  }
  getSecciones() {
    this.seccionService
      .getAll()
      .subscribe({ next: (dataFromAPI) => (this.secciones = dataFromAPI) });
  }

  getCandidatos() {
    this.candidatosService
      .getAll()
      .subscribe({ next: (dataFromAPI) => (this.candidatos = dataFromAPI) });
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

  getPropagandas() {
    this.propagandasService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.propagandas = dataFromAPI;
        this.propagandasFiltradas = this.propagandas;
        this.setAllMarkers();
      },
    });
  }

  onSelectIncidencias(id: number) {
    if (id) {
      this.clearMarkers();
    }
  }

  setAllMarkers() {
    this.clearMarkers();
    this.propagandas.forEach((propaganda) => {
      this.setInfoWindow(
        this.getMarker(propaganda),
        this.getContentString(propaganda)
      );
    });
  }

  getContentString(propagandas: Propaganda) {
    return `
      <div style="width: 350px; height: auto;" class="text-center">
  <img src="${propagandas.foto}" alt="Imagen de propaganda" style="width: 100%; height: auto;">
  <div class="px-4 py-4">
    <p style="font-weight: bold;">
      Folio:
      <span class="text-muted">${propagandas.folio}</span>
    </p>
    <p style="font-weight: bold;">
      Candidato:
      <span class="text-muted">${propagandas.candidato.nombreCompleto}</span>
    </p>
    <p style="font-weight: bold;">
      Comentarios:
      <span class="text-muted">${propagandas.comentarios}</span>
    </p>
    <p style="font-weight: bold;">
      Dirección:
      <span class="text-muted">${propagandas.ubicacion}</span>
    </p>
    <p style="font-weight: bold;">
      Municipio:
      <span class="text-muted">${propagandas.municipio.nombre}</span>
    </p>
  </div>
</div>

    `;
  }

  getMarker(propagandas: Propaganda) {
    console.log(
      `Latitud: ${propagandas.latitud}, Longitud: ${propagandas.longitud}`
    );
    const marker = new google.maps.Marker({
      position: new google.maps.LatLng(
        propagandas.latitud,
        propagandas.longitud
      ),
      map: this.map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: 'blue',
        fillOpacity: 1,
        scale: 6,
        strokeWeight: 0,
      },
      title: `${propagandas.folio}`,
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

  onSelectCandidato(id: number) {
    if (id) {
      this.clearMarkers();
      this.propagandas
        .filter((b) => b.candidato.id == id)
        .forEach((candidato) => {
          this.setInfoWindow(
            this.getMarker(candidato),
            this.getContentString(candidato)
          );
        });
    }
  }
  onSelectSecciones(id: number) {
    if (id) {
      this.clearMarkers();
      this.propagandas
        .filter((b) => b.seccion.id == id)
        .forEach((seccion) => {
          this.setInfoWindow(
            this.getMarker(seccion),
            this.getContentString(seccion)
          );
        });
    }
  }

  clearMarkers() {
    this.markers.forEach((marker) => {
      marker.setMap(null);
    });
    this.markers = [];
  }
}
