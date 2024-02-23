import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { SecurityService } from 'src/app/core/services/security.service';
import { AppUser } from 'src/app/models/login';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  formUserLogin!: FormGroup;
  user!: AppUser;
  returnUrl = 'panel/inicio';

  constructor(
    private securityService: SecurityService,
    private router: Router,
    private formBuilder: FormBuilder,
    private spinnerService: NgxSpinnerService,
    private mensajeService: MensajeService
  ) {}

  ngOnInit(): void {
    this.createFormUserLogin();
  }

  login() {
    localStorage.removeItem('dataObject');
    localStorage.removeItem('bearerToken');
    this.user = this.formUserLogin.value as AppUser;
    this.spinnerService.show();
    this.securityService.login(this.user).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (error: string) => {
        this.mensajeService.mensajeError(error);
        this.spinnerService.hide();
      },
    });
  }

  createFormUserLogin() {
    this.formUserLogin = this.formBuilder.group({
      email: [
        'admin@gmail.com',
        Validators.compose([Validators.required, Validators.minLength(3)]),
      ],
      password: [
        '123',
        Validators.compose([Validators.required, Validators.minLength(3)]),
      ],
    });
  }
}
