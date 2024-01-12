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
        path: 'candidatos',
        loadChildren: () => import('./candidatos/candidatos.module')
          .then(i => i.CandidatosModule)
      },
      {
        path: 'operadores',
        loadChildren: () => import('./operadores/operadores.module')
          .then(i => i.OperadoresModule)
      },
      {
        path: 'jornada-electoral',
        loadChildren: () => import('./jornada-electoral/jornada-electoral.module')
          .then(i => i.JornadaElectoralModule)
      },
      {
        path: 'incidencias',
        loadChildren: () => import('./incidencias/incidencias.module')
          .then(i => i.IncidenciasModule)
      },
      {
        path: 'seguimiento-voto',
        loadChildren: () => import('./seguimiento-voto/seguimiento-voto.module')
          .then(i => i.SeguimientoVotoModule)
      },
      {
        path: 'resultados',
        loadChildren: () => import('./resultados/resultados.module')
          .then(i => i.ResultadosModule)
      },
      {
        path: 'reportes',
        loadChildren: () => import('./reportes/reportes.module')
          .then(i => i.ReportesModule)
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
      {
        path: 'simpatizantes',
        loadChildren: () => import('./simpatizante/simpatizante.module')
          .then(i => i.SimpatizanteModule)
      },
      {
        path: 'programas-sociales',
        loadChildren: () => import('./programas-sociales/programas-sociales.module')
          .then(i => i.ProgramasSocialesModule)
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PanelRoutingModule { }
