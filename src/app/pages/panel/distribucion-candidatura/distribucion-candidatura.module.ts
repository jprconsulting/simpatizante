import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DistribucionCandidaturaRoutingModule } from './distribucion-candidatura-routing.module';
import { DistribucionCandidaturaComponent } from './distribucion-candidatura.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [DistribucionCandidaturaComponent],
  imports: [
    CommonModule,
    DistribucionCandidaturaRoutingModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    NgxPaginationModule,
    NgSelectModule,
    SharedModule,
    FormsModule,
  ],
})
export class DistribucionCandidaturaModule {}
