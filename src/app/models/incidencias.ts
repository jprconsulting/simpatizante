import { Casillas } from './casillas';
import { Indicadores } from './indicadores';
import { Candidato } from './candidato';

export interface Incidencia {
  id: number;
  retroalimentacion: string;
  tipoIncidencia: Indicadores;
  direccion: string;
  latitud: number;
  longitud: number;
  imagenBase64: string;
  foto: string;
  casilla: Casillas;
  candidato: Candidato;
}
