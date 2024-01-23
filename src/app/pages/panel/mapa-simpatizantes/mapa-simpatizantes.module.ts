import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapaSimpatizantesComponent } from './mapa-simpatizantes.component';
import { MapaSimpatizantesRoutingModule } from './mapa-simpatizantes-routing.module';



@NgModule({
  declarations: [
    MapaSimpatizantesComponent
  ],
  imports: [
    CommonModule,
    MapaSimpatizantesRoutingModule
  ]
})
export class MapaSimpatizantesModule { }
