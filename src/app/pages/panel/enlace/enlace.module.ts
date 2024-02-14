import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EnlaceRoutingModule } from './enlace-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgSelectModule } from '@ng-select/ng-select';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    EnlaceRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    NgSelectModule
  ]
})
export class EnlaceModule { }
