import { TipoAgrupaciones } from "./tipo-agrupaciones";

export interface Candidatura {
    id: number;
    nombre: string
    logo: string;
    imagenBase64: string;
    acronimo: string;
    estatus: boolean;
    partidos: string;
    orden: number;
    tipoAgrupacionPolitica:TipoAgrupaciones;
}

