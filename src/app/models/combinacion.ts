import { Candidatura } from './candidatura';

export interface Combinacion {
  id: number;
  candidatura: Candidatura;
  nombre: string;
  partidos?: string[] | null;
  logo: string;
  imagenBase64: string;
}
