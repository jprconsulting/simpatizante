import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/services/auth.guard';
import { MapaSimpatizantesComponent } from './mapa-simpatizantes.component';

const routes: Routes = [
  {
    path: '',
    component: MapaSimpatizantesComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MapaSimpatizantesRoutingModule { }
