import { DistribucionCandidatura } from './distribucion-candidatura';
import { Candidatura } from './candidatura';
import { TipoAgrupaciones } from './tipo-agrupaciones';
import { Combinacion } from './combinacion';

export interface DistribucionOrdenada {
  id: number;
  inputId: string;
  orden:boolean;
  distribucionCandidatura: DistribucionCandidatura;
  tipoAgrupacionPolitica: TipoAgrupaciones;
  candidatura: Candidatura;
  combinacion: Combinacion;
  PadreId: number;
  NombreCandidatura: string;
  imagenBase64: string;
  logo: string;
  nombreCandidatura:string;
}
