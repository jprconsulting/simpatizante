import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CargaRoutingModule } from './carga-routing.module';
import { CargaComponent } from './carga.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [CargaComponent],
  imports: [
    CommonModule,
    CargaRoutingModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    NgxPaginationModule,
    NgSelectModule,
    SharedModule,
    FormsModule,
  ],
})
export class CargaModule {}
