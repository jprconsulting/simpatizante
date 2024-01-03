import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProgramasSocialesRoutingModule } from './programas-sociales-routing.module';
import { ProgramasSocialesComponent } from './programas-sociales.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';


@NgModule({
  declarations: [
    ProgramasSocialesComponent
  ],
  imports: [
    CommonModule,
    ProgramasSocialesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgxSpinnerModule,
    NgxPaginationModule,
    NgSelectModule,
  ]
})
export class ProgramasSocialesModule { }
