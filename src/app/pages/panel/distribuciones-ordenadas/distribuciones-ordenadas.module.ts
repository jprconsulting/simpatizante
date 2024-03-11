import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DistribucionesOrdenadasRoutingModule } from './distribuciones-ordenadas-routing.module';
import { DistribucionesOrdenadasComponent } from './distribuciones-ordenadas.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { NgxGpAutocompleteModule } from '@angular-magic/ngx-gp-autocomplete';

@NgModule({
  declarations: [
    DistribucionesOrdenadasComponent
  ],
  imports: [
    CommonModule,
    DistribucionesOrdenadasRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgxSpinnerModule,
    NgxPaginationModule,
    NgSelectModule,
    NgxGpAutocompleteModule
  ]
})
export class DistribucionesOrdenadasModule { }
