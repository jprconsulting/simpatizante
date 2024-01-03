import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CandidatosRoutingModule } from './candidatos-routing.module';
import { CandidatosComponent } from './candidatos.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from 'src/app/shared/shared.module';



@NgModule({
  declarations: [
    CandidatosComponent
  ],
  imports: [
    CommonModule,
    CandidatosRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    NgxSpinnerModule,
    NgxPaginationModule,
    NgSelectModule,
    SharedModule
  ]
})
export class CandidatosModule { }
