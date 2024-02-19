import { Promotor } from './promotor';
import { Estado } from './estados';
import { Genero } from './genero';
import { Municipio } from './municipio';
import { Operador } from './operador';
import { ProgramaSocial } from './programa-social';
import { Seccion } from './seccion';

export interface Simpatizante {
  id: number;
  nombres: string;
  nombreCompleto: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento: string;
  strFechaNacimiento: string;
  domicilio: string;
  genero: Genero;
  curp: string;
  latitud: number;
  longitud: number;
  estatus: boolean;
  tercerNivelContacto: string;
  programaSocial: ProgramaSocial | null;
  municipio: Municipio;
  votante: Simpatizante;
  seccion: Seccion;
  estado: Estado;
  operador: Operador;
  edad: number;
  numerotel: string;
  promotor: Promotor;
}

export interface TotalBeneficiariosMunicipio extends Municipio {
  totalBeneficiarios: number;
  color: string;
  descripcionIndicador: string;
}

export interface DataMapa {
  id: string;
  color: string;
  total: number;
}
