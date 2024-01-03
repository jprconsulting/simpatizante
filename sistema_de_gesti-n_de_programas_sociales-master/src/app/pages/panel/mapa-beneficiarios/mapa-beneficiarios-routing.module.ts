import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapaBeneficiariosComponent } from './mapa-beneficiarios.component';
import { AuthGuard } from 'src/app/core/services/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: MapaBeneficiariosComponent,
    canActivate: [AuthGuard], data: { claimType: 'CanAccessMapaBeneficiarios'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MapaBeneficiariosRoutingModule { }
