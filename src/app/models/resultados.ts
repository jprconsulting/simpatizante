import { Cargo } from "./cargo";
import { Casillas } from "./casillas";
import { Comunidad } from "./comunidad";
import { Distrito } from "./distrito";
import { Municipio } from "./municipio";
import { Seccion } from "./seccion";
import { TipoEleccion } from "./tipo-eleccion";

export interface Resultado {
    id: number,
    tipoEleccionId:TipoEleccion,
    distritoId: Distrito,


    casillaId:Casillas,
    seccionId:Seccion,
    boletasSobrantes: string,
    personasVotaron: number,
    votosRepresentantes: number,
    suma: number,
    partidos: string[];
    votosUrna: number,
    casillaInstalado: number,
}