import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PanelComponent } from './panel.component';

const routes: Routes = [
  {
    path: '', component: PanelComponent,
    children: [
      {
        path: '', redirectTo: 'inicio', pathMatch: 'full'
      },
      {
        path: 'inicio',
        loadChildren: () => import('./inicio/inicio.module')
          .then(i => i.InicioModule)
      },
      {
        path: 'areas-adscripcion',
        loadChildren: () => import('./areas-adscripcion/areas-adscripcion.module')
          .then(i => i.AreasAdscripcionModule)
      },
      {
        path: 'beneficiarios',
        loadChildren: () => import('./beneficiarios/beneficiarios.module')
          .then(i => i.BeneficiariosModule)
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.module')
          .then(i => i.DashboardModule)
      },
      {
        path: 'mapa-beneficiarios',
        loadChildren: () => import('./mapa-beneficiarios/mapa-beneficiarios.module')
          .then(i => i.MapaBeneficiariosModule)
      },
      {
        path: 'mapa-programas-sociales',
        loadChildren: () => import('./mapa-programas-sociales/mapa-programas-sociales.module')
          .then(i => i.MapaProgramasSocialesModule)
      },
      {
        path: 'nube-palabras',
        loadChildren: () => import('./nube-palabras/nube-palabras.module')
          .then(i => i.NubePalabrasModule)
      },
      {
        path: 'programas-sociales',
        loadChildren: () => import('./programas-sociales/programas-sociales.module')
          .then(i => i.ProgramasSocialesModule)
      },
      {
        path: 'usuarios',
        loadChildren: () => import('./usuarios/usuarios.module')
          .then(i => i.UsuariosModule)
      },
      {
        path: 'visitas',
        loadChildren: () => import('./visitas/visitas.module')
          .then(i => i.VisitasModule)
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PanelRoutingModule { }
