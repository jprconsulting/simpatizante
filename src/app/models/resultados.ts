import { Cargo } from "./cargo";
import { Casillas } from "./casillas";
import { Municipio } from "./municipio";
import { Operador } from "./operador"
import { Seccion } from "./seccion";

export interface Resultado {
    id: number,
    seccion:Seccion,
    tipoelecion:Cargo,
    casilla:Casillas,
    municipio: Municipio,
    boletas: number,
    boletassobrantes: number,
}
