import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapaIncidenciasRoutingModule } from './mapa-incidencias-routing.module';
import { MapaIncidenciasComponent } from './mapa-incidencias.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxGpAutocompleteModule } from '@angular-magic/ngx-gp-autocomplete';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    MapaIncidenciasComponent
  ],
  imports: [
    CommonModule,
    MapaIncidenciasRoutingModule,
    NgxSpinnerModule,
    NgxPaginationModule,
    NgSelectModule,
    NgxGpAutocompleteModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class MapaIncidenciasModule { }
