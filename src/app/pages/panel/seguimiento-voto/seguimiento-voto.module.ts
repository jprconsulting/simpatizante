import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeguimientoVotoComponent } from './seguimiento-voto.component';
import { SeguimientoVotoRoutingModule } from './seguimiento-voto-routing.module';



@NgModule({
  declarations: [
    SeguimientoVotoComponent
  ],
  imports: [
    CommonModule,
    SeguimientoVotoRoutingModule
  ]
})
export class SeguimientoVotoModule { }
