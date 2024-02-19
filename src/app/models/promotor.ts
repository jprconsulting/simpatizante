import { Operador } from "./operador"

export interface Promotor {
    id: number,
    nombres: string,
    apellidoPaterno: string,
    apellidoMaterno: string
    nombreCompleto: string
    telefono: string;
    operadoresIds: number[];
    operadores: Operador[];
}
