import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/services/auth.guard';
import { MapaPropagandaComponent } from './mapa-propaganda.component';

const routes: Routes = [
  {
    path: '',
    component: MapaPropagandaComponent,
    canActivate: [AuthGuard],
    data: { claimType: 'CanAccessMapaPropaganda' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MapaPropagandaRoutingModule {}
