import { Estado } from './estados';
import { Municipio } from './municipio';

export interface Seccion {
  id: number;
  clave: number;
  municipio: Municipio;
  estado: Estado;
  claveYNombre: string;
}
