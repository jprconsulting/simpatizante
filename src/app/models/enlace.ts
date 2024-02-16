import { Operador } from "./operador"

export interface Enlace {
    id: number,
    nombres: string,
    apellidoPaterno: string,
    apellidoMaterno: string
    nombreCompleto: string
    telefono: string;
    operador: Operador
}
