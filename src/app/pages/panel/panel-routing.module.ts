import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PanelComponent } from './panel.component';
import { IncidenciasModule } from './incidencias/incidencias.module';

const routes: Routes = [
  {
    path: '',
    component: PanelComponent,
    children: [
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full',
      },
      {
        path: 'inicio',
        loadChildren: () =>
          import('./inicio/inicio.module').then((i) => i.InicioModule),
      },
      {
        path: 'candidatos',
        loadChildren: () =>
          import('./candidatos/candidatos.module').then(
            (i) => i.CandidatosModule
          ),
      },
      {
        path: 'operadores',
        loadChildren: () =>
          import('./operadores/operadores.module').then(
            (i) => i.OperadoresModule
          ),
      },
      {
        path: 'promotores',
        loadChildren: () =>
          import('./promotor/promotor.module').then((i) => i.PromotorModule),
      },
      {
        path: 'incidencias',
        loadChildren: () =>
          import('./incidencias/incidencias.module').then(
            (i) => i.IncidenciasModule
          ),
      },
      {
        path: 'seguimiento-voto',
        loadChildren: () =>
          import('./seguimiento-voto/seguimiento-voto.module').then(
            (i) => i.SeguimientoVotoModule
          ),
      },
      {
        path: 'resultados',
        loadChildren: () =>
          import('./resultados/resultados.module').then(
            (i) => i.ResultadosModule
          ),
      },
      {
        path: 'reportes',
        loadChildren: () =>
          import('./reportes/reportes.module').then((i) => i.ReportesModule),
      },
      {
        path: 'usuarios',
        loadChildren: () =>
          import('./usuarios/usuarios.module').then((i) => i.UsuariosModule),
      },
      {
        path: 'visitas',
        loadChildren: () =>
          import('./visitas/visitas.module').then((i) => i.VisitasModule),
      },
      {
        path: 'promovidos',
        loadChildren: () =>
          import('./simpatizante/simpatizante.module').then(
            (i) => i.SimpatizanteModule
          ),
      },
      {
        path: 'tipos-incidencias',
        loadChildren: () =>
          import('./tipo-incidencia/tipo-incidencia.module').then(
            (i) => i.tipoIncidenciasModule
          ),
      },
      {
        path: 'programas-sociales',
        loadChildren: () =>
          import('./programas-sociales/programas-sociales.module').then(
            (i) => i.ProgramasSocialesModule
          ),
      },
      {
        path: 'nube-palabras',
        loadChildren: () =>
          import('./nube-palabras/nube-palabras.module').then(
            (i) => i.NubePalabrasModule
          ),
      },
      {
        path: 'mapa-promovidos',
        loadChildren: () =>
          import('./mapa-simpatizantes/mapa-simpatizantes.module').then(
            (i) => i.MapaSimpatizantesModule
          ),
      },
      {
        path: 'mapa-incidencias',
        loadChildren: () =>
          import('./mapa-incidencias/mapa-incidencias.module').then(
            (i) => i.MapaIncidenciasModule
          ),
      },
      {
        path: 'mapa-propaganda',
        loadChildren: () =>
          import('./mapa-propaganda/mapa-propaganda.module').then(
            (i) => i.MapaPropagandaModule
          ),
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./dashboard/dashboard.module').then((i) => i.DashboardModule),
      },
      {
        path: 'Candidaturas',
        loadChildren: () =>
          import('./candidaturas/candidaturas.module').then(
            (i) => i.CandidaturasModule
          ),
      },
      {
        path: 'distribucion-candidatura',
        loadChildren: () =>
          import(
            './distribucion-candidatura/distribucion-candidatura.module'
          ).then((i) => i.DistribucionCandidaturaModule),
      },
      {
        path: 'Combinaciones',
        loadChildren: () =>
          import('./combinaciones/combinaciones.module').then(
            (i) => i.CombinacionesModule
          ),
      },
      {
        path: 'Propaganda-Electoral',
        loadChildren: () =>
          import('./propaganda-electoral/propaganda-electoral.module').then(
            (i) => i.PropagandaElectoralModule
          ),
      },
      {
        path: 'Distribuciones-Ordenadas',
        loadChildren: () =>
          import(
            './distribuciones-ordenadas/distribuciones-ordenadas.module'
          ).then((i) => i.DistribucionesOrdenadasModule),
      },
      {
        path: 'carga',
        loadChildren: () =>
          import('./carga/carga.module').then((i) => i.CargaModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PanelRoutingModule {}
