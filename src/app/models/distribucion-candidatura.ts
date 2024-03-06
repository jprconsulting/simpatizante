import { TipoEleccion } from './tipo-eleccion';

import { Distrito } from './distrito';
import { Municipio } from './municipio';
import { Comunidad } from './comunidad';

export interface DistribucionCandidatura {
  id: number;
  tipoEleccion: TipoEleccion;
  distrito?: Distrito;
  municipio?: Municipio;
  comunidad?: Comunidad;
  partidos?: string[] | null;
}
