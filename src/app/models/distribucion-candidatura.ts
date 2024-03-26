import { TipoEleccion } from './tipo-eleccion';

import { Estado } from './estados';
import { Distrito } from './distrito';
import { Municipio } from './municipio';
import { Comunidad } from './comunidad';

export interface DistribucionCandidatura {
  id: number;
  tipoEleccion: TipoEleccion;
  estado?: Estado;
  distrito?: Distrito;
  municipio?: Municipio;
  comunidad?: Comunidad;
  partidos?: string[] | null;
  coalicion?: string[] | null;
  independiente?: string[] | null;
  comun?: string[] | null;
  lista?: string[] | null;
}
