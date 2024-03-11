import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PropagandaElectoralComponent } from './propaganda-electoral.component';
import { AuthGuard } from 'src/app/core/services/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: PropagandaElectoralComponent,
    canActivate: [AuthGuard], data: { claimType: 'CanAccessPropaganda'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PropagandaElectoralRoutingModule { }
