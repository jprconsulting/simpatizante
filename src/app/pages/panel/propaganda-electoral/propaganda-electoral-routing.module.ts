import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PropagandaElectoralComponent } from './propaganda-electoral.component';

const routes: Routes = [
  {
    path: '',
    component: PropagandaElectoralComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PropagandaElectoralRoutingModule { }
