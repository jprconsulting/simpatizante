import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DistribucionCandidaturaComponent } from './distribucion-candidatura.component';
import { AuthGuard } from 'src/app/core/services/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: DistribucionCandidaturaComponent,
    canActivate: [AuthGuard],
    data: { claimType: 'CanAccessDistribucionCandidaturas' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DistribucionCandidaturaRoutingModule {}
