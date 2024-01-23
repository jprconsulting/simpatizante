import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapaSimpatizantesComponent } from './mapa-simpatizantes.component';
import { MapaSimpatizantesRoutingModule } from './mapa-simpatizantes-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxGpAutocompleteModule } from '@angular-magic/ngx-gp-autocomplete';



@NgModule({
  declarations: [
    MapaSimpatizantesComponent
  ],
  imports: [
    CommonModule,
    MapaSimpatizantesRoutingModule,
    NgxSpinnerModule,
    NgxPaginationModule,
    NgSelectModule,
    NgxGpAutocompleteModule,
    SharedModule
  ]
})
export class MapaSimpatizantesModule { }
