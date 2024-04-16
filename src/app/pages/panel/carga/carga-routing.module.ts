import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CargaComponent } from './carga.component';
import { AuthGuard } from 'src/app/core/services/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: CargaComponent,
    canActivate: [AuthGuard],
    data: { claimType: 'CanAccessCarga' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CargaRoutingModule {}
