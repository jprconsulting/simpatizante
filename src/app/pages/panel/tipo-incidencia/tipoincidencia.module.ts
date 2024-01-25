import { TipoIncidenciasComponent } from './tipo-incidencia.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TipoIncidencia } from 'src/app/models/tipoIncidencias';
import { TipoIncidenciasRoutingModule } from './tipo-incidencias-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxGpAutocompleteModule } from '@angular-magic/ngx-gp-autocomplete';


@NgModule({
  declarations: [
    TipoIncidenciasComponent
  ],
  imports: [
    CommonModule,
    TipoIncidenciasRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgxSpinnerModule,
    NgxPaginationModule,
    NgSelectModule,
    NgxGpAutocompleteModule
  ]
})
export class tipoIncidenciasModule { }
