import { Component } from '@angular/core';
import { AppUserAuth } from 'src/app/models/login';
import { SecurityService } from 'src/app/core/services/security.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent {

  dataObject!: AppUserAuth | null;
  constructor(
    private securityService: SecurityService
    ) {
    localStorage.getItem('dataObject') && this.setDataUser();
  }

  setDataUser() {
    this.dataObject = this.securityService.getDataUser();
  }

}

