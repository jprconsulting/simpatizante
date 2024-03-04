import { TipoEleccion } from './tipo-eleccion';
import { Pais } from './pais';
import { Estado } from './estados';
import { Distrito } from './distrito';
import { Municipio } from './municipio';
import { Comunidad } from './comunidad';
import { Candidatura } from './candidatura';

export interface DistribucionCandidatura {
  id: number;
  tipoEleccion: TipoEleccion;
  pais: Pais;
  estado: Estado;
  distrito: Distrito;
  municipio: Municipio;
  comunidad: Comunidad;
  candidatura: Candidatura;
}
