import { Beneficiario } from "./beneficiario"
import { Candidatos } from "./candidato";
import { Operadores } from "./operadores";
import { Votante } from "./votante";

export interface Visita {
    id: number;
    descripcion: string;
    servicio: string;
    imagenBase64: string;
    foto: string;
    candidato: Candidatos;
    operador: Operadores;
    simpatizante: Votante;
}
