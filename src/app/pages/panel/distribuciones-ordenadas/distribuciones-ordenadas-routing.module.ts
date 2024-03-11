import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DistribucionesOrdenadasComponent } from './distribuciones-ordenadas.component';
import { AuthGuard } from 'src/app/core/services/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: DistribucionesOrdenadasComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DistribucionesOrdenadasRoutingModule { }
