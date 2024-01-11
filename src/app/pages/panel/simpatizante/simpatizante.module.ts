import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimpatizanteRoutingModule } from './simpatizante-routing.module';
import { SimpatizanteComponent} from './simpatizante.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxGpAutocompleteModule } from '@angular-magic/ngx-gp-autocomplete';


@NgModule({
  declarations: [
    SimpatizanteComponent
  ],
  imports: [
    CommonModule,
    SimpatizanteRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgxSpinnerModule,
    NgxPaginationModule,
    NgSelectModule,
    NgxGpAutocompleteModule
  ],

})
export class SimpatizanteModule { }
