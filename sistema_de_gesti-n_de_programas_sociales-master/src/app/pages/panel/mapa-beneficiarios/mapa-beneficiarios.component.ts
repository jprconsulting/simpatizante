import { AfterViewInit, Component } from '@angular/core';
import { BeneficiariosService } from 'src/app/core/services/beneficiarios.service';
import { DashboardService } from 'src/app/core/services/dashboard.service';
import { ProgramasSocialesService } from 'src/app/core/services/programas-sociales.service';
import { Beneficiario } from 'src/app/models/beneficiario';
import { ProgramaSocial, ProgramaSocialEstadistica } from 'src/app/models/programa-social';
declare const google: any;
@Component({
  selector: 'app-mapa-beneficiarios',
  templateUrl: './mapa-beneficiarios.component.html',
  styleUrls: ['./mapa-beneficiarios.component.css']
})
export class MapaBeneficiariosComponent implements AfterViewInit {

  programaSocialEstadistica: ProgramaSocialEstadistica[] = [];
  programasSociales: ProgramaSocial[] = [];
  beneficiarios: Beneficiario[] = [];
  beneficiariosFiltrados: Beneficiario[] = [];
  map: any = {};
  infowindow = new google.maps.InfoWindow();
  markers: google.maps.Marker[] = [];


  constructor(
    private beneficiariosService: BeneficiariosService,
    private programasSocialesService: ProgramasSocialesService,
    private dashboardService: DashboardService
  ) {
    this.getTotalBeneficiariosPorProgramaSocial();
    this.getProgramasSociales();
    this.getBeneficiarios();

  }

  getTotalBeneficiariosPorProgramaSocial() {
    this.dashboardService.getTotalBeneficiariosPorProgramaSocial().subscribe({
      next: (dataFromApi) => {
        this.programaSocialEstadistica = dataFromApi;
      }
    });
  }

  getProgramasSociales() {
    this.programasSocialesService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.programasSociales = dataFromAPI;
      }
    });
  }

  getBeneficiarios() {
    this.beneficiariosService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.beneficiarios = dataFromAPI;
        this.beneficiariosFiltrados = this.beneficiarios;
        this.setAllMarkers();
      }
    });
  }


  ngAfterViewInit() {
    const mapElement = document.getElementById("map-canvas") || null;
    const lat = mapElement?.getAttribute("data-lat") || null;
    const lng = mapElement?.getAttribute("data-lng") || null;
    const myLatlng = new google.maps.LatLng(lat, lng);

    const mapOptions = {
      zoom: 10,
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
    this.map = new google.maps.Map(mapElement, mapOptions);
  }



  onSelectProgramaSocial(id: number) {
    if (id) {
      this.clearMarkers();
      this.beneficiarios.filter(b => b.programaSocial.id == id).forEach(beneficiario => {
        this.setInfoWindow(this.getMarker(beneficiario), this.getContentString(beneficiario));
      });
    }
  }

  setAllMarkers() {
    this.clearMarkers();
    this.beneficiarios.forEach(beneficiario => {
      this.setInfoWindow(this.getMarker(beneficiario), this.getContentString(beneficiario));
    });
  }

  getMarker(beneficiario: Beneficiario) {
    const marker = new google.maps.Marker({
      position: new google.maps.LatLng(beneficiario.latitud, beneficiario.longitud),
      map: this.map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: beneficiario.programaSocial.color,
        fillOpacity: 1,
        strokeWeight: 0,
        scale: 10
      },
      title: `${beneficiario.nombreCompleto}`,
    });
    this.markers.push(marker);
    return marker;
  }

  setInfoWindow(marker: any, contentString: string) {
    google.maps.event.addListener(marker, "click", () => {
      if (this.infowindow && this.infowindow.getMap()) {
        this.infowindow.close();
      }
      this.infowindow.setContent(contentString);
      this.infowindow.setPosition(marker.getPosition());
      this.infowindow.open(this.map, marker);
    });
  }

  getContentString(beneficiario: Beneficiario) {
    return `
      <div style="width: 450px; height: auto;" class=" text-center">
        <img class="rounded-circle" style="width: 100px; height: 100px; object-fit: cover;"
          src="${beneficiario.sexo === 1 ? '../../../../assets/images/hombre.png' : '../../../../assets/images/mujer.png'}"
          alt="Sunset in the mountains">

        <div class="px-4 py-4">
          <p style="font-weight:  bolder;" class=" ">
            Nombre:
            <p class="text-muted ">
              ${beneficiario.nombreCompleto}
            </p>
          </p>
          <p style="font-weight:  bolder;" class="">
            Programa inscrito:
            <p class=" text-muted">
              ${beneficiario.programaSocial.nombre}
            </p>
          </p>
          <p style="font-weight:  bolder;" class="" >
            Dirección:
            <p class="text-muted">
              ${beneficiario.domicilio}
            </p>
          </p>
        </div>
      </div>
    `;
  }

  onClear() {
    this.setAllMarkers();
  }

  clearMarkers() {
    this.markers.forEach(marker => {
      marker.setMap(null);
    });
    this.markers = [];
  }



}
