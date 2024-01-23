import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapaIncidenciasRoutingModule } from './mapa-incidencias-routing.module';
import { MapaIncidenciasComponent } from './mapa-incidencias.component';



@NgModule({
  declarations: [
    MapaIncidenciasComponent
  ],
  imports: [
    CommonModule,
    MapaIncidenciasRoutingModule
  ]
})
export class MapaIncidenciasModule { }
