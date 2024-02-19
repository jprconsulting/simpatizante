import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PromotorComponent } from './promotor.component';
import { AuthGuard } from 'src/app/core/services/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: PromotorComponent,
    canActivate: [AuthGuard], data: { claimType: 'CanAccessPromotores'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PromotorRoutingModule { }
