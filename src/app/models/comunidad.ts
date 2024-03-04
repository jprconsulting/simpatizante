import { Municipio } from './municipio';

export interface Comunidad {
  id: number;
  nombre: string;
  municipio: Municipio;
}
