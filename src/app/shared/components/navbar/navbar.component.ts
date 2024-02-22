import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SecurityService } from 'src/app/core/services/security.service';
import { AppUserAuth } from 'src/app/models/login';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  dataObject!: AppUserAuth | null;

  constructor(
    private securityService: SecurityService,
    private router: Router
  ) {
    localStorage.getItem('dataObject') && this.setDataUser();
  }

  setDataUser() {
    this.dataObject = this.securityService.getDataUser();
  }

  logout() {
    if (this.dataObject && this.dataObject.usuarioId) {
      this.securityService.logout(this.dataObject.usuarioId).subscribe(() => {
        this.router.navigateByUrl('');
      });
    } else {
    }
  }
}
