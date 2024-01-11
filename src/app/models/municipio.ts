import { Estado } from "./estados";

export interface Municipio {
    id: number;
    nombre: string;
    estado: Estado;
}
