import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingStates } from 'src/app/global/global';
import { AreaAdscripcion } from 'src/app/models/area-adscripcion';
import { ProgramaSocial } from 'src/app/models/programa-social';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { AreasAdscripcionService } from 'src/app/core/services/areas-adscripcion.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-programas-sociales',
  templateUrl: './programas-sociales.component.html',
  styleUrls: ['./programas-sociales.component.css']
})
export class ProgramasSocialesComponent {


}

