import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CombinacionesRoutingModule } from './combinaciones-routing.module';
import { CombinacionesComponent } from './combinaciones.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    CombinacionesComponent
  ],
  imports: [
    CommonModule,
    CombinacionesRoutingModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    NgxPaginationModule,
    NgSelectModule,
    SharedModule,
    FormsModule,
  ]
})
export class CombinacionesModule { }
