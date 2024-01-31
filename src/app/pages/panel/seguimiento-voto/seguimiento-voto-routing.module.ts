import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SeguimientoVotoComponent } from './seguimiento-voto.component';
import { AuthGuard } from 'src/app/core/services/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: SeguimientoVotoComponent,
    canActivate: [AuthGuard], data: { claimType: 'CanAccessSeguimientoVoto'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SeguimientoVotoRoutingModule { }
