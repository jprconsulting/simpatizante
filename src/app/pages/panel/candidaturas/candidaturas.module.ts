import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CandidaturasRoutingModule } from './candidaturas-routing.module';
import { CandidaturasComponent } from './candidaturas.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    CandidaturasComponent
  ],
  imports: [
    CommonModule,
    CandidaturasRoutingModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    NgxPaginationModule,
    NgSelectModule,
    SharedModule,
    FormsModule,
   
  ]
})
export class CandidaturasModule { }
