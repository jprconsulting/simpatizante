import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TipoIncidenciasComponent } from './tipo-incidencia.component';
import { AuthGuard } from 'src/app/core/services/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: TipoIncidenciasComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TipoIncidenciasRoutingModule { }
