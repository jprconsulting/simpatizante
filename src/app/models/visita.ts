import { Beneficiario } from './beneficiario';
import { Candidato } from './candidato';
import { Operador } from './operador';
import { Usuario } from './usuario';
import { Simpatizante } from './votante';

export interface Visita {
  id: number;
  descripcion: string;
  servicio: string;
  imagenBase64: string;
  foto: string;
  simpatizante: Simpatizante;
  usuario: Usuario;
  simpatiza: boolean;
}
