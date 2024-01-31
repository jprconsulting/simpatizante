import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OperadoresComponent } from './operadores.component';
import { AuthGuard } from 'src/app/core/services/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: OperadoresComponent,
    canActivate: [AuthGuard], data: { claimType: 'CanAccessOperadores'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OperadoresRoutingModule { }
