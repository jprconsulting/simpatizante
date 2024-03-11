import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapaPropagandaComponent } from './mapa-propaganda.component';
import { MapaPropagandaRoutingModule } from './mapa-propaganda-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxGpAutocompleteModule } from '@angular-magic/ngx-gp-autocomplete';

@NgModule({
  declarations: [MapaPropagandaComponent],
  imports: [
    CommonModule,
    MapaPropagandaRoutingModule,
    NgxSpinnerModule,
    NgxPaginationModule,
    NgSelectModule,
    NgxGpAutocompleteModule,
    SharedModule,
  ],
})
export class MapaPropagandaModule {}
