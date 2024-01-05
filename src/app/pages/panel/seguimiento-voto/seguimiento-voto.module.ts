import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeguimientoVotoComponent } from './seguimiento-voto.component';
import { SeguimientoVotoRoutingModule } from './seguimiento-voto-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from "../../../shared/shared.module";



@NgModule({
    declarations: [
        SeguimientoVotoComponent
    ],
    imports: [
        CommonModule,
        SeguimientoVotoRoutingModule,
        ReactiveFormsModule,
        NgxSpinnerModule,
        NgxPaginationModule,
        NgSelectModule,
        SharedModule
    ]
})
export class SeguimientoVotoModule { }
