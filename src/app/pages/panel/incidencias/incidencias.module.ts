import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncidenciasComponent } from './incidencias.component';
import { IncidenciasRoutingModule } from './incidencias-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxGpAutocompleteModule } from '@angular-magic/ngx-gp-autocomplete';



@NgModule({
  declarations: [
    IncidenciasComponent
  ],
  imports: [
    CommonModule,
    IncidenciasRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgxSpinnerModule,
    NgxPaginationModule,
    NgSelectModule,
    NgxGpAutocompleteModule
  ]
})
export class IncidenciasModule { }
