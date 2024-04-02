import { AfterViewInit, Component } from '@angular/core';
import * as Highcharts from 'highcharts';
import Histogram from 'highcharts/modules/histogram-bellcurve';
import { CandidatosService } from 'src/app/core/services/candidatos.service';
import { Candidato } from 'src/app/models/candidato';
import { GeneralWordCloud } from 'src/app/models/word-cloud';

import NoDataToDisplay from 'highcharts/modules/no-data-to-display';
import { DashboardService } from 'src/app/core/services/dashboard.service';
import { Seccion } from 'src/app/models/seccion';
import { SeccionService } from 'src/app/core/services/seccion.service';
import { SecurityService } from 'src/app/core/services/security.service';
import { AppUserAuth } from 'src/app/models/login';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RolesBD } from 'src/app/global/global';

NoDataToDisplay(Highcharts);
declare var require: any;
const More = require('highcharts/highcharts-more');
More(Highcharts);
Histogram(Highcharts);
const Accessibility = require('highcharts/modules/accessibility');
Accessibility(Highcharts);
const Wordcloud = require('highcharts/modules/wordcloud');
Wordcloud(Highcharts);

@Component({
  selector: 'app-nube-palabras',
  templateUrl: './nube-palabras.component.html',
  styleUrls: ['./nube-palabras.component.css'],
})
export class NubePalabrasComponent implements AfterViewInit {
  generalWordCloud!: GeneralWordCloud;
  options: Highcharts.Options = {};
  candidato: Candidato[] = [];
  seccion: Seccion[] = [];
  currentUser!: AppUserAuth | null;
  mapaForm!: FormGroup;
  candidatoId = 0;
  readonlySelectCandidato = true;

  constructor(
    private dashboardService: DashboardService,
    private candidatoService: CandidatosService,
    private seccionService: SeccionService,
    private securityService: SecurityService,
    private formBuilder: FormBuilder
  ) {
    this.currentUser = securityService.getDataUser();
    if (this.currentUser?.rolId === RolesBD.candidato) {
      this.candidatoId = this.currentUser?.candidatoId;
    }

    this.getWordCloud();
    this.getMunicipios();
    this.getMunicipios2();
    this.creteForm();
    this.readonlySelectCandidato =
      this.currentUser?.rolId !== RolesBD.administrador;
    if (this.currentUser?.rolId === RolesBD.candidato) {
      this.mapaForm.controls['candidatoId'].setValue(this.candidatoId);
    }
  }

  ngAfterViewInit() {
    this.setSettingsWordCloud();
  }
  creteForm() {
    this.mapaForm = this.formBuilder.group({
      candidatoId: [],
    });
  }
  onClear() {
    this.dashboardService.updateWordCloud(
      this.generalWordCloud.generalWordCloud
    );
  }

  getMunicipios() {
    this.candidatoService
      .getAll()
      .subscribe({ next: (dataFromAPI) => (this.candidato = dataFromAPI) });
  }
  getMunicipios2() {
    this.seccionService
      .getAll()
      .subscribe({ next: (dataFromAPI) => (this.seccion = dataFromAPI) });
  }

  getWordCloud() {
    this.dashboardService.getWordCloud().subscribe({
      next: (dataFromAPI) => {
        this.generalWordCloud = dataFromAPI;
        this.dashboardService.updateWordCloud(dataFromAPI.generalWordCloud);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  setSettingsWordCloud() {
    this.dashboardService.dataWordCloud$.subscribe((newData) => {
      this.options = {
        series: [
          {
            rotation: {
              from: -60,
              to: 60,
              orientations: 5,
            },
            type: 'wordcloud',
            data: newData,
          },
        ],
        title: {
          text: '',
        },
        lang: {
          noData: '<h2 class="page-title">Sin datos</h2>',
        },
        tooltip: {
          useHTML: true,
          padding: 0,
          borderRadius: 0,
          borderWidth: 0,
          shadow: false,
          backgroundColor: 'none',
          borderColor: 'none',
          headerFormat: '',
          followPointer: false,
          stickOnContact: false,
          shared: false,
          pointFormat: `
                        <div
                        style="
                            width: 220px;
                            height: 70px;
                            background: #ffffff;
                            box-shadow: 0px 0px 12px 2px rgba(0, 0, 0, 0.4);
                            border-radius: 10px;
                            opacity: 25;
                        "
                        >
                            <div
                                style="width: 5px; height: 100%; box-sizing: border-box; float: left; background-color: {point.color}; border-radius: 10px 0px 0px 10px;"
                            ></div>
                            <div
                                style="
                                padding: 5px;
                                float: left;
                                box-sizing: border-box;
                                width: 200px;
                                height: 60px;
                                background: #ffffff;
                                border-radius: 0px 0px 10px 0px;
                                "
                            >
                                <div class="d-flex flex-row">
                                <span class="px14 text-muted" style="font-size: 17px"
                                    >Veces que se repite</span
                                >
                                </div>
                                <span
                                class="px15 align-self-center"
                                style="width: 60%; font-size: 19px; font-weight: bolder"
                                >{point.weight}</span
                                >
                                <br /><br />
                            </div>
                        </div>
                    `,
        },
        subtitle: {
          text: '',
        },
        credits: {
          enabled: false,
        },
      };
      Highcharts.chart('container', this.options);
    });
  }

  onSelectCandidato(id: number) {
    if (id) {
      const wordCloudByCandidato =
        this.generalWordCloud.wordCloudPorCandidatos.find((i) => i.id === id);
      if (wordCloudByCandidato) {
        this.dashboardService.updateWordCloud(wordCloudByCandidato.wordCloud);
        this.setSettingsWordCloud();
      }
    }
  }

  onSelectSeccion(id: number) {
    if (id) {
      const wordCloudBySeccion =
        this.generalWordCloud.wordCloudPorMunicipios.find((i) => i.id === id);
      if (wordCloudBySeccion) {
        this.dashboardService.updateWordCloud(wordCloudBySeccion.wordCloud);
        this.setSettingsWordCloud();
      }
    }
  }
}
