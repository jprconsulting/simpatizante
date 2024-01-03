import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JornadaElectoralComponent } from './jornada-electoral.component';
import { AuthGuard } from 'src/app/core/services/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: JornadaElectoralComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JornadaElectoralRoutingModule { }
