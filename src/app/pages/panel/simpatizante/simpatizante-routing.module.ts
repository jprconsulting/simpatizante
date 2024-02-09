import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SimpatizanteComponent } from './simpatizante.component';
import { AuthGuard } from 'src/app/core/services/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: SimpatizanteComponent,
    canActivate: [AuthGuard], data: { claimType: 'CanAccessSimpatizantes'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SimpatizanteRoutingModule { }
