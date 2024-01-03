import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MapaProgramasSocialesRoutingModule } from './mapa-programas-sociales-routing.module';
import { MapaProgramasSocialesComponent } from './mapa-programas-sociales.component';
import { HighchartsChartModule } from 'highcharts-angular';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';


@NgModule({
  declarations: [
    MapaProgramasSocialesComponent
  ],
  imports: [
    CommonModule,
    MapaProgramasSocialesRoutingModule,
    HighchartsChartModule,
    SharedModule,
    NgxPaginationModule,
    NgSelectModule,
  ]
})
export class MapaProgramasSocialesModule { }
