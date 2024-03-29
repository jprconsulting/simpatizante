import { Cargo } from "./cargo";
import { Casillas } from "./casillas";
import { Comunidad } from "./comunidad";
import { Distrito } from "./distrito";
import { Municipio } from "./municipio";
import { Seccion } from "./seccion";
import { TipoEleccion } from "./tipo-eleccion";

export interface Resultado {
    id: number,
    tipoEleccion:TipoEleccion,
    distrito: Distrito,
    comunidad:Comunidad,
    municipio:Municipio,
    casilla:Casillas,
    seccion:Seccion,
    boletasSobrantes: string,
    personasVotaron: number,
    votosRepresentantes: number,
    suma: number,
    partidos: string[];
}
