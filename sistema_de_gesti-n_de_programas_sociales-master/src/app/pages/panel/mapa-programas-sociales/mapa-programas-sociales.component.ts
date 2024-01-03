import { Component, Inject } from '@angular/core';
import { BeneficiariosService } from 'src/app/core/services/beneficiarios.service';
import { TotalBeneficiariosMunicipio } from 'src/app/models/beneficiario';
import { MapData } from './map-data';
import * as Highcharts from 'highcharts';
import MapModule from 'highcharts/modules/map';
import { LoadingStates } from 'src/app/global/global';
import { PaginationInstance } from 'ngx-pagination';
MapModule(Highcharts);

@Component({
  selector: 'app-mapa-programas-sociales',
  templateUrl: './mapa-programas-sociales.component.html',
  styleUrls: ['./mapa-programas-sociales.component.css']
})
export class MapaProgramasSocialesComponent {

  totalesPorMunicipio: TotalBeneficiariosMunicipio[] = [];
  totalesPorMunicipioFilter: TotalBeneficiariosMunicipio[] = [];
  isLoading = LoadingStates.neutro;

  // Highcharts
  dataMapaTlaxcala = MapData;
  chartMap: Highcharts.Options = {};
  Highcharts: typeof Highcharts = Highcharts;


  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    private beneficiariosService: BeneficiariosService,
  ) {
    this.setSettingsMapa();
    this.getTotalBeneficiariosPorMunicipio();
  }

  getTotalBeneficiariosPorMunicipio() {
    this.isLoading = LoadingStates.trueLoading;
    this.beneficiariosService.getTotalBeneficiariosPorMunicipio().subscribe({
      next: (dataFromAPI) => {
        this.beneficiariosService.updateDataMapa(dataFromAPI.map((i) => ({ id: i.id.toString(), color: i.color, total: i.totalBeneficiarios })));
        this.totalesPorMunicipio = dataFromAPI;
        this.totalesPorMunicipioFilter = dataFromAPI;
        this.isLoading = LoadingStates.falseLoading;
      }, error: () => {
        this.isLoading = LoadingStates.errorLoading
      }
    });
  }

  onPageChange(number: number) {
    this.configPaginator.currentPage = number;
  }

  handleChangeSearch(event: any) {
    const searchTerm = event.target.value.toLowerCase();

    // Filtrar totalesPorMunicipioFilter basado en el nombre del municipio
    this.totalesPorMunicipioFilter = this.totalesPorMunicipio.filter(municipio =>
      municipio.nombre.toLowerCase().includes(searchTerm)
    );
  }


  setSettingsMapa() {
    this.beneficiariosService.dataMapa$.subscribe((newData) => {
      this.chartMap = {
        chart: {
          backgroundColor: '#ffffff'
        },
        mapNavigation: {
          enabled: true,
          enableButtons: true,
          enableMouseWheelZoom: true,
          buttonOptions: {
            align: 'right',
            verticalAlign: 'top'
          }

        },
        navigator: {
          enabled: false
        },
        exporting: {
          enabled: false
        },
        title: {
          text: ''
        },
        subtitle: {
          text: ''
        },
        legend: {
          enabled: false
        },
        credits: {
          enabled: false
        },
        colorAxis: {
          min: 0
        },
        plotOptions: {
          series: {
            inactiveOtherPoints: true,
            states: {
              hover: {
                borderColor: 'black'
              },
              inactive: {
                enabled: true,
                opacity: 0.5
              }
            },
            point: {
              events: {
                mouseOver: function (event: any) {
                  console.log('object');
                }
              }
            }
          }
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
          stickOnContact: true,
          shared: false,
          pointFormat:
                        `<div style="width: 360px; height: 120px; background: #ffffff; box-shadow: 0px 0px 12px 2px rgba(0,0,0,0.40); border-radius: 10px; opacity: 1;">
                          <div style="width: 20px; height: 100%; box-sizing: border-box; float: left; background-color: {point.color}; border-radius: 10px 0px 0px 10px;"></div>

                          <div style="padding: 5px; float: left;box-sizing: border-box; width: 340px; height: 60px; background: #ffffff; border-radius: 0px 0px 10px 0px;">
                            <div class="d-flex flex-row justify-content-between w-100">
                              <span class="px14" style="font-size: 13px; font-weight:  bolder;">Municipio</span>
                            </div>
                            <span class="px15 align-self-center" style="width: 60%; font-size: 13px; font-weight:  bolder;">{point.name}</span>
                            <br><br>
                            <div class="d-flex flex-row justify-content-between w-100">
                              <span class="px14 text-muted" style="font-size: 13px;">Total de beneficiarios</span>
                            </div>
                            <span class="px15 align-self-center text-muted"  style="width: 60%; font-size: 13px;">{point.total}</span>
                            <br><br>

                          </div>
                        </div>`

          },

        series: [
          {
            type: "map",
            joinBy: "id",
            mapData: this.dataMapaTlaxcala,
            data: newData,
          }
        ]
      };


    });
  }


}
