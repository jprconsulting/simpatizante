import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { SecurityService } from 'src/app/core/services/security.service';
import { AppUserAuth } from 'src/app/models/login';
import { RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements AfterViewInit {
  @ViewChild('rlDashboard') rlDashboard!: RouterLinkActive;
  @ViewChild('rlUsuarios') rlUsuarios: RouterLinkActive | undefined;
  @ViewChild('rlProgramasSociales') rlProgramasSociales: RouterLinkActive | undefined;
  @ViewChild('rlTipoIncidencias') rlTipoIncidencias: RouterLinkActive | undefined;
  @ViewChild('rlVisitas') rlVisitas: RouterLinkActive | undefined;
  @ViewChild('rlIncidencias') rlIncidencias: RouterLinkActive | undefined;
  @ViewChild('rlMapaIncidencias') rlMapaIncidencias: RouterLinkActive | undefined;
  @ViewChild('rlSeguimientoVoto') rlSeguimientoVoto: RouterLinkActive | undefined;
  @ViewChild('rlResultados') rlResultados: RouterLinkActive | undefined;
  @ViewChild('rlReportes') rlReportes: RouterLinkActive | undefined;
  @ViewChild('rlNubePalabras') rlNubePalabras: RouterLinkActive | undefined;
  @ViewChild('rlCandidatos') rlCandidatos: RouterLinkActive | undefined;
  @ViewChild('rlMapaPromovidos') rlMapaPromovidos: RouterLinkActive | undefined;
  @ViewChild('rlOperadores') rlOperadores: RouterLinkActive | undefined;
  @ViewChild('rlPromotores') rlPromotores: RouterLinkActive | undefined;
  @ViewChild('rlPromovidos') rlPromovidos: RouterLinkActive | undefined;

  dataObject!: AppUserAuth | null;


  constructor(private securityService: SecurityService, private cdr: ChangeDetectorRef) {
    localStorage.getItem('dataObject') && this.setDataUser();
  }

  setDataUser() {
    this.dataObject = this.securityService.getDataUser();
  }

  ngAfterViewInit() {
    this.cdr.detectChanges(); // forzar un ciclo de detección de cambios después de la vista inicial
  }


}
