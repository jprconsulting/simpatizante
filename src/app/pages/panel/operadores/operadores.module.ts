import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { OperadoresComponent } from './operadores.component';
import { OperadoresRoutingModule } from './operadores-routing.module';



@NgModule({
  declarations: [
    OperadoresComponent
  ],
  imports: [
    CommonModule,
    OperadoresRoutingModule,
    SharedModule
  ]
})
export class OperadoresModule { }
