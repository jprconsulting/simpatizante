import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VotanteComponent } from './votante.component';
import { AuthGuard } from 'src/app/core/services/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: VotanteComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VotanteRoutingModule { }
