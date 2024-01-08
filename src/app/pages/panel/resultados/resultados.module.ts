import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResultadosComponent } from './resultados.component';
import { ResultadosRoutingModule } from './resultados-routing.module';
import { SharedModule } from "../../../shared/shared.module";
import { ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';



@NgModule({
    declarations: [
        ResultadosComponent
    ],
    imports: [
        CommonModule,
        ResultadosRoutingModule,
        ReactiveFormsModule,
        NgxSpinnerModule,
        NgxPaginationModule,
        NgSelectModule,
        SharedModule
    ]
})
export class ResultadosModule { }
