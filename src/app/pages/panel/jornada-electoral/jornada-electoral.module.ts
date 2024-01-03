import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JornadaElectoralComponent } from './jornada-electoral.component';
import { JornadaElectoralRoutingModule } from './jornada-electoral-routing.module';



@NgModule({
  declarations: [
    JornadaElectoralComponent
  ],
  imports: [
    CommonModule,
    JornadaElectoralRoutingModule
  ]
})
export class JornadaElectoralModule { }
