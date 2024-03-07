import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CombinacionesComponent } from './combinaciones.component';
import { AuthGuard } from 'src/app/core/services/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: CombinacionesComponent,
    canActivate: [AuthGuard], data: { claimType: 'CanAccessCombinaciones'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CombinacionesRoutingModule { }
