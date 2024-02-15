import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'src/app/shared/shared.module';
import { EnlaceRoutingModule } from './enlace-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { EnlaceComponent } from './enlace.component';


@NgModule({
  declarations: [
    EnlaceComponent
  ],
  imports: [
    CommonModule,
    EnlaceRoutingModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    NgxPaginationModule,
    NgSelectModule,
    SharedModule
  ]
})
export class EnlaceModule { }
