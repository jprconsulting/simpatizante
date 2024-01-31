import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/services/auth.guard';
import { MapaIncidenciasComponent } from './mapa-incidencias.component';

const routes: Routes = [
  {
    path: '',
    component: MapaIncidenciasComponent,
    canActivate: [AuthGuard], data: { claimType: 'CanAccessMapaIncidencias'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MapaIncidenciasRoutingModule { }
