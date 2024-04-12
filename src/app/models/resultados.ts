import { Cargo } from './cargo';
import { Casillas } from './casillas';
import { Comunidad } from './comunidad';
import { Distrito } from './distrito';
import { Estado } from './estados';
import { Municipio } from './municipio';
import { Seccion } from './seccion';
import { TipoEleccion } from './tipo-eleccion';

export interface Resultado {
  id: number;
  tipoEleccion: TipoEleccion;
  distrito: Distrito;
  comunidad: Comunidad;
  municipio: Municipio;
  casilla: Casillas;
  seccion: Seccion;
  estado: Estado;
  boletasSobrantes: string;
  personasVotaron: number;
  votosRepresentantes: number;
  suma: number;
  noRegistrado: number;
  votosNulos: number;
  partidos: string[];
}
