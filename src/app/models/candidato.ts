import { Cargo } from './cargo';
import { Genero } from './genero';
import { Estado } from './estados';
import { Distrito } from './distrito';
import { Municipio } from './municipio';
import { Comunidad } from './comunidad';

export interface Candidato {
  id: number;
  nombreCompleto: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento: string;
  strFechaNacimiento: string;
  genero: Genero;
  sobrenombre: string;
  cargo: Cargo;
  estatus: boolean;
  imagenBase64: string;
  emblemaBase64: string;
  foto: string;
  emblema: string;
  edad: string;
  estado?: Estado;
  distrito?: Distrito;
  municipio?: Municipio;
  comunidad?: Comunidad;
}
