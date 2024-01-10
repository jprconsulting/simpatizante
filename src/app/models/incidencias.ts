import { Casillas } from "./casillas";
import { Indicadores } from "./indicadores";

export interface Incidencia {
    id: number;
    retroalimentacion: string;
    indicador: Indicadores;
    casilla: Casillas;
}
