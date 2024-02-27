import { Simpatizante } from './votante';

export interface Simpatiza {
  simpatizante: Simpatizante;
  color: string  | null;
  simpatiza: boolean  | null;
}
