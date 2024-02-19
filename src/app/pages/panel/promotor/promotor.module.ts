import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'src/app/shared/shared.module';
import { PromotorRoutingModule } from './promotor-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { PromotorComponent } from './promotor.component';


@NgModule({
  declarations: [
    PromotorComponent
  ],
  imports: [
    CommonModule,
    PromotorRoutingModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    NgxPaginationModule,
    NgSelectModule,
    SharedModule
  ]
})
export class PromotorModule { }
