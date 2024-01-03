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
  totalGeneral: TotalGeneral = { totalBeneficiarios: 0, totalUsuarios: 0, totalProgramasSociales: 0, totalVisitas: 0 };
  optionsBeneficiariosPorProgramaSocial: Highcharts.Options = {};
  optionsVisitasPorProgramaSocial: Highcharts.Options = {};
  optionsBeneficiariosPorMunicipio: Highcharts.Options = {};
  optionsNubePalabras: Highcharts.Options = {};

  constructor(private dashboardService: DashboardService) {
    this.getTotalBeneficiariosPorProgramaSocial();
    this.getTotalVisitasPorProgramaSocial();
    this.getTotalBeneficiariosPorMunicipio();
    this.getTotalGeneral();
    this.getWordCloud();
  }

  getTotalBeneficiariosPorProgramaSocial() {
    this.dashboardService.getTotalBeneficiariosPorProgramaSocial().subscribe({
        next: (dataFromAPI) => {
            const langConfig = {
                viewFullscreen: "Ver en pantalla completa",
                printChart: "Imprimir gráfica",
                downloadPNG: 'Descargar imagen PNG',
                downloadJPEG: 'Descargar imagen JPEG',
                downloadPDF: 'Descargar en formato PDF',
                downloadSVG: 'Descargar imagen vectorial en SVG',
              };

            this.optionsBeneficiariosPorProgramaSocial = {
                chart: {
                    type: 'pie'
                },
                title: {
                    text: 'Beneficiarios por programa social',
                    align: 'left'
                },
                tooltip: {
                    pointFormat: `
                        {series.name}:
                        <b>{point.percentage:.1f}%</b> <br>
                        Beneficiarios: <b>{point.totalItems}</b>
                    `
                },
                lang: langConfig,
                subtitle: {
                    text: ''
                },
                credits: {
                    enabled: false
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            distance: 20,
                            format: '{point.name}: {point.percentage:.1f}%',
                            style: {
                                fontSize: '0.8rem',
                                textOutline: 'none',
                                opacity: 0.7
                            },
                        },
                    }
                },
                series: [{
                    type: 'pie',
                    name: 'Porcentaje',
                    data: dataFromAPI.map((d) => ({ name: d.nombre, y: d.porcentaje, totalItems: d.totalBeneficiarios }) as PointOptionsWithTotal)
                }]
            };

            Highcharts.chart('container-beneficiarios-por-programa-social', this.optionsBeneficiariosPorProgramaSocial);
        }
    });
}

getTotalVisitasPorProgramaSocial() {
  const container = document.getElementById('container-visitas-por-programa-social');
  if (container) {
    container.style.display = 'none';
  }

  this.dashboardService.getTotalVisitasPorProgramaSocial().subscribe({
    next: (dataFromAPI) => {
      const hasData = dataFromAPI && dataFromAPI.length > 0;

      if (hasData) {
        this.optionsVisitasPorProgramaSocial = {
          chart: {
            type: 'pie',
            renderTo: 'container-visitas-por-programa-social'
          },
          title: {
            text: 'Visitas por programa social',
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
            name: 'Visitas',
            data: dataFromAPI.map((d) => ([d.nombre, d.total]))
          }]
        };

        if (container) {
          container.style.display = 'block';
        }

        Highcharts.chart('container-visitas-por-programa-social', this.optionsVisitasPorProgramaSocial);
      } else {
        if (container) {
          container.innerHTML = '<h2 class="page-title">Sin datos</h2>';
          container.style.display = 'block';
        }
      }
    }
  });
}

getTotalBeneficiariosPorMunicipio() {
  this.dashboardService.getTotalBeneficiariosPorMunicipio().subscribe({
      next: (dataFromAPI) => {
          const langConfig = {
              viewFullscreen: "Ver en pantalla completa",
              printChart: "Imprimir gráfica",
              downloadPNG: 'Descargar imagen PNG',
              downloadJPEG: 'Descargar imagen JPEG',
              downloadPDF: 'Descargar en formato PDF',
              downloadSVG: 'Descargar imagen vectorial en SVG',
          };

          this.optionsBeneficiariosPorMunicipio = {
              chart: {
                  type: 'column'
              },
              title: {
                  text: 'Beneficiarios por municipio',
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
                      text: 'Total de beneficiarios'
                  }
              },
              legend: {
                  enabled: false
              },
              tooltip: {
                  pointFormat: 'Beneficiarios: <b>{point.y:.1f}</b>'
              },
              series: [{
                  type: 'column',
                  name: 'Beneficiarios',
                  colors: [
                      '#9b20d9', '#9215ac', '#861ec9', '#7a17e6', '#7010f9', '#691af3',
                      '#6225ed', '#5b30e7', '#533be1', '#4c46db', '#4551d5', '#3e5ccf',
                      '#3667c9', '#2f72c3', '#277dbd', '#1f88b7', '#1693b1', '#0a9eaa',
                      '#03c69b', '#00f194'
                  ],
                  colorByPoint: true,
                  groupPadding: 0,
                  data: dataFromAPI.map((d) => ([d.nombre, d.total])),
                  dataLabels: {
                      enabled: true,
                      rotation: -90,
                      color: '#FFFFFF',
                      align: 'right',
                      format: '{point.y:.1f}',
                      y: 10,
                      style: {
                          fontSize: '13px',
                          fontFamily: 'Verdana, sans-serif'
                      }
                  }
              }]
          };

          if (!dataFromAPI || dataFromAPI.length === 0) {
              const container = document.getElementById('container-beneficiarios-por-municipio');
              if (container) {
                  container.innerHTML = '<h2 class="page-title">Sin datos</h2>';
              }
          } else {
              Highcharts.chart('container-beneficiarios-por-municipio', this.optionsBeneficiariosPorMunicipio);
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
    Highcharts.chart('container-beneficiarios-por-programa-social', this.optionsBeneficiariosPorProgramaSocial);
    Highcharts.chart('container-visitas-por-programa-social', this.optionsVisitasPorProgramaSocial);
    Highcharts.chart('container-beneficiarios-por-municipio', this.optionsBeneficiariosPorMunicipio);
    Highcharts.chart('container-nube-palabras', this.optionsNubePalabras);
  }



}
