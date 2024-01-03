import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResultadosComponent } from './resultados.component';
import { ResultadosRoutingModule } from './resultados-routing.module';



@NgModule({
  declarations: [
    ResultadosComponent
  ],
  imports: [
    CommonModule,
    ResultadosRoutingModule
  ]
})
export class ResultadosModule { }
