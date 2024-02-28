import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CandidaturasComponent } from './candidaturas.component';

const routes: Routes = [
  {
    path: '',
    component: CandidaturasComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CandidaturasRoutingModule { }
