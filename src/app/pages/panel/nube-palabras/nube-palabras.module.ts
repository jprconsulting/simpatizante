import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NubePalabrasRoutingModule } from './nube-palabras-routing.module';
import { NubePalabrasComponent } from './nube-palabras.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxGpAutocompleteModule } from '@angular-magic/ngx-gp-autocomplete';


@NgModule({
  declarations: [
    NubePalabrasComponent
  ],
  imports: [
    CommonModule,
    NubePalabrasRoutingModule,
    SharedModule,
    NgxSpinnerModule,
    NgxPaginationModule,
    NgSelectModule,
    NgxGpAutocompleteModule
  ]
})
export class NubePalabrasModule { }
