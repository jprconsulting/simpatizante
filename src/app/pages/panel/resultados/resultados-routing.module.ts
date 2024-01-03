import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ResultadosComponent } from './resultados.component';
import { AuthGuard } from 'src/app/core/services/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: ResultadosComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResultadosRoutingModule { }
