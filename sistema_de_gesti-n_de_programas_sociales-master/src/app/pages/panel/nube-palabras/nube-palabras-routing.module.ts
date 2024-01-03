import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NubePalabrasComponent } from './nube-palabras.component';
import { AuthGuard } from 'src/app/core/services/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: NubePalabrasComponent,
    canActivate: [AuthGuard], data: { claimType: 'CanAccessNubePalabras'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NubePalabrasRoutingModule { }
