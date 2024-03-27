import { Candidato } from './candidato';
import { Seccion } from './seccion';
import { Municipio } from './municipio';

export interface Operador {
  id: number;
  nombreCompleto: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  strFechaNacimiento: string;
  fechaNacimiento: string;
  estatus: boolean;
  candidato: Candidato;
  seccionesIds: number[];
  secciones: Seccion[];
  edad: number;
  municipio: Municipio;
}
