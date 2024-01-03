import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProgramasSocialesComponent } from './programas-sociales.component';
import { AuthGuard } from 'src/app/core/services/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: ProgramasSocialesComponent,
    canActivate: [AuthGuard], data: { claimType: 'CanAccessProgramasSociales'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProgramasSocialesRoutingModule { }
