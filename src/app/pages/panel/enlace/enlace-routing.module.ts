import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EnlaceComponent } from './enlace.component';
import { AuthGuard } from 'src/app/core/services/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: EnlaceComponent,
    canActivate: [AuthGuard], data: { claimType: 'CanAccessEnlaces'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EnlaceRoutingModule { }
