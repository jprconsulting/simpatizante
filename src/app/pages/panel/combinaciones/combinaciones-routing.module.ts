import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CombinacionesComponent } from './combinaciones.component';

const routes: Routes = [
  {
    path: '',
    component: CombinacionesComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CombinacionesRoutingModule { }
