import { Component } from '@angular/core';
import { SecurityService } from 'src/app/core/services/security.service';
import { AppUserAuth } from 'src/app/models/login';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  dataObject!: AppUserAuth | null;

  constructor(private securityService: SecurityService) {
    localStorage.getItem('dataObject') && this.setDataUser();
  }

  setDataUser() {
    this.dataObject = this.securityService.getDataUser();
  }
}
