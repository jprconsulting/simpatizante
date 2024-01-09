import { Casillas } from "./casillas";
import { Indicador } from "./indicador";

export interface Incidencia {
    id: number;
    retroalimentacion: string;
    tipo: Indicador;
    casilla: Casillas;
}