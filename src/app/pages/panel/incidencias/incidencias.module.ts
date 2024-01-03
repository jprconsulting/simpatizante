import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncidenciasComponent } from './incidencias.component';
import { IncidenciasRoutingModule } from './incidencias-routing.module';



@NgModule({
  declarations: [
    IncidenciasComponent
  ],
  imports: [
    CommonModule,
    IncidenciasRoutingModule
  ]
})
export class IncidenciasModule { }
