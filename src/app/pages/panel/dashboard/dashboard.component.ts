import { AfterViewInit, Component } from '@angular/core';
import * as Highcharts from 'highcharts';
import { DashboardService } from 'src/app/core/services/dashboard.service';
import { TotalGeneral } from 'src/app/models/estadistica';
import HC_exporting from 'highcharts/modules/exporting';
HC_exporting(Highcharts);


interface PointOptionsWithTotal extends Highcharts.PointOptionsObject {
  totalItems: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements AfterViewInit {

  Highcharts: typeof Highcharts = Highcharts;
  totalGeneral: TotalGeneral = { totalSimpatizantes: 0, totalUsuarios: 0, totalCandidatos: 0, totalOperadores: 0, totalVisitas: 0 };
  optionsBeneficiariosPorProgramaSocial: Highcharts.Options = {};
  optionsSimpatizantesPorProgramaSocial: Highcharts.Options = {};
  optionssimpatizantesPoEdad: Highcharts.Options = {};
  optionssimpatizantesPorGenero: Highcharts.Options = { };
  optionsNubePalabras: Highcharts.Options = {};

  constructor(private dashboardService: DashboardService) {

    this.getTotalsimpatizantesPorProgramaSocial();
    this.getTotalSimpatizantesPorEdad();
    this.getTotalGeneral();
    this.getWordCloud();
    this.getSimpatizantesPorGenero();
  }
  getSimpatizantesPorGenero() {
    const container = document.getElementById('container-simpatizantes-por-genero');
    if (container) {
      container.style.display = 'none';
    }

    this.dashboardService.getSimpatizantesPorGenero().subscribe({
      next: (dataFromAPI) => {
        const hasData = dataFromAPI && dataFromAPI.length > 0;

        if (hasData) {
          this.optionssimpatizantesPorGenero = {
            chart: {
              type: 'pie',
              renderTo: 'container-simpatizantes-por-genero'
            },
            title: {
              text: 'Simpatizante por genero',
              align: 'left'
            },
            credits: {
              enabled: false
            },
            subtitle: {
              text: ''
            },
            plotOptions: {
              pie: {
                innerSize: 100,
                depth: 45
              }
            },
            series: [{
              type: 'pie',
              name: ' ',
              data: dataFromAPI.map((d) => ({ name: d.nombre, y: d.totalSinpatizantes })),
            }]
          };

          if (container) {
            container.style.display = 'block';
          }

          Highcharts.chart('container-simpatizantes-por-genero', this.optionssimpatizantesPorGenero); console.log('dnji', this.optionssimpatizantesPorGenero)
        } else {
          if (container) {
            container.innerHTML = '<h2 class="page-title">Sin datos</h2>';
            container.style.display = 'block';
          }
        }
      }
    });
  }


  getTotalsimpatizantesPorProgramaSocial() {
    const container = document.getElementById('container-simpatizantes-por-programa-social');
    if (container) {
      container.style.display = 'none';
    }

    this.dashboardService.getTotalSimpatizantesPorProgramaSocial().subscribe({
      next: (dataFromAPI) => {
        const hasData = dataFromAPI && dataFromAPI.length > 0;

        if (hasData) {
          this.optionsSimpatizantesPorProgramaSocial = {
            chart: {
              type: 'pie',
              renderTo: 'container-simpatizantes-por-programa-social'
            },
            title: {
              text: 'Simpatizantes por programa social',
              align: 'left'
            },
            credits: {
              enabled: false
            },
            subtitle: {
              text: ''
            },
            plotOptions: {
              pie: {
                innerSize: 100,
                depth: 45
              }
            },
            series: [{
              type: 'pie',
              name: ' ',
              data: dataFromAPI.map((d) => ({ name: d.nombre, y: d.totalSinpatizantes }))
            }]
          };

          if (container) {
            container.style.display = 'block';
          }

          Highcharts.chart('container-simpatizantes-por-programa-social', this.optionsSimpatizantesPorProgramaSocial); console.log('dnji', this.optionsSimpatizantesPorProgramaSocial)
        } else {
          if (container) {
            container.innerHTML = '<h2 class="page-title">Sin datos</h2>';
            container.style.display = 'block';
          }
        }
      }
    });
  }

  getTotalSimpatizantesPorEdad() {
    this.dashboardService.getTotalSimpatizantesPorEdad().subscribe({
      next: (dataFromAPI) => {
        const langConfig = {
          viewFullscreen: "Ver en pantalla completa",
          printChart: "Imprimir gráfica",
          downloadPNG: 'Descargar imagen PNG',
          downloadJPEG: 'Descargar imagen JPEG',
          downloadPDF: 'Descargar en formato PDF',
          downloadSVG: 'Descargar imagen vectorial en SVG',
        };

        this.optionssimpatizantesPoEdad = {
          chart: {
            type: 'column'
          },
          title: {
            text: 'Simpatizantes por edad',
            align: 'left'
          },
          subtitle: {
            text: ''
          },
          credits: {
            enabled: false
          },
          lang: langConfig,
          xAxis: {
            type: 'category',
            labels: {
              autoRotation: [-45, -90],
              style: {
                fontSize: '13px',
                fontFamily: 'Verdana, sans-serif'
              }
            }
          },
          yAxis: {
            min: 0,
            title: {
              text: 'Total de Simpatizantes'
            }
          },
          legend: {
            enabled: false
          },
          tooltip: {

          },
          series: [{
            type: 'column',
            name: 'Simpatizantes',
            colors: [
              '#9b20d9', '#9215ac', '#861ec9', '#7a17e6', '#7010f9', '#691af3',
              '#6225ed', '#5b30e7', '#533be1', '#4c46db', '#4551d5', '#3e5ccf',
              '#3667c9', '#2f72c3', '#277dbd', '#1f88b7', '#1693b1', '#0a9eaa',
              '#03c69b', '#00f194'
            ],
            colorByPoint: true,
            groupPadding: 0,
            data: dataFromAPI.map((d) => ({
              name: `${d.rangoEdad} (${d.porcentaje.toFixed(2)}%)`,
              y: d.totalSinpatizantes
            })),
            dataLabels: {
              enabled: true,
              rotation: -90,
              color: '#FFFFFF',
              align: 'right',
              y: 10,
              style: {
                fontSize: '13px',
                fontFamily: 'Verdana, sans-serif'
              }
            }
          }]
        };

        if (!dataFromAPI || dataFromAPI.length === 0) {
          const container = document.getElementById('container-simpatizantes-por-edad');
          if (container) {
            container.innerHTML = '<h2 class="page-title">Sin datos</h2>';
          }
        } else {
          Highcharts.chart('container-simpatizantes-por-edad', this.optionssimpatizantesPoEdad);
        }
      }
    });
  }

  getTotalGeneral() {
    this.dashboardService.getTotalGeneral().subscribe({
      next: (totalFromAPI) => {
        this.totalGeneral = totalFromAPI;
      }
    });
  }

  getWordCloud() {
    this.dashboardService.getWordCloud().subscribe({
      next: (dataFromAPI) => {
        const langConfig = {
          viewFullscreen: "Ver en pantalla completa",
          printChart: "Imprimir gráfica",
          downloadPNG: 'Descargar imagen PNG',
          downloadJPEG: 'Descargar imagen JPEG',
          downloadPDF: 'Descargar en formato PDF',
          downloadSVG: 'Descargar imagen vectorial en SVG',
        };

        Highcharts.setOptions({
          lang: langConfig
        });

        this.optionsNubePalabras = {
          series: [{
            rotation: {
              from: -60,
              to: 60,
              orientations: 5
            },
            type: 'wordcloud',
            data: dataFromAPI.generalWordCloud,
          }],
          title: {
            text: 'Nube de palabras',
            align: 'left'
          },
          lang: {
            noData: '<h2 class="page-title">Sin datos</h2>'
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
                  `
          },
          subtitle: {
            text: ''
          },
          credits: {
            enabled: false
          },
        };
        Highcharts.chart('container-nube-palabras', this.optionsNubePalabras);
      }
    })
  }

  ngAfterViewInit() {
    Highcharts.chart('container-simpatizantes-por-programa-social', this.optionsBeneficiariosPorProgramaSocial);
    Highcharts.chart('container-simpatizantes-por-edad', this.optionssimpatizantesPoEdad);
    Highcharts.chart('container-simpatizantes-por-genero', this.optionssimpatizantesPorGenero);
    Highcharts.chart('container-nube-palabras', this.optionsNubePalabras);
  }



}
