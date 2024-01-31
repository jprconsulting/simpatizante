import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VisitasComponent } from './visitas.component';
import { AuthGuard } from 'src/app/core/services/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: VisitasComponent,
    canActivate: [AuthGuard], data: { claimType: 'CanAccessVisitas'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VisitasRoutingModule { }
