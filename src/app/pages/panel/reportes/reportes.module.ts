import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportesComponent } from './reportes.component';
import { ReportesRoutingModule } from './reportes-routing.module';



@NgModule({
  declarations: [
    ReportesComponent
  ],
  imports: [
    CommonModule,
    ReportesRoutingModule
  ]
})
export class ReportesModule { }
