import { Beneficiario } from "./beneficiario"
import { Candidatos } from "./candidato";
import { Operadores } from "./operadores";

export interface Visita {
    operador: Operadores;
    id: number;
    descripcion: string;
    foto: string;
    imagenBase64: string;
    strFechaHoraVisita: string;
    OperadorId:Operadores,
    CandidatoId: Candidatos,
    beneficiario: Beneficiario;
}