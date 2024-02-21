import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { OperadoresComponent } from './operadores.component';
import { OperadoresRoutingModule } from './operadores-routing.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    OperadoresComponent
  ],
  imports: [
    CommonModule,
    OperadoresRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    NgxPaginationModule,
    NgSelectModule,
    FormsModule
  ]
})
export class OperadoresModule { }
