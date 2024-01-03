import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapaProgramasSocialesComponent } from './mapa-programas-sociales.component';
import { AuthGuard } from 'src/app/core/services/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: MapaProgramasSocialesComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MapaProgramasSocialesRoutingModule { }
