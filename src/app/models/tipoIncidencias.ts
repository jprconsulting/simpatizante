import { Casillas } from "./casillas";
import { Indicadores } from "./indicadores";

export interface TipoIncidencia {
    id: number;
    retroalimentacion: string;
    tipoIncidencia: Indicadores;
    direccion: string;
    latitud: number;
    longitud: number;
    imagenBase64: string;
    foto: string;
    casilla: Casillas;
}
