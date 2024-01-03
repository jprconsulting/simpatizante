import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AreasAdscripcionRoutingModule } from './areas-adscripcion-routing.module';
import { AreasAdscripcionComponent } from './areas-adscripcion.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    AreasAdscripcionComponent
  ],
  imports: [
    CommonModule,
    AreasAdscripcionRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    NgxSpinnerModule,
    NgxPaginationModule,
    NgSelectModule,
  ]
})
export class AreasAdscripcionModule { }
