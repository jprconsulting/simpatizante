import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MapaBeneficiariosRoutingModule } from './mapa-beneficiarios-routing.module';
import { MapaBeneficiariosComponent } from './mapa-beneficiarios.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxGpAutocompleteModule } from '@angular-magic/ngx-gp-autocomplete';
import { SharedModule } from "../../../shared/shared.module";


@NgModule({
    declarations: [
        MapaBeneficiariosComponent
    ],
    imports: [
        CommonModule,
        MapaBeneficiariosRoutingModule,
        NgxSpinnerModule,
        NgxPaginationModule,
        NgSelectModule,
        NgxGpAutocompleteModule,
        SharedModule
    ]
})
export class MapaBeneficiariosModule { }
